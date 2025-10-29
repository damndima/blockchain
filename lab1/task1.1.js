const crypto = require("crypto");

class BlockAlt {
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

  // Майнить поки третій символ хешу не стане '3'
  mineThirdCharIsThree() {
    let iterations = 0;
    const start = Date.now();

    while (this.hash[2] !== "3") {
      this.nonce++;
      iterations++;
      this.hash = this.calculateHash();
    }

    const timeMs = Date.now() - start;
    console.log(`Alt Block ${this.index} mined (3rd char == '3'): ${this.hash}`);
    console.log(` - iterations: ${iterations}`);
    console.log(` - time: ${timeMs} ms`);
    return { iterations, timeMs, hash: this.hash };
  }
}

const altBlock = new BlockAlt(1, Date.now().toString(), "0");
altBlock.mineThirdCharIsThree();
