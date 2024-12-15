import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Chess } from 'chess.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function movesToFen(moves) {
    const chess = new Chess();
    const moveList = moves.split(' ').filter(move => move.trim());
    
    try {
        for (const move of moveList) {
            const result = chess.move(move);
            if (!result) {
                throw new Error(`Invalid move: ${move}`);
            }
        }
        return chess.fen();
    } catch (error) {
        throw new Error(`Error converting moves to FEN: ${error.message}`);
    }
}

async function downloadImage(moves, filename) {
    const fen = movesToFen(moves);
    const positionPart = fen.split(' ')[0];
    const url = `https://chessboardimage.com/${positionPart}.png`;
    const filepath = path.join(__dirname, 'repertoire', 'white', 'e4', 'scotch', 'images', filename);
    
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }
            
            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            
            fileStream.on('error', (err) => {
                fs.unlink(filepath, () => reject(err));
            });
        }).on('error', reject);
    });
}

async function main() {
    const positionsFile = path.join(__dirname, 'repertoire', 'white', 'e4', 'scotch', 'positions.txt');
    const content = fs.readFileSync(positionsFile, 'utf8');
    
    const positions = content
        .split('\n')
        .filter(line => line.includes('|'))
        .map(line => {
            const [moves, filename] = line.split('|');
            return { moves: moves.trim(), filename: `${filename.trim()}.png` };
        });
    
    for (const position of positions) {
        try {
            console.log(`Generating image for ${position.filename}...`);
            await downloadImage(position.moves, position.filename);
            console.log(`Successfully generated ${position.filename}`);
        } catch (error) {
            console.error(`Failed to generate ${position.filename}:`, error);
        }
    }
}

main().catch(console.error);
