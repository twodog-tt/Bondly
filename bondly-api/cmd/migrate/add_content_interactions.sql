-- 创建内容互动相关表
-- 执行时间: 2024-01-XX
-- 描述: 创建内容互动功能所需的数据库表

-- 创建内容互动表
CREATE TABLE IF NOT EXISTS content_interactions (
    id BIGSERIAL PRIMARY KEY,
    content_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'dislike', 'bookmark', 'share')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_id, user_id, interaction_type)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_content_interactions_content_id ON content_interactions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_user_id ON content_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_type ON content_interactions(interaction_type);

-- 创建内容点赞表（如果不存在）
CREATE TABLE IF NOT EXISTS content_likes (
    id BIGSERIAL PRIMARY KEY,
    content_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_like BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_id, user_id)
);

-- 创建内容收藏表（如果不存在）
CREATE TABLE IF NOT EXISTS content_bookmarks (
    id BIGSERIAL PRIMARY KEY,
    content_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_id, user_id)
);

-- 创建内容分享表（如果不存在）
CREATE TABLE IF NOT EXISTS content_shares (
    id BIGSERIAL PRIMARY KEY,
    content_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_content_likes_content_id ON content_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_user_id ON content_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_content_bookmarks_content_id ON content_bookmarks(content_id);
CREATE INDEX IF NOT EXISTS idx_content_bookmarks_user_id ON content_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_content_shares_content_id ON content_shares(content_id);
CREATE INDEX IF NOT EXISTS idx_content_shares_user_id ON content_shares(user_id);

-- 验证表创建成功
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('content_interactions', 'content_likes', 'content_bookmarks', 'content_shares'); 