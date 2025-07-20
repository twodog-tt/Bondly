-- 为comments表添加content_id字段，支持关联contents表
-- 执行时间: 2025-07-20

-- 1. 添加content_id字段
ALTER TABLE comments ADD COLUMN content_id BIGINT;

-- 2. 添加外键约束
ALTER TABLE comments ADD CONSTRAINT fk_comments_content 
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE;

-- 3. 创建索引以提高查询性能
CREATE INDEX idx_comments_content_id ON comments(content_id);

-- 4. 修改post_id字段为可空（因为现在可以关联posts或contents）
-- 注意：这里需要先删除现有的外键约束，然后重新添加
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_post;
ALTER TABLE comments ALTER COLUMN post_id DROP NOT NULL;
ALTER TABLE comments ADD CONSTRAINT fk_comments_post 
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- 5. 添加检查约束，确保post_id和content_id至少有一个不为空
ALTER TABLE comments ADD CONSTRAINT chk_comments_reference 
    CHECK ((post_id IS NOT NULL AND content_id IS NULL) OR 
           (post_id IS NULL AND content_id IS NOT NULL) OR 
           (post_id IS NOT NULL AND content_id IS NOT NULL));

-- 6. 更新现有数据（如果有的话）
-- 这里可以根据实际业务需求来决定如何处理现有数据
-- 例如：将现有的post_id对应的内容迁移到contents表，或者保持现状

COMMENT ON COLUMN comments.content_id IS '关联contents表的ID，与post_id互斥或共存';
COMMENT ON CONSTRAINT chk_comments_reference ON comments IS '确保评论至少关联一个内容（posts或contents）'; 