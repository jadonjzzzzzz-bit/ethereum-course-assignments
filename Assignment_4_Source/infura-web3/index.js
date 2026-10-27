require("dotenv").config();
const Web3 = require("web3");

const apiKey = process.env.INFURA_API_KEY;
const endpoint = process.env.INFURA_MAINNET_URL ||
  (apiKey ? "https://mainnet.infura.io/v3/" + apiKey : "");

if (!endpoint) {
  console.error("Set INFURA_API_KEY or INFURA_MAINNET_URL in a local .env file.");
  process.exit(1);
}

const web3 = new Web3(new Web3.providers.HttpProvider(endpoint));
const startBlock = Number(process.env.START_BLOCK || 0);
const configuredEnd = process.env.END_BLOCK ? Number(process.env.END_BLOCK) : null;
const batchSize = Math.max(1, Number(process.env.BLOCK_BATCH_SIZE || 3));
const maxRetries = Math.max(0, Number(process.env.MAX_RETRIES || 5));

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getBlockWithRetry(blockNumber) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await web3.eth.getBlock(blockNumber, true);
    } catch (error) {
      if (attempt >= maxRetries) throw error;
      await delay(500 * (2 ** attempt));
    }
  }
}

async function findFirstContractCreation() {
  const latestBlock = Number(await web3.eth.getBlockNumber());
  const endBlock = configuredEnd === null ? latestBlock : Math.min(configuredEnd, latestBlock);
  if (!Number.isSafeInteger(startBlock) || !Number.isSafeInteger(endBlock) ||
      startBlock < 0 || endBlock < startBlock) {
    throw new Error("Invalid scan range " + startBlock + ".." + endBlock);
  }

  console.log("Scanning Ethereum mainnet blocks " + startBlock + " through " + endBlock + ".");
  for (let first = startBlock; first <= endBlock; first += batchSize) {
    const last = Math.min(first + batchSize - 1, endBlock);
    const blockNumbers = Array.from({ length: last - first + 1 }, (_, i) => first + i);
    const blocks = await Promise.all(blockNumbers.map(getBlockWithRetry));

    // Promise.all preserves input order, so the first match is the earliest transaction.
    for (const block of blocks) {
      if (!block) continue;
      for (const tx of block.transactions) {
        if (tx.to === null) {
          return {
            blockNumber: block.number,
            blockHash: block.hash,
            transactionHash: tx.hash,
            transactionIndex: tx.transactionIndex,
            sender: tx.from
          };
        }
      }
    }

    if ((last + 1) % 10000 < batchSize) {
      console.log("Scanned through block " + last + ".");
    }

    // Pace requests to stay within typical free-tier throughput limits.
    if (last < endBlock) await delay(1000);
  }
  return null;
}

findFirstContractCreation()
  .then(result => {
    if (!result) {
      console.log("No contract-creation transaction was found in the scanned range.");
      process.exitCode = 2;
      return;
    }
    console.log("First contract-creation transaction:");
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error("Scan failed:", error.message);
    process.exitCode = 1;
  });
