
import crypto from 'crypto';

// Use a secure key from environment variables
// In production, this should be a 32-byte hex string
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_insecure_key_for_dev_only_32_bytes_required!!';
const ALGORITHM = 'aes-256-gcm';

// Ensure key is 32 bytes
const getKey = () => {
    // If key is provided as hex, buffer it, otherwise use direct string (padded/truncated)
    if (ENCRYPTION_KEY.length === 64) {
        return Buffer.from(ENCRYPTION_KEY, 'hex');
    }
    // Fallback for dev: pad or slice to 32 bytes
    return Buffer.alloc(32, ENCRYPTION_KEY, 'utf-8');
};

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(text: string): string {
    const parts = text.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted text format');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
