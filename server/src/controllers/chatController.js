import { GoogleGenerativeAI } from "@google/generative-ai";
import { QueryTypes } from "sequelize";
import sequelize from "../config/database.js";

import {
  Room,
  Tour, // ✅ FIX: you MUST import Tour model
} from "../models/index.js";

/* ======================================================
   MODEL SETTINGS
====================================================== */

const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

const MAX_RETRIES_PER_MODEL = 2;
const BASE_BACKOFF_MS = 600;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalize = (value = "") => String(value).trim().toLowerCase();

const isRetryableGeminiError = (error) => {
  const status = Number(error?.status);
  return [429, 500, 503, 504].includes(status);
};

/* ======================================================
   ROOM DETECTION
====================================================== */

const isRoomQuestion = (message) => {
  const text = normalize(message);

  const keywords = [
    "room",
    "rooms",
    "suite",
    "suites",
    "hotel room",
    "hotel rooms",
    "stay",
    "stays",
    "night",
    "nights",
    "check in",
    "check-in",
    "check out",
    "check-out",
    "family room",
    "deluxe",
    "superior",
    "amenity",
    "amenities",
    "facility",
    "facilities",
    "bed",
    "beds",
    "price room",
    "room price",
    "room prices",
    "availability",
    "available room",
    "available rooms",
    "booking room",
    "book room",
    "accommodate",
    "accommodation"
  ];

  return keywords.some((k) => text.includes(k));
};

/* ======================================================
   TOUR DETECTION (FIXED)
====================================================== */

const isTourQuestion = (message) => {
  const text = normalize(message);

  const keywords = [
    "tour",
    "tour package",
    "travel",
    "trip",
    "safari",
    "city tour",
    "beach tour",
    "day tour",
    "round tour",
    "excursion",
    "adventure",
    "pickup",
    "drop",
    "guide",
    "airport transfer",
    "tour booking",
    "tour package price",
    "cheap tour",
    "luxury tour",
  ];

  return keywords.some((k) => text.includes(k));
};

/* ======================================================
   TOUR DATA FETCH
====================================================== */

const getAllTourPackages = async () => {
  const tours = await Tour.findAll({
    where: { status: "active" },
    attributes: [
      "id",
      "packageName",
      "overview",
      "location",
      "price",
      "discount",
      "duration",
      "durationType",
      "groupSize",
      "image",
    ],
    order: [["createdAt", "DESC"]],
  });

  return tours.map((tour) => ({
    id: tour.id,
    name: tour.packageName,
    overview: tour.overview,
    location: tour.location,
    price: tour.price,
    discount: tour.discount,
    duration: tour.duration,
    durationType: tour.durationType,
    groupSize: tour.groupSize,
    image: tour.image,
  }));
};

/* ======================================================
   ROOM DATA FETCH
====================================================== */

const getRoomPackages = async () => {
  const query = `
    SELECT 
        rt.id AS id,
        rt.type AS name,
        rt.image_url AS image,
        MIN(rp.price) AS price,
        MAX(ot.capacity) AS maxAdults,
        MAX(r.kids) AS maxKids,
        COUNT(r.id) AS availableRooms
    FROM room_type rt
    LEFT JOIN room r ON rt.id = r.room_type_id AND r.status = 'available'
    LEFT JOIN occupancy_type ot ON r.occupancy_type_id = ot.id
    LEFT JOIN room_price rp ON rt.id = rp.roomTypeId
    GROUP BY rt.id, rt.type, rt.image_url
  `;
  const rows = await sequelize.query(query, {
    type: QueryTypes.SELECT
  });

  return rows.map(row => {
    const norm = (row.name || "").toLowerCase();
    const description = norm.includes("presidential")
      ? "The peak of opulent resort living. Features private plunge pool and supreme coastal details."
      : norm.includes("villa")
        ? "Private beachfront sanctuary with step-out access to white sands."
        : norm.includes("suite")
          ? "Captivating ocean vistas meets refined suite luxury."
          : "Savor elegant coastal living with custom-crafted designer touches.";

    return {
      id: row.id,
      name: row.name,
      price: row.price || 250,
      image: row.image,
      maxAdults: row.maxAdults || 3,
      maxKids: row.maxKids || 0,
      description: description,
      availableRooms: Number(row.availableRooms || 0)
    };
  });
};

/* ======================================================
   GEMINI
====================================================== */

const generateReplyWithGemini = async (message, context = null) => {
  if (!process.env.GEMINI_API_KEY) return null;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const systemInstruction = `
        You are BlueBird Hotels assistant, a premium concierge chatbot.

        Your job is to assist guests with inquiries about room availability, prices, capacities, and facilities using the live data provided.

        Rules:
        - Do NOT invent prices or details. If a room type is not in the data, state that it is not available.
        - Utilize the provided room data (which includes room names, pricing, maximum occupancy, and available room counts) to answer questions directly.
        - When asked for cheap rooms or room options for specific numbers of adults/kids, suggest the best fits from the provided room data based on price and maximum occupancy limits.
        - If rooms are available, encourage the user to click the "Review Package Details" or booking button.
        - Be concise, elegant, welcoming, and highly professional.
    `;

  const prompt = context ? `User: ${message}\n\nData:\n${context}` : message;

  let lastError;

  for (const model of MODEL_FALLBACK_CHAIN) {
    const aiModel = genAI.getGenerativeModel({
      model,
      systemInstruction,
    });

    for (let i = 0; i < MAX_RETRIES_PER_MODEL; i++) {
      try {
        const result = await aiModel.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        lastError = err;

        if (isRetryableGeminiError(err) && i < MAX_RETRIES_PER_MODEL - 1) {
          await sleep(BASE_BACKOFF_MS * (i + 1));
          continue;
        }

        break;
      }
    }
  }

  console.log("Gemini error:", lastError?.message);
  return null;
};

/* ======================================================
   MAIN CONTROLLER
====================================================== */

const chatBot = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "Message required",
    });
  }

  try {
    const text = message.trim();

    /* ======================================================
           1. TOUR CHECK FIRST (IMPORTANT FIX)
        ====================================================== */

    if (isTourQuestion(text)) {
      const tours = await getAllTourPackages();

      const aiReply = await generateReplyWithGemini(
        text,
        JSON.stringify(tours),
      );

      return res.json({
        reply: aiReply || "Here are our tour packages",
        tours,
        source: "tour",
      });
    }

    /* ======================================================
           2. ROOM CHECK
        ====================================================== */

    if (isRoomQuestion(text)) {
      const rooms = await getRoomPackages();

      const aiReply = await generateReplyWithGemini(
        text,
        JSON.stringify(rooms),
      );

      return res.json({
        reply: aiReply || "Here are room packages",
        packages: rooms,
        source: "rooms",
      });
    }

    /* ======================================================
           3. GENERAL CHAT
        ====================================================== */

    const aiReply = await generateReplyWithGemini(text);

    return res.json({
      reply: aiReply || "I can help with rooms and tours",
      source: "gemini",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error",
    });
  }
};

export default chatBot;
