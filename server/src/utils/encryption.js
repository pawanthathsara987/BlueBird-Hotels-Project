import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

const SECRET_KEY = crypto
    .createHash('sha256')
    .update(process.env.ENCRYPTION_KEY)
    .digest();

const IV_LENGTH = 16;

export function encrypt(text) {
    if (!text) return text;

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, SECRET_KEY, iv);

    let encrypted = cipher.update(text.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText) {
    try {

        if (!encryptedText) return encryptedText;


        if (!encryptedText.includes(':')) {
            return encryptedText;
        }

        const parts = encryptedText.split(':');

        if (parts.length !== 2) {
            return encryptedText;
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];

        if (iv.length !== 16) {
            return encryptedText;
        }

        const decipher = crypto.createDecipheriv(algorithm, SECRET_KEY, iv);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;

    } catch (error) {
        console.error('Decryption failed:', error.message);
        return encryptedText;
    }
}