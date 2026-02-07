import http from 'k6/http';
import { unOpt } from './util.js'

const url = unOpt(__ENV.RPC_URL);

console.log("RPC_URL = ", url)

export const options = {
  vus: 500,        // visual users, concurrency
  duration: '60s', // test duration
};

export default function() {
  const payload = {
    jsonrpc: "2.0",
    method: "eth_blockNumber",
    params: [],
    id: 1
  };

  http.post(url, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });
}
