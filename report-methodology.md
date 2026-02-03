# **RPC & Mempool Stress Testing Methodology Summary**

## 1. Objective

The purpose of the stress testing was to evaluate the performance, stability, and failure characteristics of a private Arbitrum-Orbit (Geth-compatible) blockchain node under realistic and worst-case RPC and transaction workloads.

The tests aimed to measure:

- [x] Maximum sustainable RPC throughput (requests per second)
- [x] Latency distribution (P50, P95, P99)
- [x] Error rates under load
- [x] Node CPU, memory, and disk I/O saturation thresholds
- [ ] Transaction pool (mempool) and sequencer behavior under high write load
- [x] System stability and failure modes under extreme conditions

## 2. Test Environment

**Node Hardware Configuration**

- CPU: 4 vCPUs (x86_64)
- Memory: 16 GB RAM (no swap)
- Storage: 1 TB NVMe SSD
- OS: Ubuntu 24.04 LTS
- Single-node Arbitrum Orbit

This configuration represents a minimal production-like RPC and sequencer node.

## 3. Tooling

### Load Testing Framework

- **k6** was used as the primary load generator for JSON-RPC stress testing due to:

  - High concurrency support
  - Scriptable workloads
  - Detailed latency and error metrics
  - Ability to simulate realistic and adversarial traffic patterns

### Supporting Tools

- [ ] **Foundry (cast)** for transaction generation and signing (TODO)
- [ ] **Prometheus / Grafana (optional)** for node metrics monitoring (TODO)

## 4. Test Phases

### Phase 1: RPC Smoke Test (Baseline Throughput)

**Goal:**
Measure raw HTTP and JSON-RPC throughput and validate RPC endpoint stability.

**Method:**
A k6 script continuously issued `eth_blockNumber` requests with fixed concurrency and duration.

**Metrics Collected:**

- Requests per second (RPS)
- Average and percentile latencies
- HTTP error rate

**Outcome:**
This phase establishes a baseline for the RPC layer independent of heavy blockchain state access.

NOTE:
We ignore it in our result since phase 2 already be passed.

### Phase 2: Realistic Read-Only RPC Load

**Goal:**
Simulate typical production read traffic from wallets, indexers, and dApps.

**RPC Methods Tested:**

- `eth_blockNumber`
- `eth_getBlockByNumber`
- `eth_gasPrice`

**Method:**
k6 randomly selected RPC calls to emulate mixed user traffic patterns.

**Metrics Collected:**

- Latency distribution (P50/P95/P99)
- CPU utilization
- RPC error rates

### Phase 3: CPU-Bound Execution Stress (`eth_call`) (TODO)

**Goal:**
Stress the EVM execution engine and state trie access.

**Method:**
k6 repeatedly executed smart contract calls via `eth_call`.

**Expected Behavior:**

- High CPU utilization
- Increasing response latency at high concurrency
- Potential RPC timeouts under saturation

This phase identifies compute bottlenecks in the node.

### Phase 4: Disk-Bound State Scan Stress (`eth_getLogs`)

**Goal:**
Stress disk I/O and database indexing.

**Method:**
Large-range `eth_getLogs` queries were issued to simulate indexer-like workloads and worst-case attacks.

**Expected Behavior:**

- NVMe IOPS saturation
- High latency spikes
- Potential node unresponsiveness

This phase represents a known DoS vector on Ethereum-compatible nodes.

### Phase 5: Transaction Mempool Stress (Write Load) (TODO)

**Goal:**
Evaluate transaction ingestion, mempool behavior, and sequencer throughput.

**Method:**

1. Transactions were pre-signed using Foundry (`cast`) with unique nonces.
2. Raw signed transactions were loaded into k6.
3. k6 issued `eth_sendRawTransaction` calls at high concurrency and/or fixed TPS rates.

**Metrics Collected:**

- Transaction acceptance rate
- Mempool size and eviction behavior
- Sequencer block production latency
- Node CPU and memory usage

This phase simulates real user transaction load and adversarial spam conditions.

### Phase 6: Mixed Production Load Simulation (TODO)

**Goal:**
Model real-world RPC traffic distribution.

**Traffic Mix (example profile):**

- 70% read operations (`eth_call`, `eth_blockNumber`)
- 20% log and state queries (`eth_getLogs`, `eth_getBlockByNumber`)
- 10% transaction submissions (`eth_sendRawTransaction`)

This phase evaluates sustained operational stability.

## 5. Key Observations (General Expectations for This Hardware Class)

- Read-only RPC calls scale significantly higher than EVM execution calls.
- `eth_call` becomes CPU-bound on 4 vCPUs at moderate concurrency.
- `eth_getLogs` can saturate NVMe disk I/O and cause RPC stalls.
- High transaction throughput stresses the sequencer and txpool before raw RPC limits.
- Single-node deployments represent a single point of failure under RPC flood conditions.
