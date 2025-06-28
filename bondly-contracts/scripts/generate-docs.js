const fs = require('fs');
const path = require('path');

// 递归查找所有 .sol 文件
function findSolFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findSolFiles(fullPath));
    } else if (item.endsWith('.sol')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 从文件路径提取合约名称
function getContractName(filePath) {
  const fileName = path.basename(filePath, '.sol');
  return fileName;
}

// 解析 NatSpec 注释
function parseNatSpec(content) {
  const functions = [];
  const events = [];
  
  // 匹配函数注释 - 更精确的正则表达式
  const functionRegex = /\/\*\*([\s\S]*?)\*\/\s*function\s+(\w+)\s*\(([\s\S]*?)\)\s*(external|public|internal|private)/g;
  let match;
  
  while ((match = functionRegex.exec(content)) !== null) {
    const comment = match[1];
    const functionName = match[2];
    const params = match[3];
    
    // 解析注释中的参数和返回值
    const paramMatches = comment.match(/@param\s+(\w+)\s+(.*?)(?=\n\s*\*\/|\n\s*@|\*\/|$)/gs) || [];
    const returnMatches = comment.match(/@return\s+(.*?)(?=\n\s*\*\/|\n\s*@|\*\/|$)/gs) || [];
    const noticeMatches = comment.match(/@notice\s+(.*?)(?=\n\s*\*\/|\n\s*@|\*\/|$)/gs) || [];
    const devMatches = comment.match(/@dev\s+(.*?)(?=\n\s*\*\/|\n\s*@|\*\/|$)/gs) || [];
    
    functions.push({
      name: functionName,
      params: paramMatches.map(p => {
        const cleanP = p.replace(/@param\s+/, '').trim();
        const firstSpace = cleanP.indexOf(' ');
        if (firstSpace === -1) return { name: cleanP, description: '' };
        return { 
          name: cleanP.substring(0, firstSpace), 
          description: cleanP.substring(firstSpace + 1).trim() 
        };
      }),
      returns: returnMatches.map(r => r.replace(/@return\s+/, '').trim()),
      notice: noticeMatches.map(n => n.replace(/@notice\s+/, '').trim()),
      dev: devMatches.map(d => d.replace(/@dev\s+/, '').trim())
    });
  }
  
  // 匹配事件注释
  const eventRegex = /\/\*\*([\s\S]*?)\*\/\s*event\s+(\w+)\s*\(([\s\S]*?)\)/g;
  
  while ((match = eventRegex.exec(content)) !== null) {
    const comment = match[1];
    const eventName = match[2];
    const params = match[3];
    
    const paramMatches = comment.match(/@param\s+(\w+)\s+(.*?)(?=\n\s*\*\/|\n\s*@|\*\/|$)/gs) || [];
    const noticeMatches = comment.match(/@notice\s+(.*?)(?=\n\s*\*\/|\n\s*@|\*\/|$)/gs) || [];
    const devMatches = comment.match(/@dev\s+(.*?)(?=\n\s*\*\/|\n\s*@|\*\/|$)/gs) || [];
    
    events.push({
      name: eventName,
      params: paramMatches.map(p => {
        const cleanP = p.replace(/@param\s+/, '').trim();
        const firstSpace = cleanP.indexOf(' ');
        if (firstSpace === -1) return { name: cleanP, description: '' };
        return { 
          name: cleanP.substring(0, firstSpace), 
          description: cleanP.substring(firstSpace + 1).trim() 
        };
      }),
      notice: noticeMatches.map(n => n.replace(/@notice\s+/, '').trim()),
      dev: devMatches.map(d => d.replace(/@dev\s+/, '').trim())
    });
  }
  
  return { functions, events };
}

// 生成单个合约的 Markdown 文档
function generateContractMarkdown(contractName, parsed, contractContent) {
  // 提取合约描述
  const contractDescMatch = contractContent.match(/@title\s+(.*?)(?=\n|$)/);
  const contractDesc = contractDescMatch ? contractDescMatch[1] : `${contractName} 合约`;
  
  let markdown = `# ${contractName} 合约文档

## 概述

${contractDesc}

## 函数

`;

  parsed.functions.forEach(func => {
    markdown += `### ${func.name}\n\n`;
    
    if (func.notice.length > 0) {
      markdown += `**说明**: ${func.notice.join(' ')}\n\n`;
    }
    
    if (func.dev.length > 0) {
      markdown += `**开发者说明**: ${func.dev.join(' ')}\n\n`;
    }
    
    if (func.params.length > 0) {
      markdown += `**参数**:\n`;
      func.params.forEach(param => {
        markdown += `- \`${param.name}\`: ${param.description}\n`;
      });
      markdown += '\n';
    }
    
    if (func.returns.length > 0) {
      markdown += `**返回值**:\n`;
      func.returns.forEach(ret => {
        markdown += `- ${ret}\n`;
      });
      markdown += '\n';
    }
    
    markdown += '---\n\n';
  });
  
  if (parsed.events.length > 0) {
    markdown += `## 事件\n\n`;
    
    parsed.events.forEach(event => {
      markdown += `### ${event.name}\n\n`;
      
      if (event.notice.length > 0) {
        markdown += `**说明**: ${event.notice.join(' ')}\n\n`;
      }
      
      if (event.dev.length > 0) {
        markdown += `**开发者说明**: ${event.dev.join(' ')}\n\n`;
      }
      
      if (event.params.length > 0) {
        markdown += `**参数**:\n`;
        event.params.forEach(param => {
          markdown += `- \`${param.name}\`: ${param.description}\n`;
        });
        markdown += '\n';
      }
      
      markdown += '---\n\n';
    });
  }
  
  return markdown;
}

// 生成项目总览文档
function generateIndexMarkdown(contracts) {
  let markdown = `# Bondly 智能合约文档

## 项目概述

Bondly 是一个 Web3 去中心化社交价值网络平台，包含多个智能合约模块。

## 合约列表

`;

  contracts.forEach(contract => {
    markdown += `- [${contract.name}](./${contract.name}.md) - ${contract.description}\n`;
  });
  
  markdown += `
## 快速开始

1. 查看具体合约文档了解功能
2. 使用 \`node scripts/generate-docs.js\` 重新生成文档
3. 所有文档基于 NatSpec 注释自动生成

## 合约架构

- **Token**: 代币相关合约
- **Governance**: 治理相关合约  
- **Staking**: 质押相关合约
- **NFT**: NFT 相关合约
- **Registry**: 注册表合约

`;
  
  return markdown;
}

// 主函数
function main() {
  const contractsDir = path.join(__dirname, '../contracts');
  const docsDir = path.join(__dirname, '../docs');
  
  // 确保文档目录存在
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  // 查找所有 .sol 文件
  const solFiles = findSolFiles(contractsDir);
  console.log(`找到 ${solFiles.length} 个合约文件`);
  
  const contracts = [];
  
  // 处理每个合约文件
  for (const filePath of solFiles) {
    try {
      const contractContent = fs.readFileSync(filePath, 'utf8');
      const contractName = getContractName(filePath);
      
      console.log(`处理合约: ${contractName}`);
      
      // 解析 NatSpec
      const parsed = parseNatSpec(contractContent);
      
      // 生成合约文档
      const markdown = generateContractMarkdown(contractName, parsed, contractContent);
      
      // 写入文件
      const outputPath = path.join(docsDir, `${contractName}.md`);
      fs.writeFileSync(outputPath, markdown);
      
      // 提取合约描述用于索引
      const contractDescMatch = contractContent.match(/@title\s+(.*?)(?=\n|$)/);
      const contractDesc = contractDescMatch ? contractDescMatch[1] : `${contractName} 合约`;
      
      contracts.push({
        name: contractName,
        description: contractDesc
      });
      
      console.log(`✓ 已生成: ${contractName}.md`);
    } catch (error) {
      console.error(`✗ 处理 ${filePath} 时出错:`, error.message);
    }
  }
  
  // 生成索引文档
  const indexMarkdown = generateIndexMarkdown(contracts);
  fs.writeFileSync(path.join(docsDir, 'README.md'), indexMarkdown);
  console.log('✓ 已生成: README.md');
  
  console.log(`\n文档生成完成！共处理 ${contracts.length} 个合约。`);
}

// 运行主函数
main(); 