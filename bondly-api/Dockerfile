# 使用轻量级的 alpine 镜像作为运行环境
FROM alpine:latest



# 安装 ca-certificates 用于 HTTPS 请求
RUN apk --no-cache add ca-certificates tzdata

# 设置时区
ENV TZ=Asia/Shanghai

# 创建非 root 用户
RUN addgroup -g 1001 -S bondly && \
    adduser -u 1001 -S bondly -G bondly

# 设置工作目录
WORKDIR /app

# 复制本地构建的二进制文件
COPY bondly-api .

# 复制配置文件
COPY env.example .env

# 更改文件所有者
RUN chown -R bondly:bondly /app

# 切换到非 root 用户
USER bondly

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# 运行应用
CMD ["./bondly-api"] 