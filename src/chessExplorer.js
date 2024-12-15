import axios from 'axios';

export class ChessExplorer {
    constructor(baseUrl = 'https://explorer.lichess.ovh/lichess', evalUrl = 'https://lichess.org/api/cloud-eval') {
        this.baseUrl = baseUrl;
        this.evalUrl = evalUrl;
    }

    async getCloudEval(fen) {
        try {
            console.log('Requesting cloud eval for FEN:', fen);
            const response = await axios.get(this.evalUrl, {
                params: { fen }
            });
            console.log('Cloud eval response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Cloud eval error:', error.response?.data || error.message);
            return null;
        }
    }

    async explorePosition(position, color = 'white', speed = 'rapid', ratings = '2200,2500') {
        // Position can be either a FEN string or a move sequence
        const isMovesSequence = position.includes(',') || /^[a-h][1-8][a-h][1-8]$/.test(position);
        const params = {
            speed,
            ratings
        };

        if (isMovesSequence) {
            params.play = position;
        } else {
            if (!this.validateFEN(position)) {
                throw new Error('Invalid FEN string provided');
            }
            params.fen = position;
        }

        try {
            console.log('Exploring position:', {
                position,
                color,
                speed,
                ratings
            });

            const explorerData = await axios.get(this.baseUrl, { params });
            const evalData = isMovesSequence ? null : await this.getCloudEval(position);

            console.log('Explorer response:', explorerData.data);

            return {
                evaluation: evalData ? {
                    score: (evalData.pvs[0].cp / 100).toFixed(2),
                    depth: evalData.depth,
                    bestLine: evalData.pvs[0].moves
                } : null,
                moves: explorerData.data.moves.map(move => ({
                    san: move.san,
                    totalGames: move.white + move.black + move.draws,
                    winRate: ((move.white + move.draws * 0.5) / (move.white + move.black + move.draws) * 100).toFixed(1),
                    white: move.white,
                    draws: move.draws,
                    black: move.black
                }))
            };
        } catch (error) {
            console.error('Explorer error:', error.response?.data || error.message);
            throw new Error(`Failed to explore position: ${error.message}`);
        }
    }

    validateFEN(fen) {
        // Basic FEN validation
        if (!fen || typeof fen !== 'string') return false;
        
        const parts = fen.trim().split(' ');
        if (parts.length < 4) return false;

        // Check board part
        const ranks = parts[0].split('/');
        if (ranks.length !== 8) return false;

        for (const rank of ranks) {
            const squares = this._validateRank(rank);
            console.log('Rank:', rank, 'Squares:', squares);
            if (squares < 0) {
                console.log('Invalid character in rank:', rank);
                return false;
            }
            if (squares !== 8) {
                console.log('Invalid number of squares in rank:', squares);
                return false;
            }
        }

        // Check active color
        if (!/^[wb]$/.test(parts[1])) {
            console.log('Invalid active color:', parts[1]);
            return false;
        }

        // Check castling rights
        if (!/^(-|[KQkq]{1,4})$/.test(parts[2])) {
            console.log('Invalid castling rights:', parts[2]);
            return false;
        }

        // Check en passant square
        if (!/^(-|[a-h][36])$/.test(parts[3])) {
            console.log('Invalid en passant square:', parts[3]);
            return false;
        }

        return true;
    }

    // Helper method to validate a rank in FEN notation
    _validateRank(rank) {
        let squares = 0;
        let emptySquares = 0;
        for (const char of rank) {
            if (/[1-8]/.test(char)) {
                emptySquares += parseInt(char, 10);
            } else if (/[prnbqkPRNBQK]/.test(char)) {
                squares += 1;
            } else {
                return -1; // Invalid character
            }
        }
        return squares + emptySquares;
    }
}
