import { GoogleGenerativeAI } from '@google/generative-ai';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database.js';

import {
    Amenities,
    Room,
    RoomAmenities,
    RoomPackage,
} from '../models/index.js';

const MODEL_FALLBACK_CHAIN = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
];

const MAX_RETRIES_PER_MODEL = 2;

const BASE_BACKOFF_MS = 600;

const sleep = (ms) =>
    new Promise((resolve) =>
        setTimeout(resolve, ms)
    );

const normalize = (value = '') =>
    String(value)
        .trim()
        .toLowerCase();

const isRetryableGeminiError = (
    error
) => {
    const status = Number(
        error?.status
    );

    return [429, 500, 503, 504].includes(
        status
    );
};

/* ======================================================
   PACKAGE QUESTION DETECTION
====================================================== */

const isPackageRelatedQuestion = (
    message
) => {
    const text = normalize(message);

    const keywords = [
        'package',
        'room',
        'price',
        'cost',
        'amenity',
        'facility',
        'available',
        'availability',
        'adult',
        'kid',
        'family',
        'suite',
        'cheap',
        'budget',
        'luxury',
        'today',
        'tomorrow',
    ];

    return keywords.some((keyword) =>
        text.includes(keyword)
    );
};

const hasAvailabilityIntent = (
    message
) => {
    const text = normalize(message);

    return /(availability|available|vacant|free room|rooms available|today|tomorrow|book on|for date)/.test(
        text
    );
};

/* ======================================================
   DATE HELPERS
====================================================== */

const getTodayIso = () => {
    return new Date()
        .toISOString()
        .slice(0, 10);
};

const addDaysIso = (
    isoDate,
    days = 1
) => {
    const date = new Date(
        `${isoDate}T00:00:00Z`
    );

    if (
        Number.isNaN(date.getTime())
    ) {
        return null;
    }

    date.setUTCDate(
        date.getUTCDate() + days
    );

    return date
        .toISOString()
        .slice(0, 10);
};

const toIsoDate = (
    year,
    month,
    day
) => {
    const date = new Date(
        Date.UTC(
            Number(year),
            Number(month) - 1,
            Number(day)
        )
    );

    if (
        Number.isNaN(date.getTime())
    ) {
        return null;
    }

    return date
        .toISOString()
        .slice(0, 10);
};

/* ======================================================
   EXTRACT DATE
====================================================== */

const extractRequestedDate = (
    message
) => {
    const text = normalize(message);

    // TODAY
    if (/\btoday\b/.test(text)) {
        return getTodayIso();
    }

    // TOMORROW
    if (/\btomorrow\b/.test(text)) {
        return addDaysIso(
            getTodayIso(),
            1
        );
    }

    // YYYY-MM-DD
    const isoMatch = text.match(
        /\b(\d{4}-\d{2}-\d{2})\b/
    );

    if (isoMatch?.[1]) {
        return isoMatch[1];
    }

    // DD/MM/YYYY OR MM/DD/YYYY
    const slashMatch = text.match(
        /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/
    );

    if (slashMatch) {
        const first = Number(
            slashMatch[1]
        );

        const second = Number(
            slashMatch[2]
        );

        const year = Number(
            slashMatch[3]
        );

        const day =
            first > 12
                ? first
                : second;

        const month =
            first > 12
                ? second
                : first;

        return toIsoDate(
            year,
            month,
            day
        );
    }

    return null;
};

/* ======================================================
   GET AVAILABLE PACKAGES
====================================================== */

const getAvailablePackagesForDate =
    async (checkInDate) => {
        let checkOutDate =
            addDaysIso(
                checkInDate,
                1
            );

        // SAFETY CHECK
        if (
            !checkOutDate ||
            checkOutDate ===
                checkInDate
        ) {
            checkOutDate =
                addDaysIso(
                    checkInDate,
                    1
                );
        }

        const query = `
        SELECT
            rp.id,
            rp.pname,
            rp.pprice,
            rp.pimage,
            rp.maxAdults,
            rp.maxKids,
            rp.description,

            COUNT(r.id) AS availableRooms

        FROM room r

        JOIN room_package rp
            ON r.packageId = rp.id

        WHERE r.roomStatus = 'available'

        AND r.id NOT IN (
            SELECT br.room_id
            FROM booked_rooms br
            WHERE br.status IN (
                'reserved',
                'checked_in',
                'hold'
            )
            AND (
                (:checkInDate < br.checkOut)
                AND (:checkOutDate > br.checkIn)
            )
        )

        GROUP BY rp.id
    `;

        const rows =
            await sequelize.query(
                query,
                {
                    replacements: {
                        checkInDate,
                        checkOutDate,
                    },
                    type: QueryTypes.SELECT,
                }
            );

        return rows.map((row) => ({
            id: row.id,
            name: row.pname,
            price: row.pprice,
            image: row.pimage,
            maxAdults:
                row.maxAdults,
            maxKids: row.maxKids,
            description:
                row.description,
            availableRooms:
                Number(
                    row.availableRooms
                ) || 0,
        }));
    };

/* ======================================================
   ALL PACKAGE RECORDS
====================================================== */

const getPackageRecords =
    async () => {
        const rows =
            await RoomPackage.findAll(
                {
                    attributes: [
                        'id',
                        'pname',
                        'pprice',
                        'pimage',
                        'maxAdults',
                        'maxKids',
                        'description',
                    ],

                    include: [
                        {
                            model: Room,
                            attributes: [
                                'id',
                                'roomStatus',
                            ],
                            required: false,
                        },
                    ],

                    order: [
                        ['pprice', 'ASC'],
                    ],
                }
            );

        return rows.map((row) => {
            const plain = row.get({
                plain: true,
            });

            const rooms =
                Array.isArray(
                    plain.Rooms
                )
                    ? plain.Rooms
                    : [];

            const availableRooms =
                rooms.filter(
                    (room) =>
                        room.roomStatus ===
                        'available'
                ).length;

            return {
                id: plain.id,
                name: plain.pname,
                image: plain.pimage,
                price: plain.pprice,
                maxAdults:
                    plain.maxAdults,
                maxKids:
                    plain.maxKids,
                description:
                    plain.description,
                availableRooms,
            };
        });
    };

/* ======================================================
   FILTER PACKAGES
====================================================== */

const filterPackagesByQuestion = (
    packages,
    message
) => {
    if (!packages.length)
        return packages;

    const text = normalize(message);

    if (
        /(cheap|budget|low price|affordable)/.test(
            text
        )
    ) {
        return [...packages]
            .sort(
                (a, b) =>
                    a.price -
                    b.price
            )
            .slice(0, 5);
    }

    if (
        /(luxury|premium|best|expensive)/.test(
            text
        )
    ) {
        return [...packages]
            .sort(
                (a, b) =>
                    b.price -
                    a.price
            )
            .slice(0, 5);
    }

    return packages.slice(0, 5);
};

/* ======================================================
   GEMINI
====================================================== */

const generateReplyWithGemini =
    async (
        userMessage,
        packageContext
    ) => {
        if (
            !process.env
                .GEMINI_API_KEY
        )
            return null;

        const genAI =
            new GoogleGenerativeAI(
                process.env
                    .GEMINI_API_KEY
            );

        let lastError;

        const systemInstruction = `
You are BlueBird Hotels assistant.

IMPORTANT HOTEL RULES:

- Hotel bookings are charged per night.
- Even if guest stays only 1 hour or 2 hours, full night payment is required.
- Check-in and check-out cannot be the same date.
- If customer asks for availability today, automatically assume checkout is tomorrow.
- Never suggest same-day checkout.
- Only use provided package data.
- Do not invent prices or rooms.
`;

        const prompt =
            packageContext
                ? `
Customer message:
${userMessage}

Verified package data:
${packageContext}

Write a short helpful reply.
`
                : userMessage;

        for (const modelName of MODEL_FALLBACK_CHAIN) {
            const model =
                genAI.getGenerativeModel(
                    {
                        model:
                            modelName,
                        systemInstruction,
                    }
                );

            for (
                let attempt = 1;
                attempt <=
                MAX_RETRIES_PER_MODEL;
                attempt += 1
            ) {
                try {
                    const result =
                        await model.generateContent(
                            prompt
                        );

                    const response =
                        await result.response;

                    return response.text();
                } catch (error) {
                    const status =
                        Number(
                            error?.status
                        );

                    if (
                        status === 404
                    ) {
                        lastError =
                            error;
                        break;
                    }

                    lastError =
                        error;

                    if (
                        isRetryableGeminiError(
                            error
                        ) &&
                        attempt <
                            MAX_RETRIES_PER_MODEL
                    ) {
                        await sleep(
                            BASE_BACKOFF_MS *
                                Math.pow(
                                    2,
                                    attempt -
                                        1
                                )
                        );

                        continue;
                    }

                    break;
                }
            }
        }

        if (lastError) {
            console.warn(
                'Gemini failed:',
                lastError.message
            );
        }

        return null;
    };

/* ======================================================
   CONTROLLER
====================================================== */

const chatBot = async (
    req,
    res
) => {
    const { message } = req.body;

    if (
        !message ||
        typeof message !==
            'string'
    ) {
        return res.status(400).json(
            {
                error: 'Message is required',
            }
        );
    }

    try {
        const cleanMessage =
            message.trim();

        const requestedDate =
            extractRequestedDate(
                cleanMessage
            );

        /* ==========================================
           AVAILABILITY
        ========================================== */

        if (
            requestedDate &&
            hasAvailabilityIntent(
                cleanMessage
            )
        ) {
            const availablePackages =
                await getAvailablePackagesForDate(
                    requestedDate
                );

            const matchedPackages =
                filterPackagesByQuestion(
                    availablePackages,
                    cleanMessage
                );

            const aiReply =
                await generateReplyWithGemini(
                    cleanMessage,
                    JSON.stringify(
                        matchedPackages
                    )
                );

            return res.status(200).json(
                {
                    reply:
                        aiReply ||
                        'Here are the available room packages.',

                    packages:
                        matchedPackages,

                    source:
                        'availability',

                    checkIn:
                        requestedDate,

                    checkOut:
                        addDaysIso(
                            requestedDate,
                            1
                        ),
                }
            );
        }

        /* ==========================================
           PACKAGE QUESTIONS
        ========================================== */

        if (
            isPackageRelatedQuestion(
                cleanMessage
            )
        ) {
            const packageRows =
                await getPackageRecords();

            const matchedPackages =
                filterPackagesByQuestion(
                    packageRows,
                    cleanMessage
                );

            const aiReply =
                await generateReplyWithGemini(
                    cleanMessage,
                    JSON.stringify(
                        matchedPackages
                    )
                );

            return res.status(200).json(
                {
                    reply:
                        aiReply ||
                        'Here are our available packages.',

                    packages:
                        matchedPackages,

                    source:
                        'database',
                }
            );
        }

        /* ==========================================
           NORMAL GEMINI CHAT
        ========================================== */

        const aiReply =
            await generateReplyWithGemini(
                cleanMessage
            );

        if (aiReply) {
            return res.status(200).json(
                {
                    reply: aiReply,
                    source: 'gemini',
                }
            );
        }

        return res.status(200).json(
            {
                reply:
                    'I can help with room packages, availability, pricing, and hotel information.',
                source:
                    'fallback',
            }
        );
    } catch (error) {
        console.error(
            'Chat controller error:',
            error
        );

        return res.status(500).json({
            error:
                'Unable to process request right now.',
        });
    }
};

export default chatBot;