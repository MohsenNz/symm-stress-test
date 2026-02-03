import http from 'k6/http';

const url = "https://symmchain-node1.muon.net";
// const url = "http://127.0.0.1:8449";

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
