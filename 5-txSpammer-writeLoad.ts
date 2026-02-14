import { ethers } from "ethers";
import fs from "fs";
import path from "path";

// ----------------------------------------------------------------------------
// -- CONFIG
const RPC_URL = unOpt(process.env.RPC_URL);
const WALLET_PRIVATE_KEY = unOpt(process.env.PK);
const CONTRACT_ADDRESS = "0x356380855afCb805d4Fc1f55e92089a05BEADF18";
const ABI = [
  "function setNumber(uint256 num) external"
];
const reqCount = 10;

// ----------------------------------------------------------------------------
// -- PROVIDER & WALLET
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// ----------------------------------------------------------------------------
// -- Types

type txResult = {
  elapsed: number, // seconds
  success: boolean
}

type Out = {
  reqCountAll: number,
  reqCountSucc: number,
  avgTimeAll: number,
  avgTimeSucc: number,
  minTime: number,
  maxTime: number,
  medTime: number,
}

//-------------------------------------------------------
// -- Def

async function main() {
  // Get starting nonce
  const baseNonce = await wallet.getNonce();

  const txPromises: Promise<void>[] = [];
  const txRes: txResult[] = [];

  for (let i = 0; i < reqCount; i++) {
    const nonce = baseNonce + i;

    const txPromise = (async () => {
      const startTime = Date.now();

      try {
        const tx = await contract.setNumber(i, {
          nonce,
          gasLimit: 100_000
        });

        // Wait for transaction to be mined
        const receipt = await tx.wait();

        const elapsed = (Date.now() - startTime) / 1000; // seconds
        const success = receipt.status === 1 ? true : false;
        txRes[i] = { elapsed, success }

      } catch (err: any) {
        console.error(`Tx ${i} failed: ${err.message}`);
      }
    })();

    txPromises.push(txPromise);
  }

  await Promise.all(txPromises);

  const timeSuccs = txRes.filter((x) => x.success).map((x) => x.elapsed);

  console.debug("timeSuccs: ", timeSuccs); // debug

  const out: Out = {
    reqCountAll: reqCount,
    reqCountSucc: txRes.filter((x) => x.success).length,
    avgTimeAll: txRes.reduce((acc, x) => acc + x.elapsed, 0) / txRes.length,
    avgTimeSucc: timeSuccs.reduce((acc, x) => acc + x) / txRes.length,
    minTime: Math.min(...timeSuccs),
    maxTime: Math.max(...timeSuccs),
    medTime: median(timeSuccs) || 0,
  }

  // console.log(JSON.stringify(out, null, 2));
  printOut(out)
}

function printOut(o: Out) {
  const reqCountFailed = o.reqCountAll - o.reqCountSucc

  console.log("requst duration:")
  console.log("  average (all)    :", o.avgTimeAll.toFixed(3))
  console.log("  average (success):", o.avgTimeSucc.toFixed(3))
  console.log("  min              :", o.minTime.toFixed(3))
  console.log("  max              :", o.maxTime.toFixed(3))
  console.log("  med              :", o.medTime.toFixed(3))
  console.log("requst count:", o.reqCountAll)
  console.log("  all              :", o.reqCountAll.toFixed(3))
  console.log("  success          :", o.reqCountSucc.toFixed(3), `${(o.reqCountSucc / o.reqCountAll).toFixed(3)}%`)
  console.log("  failed           :", reqCountFailed.toFixed(3), `${(reqCountFailed / o.reqCountAll).toFixed(3)}%`)
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
