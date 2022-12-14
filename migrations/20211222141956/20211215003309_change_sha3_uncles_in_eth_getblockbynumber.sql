-- +goose Up
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION eth_getBlockByNumber(block_id blockno) RETURNS block_result AS $$
DECLARE
  result block_result;
BEGIN
  SELECT
      id,                           -- number
      hash,                         -- hash
      parent_hash,                  -- parentHash
      repeat('\000', 8)::bytea,     -- nonce
      '\x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',    -- sha3Uncles keccak256(rlp.encode([]))
      repeat('\000', 256)::bytea,   -- logsBloom
      transactions_root,            -- transactionsRoot
      state_root,                   -- stateRoot
      receipts_root,                -- receiptsRoot
      repeat('\000', 20)::bytea,    -- miner
      0,                            -- difficulty
      0,                            -- totalDifficulty
      ''::bytea,                    -- extraData
      size,                         -- size
      gas_limit,                    -- gasLimit
      gas_used,                     -- gasUsed
      repeat('\000', 32)::hash,     -- mixHash
      COALESCE(EXTRACT(EPOCH FROM timestamp), 0)::int4 -- timestamp
    FROM block
    WHERE id = block_id
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION eth_getBlockByNumber(block_id blockno) RETURNS block_result AS $$
DECLARE
  result block_result;
BEGIN
  SELECT
      id,                           -- number
      hash,                         -- hash
      parent_hash,                  -- parentHash
      repeat('\000', 8)::bytea,     -- nonce
      repeat('\000', 32)::bytea,    -- sha3Uncles
      repeat('\000', 256)::bytea,   -- logsBloom
      transactions_root,            -- transactionsRoot
      state_root,                   -- stateRoot
      receipts_root,                -- receiptsRoot
      repeat('\000', 20)::bytea,    -- miner
      0,                            -- difficulty
      0,                            -- totalDifficulty
      ''::bytea,                    -- extraData
      size,                         -- size
      gas_limit,                    -- gasLimit
      gas_used,                     -- gasUsed
      repeat('\000', 32)::hash,     -- mixHash
      COALESCE(EXTRACT(EPOCH FROM timestamp), 0)::int4 -- timestamp
    FROM block
    WHERE id = block_id
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
-- +goose StatementEnd
