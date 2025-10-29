const crypto = require("crypto");

class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto.createHash("sha256")
      .update(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash + this.nonce)
      .digest("hex");
  }

  mineBlock(difficulty) {
    const target = "0".repeat(difficulty);
    let iterations = 0;
    const start = Date.now();

    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      iterations++;
      this.hash = this.calculateHash();
    }

    const timeMs = Date.now() - start;
    console.log(`Block ${this.index} mined: ${this.hash}`);
    console.log(` - iterations (nonce tries): ${iterations}`);
    console.log(` - time: ${timeMs} ms`);
    return { iterations, timeMs, hash: this.hash };
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3;
  }

  createGenesisBlock() {
    return new Block(0, Date.now().toString(), "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    const stats = newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return stats;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log(`Invalid: block ${i} hash does not match calculated hash.`);
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log(`Invalid: block ${i} previousHash mismatch.`);
        return false;
      }
      if (currentBlock.hash.substring(0, this.difficulty) !== "0".repeat(this.difficulty)) {
        console.log(`Invalid: block ${i} does not meet difficulty requirement.`);
        return false;
      }
    }
    return true;
  }
}

const myCoin = new Blockchain();

console.log("⛏ Mining block 1...");
myCoin.addBlock(new Block(1, Date.now().toString(), { amount: 4 }));

console.log("⛏ Mining block 2...");
myCoin.addBlock(new Block(2, Date.now().toString(), { amount: 10 }));

console.log("⛏ Mining block 3...");
myCoin.addBlock(new Block(3, Date.now().toString(), { amount: 8 }));

console.log("\nBlockchain valid?", myCoin.isChainValid()); // true

console.log("\n--- Tampering block 1 data (simulate hack) ---");
myCoin.chain[1].data = { amount: 1000, hacked: true };

console.log("Blockchain valid after tamper?", myCoin.isChainValid()); // false