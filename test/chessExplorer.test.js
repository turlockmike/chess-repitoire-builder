import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ChessExplorer } from '../src/chessExplorer.js';

test('ChessExplorer - FEN validation', async (t) => {
    const explorer = new ChessExplorer();

    await t.test('validates starting position', () => {
        const startPos = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        assert.equal(explorer.validateFEN(startPos), true);
    });

    await t.test('validates Sicilian after 1.e4 c5', () => {
        const sicilianMoves = 'e2e4,c7c5';
        const result = explorer.explorePosition(sicilianMoves);
        assert.ok(result, 'Should accept valid move sequence');
    });

    await t.test('rejects invalid FEN strings', () => {
        const invalidCases = [
            '',                    // empty string
            'invalid',            // nonsense string
            'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',  // missing parts
            'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1', // invalid active color
            'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq a9 0 1', // invalid en passant
        ];

        invalidCases.forEach(fen => {
            assert.equal(explorer.validateFEN(fen), false);
        });
    });
});

test('ChessExplorer - Position Analysis', async (t) => {
    const explorer = new ChessExplorer();

    await t.test('analyzes starting position', async () => {
        const startPos = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        const result = await explorer.explorePosition(startPos);
        
        assert.ok(result.moves.length > 0, 'Should return some moves');
        assert.ok(result.moves.some(m => m.san === 'e4'), 'Should include e4 as a move');
        
        const e4Move = result.moves.find(m => m.san === 'e4');
        assert.ok(e4Move.totalGames > 0, 'Should have games played');
        assert.ok(typeof e4Move.winRate === 'string', 'Should have win rate as string');
    });

    await t.test('handles invalid FEN gracefully', async () => {
        const invalidFen = 'invalid';
        await assert.rejects(
            () => explorer.explorePosition(invalidFen),
            Error,
            'Should reject with invalid FEN'
        );
    });

    await t.test('analyzes Sicilian position', async () => {
        const sicilianMoves = 'e2e4,c7c5';
        const result = await explorer.explorePosition(sicilianMoves);
        
        assert.ok(result.moves.length > 0, 'Should return some moves');
        assert.ok(result.moves.some(m => m.san === 'Nf3'), 'Should include Nf3 as a move');
    });
});
