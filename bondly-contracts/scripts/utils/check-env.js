#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 检查环境配置...\n');

// 检查 .env 文件
const envPath = path.join(__dirname, '../../.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ 未找到 .env 文件');
  console.log('📝 请复制 env.example 为 .env 并配置环境变量');
  process.exit(1);
}

console.log('✅ .env 文件存在');

// 检查必要的环境变量
const requiredEnvVars = [
  'PRIVATE_KEY',
  'GOERLI_RPC_URL',
  'ETHERSCAN_API_KEY'
];

const envContent = fs.readFileSync(envPath, 'utf8');
const missingVars = [];

requiredEnvVars.forEach(varName => {
  if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=your_`)) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('❌ 缺少必要的环境变量:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  process.exit(1);
}

console.log('✅ 所有必要的环境变量已配置');

// 检查 Node.js 版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.log(`❌ Node.js 版本过低: ${nodeVersion}`);
  console.log('📝 需要 Node.js >= 18.0.0');
  process.exit(1);
}

console.log(`✅ Node.js 版本: ${nodeVersion}`);

// 检查依赖
const packageJsonPath = path.join(__dirname, '../../package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log('❌ 未找到 package.json 文件');
  process.exit(1);
}

const nodeModulesPath = path.join(__dirname, '../../node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('⚠️  node_modules 不存在，请运行 npm install');
  process.exit(1);
}

console.log('✅ 依赖已安装');

console.log('\n�� 环境检查完成！可以开始开发了。'); 