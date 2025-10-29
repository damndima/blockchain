const API_KEY = "UXVP6TXZFRCE11MFQM37229C47S386Y35P";
const BASE_URL = "https://api.etherscan.io/v2/api";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function hexToDec(hexStr) {
  return parseInt(hexStr, 16);
}

function toReadableDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleString("uk-UA");
}

async function etherscanRequest(action, params = {}) {
  const url = new URL(BASE_URL);
  url.searchParams.set("chainid", "1");
  url.searchParams.set("module", "proxy");
  url.searchParams.set("action", action);
  url.searchParams.set("apikey", API_KEY);
  for (const [key, val] of Object.entries(params)) url.searchParams.set(key, val);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`API Etherscan недоступний (HTTP ${res.status})`);

  const data = await res.json();

  if (data.error) throw new Error(`Помилка Etherscan: ${data.error.message}`);
  if (!data.result) throw new Error("Порожня відповідь або невірний API-ключ.");

  return data.result;
}

async function getLatestBlockNumber() {
  return etherscanRequest("eth_blockNumber");
}

async function getBlockByNumber(tagHex, includeTx = true) {
  return etherscanRequest("eth_getBlockByNumber", {
    tag: tagHex,
    boolean: includeTx ? "true" : "false",
  });
}

async function main() {
  if (!API_KEY) {
    console.error("Не знайдено змінну ETHERSCAN_API_KEY");
    process.exit(1);
  }

  try {
    console.log("Отримуємо номер останнього блоку...");
    const latestHex = await getLatestBlockNumber();

    if (latestHex.startsWith("You are using a deprecated")) {
      throw new Error("API V1");
    }

    const latestDec = hexToDec(latestHex);
    console.log(`Останній блок: #${latestDec} (hex: ${latestHex})`);

    console.log("Отримуємо інформацію про блок...");
    const block = await getBlockByNumber(latestHex, true);

    const blockNum = hexToDec(block.number);
    const timestamp = hexToDec(block.timestamp);
    const date = toReadableDate(timestamp);
    const txCount = block.transactions?.length ?? 0;
    const hash = block.hash;
    const prevHash = block.parentHash;

    console.log("\nІнформація про останній блок:");
    console.log(`• Номер блоку:            ${blockNum}`);
    console.log(`• Дата створення:         ${date}`);
    console.log(`• Кількість транзакцій:   ${txCount}`);
    console.log(`• Хеш блоку:              ${hash}`);
    console.log(`• Хеш попереднього блоку: ${prevHash}`);

    console.log("\nРозрахунок середньої кількості транзакцій за 5 останніх блоків...");

    const totalBlocks = 5;
    let totalTx = txCount;

    for (let i = 1; i < totalBlocks; i++) {
      const hexTag = "0x" + (latestDec - i).toString(16);
      await sleep(250); // невелика пауза
      const b = await getBlockByNumber(hexTag, true);
      const txs = b.transactions?.length ?? 0;
      totalTx += txs;
      console.log(`Блок #${hexToDec(b.number)} → ${txs} транзакцій`);
    }

    const avg = totalTx / totalBlocks;
    console.log(`\nСередня кількість транзакцій: ${avg.toFixed(2)} за блок`);

  } catch (err) {
    const msg = err.message || err.toString();

    if (/api.?key/i.test(msg)) {
      console.error("Помилка: невірний або відсутній API-ключ.");
    } else if (/network|fetch|Etherscan недоступний/i.test(msg)) {
      console.error("Помилка: API Etherscan зараз недоступний або проблема з мережею.");
    }

    console.error("Деталі:", msg);
  }
}

main();