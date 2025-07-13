-- 删除旧的内容互动相关表
-- 执行时间: 2024-01-XX
-- 描述: 删除冗余的content_likes、content_bookmarks、content_shares表，统一使用content_interactions表

-- 删除旧表（如果存在）
DROP TABLE IF EXISTS content_likes CASCADE;
DROP TABLE IF EXISTS content_bookmarks CASCADE;
DROP TABLE IF EXISTS content_shares CASCADE;

-- 删除相关索引（如果存在）
DROP INDEX IF EXISTS idx_content_likes_content_id;
DROP INDEX IF EXISTS idx_content_likes_user_id;
DROP INDEX IF EXISTS idx_content_bookmarks_content_id;
DROP INDEX IF EXISTS idx_content_bookmarks_user_id;
DROP INDEX IF EXISTS idx_content_shares_content_id;
DROP INDEX IF EXISTS idx_content_shares_user_id;

-- 验证表删除成功
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('content_likes', 'content_bookmarks', 'content_shares');

-- 验证content_interactions表仍然存在
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'content_interactions'; 