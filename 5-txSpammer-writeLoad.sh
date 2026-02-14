NONCE=$(cast nonce "$WALLET" --rpc-url "$RPC_URL")

for i in {0..10000}; do
  cast send 0x356380855afCb805d4Fc1f55e92089a05BEADF18 "setNumber(uint256)" "$i" \
    --nonce $((NONCE+i)) \
    --gas-limit 100000 \
    --private-key "$PK" \
    --rpc-url "$RPC_URL" &
done

wait
