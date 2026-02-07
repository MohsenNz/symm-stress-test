import http from 'k6/http';

const url = __ENV.RPC_URL;

console.log("RPC_URL = ", url)

export const options = {
  vus: 500,
  duration: '120s',
};

export default function() {
  const calls = [
    { method: "eth_blockNumber", params: [] },
    { method: "eth_getBlockByNumber", params: ["latest", false] },
    { method: "eth_gasPrice", params: [] },
  ];

  const call = calls[Math.floor(Math.random() * calls.length)];

  const payload = {
    jsonrpc: "2.0",
    method: call.method,
    params: call.params,
    id: 1
  };

  http.post(url, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });
}
