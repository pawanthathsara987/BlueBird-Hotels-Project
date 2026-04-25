import { GoogleGenerativeAI } from '@google/generative-ai';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { Amenities, Room, RoomAmenities, RoomPackage } from '../models/index.js';

const MODEL_FALLBACK_CHAIN = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
const MAX_RETRIES_PER_MODEL = 2;
const BASE_BACKOFF_MS = 600;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalize = (value = '') => String(value).trim().toLowerCase();

const isRetryableGeminiError = (error) => {
    const status = Number(error?.status);
    return [429, 500, 503, 504].includes(status);
};

const isPackageRelatedQuestion = (message) => {
    const text = normalize(message);
    const keywords = [
        'package',
        'room',
        'price',
        'cost',
        'amenity',
        'facilit',
        'available',
        'adult',
        'kid',
        'family',
        'suite',
        'cheap',
        'budget',
        'luxury',
    ];

    return keywords.some((keyword) => text.includes(keyword));
};

const hasAvailabilityIntent = (message) => {
    const text = normalize(message);
    return /(availability|available|vacant|free room|rooms available|book on|for date)/.test(text);
};

const toIsoDate = (year, month, day) => {
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
};

const extractRequestedDate = (message) => {
    const text = String(message || '');

    const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (isoMatch?.[1]) return isoMatch[1];

    const slashMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
    if (slashMatch) {
        const first = Number(slashMatch[1]);
        const second = Number(slashMatch[2]);
        const year = Number(slashMatch[3]);

        // Prefer day/month/year if unambiguous, otherwise assume month/day/year.
        const day = first > 12 ? first : second;
        const month = first > 12 ? second : first;
        return toIsoDate(year, month, day);
    }

    const naturalDateMatch = text.match(/\b(?:on|for)\s+([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?)\b/i);
    if (naturalDateMatch?.[1]) {
        const parsed = new Date(naturalDateMatch[1]);
        if (!Number.isNaN(parsed.getTime())) {
            return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()))
                .toISOString()
                .slice(0, 10);
        }
    }

    return null;
};

const addDaysIso = (isoDate, days) => {
    const date = new Date(`${isoDate}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
};

const getAvailablePackagesForDate = async (checkInDate) => {
    const checkOutDate = addDaysIso(checkInDate, 1);

    const query = `
        SELECT
            p.id,
            p.pname,
            p.pprice,
            p.maxAdults,
            p.maxKids,
            p.description,
            COUNT(r.id) AS availableRooms
        FROM room_package p
        JOIN room r ON p.id = r.packageId
        WHERE r.roomStatus = 'available'
          AND NOT EXISTS (
              SELECT 1
              FROM booking_room br
              WHERE br.roomId = r.id
                AND br.status NOT IN ('cancelled', 'checked_out')
                AND br.checkIn < :checkOutDate
                AND br.checkOut > :checkInDate
          )
        GROUP BY p.id, p.pname, p.pprice, p.maxAdults, p.maxKids, p.description
        ORDER BY p.pprice ASC
    `;

    const rows = await sequelize.query(query, {
        replacements: { checkInDate, checkOutDate },
        type: QueryTypes.SELECT,
    });

    return rows.map((row) => ({
        id: row.id,
        name: row.pname,
        price: row.pprice,
        maxAdults: row.maxAdults,
        maxKids: row.maxKids,
        description: row.description,
        availableRooms: Number(row.availableRooms) || 0,
        amenities: [],
    }));
};

const getPackageRecords = async () => {
    const rows = await RoomPackage.findAll({
        attributes: ['id', 'pname', 'pprice', 'maxAdults', 'maxKids', 'description'],
        include: [
            {
                model: Room,
                attributes: ['id', 'roomStatus'],
                required: false,
                include: [
                    {
                        model: RoomAmenities,
                        attributes: ['amenityId'],
                        required: false,
                        include: [{ model: Amenities, attributes: ['name'], required: false }],
                    },
                ],
            },
        ],
        order: [['pprice', 'ASC']],
    });

    return rows.map((row) => {
        const plain = row.get({ plain: true });
        const rooms = Array.isArray(plain.Rooms) ? plain.Rooms : [];

        const availableRooms = rooms.filter((room) => room.roomStatus === 'available').length;

        const amenitySet = new Set();
        for (const room of rooms) {
            const roomAmenities = Array.isArray(room.RoomAmenities) ? room.RoomAmenities : [];
            for (const assignment of roomAmenities) {
                const amenityName = assignment?.Amenity?.name;
                if (amenityName) amenitySet.add(amenityName);
            }
        }

        return {
            id: plain.id,
            name: plain.pname,
            price: plain.pprice,
            maxAdults: plain.maxAdults,
            maxKids: plain.maxKids,
            description: plain.description,
            availableRooms,
            amenities: [...amenitySet],
        };
    });
};

const filterPackagesByQuestion = (packages, message) => {
    if (!packages.length) return packages;

    const text = normalize(message);
    const tokens = text.split(/[^a-z0-9]+/).filter((token) => token.length >= 3);
    let filtered = packages;

    if (tokens.length) {
        filtered = packages.filter((pkg) => {
            const haystack = `${normalize(pkg.name)} ${normalize(pkg.description)} ${normalize(pkg.amenities.join(' '))}`;
            return tokens.some((token) => haystack.includes(token));
        });
    }

    if (!filtered.length) filtered = packages;

    if (/(cheap|budget|affordable|lowest|low price)/.test(text)) {
        return [...filtered].sort((a, b) => a.price - b.price).slice(0, 3);
    }

    if (/(luxury|premium|best|highest|expensive)/.test(text)) {
        return [...filtered].sort((a, b) => b.price - a.price).slice(0, 3);
    }

    return filtered.slice(0, 5);
};

const buildPackageReply = (question, packages) => {
    if (!packages.length) {
        return 'We do not have package data available right now. Please contact the front desk for immediate help.';
    }

    const lines = packages.map((pkg, index) => {
        const amenityText = pkg.amenities.length ? pkg.amenities.join(', ') : 'No amenity details listed';
        return (
            `${index + 1}. ${pkg.name} - ${pkg.price} MMK/night\n` +
            `   Capacity: ${pkg.maxAdults} adults, ${pkg.maxKids} kids\n` +
            `   Available rooms: ${pkg.availableRooms}\n` +
            `   Amenities: ${amenityText}\n` +
            `   Details: ${pkg.description || 'No description'}`
        );
    });

    return `Here are matching room packages for "${question}":\n\n${lines.join('\n\n')}\n\nIf you want, I can also suggest the best option for your budget and group size.`;
};

const buildAvailabilityReply = (dateIso, packages) => {
    if (!packages.length) {
        return `No room packages are available on ${dateIso}. Please try another date.`;
    }

    const lines = packages.map((pkg, index) => (
        `${index + 1}. ${pkg.name} - ${pkg.price} MMK/night\n` +
        `   Capacity: ${pkg.maxAdults} adults, ${pkg.maxKids} kids\n` +
        `   Available rooms: ${pkg.availableRooms}\n` +
        `   Details: ${pkg.description || 'No description'}`
    ));

    return `Available packages on ${dateIso}:\n\n${lines.join('\n\n')}\n\nShare adults/kids count and I can suggest the best option.`;
};

const buildPackageContextForGemini = (question, packages) => {
    const compact = packages.map((pkg) => ({
        name: pkg.name,
        price: pkg.price,
        capacity: { adults: pkg.maxAdults, kids: pkg.maxKids },
        availableRooms: pkg.availableRooms,
        amenities: pkg.amenities,
        description: pkg.description,
    }));

    return JSON.stringify({
        userQuestion: question,
        packages: compact,
        rule: 'Only use this provided data. If a fact is missing, clearly say it is unavailable.',
    });
};

const generateReplyWithGemini = async (userMessage, packageContext) => {
    if (!process.env.GEMINI_API_KEY) return null;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    let lastError;

    const systemInstruction =
        'You are BlueBird Hotels assistant. Be concise, helpful, and factual. ' +
        'If package data is provided, only answer using that data and do not invent extra details.';

    const prompt = packageContext
        ? `Customer message: ${userMessage}\n\nVerified package data:\n${packageContext}\n\nWrite a customer-friendly reply.`
        : userMessage;

    for (const modelName of MODEL_FALLBACK_CHAIN) {
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction,
        });

        for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt += 1) {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                const status = Number(error?.status);

                if (status === 404) {
                    lastError = error;
                    break;
                }

                lastError = error;
                if (isRetryableGeminiError(error) && attempt < MAX_RETRIES_PER_MODEL) {
                    await sleep(BASE_BACKOFF_MS * Math.pow(2, attempt - 1));
                    continue;
                }
                break;
            }
        }
    }

    if (lastError) {
        console.warn('Gemini fallback failed:', lastError.message);
    }
    return null;
};

const chatBot = async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const cleanMessage = message.trim();
        const requestedDate = extractRequestedDate(cleanMessage);

        if (requestedDate && (hasAvailabilityIntent(cleanMessage) || isPackageRelatedQuestion(cleanMessage))) {
            const availablePackages = await getAvailablePackagesForDate(requestedDate);
            const matchedByQuestion = filterPackagesByQuestion(availablePackages, cleanMessage);
            const deterministicReply = buildAvailabilityReply(requestedDate, matchedByQuestion);
            const packageContext = buildPackageContextForGemini(
                `${cleanMessage} (date: ${requestedDate})`,
                matchedByQuestion
            );
            const aiReply = await generateReplyWithGemini(cleanMessage, packageContext);

            return res.status(200).json({
                reply: aiReply || deterministicReply,
                source: aiReply ? 'date-availability+gemini' : 'date-availability',
                date: requestedDate,
                packageCount: matchedByQuestion.length,
            });
        }

        if (isPackageRelatedQuestion(cleanMessage)) {
            const packageRows = await getPackageRecords();
            const matchedPackages = filterPackagesByQuestion(packageRows, cleanMessage);

            const deterministicReply = buildPackageReply(cleanMessage, matchedPackages);
            const packageContext = buildPackageContextForGemini(cleanMessage, matchedPackages);
            const aiReply = await generateReplyWithGemini(cleanMessage, packageContext);

            return res.status(200).json({
                reply: aiReply || deterministicReply,
                source: aiReply ? 'database+gemini' : 'database',
                packageCount: matchedPackages.length,
            });
        }

        const aiReply = await generateReplyWithGemini(cleanMessage);
        if (aiReply) {
            return res.status(200).json({ reply: aiReply, source: 'gemini' });
        }

        return res.status(200).json({
            reply: 'I can help with room packages, prices, and amenities. Ask me things like: "What package is best for 2 adults and 1 kid?"',
            source: 'fallback',
        });
    } catch (error) {
        console.error('Chat controller error:', error);
        return res.status(500).json({
            error: 'Unable to process chat request right now. Please try again shortly.',
        });
    }
};

export default chatBot;