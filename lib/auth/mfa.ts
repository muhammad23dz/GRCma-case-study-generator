import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { encrypt, decrypt } from '@/lib/security/encryption';
import { prisma } from '@/lib/prisma';

// SOC 2: Enforce secure crypto settings for MFA
authenticator.options = {
    window: 1, // Allow +/- 1 step window (30s) to account for clock drift
    step: 30
};

export class MFAService {
    /**
     * Generate a new MFA secret and QR code for setup
     */
    async generateSecret(email: string) {
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(email, 'NCC GRC Platform', secret);

        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        return {
            secret,
            qrCodeUrl
        };
    }

    /**
     * Encrypt and save the MFA secret for the user
     */
    async enableMFA(userId: string, secret: string, token: string): Promise<boolean> {
        // 1. Verify the token first to ensure the user scanned it correctly
        const isValid = authenticator.verify({ token, secret });

        if (!isValid) return false;

        // 2. Encrypt secret before storage (AES-256-GCM)
        const encryptedSecret = encrypt(secret);

        await prisma.user.update({
            where: { id: userId },
            data: {
                mfaSecret: encryptedSecret,
                mfaEnabled: true
            }
        });

        return true;
    }

    /**
     * Verify a token against the stored user secret
     */
    async verifyUserToken(userId: string, token: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { mfaSecret: true, mfaEnabled: true }
        });

        if (!user || !user.mfaSecret || !user.mfaEnabled) return false;

        try {
            const secret = decrypt(user.mfaSecret);
            return authenticator.verify({ token, secret });
        } catch (error) {
            console.error('MFA Decryption failed:', error);
            return false;
        }
    }
}
