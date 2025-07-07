const sharp = require('sharp');
const path = require('path');

async function analyzeImageColors(filePath) {
  try {
    console.log('分析文件:', filePath);
    console.log('=' .repeat(50));
    
    // 获取图片信息
    const metadata = await sharp(filePath).metadata();
    console.log('图片信息:');
    console.log('尺寸:', metadata.width, 'x', metadata.height);
    console.log('格式:', metadata.format);
    console.log('颜色空间:', metadata.space);
    console.log('通道数:', metadata.channels);
    
    // 获取图片数据
    const { data, info } = await sharp(filePath)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    console.log('\n像素数据信息:');
    console.log('数据长度:', data.length, '字节');
    console.log('每像素字节数:', info.channels);
    
    // 分析颜色分布
    const colorCounts = {};
    const totalPixels = data.length / info.channels;
    
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // 将颜色量化到16个级别以减少颜色数量
      const quantizedR = Math.floor(r / 16) * 16;
      const quantizedG = Math.floor(g / 16) * 16;
      const quantizedB = Math.floor(b / 16) * 16;
      
      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    }
    
    // 排序并获取前20个最常见的颜色
    const sortedColors = Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);
    
    console.log('\n主要颜色分析 (前20个):');
    console.log('-' .repeat(80));
    console.log('排名 | RGB值 | 十六进制 | 像素数量 | 占比');
    console.log('-' .repeat(80));
    
    sortedColors.forEach(([colorKey, count], index) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      const percentage = (count / totalPixels * 100).toFixed(2);
      
      console.log(`${(index + 1).toString().padStart(2)} | ${r.toString().padStart(3)},${g.toString().padStart(3)},${b.toString().padStart(3)} | ${hexColor} | ${count.toString().padStart(8)} | ${percentage}%`);
    });
    
    // 分析主要颜色类型
    console.log('\n颜色类型分析:');
    console.log('-' .repeat(40));
    
    const whiteColors = sortedColors.filter(([colorKey]) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      return r > 240 && g > 240 && b > 240;
    });
    
    const blackColors = sortedColors.filter(([colorKey]) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      return r < 16 && g < 16 && b < 16;
    });
    
    const purpleColors = sortedColors.filter(([colorKey]) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      return r > g && b > g && Math.abs(r - b) < 50; // 紫色系
    });
    
    console.log('白色系颜色数量:', whiteColors.length);
    console.log('黑色系颜色数量:', blackColors.length);
    console.log('紫色系颜色数量:', purpleColors.length);
    
    if (purpleColors.length > 0) {
      console.log('\n主要紫色系颜色:');
      purpleColors.slice(0, 5).forEach(([colorKey, count], index) => {
        const [r, g, b] = colorKey.split(',').map(Number);
        const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        console.log(`${index + 1}. RGB(${r}, ${g}, ${b}) = ${hexColor}`);
      });
    }
    
  } catch (error) {
    console.error('分析图片时出错:', error.message);
  }
}

// 分析Bondly logo
const logoPath = path.join(__dirname, 'public/images/logo/bondly-logo.png');
analyzeImageColors(logoPath); 