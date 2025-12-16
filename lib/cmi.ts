import crypto from 'crypto';

interface CmiParams {
    [key: string]: string;
}

export const CMI_CONFIG = {
    storeKey: process.env.CMI_STORE_KEY || 'Test1234', // Default Test Key
    clientId: process.env.CMI_CLIENT_ID || '600000000', // Default Test Client ID
    gatewayUrl: process.env.CMI_GATEWAY_URL || 'https://testpayment.cmi.co.ma/fim/est3Dgate',
    okUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payment/callback/ok`,
    failUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payment/callback/fail`,
    shopUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`,
};

export function generateCmiHash(params: CmiParams): string {
    // 1. Sort parameters alphabetically by key
    const sortedKeys = Object.keys(params).sort();

    // 2. Concatenate values in order
    // Note: CMI typically ignores empty values in the hash, but checks vary.
    // We will include all provided values.
    let rawString = '';
    sortedKeys.forEach((key) => {
        // Only include specific CMI keys if strict filtering is needed,
        // but usually signing everything sent is safer.
        // We skip 'HASH' or 'encoding' if present in the input object to avoid recursion
        if (key.toLowerCase() !== 'hash' && key.toLowerCase() !== 'encoding') {
            const val = params[key];
            if (val !== undefined && val !== null) {
                rawString += val.toString().trim();
            }
        }
    });

    // 3. Append Store Key
    const stringToSign = rawString + CMI_CONFIG.storeKey;

    // 4. Calculate SHA-512 and return Base64
    const hash = crypto.createHash('sha512').update(stringToSign).digest('base64');

    return hash;
}
