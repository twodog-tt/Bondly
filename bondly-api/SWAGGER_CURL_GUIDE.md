# Bondly API Swagger UI 使用指南

## 🌟 概述

我们已经为 Bondly API 的所有接口添加了完善的 Swagger 注释，现在你可以在 Swagger UI 中查看详细的 API 文档和自动生成的 curl 示例。

## 🚀 访问地址

**Swagger UI**: http://localhost:8080/swagger/index.html

## 📋 功能特性

### ✅ 完整的接口文档
- **21个API接口**，涵盖6个功能模块
- 详细的请求参数说明和示例值
- 完整的响应结构定义
- 错误码和错误信息说明

### ✅ 自动生成的 curl 示例
- 每个接口都会自动生成 curl 命令
- 包含完整的请求头、参数和请求体
- 支持直接复制粘贴使用

## 🔧 如何在 Swagger UI 中查看 curl 示例

### 方法1：使用 "Try it out" 功能

1. **打开接口**: 点击任意 API 接口展开详情
2. **点击 "Try it out"**: 在接口详情右上角
3. **填写参数**: 输入必要的参数值（会自动填入示例值）
4. **查看 curl**: 在参数填写区域下方会显示生成的 curl 命令
5. **执行请求**: 点击 "Execute" 执行请求并查看结果

### 方法2：查看接口示例

1. **查看 Request body**: 每个 POST 接口都有完整的请求体示例
2. **查看 Parameters**: GET 接口的查询参数都有示例值
3. **查看 Responses**: 每个响应都有详细的结构说明
