const crypto = require('crypto');

function anchorDiscriminator(name) {
    const preimage = `instruction:${name}`;
    const hash = crypto.createHash("sha256").update(preimage).digest();
    return hash.subarray(0, 8);
}

// Test the discriminator
const disc = anchorDiscriminator("create_profile");
console.log("Discriminator for 'create_profile':", disc.toString('hex'));
console.log("Discriminator bytes:", Array.from(disc));

// Also test the old (incorrect) version for comparison
function oldDiscriminator(name) {
    const preimage = `global:${name}`;
    const hash = crypto.createHash("sha256").update(preimage).digest();
    return hash.subarray(0, 8);
}

const oldDisc = oldDiscriminator("create_profile");
console.log("Old discriminator (global):", oldDisc.toString('hex'));
console.log("New discriminator (instruction):", disc.toString('hex'));
