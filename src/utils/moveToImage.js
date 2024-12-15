import { Chess } from 'chess.js';
import { fenToImageUrl } from './fenToImage.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * Convert moves to an image and save it
 * @param {string} moves - Space-separated moves (e.g., "e4 e5 Nf3")
 * @param {string} outputPath - Where to save the image
 * @returns {Promise<string>} Path to saved image
 */
export async function movesToImage(moves, outputPath) {
    // Convert moves to FEN
    const chess = new Chess();
    const moveList = moves.split(' ').filter(move => move.trim());
    
    try {
        for (const move of moveList) {
            const result = chess.move(move);
            if (!result) {
                throw new Error(`Invalid move: ${move} in sequence ${moves}`);
            }
        }

        // Get image URL
        const imageUrl = fenToImageUrl(chess.fen());
        console.log('Generated URL:', imageUrl);
        
        // Create output directory if it doesn't exist
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Download and save image
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(outputPath, response.data);
        
        return outputPath;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// Command line interface
if (process.argv[2] && process.argv[3]) {
    const content = fs.readFileSync(process.argv[2], 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    const outputDir = process.argv[3];
    
    for (const line of lines) {
        const [moves, name] = line.split('|').map(s => s.trim());
        if (!moves || !name) continue;
        
        const outputPath = path.join(outputDir, `${name}.png`);
        movesToImage(moves, outputPath)
            .then(path => console.log(`Image saved to ${path}`))
            .catch(error => {
                console.error('Failed to generate image:', error.message);
                process.exit(1);
            });
    }
}
