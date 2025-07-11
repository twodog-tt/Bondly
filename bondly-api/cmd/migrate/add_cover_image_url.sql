-- 为contents表添加cover_image_url字段
-- 执行时间: 2024-01-XX
-- 描述: 添加封面图片URL字段，支持内容封面图片功能

-- 添加cover_image_url字段
ALTER TABLE contents ADD COLUMN cover_image_url TEXT COMMENT '封面图片URL';

-- 添加索引（可选，如果经常按封面图片查询）
-- CREATE INDEX idx_contents_cover_image_url ON contents(cover_image_url);

-- 验证字段添加成功
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'contents' AND COLUMN_NAME = 'cover_image_url'; 