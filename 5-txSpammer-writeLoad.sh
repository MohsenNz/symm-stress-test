for i in {1..10000}; do
  cast send 0x356380855afCb805d4Fc1f55e92089a05BEADF18 "setNumber(uint256)" "$i" \
    --private-key "$PK" \
    --rpc-url "$RPC_URL"
done
