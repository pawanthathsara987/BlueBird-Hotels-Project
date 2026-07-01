import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import supabase from "../config/supabaseClient.js";
import StaffMember from "../models/User/StaffMember.js";

const qrFolder = path.join(process.cwd(), "uploads", "qrcodes");

// Create folder if it doesn't exist
if (!fs.existsSync(qrFolder)) {
    fs.mkdirSync(qrFolder, { recursive: true });
}

export const generateQRCode = async (staffId) => {
    try {
        const qrPath = path.join(qrFolder, `${staffId}.png`);

        const payload = {
            staffId,
            type: "attendance",
            version: 1
        };

        const signature = crypto
            .createHmac("sha256", process.env.QR_SECRET || "default_qr_secret_key_123456")
            .update(JSON.stringify(payload))
            .digest("hex");

        const qrData = JSON.stringify({
            ...payload,
            signature
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

export const regenerateAllStaffQRCodes = async () => {
    try {
        console.log("🔄 Starting background regeneration of Staff QR Codes with HMAC signatures...");
        const staffMembers = await StaffMember.findAll();
        for (const staff of staffMembers) {
            console.log(`Generating signed QR for ${staff.name} (${staff.staffId})...`);
            const qrCodeUrl = await generateQRCode(staff.staffId);
            staff.qrCodeUrl = qrCodeUrl;
            await staff.save();
        }
        console.log("✅ All Staff QR Codes regenerated successfully with HMAC signatures.");
    } catch (error) {
        console.error("❌ Failed to regenerate staff QR codes:", error);
    }
};