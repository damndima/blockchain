// Програма для обчислення хешів SHA-256 і SHA3-256

const crypto = require("crypto");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Введіть рядок для хешування: ", (input) => {
  const sha256 = crypto.createHash("sha256").update(input).digest("hex");

  const sha3_256 = crypto.createHash("sha3-256").update(input).digest("hex");

  console.log("\n Результати хешування:");
  console.log("SHA-256 :", sha256);
  console.log("SHA3-256:", sha3_256);

  console.log("\n Порівняння:");
  console.log("Довжина SHA-256 :", sha256.length, "символів");
  console.log("Довжина SHA3-256:", sha3_256.length, "символів");

  console.log("\n Висновок:");
  console.log("- Обидва хеші мають однакову довжину (256 біт або 64 hex-символи).");
  console.log("- SHA-256 (SHA-2) — швидший, використовується у Bitcoin, TLS, тощо.");
  console.log("- SHA3-256 (Keccak) — новіший стандарт, стійкіший до деяких типів атак.");
  console.log("- Отже: SHA-256 швидший ⚡, SHA3-256 — надійніший.");

  rl.close();
});