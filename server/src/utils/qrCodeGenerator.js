import QRCode from "qrcode";
import fs from "fs";
import path from "path";

const qrFolder = path.join(process.cwd(), "uploads", "qrcodes");

// Create folder if it doesn't exist
if (!fs.existsSync(qrFolder)) {
    fs.mkdirSync(qrFolder, { recursive: true });
}

export const generateQRCode = async (staffId) => {
    try {
        const qrPath = path.join(qrFolder, `${staffId}.png`);

        // Payload (we'll improve this later)
        const qrData = JSON.stringify({
            staffId,
            type: "attendance",
            version: 1
        });

        await QRCode.toFile(qrPath, qrData, {
            width: 400,
            margin: 2
        });

        return `/uploads/qrcodes/${staffId}.png`;

    } catch (error) {
        throw error;
    }
};