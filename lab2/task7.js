// Реалізація Merkle proof (доказу належності транзакції блоку)

const crypto = require("crypto");

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function buildMerkleTree(transactions) {
  if (transactions.length === 0) return [sha256("")];

  let level = transactions.map(tx => sha256(JSON.stringify(tx)));
  const tree = [level]; 

  while (level.length > 1) {
    if (level.length % 2 !== 0) {
      level.push(level[level.length - 1]);
    }

    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      nextLevel.push(sha256(level[i] + level[i + 1]));
    }
    tree.push(nextLevel);
    level = nextLevel;
  }

  return tree;
}

function getMerkleRoot(tree) {
  return tree[tree.length - 1][0];
}

function getMerkleProof(transactions, txIndex) {
  const tree = buildMerkleTree(transactions);
  const proof = [];
  let index = txIndex;

  for (let level = 0; level < tree.length - 1; level++) {
    const currentLevel = tree[level];
    const isRightNode = index % 2; 
    const pairIndex = isRightNode ? index - 1 : index + 1;

    if (pairIndex < currentLevel.length) {
      proof.push({
        hash: currentLevel[pairIndex],
        direction: isRightNode ? "left" : "right"
      });
    }

    index = Math.floor(index / 2); 
  }

  return proof;
}

function verifyProof(tx, proof, merkleRoot) {
  let computedHash = sha256(JSON.stringify(tx));

  for (const step of proof) {
    if (step.direction === "left") {
      computedHash = sha256(step.hash + computedHash);
    } else {
      computedHash = sha256(computedHash + step.hash);
    }
  }

  return computedHash === merkleRoot;
}

const transactions = [
  { from: "Alice", to: "Bob", amount: 10 },
  { from: "Charlie", to: "Dave", amount: 20 },
  { from: "Eve", to: "Frank", amount: 30 },
  { from: "George", to: "Helen", amount: 40 }
];

const tree = buildMerkleTree(transactions);
const merkleRoot = getMerkleRoot(tree);

console.log("Merkle Root:", merkleRoot);
console.log("\nТранзакції:");
transactions.forEach((tx, i) => console.log(`${i}:`, tx));

const txId = 2;
const proof = getMerkleProof(transactions, txId);
const result1 = verifyProof(transactions[txId], proof, merkleRoot);

console.log("\n✅ (1) Справжня транзакція:");
console.log("txId:", txId);
console.log("proof:", proof);
console.log("Результат перевірки:", result1);

const tamperedTx = { from: "Eve", to: "Frank", amount: 999 };
const result2 = verifyProof(tamperedTx, proof, merkleRoot);

console.log("\n❌ (2) Транзакцію підроблено:");
console.log("Результат перевірки:", result2);

const fakeTx = { from: "X", to: "Y", amount: 123 };
const fakeProof = getMerkleProof(transactions, 0); 
const result3 = verifyProof(fakeTx, fakeProof, merkleRoot);

console.log("\n❌ (3) Транзакція відсутня у блоці:");
console.log("Результат перевірки:", result3);

console.log("\nЛегкий клієнт має тільки:");
console.log("- Заголовок блоку: { timestamp, prevHash, merkleRoot }");
console.log("- Proof для однієї транзакції (масив хешів + напрямки)");
console.log("→ Але може впевнено перевірити її справжність без усіх транзакцій!");