import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import supabase from "../config/supabaseClient.js";

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

        // Generate QR code as buffer
        const qrBuffer = await QRCode.toBuffer(qrData, {
            width: 400,
            margin: 2
        });

        // Write to local disk as fallback/reference
        await fs.promises.writeFile(qrPath, qrBuffer);

        // Upload to Supabase bucket 'staffQR'
        const fileName = `${staffId}.png`;
        const { error } = await supabase.storage.from("staffQR").upload(
            fileName,
            qrBuffer,
            { contentType: "image/png", upsert: true }
        );

        if (error) {
            console.error(`❌ Supabase QR upload failed: ${error.message}`);
            // Fallback to local path if upload fails
            return `/uploads/qrcodes/${staffId}.png`;
        }

        const { data } = supabase.storage.from("staffQR").getPublicUrl(fileName);
        return data.publicUrl;

    } catch (error) {
        throw error;
    }
};