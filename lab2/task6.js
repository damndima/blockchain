// Блокчейн із деревом Меркла для хешів транзакцій

const crypto = require("crypto");

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function buildMerkleRoot(transactions) {
  if (transactions.length === 0) return sha256("");

  let level = transactions.map(tx => sha256(JSON.stringify(tx)));
  console.log("Рівень 0 (tx-хеші):", level);

  let levelIndex = 1;
  while (level.length > 1) {
    if (level.length % 2 !== 0) {
      level.push(level[level.length - 1]);
    }
    const newLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      const combined = level[i] + level[i + 1];
      newLevel.push(sha256(combined));
    }
    console.log(`Рівень ${levelIndex}:`, newLevel);
    level = newLevel;
    levelIndex++;
  }

  return level[0]; 
}

class Block {
  constructor(index, transactions, previousHash = "") {
    this.index = index;
    this.timestamp = new Date().toISOString();
    this.transactions = transactions; 
    this.previousHash = previousHash;
    this.merkleRoot = buildMerkleRoot(transactions);
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return sha256(this.previousHash + this.timestamp + this.merkleRoot);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, [{ from: "system", to: "Alice", amount: 100 }], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (current.hash !== current.calculateHash()) {
        return false;
      }
      if (current.previousHash !== previous.hash) {
        return false;
      }
    }
    return true;
  }
}

const blockchain = new Blockchain();

blockchain.addBlock(new Block(1, [
  { from: "Alice", to: "Bob", amount: 30 },
  { from: "Charlie", to: "Alice", amount: 20 },
  { from: "Bob", to: "Eve", amount: 10 }
]));

blockchain.addBlock(new Block(2, [
  { from: "Eve", to: "Dan", amount: 5 },
  { from: "Alice", to: "Frank", amount: 40 }
]));

console.log("\nБлокчейн");
console.log(JSON.stringify(blockchain, null, 2));

console.log("\nПеревірка цілісності:", blockchain.isChainValid());

console.log("\nЗмінюємо одну транзакцію у блоці 1...");
blockchain.chain[1].transactions[0].amount = 9999; 
blockchain.chain[1].merkleRoot = buildMerkleRoot(blockchain.chain[1].transactions);
blockchain.chain[1].hash = blockchain.chain[1].calculateHash();

console.log("\nПісля зміни:");
console.log(JSON.stringify(blockchain, null, 2));

console.log("\n❌ Перевірка цілісності після зміни:", blockchain.isChainValid());