// Симуляція цифрового підпису документа і перевірка валідності (RSA-2048)

const crypto = require("crypto");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" }
});

const document = {
  id: "001",
  author: "Дмитро Страхов",
  content: "Це офіційний документ, що підтверджує володіння лабораторною 5."
};

const documentText = JSON.stringify(document, null, 2);

function signData(privKey, text) {
  const sign = crypto.createSign("sha256");
  sign.update(text);
  sign.end();
  return sign.sign(privKey, "base64");
}

function verifyData(pubKey, text, signature) {
  const verify = crypto.createVerify("sha256");
  verify.update(text);
  verify.end();
  return verify.verify(pubKey, signature, "base64");
}

const signature = signData(privateKey, documentText);

console.log("Симуляція перевірки цифрового підпису\n");
console.log("Документ:", documentText);
console.log("\nПідпис (base64, скорочено):", signature.slice(0, 60) + "...");

const isValidOriginal = verifyData(publicKey, documentText, signature);
console.log("\n✅ (a) Справжній документ → перевірка:", isValidOriginal);

const modifiedDocument = JSON.stringify({
  ...document,
  content: "Це офіційний документ, що підтверджує володіння об'єктом №18."
});
const isValidModified = verifyData(publicKey, modifiedDocument, signature);
console.log("❌ (b) Документ змінено → перевірка:", isValidModified);

const fakeSignature = signData(privateKey, documentText + " ");
const isValidFake = verifyData(publicKey, documentText, fakeSignature);
console.log("❌ (c) Підпис підмінено → перевірка:", isValidFake);

console.log("\n Висновок:");
console.log("- Цифровий підпис гарантує автентичність і цілісність документа.");
console.log("- Якщо змінюється навіть один символ у документі або підписі — перевірка провалюється.");
console.log("- Приватний ключ використовується лише для підпису й НІКОЛИ не передається іншим.");