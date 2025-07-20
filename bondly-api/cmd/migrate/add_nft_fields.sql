-- 添加NFT相关字段到contents表
ALTER TABLE contents 
ADD COLUMN IF NOT EXISTS nft_token_id BIGINT,
ADD COLUMN IF NOT EXISTS nft_contract_address VARCHAR(42),
ADD COLUMN IF NOT EXISTS ipfs_hash TEXT,
ADD COLUMN IF NOT EXISTS metadata_hash TEXT;

-- 添加注释
COMMENT ON COLUMN contents.nft_token_id IS 'NFT Token ID，如果内容已铸造为NFT';
COMMENT ON COLUMN contents.nft_contract_address IS 'NFT合约地址';
COMMENT ON COLUMN contents.ipfs_hash IS 'IPFS内容哈希';
COMMENT ON COLUMN contents.metadata_hash IS 'IPFS元数据哈希'; 