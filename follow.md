What You’re Stress-Testing (RPC)
---

Typical RPC bottlenecks:
- eth_call (smart contract simulation)
- eth_getBlockByNumber
- eth_getLogs (very expensive)
- eth_sendRawTransaction (tx pool pressure)
- WebSocket subscriptions

You should test read load, write load, and mixed load separately.

What Metrics You MUST Watch
---

Node metrics
- CPU %
- Memory usage
- Disk IOPS
- Peer count
- RPC latency
- Txpool size
- Block time drift

RPC metrics
- Requests/sec
- Error rate
- P95 latency
- Timeout rate

Realistic Stress Test Strategy
---

Phase 1 — Read Only
- eth_blockNumber
- eth_call
- eth_getLogs

Phase 2 — Write Only
- Send signed transactions
- Fill mempool
- Observe block production

Phase 3 — Mixed Load (Production Simulation)
- 80% reads, 20% writes

Pro Tips (From Production Chains)
---

### eth_getLogs will kill your node first
Limit range or test intentionally to find index bottlenecks.

### Use WebSocket too
HTTP is cheap; WS subscriptions are heavy.

### Test with archival mode ON/OFF
Archival nodes behave very differently.

### Test multi-node RPC behind load balancer
Single node != production.

Arbitrum Orbit-Specific Pitfalls
---

### Sequencer is CPU bound
Unlike L1 geth, Orbit sequencer:
- compresses calldata
- batches L2 blocks
- does extra fraud-proof metadata
-> eth_call can kill sequencer faster than L1 geth.

⚠️ eth_getLogs is worse on Orbit

Orbit chains often have less indexed infra, so logs scan raw state.

⚠️ Single-node = SPOF

RPC stress can halt consensus if node is sequencer.

👉 Run RPC on a non-sequencer replica in real prod.
