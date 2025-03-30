import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'src/assets/capybara.png');
const outputPath = path.join(__dirname, 'src/assets/capybara-transparent.png');

async function removeBackground() {
  try {
    // First, enhance the image with stronger colors and sharper lines
    const preprocessed = await sharp(inputPath)
      .normalize() // Normalize the contrast
      .modulate({
        brightness: 1.3,    // Increase brightness more
        saturation: 1.5,    // Much more saturation for bolder colors
        hue: 5             // Slight hue adjustment for warmer browns
      })
      .sharpen({
        sigma: 2.5,        // Increase sharpness
        m1: 2.5,
        m2: 0.3
      })
      .gamma(1.2)          // Boost midtones
      .convolve({          // Enhance edges
        width: 3,
        height: 3,
        kernel: [-1, -1, -1,
                -1,  9, -1,
                -1, -1, -1]
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
        
        // Background removal with color enhancement
        if (
          // Remove light pixels with low color variation
          (brightness > 150 && colorDiff < 45) ||
          // Remove grayish pixels
          (Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && Math.abs(r - b) < 25 && brightness > 140) ||
          // Remove very light pixels
          (r > 170 && g > 170 && b > 170) ||
          // Remove edge pixels more aggressively
          (isEdge && brightness > 130)
        ) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        } else {
          // Enhance colors of non-background pixels
          const isOrange = r > g && g > b;
          const isDarkBrown = r > g && g > b && brightness < 100;
          
          if (isOrange) {
            // Make orange more vibrant
            data[i] = Math.min(255, r * 1.1);     // Boost red
            data[i + 1] = Math.min(255, g * 0.9); // Reduce green slightly
            data[i + 2] = Math.min(255, b * 0.7); // Reduce blue more
          } else if (isDarkBrown) {
            // Make dark browns richer
            data[i] = Math.min(255, r * 0.9);     // Keep red
            data[i + 1] = Math.min(255, g * 0.7); // Reduce green
            data[i + 2] = Math.min(255, b * 0.5); // Reduce blue significantly
          }
          
          // Enhance edges
          let isNearDark = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ni = ((y + dy) * width + (x + dx)) * 4;
              if (ni >= 0 && ni < data.length - 3) {
                const nBrightness = (data[ni] + data[ni + 1] + data[ni + 2]) / 3;
                if (nBrightness < 50) {
                  isNearDark = true;
                  break;
                }
              }
            }
            if (isNearDark) break;
          }
          
          // Darken edges near dark pixels
          if (isNearDark) {
            data[i] = Math.max(0, data[i] * 0.7);
            data[i + 1] = Math.max(0, data[i + 1] * 0.7);
            data[i + 2] = Math.max(0, data[i + 2] * 0.7);
          }
        }
      }
    }
    
    // Create the final image with enhanced colors and cleaner edges
    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toFile(outputPath);
    
    console.log('Image enhanced and background removed successfully!');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

removeBackground(); 