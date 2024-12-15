#!/usr/bin/env node
import { Command } from 'commander';
import { ChessExplorer } from './src/chessExplorer.js';

const program = new Command();
const explorer = new ChessExplorer();

program
  .name('chess-explorer')
  .description('CLI tool for exploring chess openings using Lichess data')
  .version('1.0.0');

program
  .command('explore')
  .description('Explore a chess position')
  .option('-m, --moves <moves>', 'Move sequence (e.g., "e2e4,c7c5")')
  .option('-f, --fen <fen>', 'FEN string')
  .option('-r, --ratings <ratings>', 'Rating range (e.g., "2200,2500")', '2200,2500')
  .option('-s, --speed <speed>', 'Game speed (bullet, blitz, rapid, classical)', 'rapid')
  .action(async (options) => {
    try {
      if (!options.moves && !options.fen) {
        console.error('Error: Either moves or FEN must be provided');
        process.exit(1);
      }

      const position = options.moves || options.fen;
      const result = await explorer.explorePosition(position, 'white', options.speed, options.ratings);
      
      console.log('\nPosition Analysis:');
      if (result.evaluation) {
        console.log(`\nEngine Evaluation: ${result.evaluation.score} (depth ${result.evaluation.depth})`);
        console.log(`Best line: ${result.evaluation.bestLine}`);
      }

      console.log('\nMost Common Moves:');
      result.moves
        .sort((a, b) => b.totalGames - a.totalGames)
        .forEach(move => {
          const percentage = ((move.totalGames / result.moves.reduce((sum, m) => sum + m.totalGames, 0)) * 100).toFixed(1);
          console.log(`${move.san}: ${percentage}% (${move.winRate}% for White, ${move.totalGames} games)`);
        });
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
