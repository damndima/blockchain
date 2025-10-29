// Пошук колізій у SHA-256 (спрощений варіант)

const crypto = require("crypto");

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

const base = "student_test"; 
const n = 4;
const seen = {};

let nonce = 0;
let attempts = 0;
let collisionFound = false;

console.log(` Шукаємо колізію для перших ${n} символів хешу SHA-256...`);

while (!collisionFound) {
  const input = base + nonce;
  const hash = sha256(input);
  const prefix = hash.substring(0, n);
  attempts++;

  if (seen[prefix] && seen[prefix].input !== input) {
    console.log("\nКолізія знайдена");
    console.log(`Префікс (${n} символів): ${prefix}`);
    console.log(`Кількість спроб: ${attempts}`);

    console.log("\n1️⃣", seen[prefix].input, "→", seen[prefix].hash);
    console.log("2️⃣", input, "→", hash);
    collisionFound = true;
  } else {
    seen[prefix] = { input, hash };
  }

  nonce++;
}