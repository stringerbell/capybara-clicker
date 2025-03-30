import heicConvert from 'heic-convert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'src/assets/IMG_1222.HEIC');
const outputPath = path.join(__dirname, 'src/assets/capybara.png');

heicConvert({
  buffer: fs.readFileSync(inputPath),
  format: 'PNG',
  quality: 1
})
.then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log('Conversion complete!');
})
.catch(error => {
  console.error('Error converting image:', error);
}); 