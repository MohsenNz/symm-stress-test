import http from 'k6/http';

const url = "https://symmchain-node1.muon.net";
// const url = "http://127.0.0.1:8449";

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
