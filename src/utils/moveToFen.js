import { Chess } from 'chess.js';

/**
 * Convert a sequence of moves to FEN notation
 * @param {string} moves - Space-separated string of moves (e.g., "e4 e5 Nf3")
 * @returns {object} Object containing FEN and move history
 */
export function movesToFen(moves) {
    const chess = new Chess();
    const moveList = moves.split(' ').filter(move => move.trim());
    const history = [];

    try {
        for (const move of moveList) {
            const result = chess.move(move);
            if (!result) {
                throw new Error(`Invalid move: ${move}`);
            }
            history.push({
                move: move,
                fen: chess.fen(),
                turn: chess.turn() === 'w' ? 'White' : 'Black',
                fullMoves: chess.moveNumber()
            });
        }

        return {
            success: true,
            finalFen: chess.fen(),
            history: history
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            history: history
        };
    }
}

// Command line interface
if (process.argv[2]) {
    const result = movesToFen(process.argv[2]);
    if (result.success) {
        console.log('\nFinal Position FEN:');
        console.log(result.finalFen);
        console.log('\nMove History:');
        result.history.forEach(h => {
            console.log(`${h.fullMoves}${h.turn === 'Black' ? '.' : '...'} ${h.move} -> ${h.fen}`);
        });
    } else {
        console.error('Error:', result.error);
        if (result.history.length > 0) {
            console.log('\nValid moves up to error:');
            result.history.forEach(h => {
                console.log(`${h.fullMoves}${h.turn === 'Black' ? '.' : '...'} ${h.move} -> ${h.fen}`);
            });
        }
    }
}
