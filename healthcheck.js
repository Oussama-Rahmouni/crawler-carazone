const fs = require('fs');
const path = require('path');


const outDir = process.env.OUTPUT_DIR || './output';

function check() {
    try {
        const files = fs.readdirSync(outDir);
        if (files.length === 0) {
            process.exit(0);
        }

        const latestFile = files.map(f => {
            return fs.statSync(path.join(outDir, f)).mtimeMs;
        }).sort((a, b) => b - a)[0];

        const diff = (Date.now() - latestFile) / 1000 / 60;

        if (diff > 5) {
            console.error('No new files in 5 mins.');
            process.exit(1);
        }
        
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}

check();