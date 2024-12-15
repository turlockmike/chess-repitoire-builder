import { readFileSync } from 'fs';
import { movesToImage } from './moveToImage.js';
import path from 'path';

async function processMovesFile(inputFile, outputDir) {
    const content = readFileSync(inputFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
        const [moves, name] = line.split('|').map(s => s.trim());
        if (!moves || !name) continue;
        
        // Clean up moves string
        const cleanMoves = moves.replace(/\s+/g, ' ').trim();
        
        const outputPath = path.join(outputDir, `${name}.png`);
        try {
            await movesToImage(cleanMoves, outputPath);
            console.log(`Generated ${name}.png`);
        } catch (error) {
            console.error(`Failed to generate ${name}.png:`, error.message);
        }
    }
}

// Command line interface
if (process.argv[2] && process.argv[3]) {
    const inputFile = process.argv[2];
    const outputDir = process.argv[3];
    
    processMovesFile(inputFile, outputDir)
        .catch(error => {
            console.error('Failed to process moves file:', error.message);
            process.exit(1);
        });
}
