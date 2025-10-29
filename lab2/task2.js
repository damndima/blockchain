// Демонстрація ефекту лавини у SHA-256
const crypto = require("crypto");

function generateRandomString(length = 16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

const original = generateRandomString();
const hash1 = sha256(original);

const modified =
  original.substring(0, 0) + (original[0] === "a" ? "b" : "a") + original.substring(1);
const hash2 = sha256(modified);

let diffCount = 0;
for (let i = 0; i < hash1.length; i++) {
  if (hash1[i] !== hash2[i]) diffCount++;
}
const percentDiff = ((diffCount / hash1.length) * 100).toFixed(2);

console.log(" Початковий рядок :", original);
console.log("SHA-256 (original) :", hash1);
console.log("\nЗмінений рядок   :", modified);
console.log("SHA-256 (modified) :", hash2);

console.log(`\n Відмінності між хешами: ${diffCount} / ${hash1.length} символів (${percentDiff}%)`);
console.log("\n Висновок:");
console.log("Ефект лавини означає, що навіть зміна одного символу змінює більшість бітів у хеші.");
console.log("Це критично для блокчейну, бо гарантує:");
console.log("- неможливість передбачити або відновити вихідні дані з хешу;");
console.log("- неможливість частково підмінити дані без зміни всього хешу;");
console.log("- цілісність усіх блоків у ланцюгу: зміна одного блоку змінює всі наступні.");