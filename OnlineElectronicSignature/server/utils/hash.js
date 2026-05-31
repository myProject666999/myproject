const crypto = require('crypto');
const fs = require('fs');

function computeFileHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

function computeDataHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

function computeChainHash(prevHash, data) {
    return crypto.createHash('sha256')
        .update((prevHash || '') + JSON.stringify(data))
        .digest('hex');
}

module.exports = { computeFileHash, computeDataHash, computeChainHash };
