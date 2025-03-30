import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'src/assets/capybara.png');
const outputPath = path.join(__dirname, 'src/assets/capybara-transparent.png');

async function removeBackground() {
  try {
    // First, preprocess the image to increase contrast and clean up noise
    const preprocessed = await sharp(inputPath)
      .normalize() // Normalize the image contrast
      .modulate({
        brightness: 1.2,  // Increase brightness more
        saturation: 1.3,  // Increase saturation more
        hue: 5           // Slightly adjust hue to make browns more distinct
      })
      .sharpen({
        sigma: 2,
        m1: 2,
        m2: 0.5
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = preprocessed;
    const width = info.width;
    const height = info.height;

    // For each pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate brightness and color difference
        const brightness = (r + g + b) / 3;
        const colorDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r));
        
        // Check if pixel is near the edge of the image
        const isEdge = x < 2 || x >= width - 2 || y < 2 || y >= height - 2;
        
        // More aggressive background removal
        if (
          // Remove light pixels with low color variation
          (brightness > 160 && colorDiff < 40) ||
          // Remove grayish pixels
          (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20 && brightness > 150) ||
          // Remove very light pixels
          (r > 180 && g > 180 && b > 180) ||
          // Remove edge pixels more aggressively
          (isEdge && brightness > 140)
        ) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
          
          // If this is a background pixel, check neighbors and remove light neighbors too
          if (!isEdge) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const ni = ((y + dy) * width + (x + dx)) * 4;
                if (ni >= 0 && ni < data.length - 3) {
                  const nr = data[ni];
                  const ng = data[ni + 1];
                  const nb = data[ni + 2];
                  const nBrightness = (nr + ng + nb) / 3;
                  if (nBrightness > 170) {
                    data[ni + 3] = 0;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Create the final image with cleaned up edges
    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toFile(outputPath);
    
    console.log('Background removed successfully!');
  } catch (error) {
    console.error('Error removing background:', error);
  }
}

removeBackground(); 