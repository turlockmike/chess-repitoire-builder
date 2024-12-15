#!/usr/bin/env node
import { Command } from 'commander';
import { ChessExplorer } from './src/chessExplorer.js';

const program = new Command();
const explorer = new ChessExplorer();

program
  .name('chess-explorer')
  .description('CLI to explore chess openings using Lichess API')
  .version('1.0.0');

program
  .command('explore')
  .description('Explore an opening position')
  .option('-p, --position [fen]', 'FEN position to explore (default is starting position)')
  .option('-c, --color [color]', 'Color to play (white/black)', 'white')
  .option('-s, --speed [speed]', 'Game speed (bullet/blitz/rapid/classical)', 'rapid')
  .option('-r, --rating [rating]', 'Rating range (1600,1800)', '1600,1800')
  .action(async (options) => {
    const fen = options.position || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    
    if (!explorer.validateFEN(fen)) {
      console.error('Invalid FEN string provided');
      process.exit(1);
    }

    try {
      const result = await explorer.explorePosition(fen, options.color, options.speed, options.rating);
      
      console.log('\nPosition Analysis:');
      if (result.evaluation) {
        console.log(`Engine Evaluation: ${result.evaluation.score} (depth ${result.evaluation.depth})`);
        console.log(`Best line: ${result.evaluation.bestLine}\n`);
      }

      console.log('Top moves from master games:');
      result.moves.forEach(move => {
        console.log(`${move.san}: ${move.totalGames} games, ${move.winRate}% score, (W: ${move.white}, D: ${move.draws}, B: ${move.black})`);
      });
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
