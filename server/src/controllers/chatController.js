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
    "suite",
    "hotel room",
    "stay",
    "night",
    "check in",
    "check out",
    "family room",
    "deluxe",
    "amenity",
    "facility",
    "bed",
    "price room",
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
  const rows = await RoomPackage.findAll({
    attributes: [
      "id",
      "pname",
      "pprice",
      "pimage",
      "maxAdults",
      "maxKids",
      "description",
    ],
    include: [
      {
        model: Room,
        attributes: ["id", "roomStatus"],
        required: false,
      },
    ],
  });

  return rows.map((row) => {
    const plain = row.get({ plain: true });

    const rooms = plain.Rooms || [];

    const availableRooms = rooms.filter(
      (r) => r.roomStatus === "available",
    ).length;

    return {
      id: plain.id,
      name: plain.pname,
      price: plain.pprice,
      image: plain.pimage,
      maxAdults: plain.maxAdults,
      maxKids: plain.maxKids,
      description: plain.description,
      availableRooms,
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
        You are BlueBird Hotels assistant.

        Rules:
        - Do NOT invent prices
        - Only use provided data
        - Be concise
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
