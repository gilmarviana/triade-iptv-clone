const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  const inputDir = 'public';
  const outputDir = 'public/images/optimized';
  
  // Garantir que o diretório de saída existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Lista de imagens para otimizar
  const images = [
    { input: 'logo-iptv.png', sizes: [31, 35, 70, 78] },
    { input: 'logo192.png', sizes: [192, 192] },
    { input: 'logo512.png', sizes: [512, 512] }
  ];
  
  for (const image of images) {
    const inputPath = path.join(inputDir, image.input);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`Arquivo não encontrado: ${inputPath}`);
      continue;
    }
    
    console.log(`Otimizando: ${image.input}`);
    
    // Para cada tamanho, criar versões PNG e WebP
    for (const size of image.sizes) {
      const baseName = path.parse(image.input).name;
      
      // Versão PNG otimizada
      await sharp(inputPath)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ quality: 85, compressionLevel: 9 })
        .toFile(path.join(outputDir, `${baseName}-${size}.png`));
      
      // Versão WebP otimizada
      await sharp(inputPath)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 85, effort: 6 })
        .toFile(path.join(outputDir, `${baseName}-${size}.webp`));
      
      console.log(`  Criado: ${baseName}-${size}.png e ${baseName}-${size}.webp`);
    }
  }
  
  console.log('Otimização de imagens concluída!');
}

optimizeImages().catch(console.error); 