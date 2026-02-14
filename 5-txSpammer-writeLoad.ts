import { ethers } from "ethers";
import { privates } from "./privates";

// ----------------------------------------------------------------------------
// -- CONFIG
const RPC_URL = unOpt(process.env.RPC_URL);
// const WALLET_PRIVATE_KEY = unOpt(process.env.PK);
const CONTRACT_ADDRESS = "0x356380855afCb805d4Fc1f55e92089a05BEADF18";
const ABI = [
  "function setNumber(uint256 num) external"
];
const reqCount = 10;

// ----------------------------------------------------------------------------
// -- PROVIDER & WALLET
const provider = new ethers.JsonRpcProvider(RPC_URL);
// const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
// const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

const wallets = privates.map((pk) => new ethers.Wallet(pk, provider))

// ----------------------------------------------------------------------------
// -- Types

type txResult = {
  sentElapsed: number, // seconds
  minedElapsed: number, // seconds
  success: boolean,
  txHash: string,
  blockNumber: number,
}

type Out = {
  reqCountAll: number,
  reqCountSucc: number,
  sentAvgTimeAll: number,
  sentAvgTimeSucc: number,
  sentMinTime: number,
  sentMaxTime: number,
  sentMedTime: number,

  mindAvgTimeAll: number,
  mindAvgTimeSucc: number,
  mindMinTime: number,
  mindMaxTime: number,
  mindMedTime: number,

  perBlockNumber: Map<number, number>,
}

//-------------------------------------------------------
// -- Def

async function main() {
  const txPromises: Promise<void>[] = [];
  const txRess: txResult[] = [];

  let i = 1;
  for (const wallet of wallets) {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    const txPromise = (async () => {
      try {
        const sentAt = Date.now();

        const tx = await contract.setNumber(i++, {
          gasLimit: 100_000
        });
        const sentElapsed = (Date.now() - sentAt) / 1000; // seconds

        // Wait for transaction to be mined
        const receipt = await tx.wait();

        const minedElapsed = (Date.now() - sentAt) / 1000; // seconds
        const success = receipt.status === 1 ? true : false;
        const txHash = tx.hash;
        const blockNumber = receipt.blockNumber;
        txRess.push({ sentElapsed, minedElapsed, success, txHash, blockNumber })
      } catch (err: any) {
        console.error(`Tx ${i} failed: ${err.message}`);
      }
    })();

    txPromises.push(txPromise);
  }

  await Promise.all(txPromises);

  const timeSuccSents = txRess.filter((x) => x.success).map((x) => x.sentElapsed);
  const timeSuccMineds = txRess.filter((x) => x.success).map((x) => x.minedElapsed);

  console.debug("timeSuccsSent: ", timeSuccSents); // debug
  console.debug("timeSuccsMined: ", timeSuccMineds); // debug

  const perBlockNumber = new Map<number, number>();
  const l = txRess.map((x) => x.blockNumber)
  for (const bn of l) {
    perBlockNumber.set(bn, (perBlockNumber.get(bn) ?? 0) + 1)
  }

  const out: Out = {
    reqCountAll: wallets.length,
    reqCountSucc: txRess.filter((x) => x.success).length,

    sentAvgTimeAll: txRess.reduce((acc, x) => acc + x.sentElapsed, 0) / txRess.length,
    sentAvgTimeSucc: timeSuccSents.reduce((acc, x) => acc + x, 0) / txRess.length,
    sentMinTime: Math.min(...timeSuccSents),
    sentMaxTime: Math.max(...timeSuccSents),
    sentMedTime: median(timeSuccSents) || 0,

    mindAvgTimeAll: txRess.reduce((acc, x) => acc + x.minedElapsed, 0) / txRess.length,
    mindAvgTimeSucc: timeSuccMineds.reduce((acc, x) => acc + x, 0) / txRess.length,
    mindMinTime: Math.min(...timeSuccMineds),
    mindMaxTime: Math.max(...timeSuccMineds),
    mindMedTime: median(timeSuccMineds) || 0,

    perBlockNumber
  }

  // console.log(JSON.stringify(out, null, 2));
  printOut(out)

  const faileds = txRess.filter((x) => !x.success)
  const failedTxHashs = faileds.map((x) => x.txHash)

  if (failedTxHashs.length > 0)
    console.debug("Some Tx failed :\n", failedTxHashs.slice(0, 10))
}

function printOut(o: Out) {
  const reqCountFailed = o.reqCountAll - o.reqCountSucc

  console.log("requst duration (sent):")
  console.log("  average (all)    :", o.sentAvgTimeAll.toFixed(3))
  console.log("  average (success):", o.sentAvgTimeSucc.toFixed(3))
  console.log("  min              :", o.sentMinTime.toFixed(3))
  console.log("  max              :", o.sentMaxTime.toFixed(3))
  console.log("  med              :", o.sentMedTime.toFixed(3))
  console.log("requst duration (mined):")
  console.log("  average (all)    :", o.mindAvgTimeAll.toFixed(3))
  console.log("  average (success):", o.mindAvgTimeSucc.toFixed(3))
  console.log("  min              :", o.mindMinTime.toFixed(3))
  console.log("  max              :", o.mindMaxTime.toFixed(3))
  console.log("  med              :", o.mindMedTime.toFixed(3))
  console.log("requst count:")
  console.log("  all              :", o.reqCountAll)
  console.log("  success          :", o.reqCountSucc, `${(o.reqCountSucc / o.reqCountAll * 100).toFixed(1)}%`)
  console.log("  failed           :", reqCountFailed, `${(reqCountFailed / o.reqCountAll * 100).toFixed(1)}%`)
  console.log("tx per block:")
  for (const x of o.perBlockNumber) {
    console.log(`  blocknumber=${x[0]} tx-count: ${x[1]}`)
  }
}

function median(numbers: number[]): number | undefined {
  if (numbers.length === 0) {
    console.error("Error: empty list median")
    return undefined;
  }

  const sorted = [...numbers].sort((a, b) => a - b);

  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

function unOpt<T>(x: T | undefined | null): T {
  switch (x) {
    case undefined:
    case null:
      throw new Error("unexpected null/undefined")
    default:
      return x;
  }
}

// ----------------------------------------------------------------------------
// -- Exe

main().catch((err) => {
  console.error("Script failed:", err);
});
