const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../assets/scbc-logo.png');
const OUTPUT_DIR = path.join(__dirname, '../assets');

// Define all required icon sizes
const ICON_SIZES = {
  // iOS App Icon sizes
  'icon-20.png': 20,
  'icon-20@2x.png': 40,
  'icon-20@3x.png': 60,
  'icon-29.png': 29,
  'icon-29@2x.png': 58,
  'icon-29@3x.png': 87,
  'icon-40.png': 40,
  'icon-40@2x.png': 80,
  'icon-40@3x.png': 120,
  'icon-60@2x.png': 120,
  'icon-60@3x.png': 180,
  'icon-76.png': 76,
  'icon-76@2x.png': 152,
  'icon-83.5@2x.png': 167,
  'icon-1024.png': 1024, // App Store
  
  // Other required icons
  'icon.png': 1024,      // Main app icon
  'notification-icon.png': 96,
  'adaptive-icon.png': 1024,
  'splash-icon.png': 1242,
  'favicon.png': 32,
};

async function generateIcons() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load the source image
  const sourceImage = sharp(LOGO_PATH);

  // Generate each icon size
  for (const [filename, size] of Object.entries(ICON_SIZES)) {
    const outputPath = path.join(OUTPUT_DIR, filename);
    
    try {
      await sourceImage
        .clone()
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${filename} (${size}x${size}px)`);
    } catch (error) {
      console.error(`❌ Error generating ${filename}:`, error);
    }
  }
}

generateIcons().then(() => {
  console.log('🎉 Icon generation complete!');
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 