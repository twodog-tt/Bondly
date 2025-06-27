#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📊 生成项目报告...\n');

const report = {
  timestamp: new Date().toISOString(),
  project: 'Bondly Contracts',
  version: '1.0.0',
  stats: {}
};

// 统计合约文件
const contractsDir = path.join(__dirname, '../../contracts');
const contractFiles = [];

function scanDirectory(dir, prefix = '') {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath, prefix + item + '/');
    } else if (item.endsWith('.sol')) {
      contractFiles.push(prefix + item);
    }
  });
}

if (fs.existsSync(contractsDir)) {
  scanDirectory(contractsDir);
}

report.stats.contracts = {
  total: contractFiles.length,
  files: contractFiles
};

// 统计测试文件
const testDir = path.join(__dirname, '../../test');
const testFiles = [];

if (fs.existsSync(testDir)) {
  const testItems = fs.readdirSync(testDir);
  testItems.forEach(item => {
    if (item.endsWith('.ts') || item.endsWith('.js')) {
      testFiles.push(item);
    }
  });
}

report.stats.tests = {
  total: testFiles.length,
  files: testFiles
};

// 统计脚本文件
const scriptsDir = path.join(__dirname, '../');
const scriptFiles = [];

if (fs.existsSync(scriptsDir)) {
  const scriptItems = fs.readdirSync(scriptsDir);
  scriptItems.forEach(item => {
    const fullPath = path.join(scriptsDir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const subDir = path.join(fullPath);
      const subItems = fs.readdirSync(subDir);
      subItems.forEach(subItem => {
        if (subItem.endsWith('.ts') || subItem.endsWith('.js')) {
          scriptFiles.push(item + '/' + subItem);
        }
      });
    } else if (item.endsWith('.ts') || item.endsWith('.js')) {
      scriptFiles.push(item);
    }
  });
}

report.stats.scripts = {
  total: scriptFiles.length,
  files: scriptFiles
};

// 检查编译状态
const artifactsDir = path.join(__dirname, '../../artifacts');
const cacheDir = path.join(__dirname, '../../cache');

report.stats.compilation = {
  artifactsExist: fs.existsSync(artifactsDir),
  cacheExist: fs.existsSync(cacheDir),
  lastCompiled: null
};

if (fs.existsSync(cacheDir)) {
  const cacheStats = fs.statSync(cacheDir);
  report.stats.compilation.lastCompiled = cacheStats.mtime.toISOString();
}

// 输出报告
console.log('📋 项目统计:');
console.log(`   合约文件: ${report.stats.contracts.total} 个`);
console.log(`   测试文件: ${report.stats.tests.total} 个`);
console.log(`   脚本文件: ${report.stats.scripts.total} 个`);
console.log(`   编译状态: ${report.stats.compilation.artifactsExist ? '✅ 已编译' : '❌ 未编译'}`);

if (report.stats.contracts.total > 0) {
  console.log('\n📄 合约文件列表:');
  report.stats.contracts.files.forEach(file => {
    console.log(`   - ${file}`);
  });
}

// 保存报告到文件
const reportPath = path.join(__dirname, '../../report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n💾 报告已保存到: ${reportPath}`);
console.log('🎉 报告生成完成！'); 