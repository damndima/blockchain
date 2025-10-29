// Генерація RSA-2048 ключів, підпис повідомлення приватним ключем і перевірка публічним ключем

const crypto = require("crypto");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,           
  publicKeyEncoding: {
    type: "spki",               
    format: "pem"
  },
  privateKeyEncoding: {
    type: "pkcs8",             
    format: "pem",
  }
});

const message = "Це секретне повідомлення для підпису.";
const modifiedMessage = "Це СЕКРЕТНЕ повідомлення для підпису.";

function signMessage(privKeyPem, msg) {
  const sign = crypto.createSign("sha256");
  sign.update(msg);
  sign.end();
  const signature = sign.sign(privKeyPem);
  return signature;
}

function verifySignature(pubKeyPem, msg, signatureBuffer) {
  const verify = crypto.createVerify("sha256");
  verify.update(msg);
  verify.end();
  return verify.verify(pubKeyPem, signatureBuffer);
}

const signatureBuf = signMessage(privateKey, message);

console.log("RSA-2048 підпис/перевірка\n");

const pubShort = publicKey.replace(/\r?\n/g, "\\n");
const start = pubShort.slice(0, 80);
const end = pubShort.slice(-80);
console.log("Публічний ключ (укорочено):");
console.log(start + " ... " + end + "\n");

console.log("Підпис (hex)   :", signatureBuf.toString("hex"));
console.log("Підпис (base64):", signatureBuf.toString("base64"));
console.log("Довжина підпису (байт):", signatureBuf.length, "\n");

const okOriginal = verifySignature(publicKey, message, signatureBuf);
console.log("Перевірка підпису для ОРИГІНАЛЬНОГО повідомлення:", okOriginal); 

const okModified = verifySignature(publicKey, modifiedMessage, signatureBuf);
console.log("Перевірка підпису для ЗМІНЕНОГО повідомлення     :", okModified); 

console.log("\n Додатково (коротко)");
console.log("Приватний ключ (перші 120 символів):");
console.log(privateKey.slice(0, 120).replace(/\r?\n/g, "\\n") + " ...");
console.log("\nПублічний ключ (перші 120 символів):");
console.log(publicKey.slice(0, 120).replace(/\r?\n/g, "\\n") + " ...\n");

/*
Коментар:
- Приватний ключ ніколи не передається іншим, бо він дає можливість:
    1) підписувати повідомлення від імені власника ключа;
    2) повністю підробляти автентичність.
  Якщо приватний ключ стане відомим, нападник зможе підписувати будь-які повідомлення і видавати їх за справжні.
- Публічний ключ розповсюджуємо — на його основі інші можуть перевірити підпис.
- Для безпечного зберігання приватного ключа його зазвичай шифрують і/або зберігають у захищених модулях (HSM, secure enclave).
*/