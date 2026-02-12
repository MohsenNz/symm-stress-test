for i in {1..10000}; do
  cast send "$ADDR" "stress(uint256,uint256)" 1 0 \
    --private-key "$PK" \
    --rpc-url "$RPC_URL"
done
