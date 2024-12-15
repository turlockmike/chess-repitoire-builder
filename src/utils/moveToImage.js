import { Chess } from 'chess.js';
import { fenToImageUrl } from './fenToImage.js';
import axios from 'axios';
import fs from 'fs';

/**
 * Convert moves to an image and save it
 * @param {string} moves - Space-separated moves (e.g., "e4 e5 Nf3")
 * @param {string} outputPath - Where to save the image
 * @returns {Promise<string>} Path to saved image
 */
async function movesToImage(moves, outputPath) {
    // Convert moves to FEN
    const chess = new Chess();
    const moveList = moves.split(' ').filter(move => move.trim());
    
    try {
        for (const move of moveList) {
            const result = chess.move(move);
            if (!result) {
                throw new Error(`Invalid move: ${move}`);
            }
        }

        // Get image URL
        const imageUrl = fenToImageUrl(chess.fen());
        console.log('Generated URL:', imageUrl);
        
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
    const moves = process.argv[2];
    const outputPath = process.argv[3];
    
    movesToImage(moves, outputPath)
        .then(path => console.log(`Image saved to ${path}`))
        .catch(error => {
            console.error('Failed to generate image:', error.message);
            process.exit(1);
        });
}
