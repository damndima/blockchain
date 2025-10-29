const crypto = require("crypto");

class Validator {
  constructor(name, stake) {
    this.name = name;
    this.stake = stake;
  }
}

function selectValidator(validators) {
  const totalStake = validators.reduce((sum, v) => sum + v.stake, 0);
  let rand = Math.floor(Math.random() * totalStake);

  for (const v of validators) {
    rand -= v.stake;
    if (rand < 0) {
      return v;
    }
  }
  return validators[validators.length - 1]; 
}

class Block {
  constructor(index, timestamp, data, previousHash = "", validator = null) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.validator = validator ? validator.name : "unknown";
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto.createHash("sha256")
      .update(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash + this.validator)
      .digest("hex");
  }
}

class Blockchain {
  constructor(validators) {
    this.chain = [this.createGenesisBlock()];
    this.validators = validators;
  }

  createGenesisBlock() {
    return new Block(0, Date.now().toString(), "Genesis Block", "0", { name: "system" });
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data) {
    const chosenValidator = selectValidator(this.validators);
    const newBlock = new Block(
      this.chain.length,
      Date.now().toString(),
      data,
      this.getLatestBlock().hash,
      chosenValidator
    );
    this.chain.push(newBlock);
    console.log(`Block ${newBlock.index} validated by ${newBlock.validator} (stake = ${chosenValidator.stake})`);
    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const prevBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      if (currentBlock.previousHash !== prevBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

const validators = [
  new Validator("Alice", 5),
  new Validator("Bob", 10),
  new Validator("Charlie", 1)
];

const myPoSChain = new Blockchain(validators);

console.log("⛏ Adding 5 blocks...");
for (let i = 1; i <= 5; i++) {
  myPoSChain.addBlock({ amount: i * 10 });
}

console.log("\nBlockchain valid?", myPoSChain.isChainValid()); 

console.log("\n--- Tampering block 2 ---");
myPoSChain.chain[2].data = { hacked: true };
console.log("Blockchain valid after tamper?", myPoSChain.isChainValid()); 

console.log("\n⛏ Simulating 50 blocks...");
let wins = { Alice: 0, Bob: 0, Charlie: 0 };

for (let i = 0; i < 50; i++) {
  const b = myPoSChain.addBlock({ tx: `tx ${i}` });
  wins[b.validator]++;
}

console.log("\nValidator wins distribution over 50 blocks:");
console.log(wins);