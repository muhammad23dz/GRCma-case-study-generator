const https = require('http'); // Since we are checking local dev or prod

// URL to check (assuming local dev for now, or can be passed as arg)
const TARGET_URL = process.argv[2] || 'http://localhost:3000';

console.log(`\n🔒 STARTING SECURITY AUDIT FOR: ${TARGET_URL}\n`);

const REQUIRED_HEADERS = [
    { key: 'content-security-policy', label: 'CSP (Anti-XSS/Malware)' },
    { key: 'strict-transport-security', label: 'HSTS (Secure Transport)' },
    { key: 'x-frame-options', label: 'X-Frame-Options (Anti-Clickjacking)' },
    { key: 'x-content-type-options', label: 'NoSniff (MIME Probing)' },
    { key: 'referrer-policy', label: 'Referrer Policy (Privacy)' }
];

const req = https.get(TARGET_URL, (res) => {
    console.log(`Response Code: ${res.statusCode}\n`);

    let passed = 0;

    console.log('--- HEADER ANALYSIS ---');
    REQUIRED_HEADERS.forEach(reqHeader => {
        const val = res.headers[reqHeader.key];
        if (val) {
            console.log(`✅ [PASS] ${reqHeader.label}: Present`);
            // Optional: Print substring of CSP
            if (reqHeader.key === 'content-security-policy') {
                console.log(`   └─ Value: ${val.substring(0, 60)}...`);
            }
            passed++;
        } else {
            console.log(`❌ [FAIL] ${reqHeader.label}: MISSING`);
        }
    });

    console.log('\n--- SUMMARY ---');
    console.log(`Security Score: ${passed}/${REQUIRED_HEADERS.length}`);
    if (passed === REQUIRED_HEADERS.length) {
        console.log('🌟 PLATFORM STATUS: HARDENED (Defcon 1 Ready)');
    } else {
        console.log('⚠️  PLATFORM STATUS: VULNERABLE');
    }

});

req.on('error', (e) => {
    console.error(`ERROR: Could not connect to target. Is the server running? (${e.message})`);
});
