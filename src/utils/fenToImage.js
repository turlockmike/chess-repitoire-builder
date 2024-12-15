/**
 * Generate a chess board image URL from FEN
 * @param {string} fen - FEN string
 * @returns {string} URL to the chess board image
 */
export function fenToImageUrl(fen) {
    // Get just the position part of the FEN (before the first space)
    const positionPart = fen.split(' ')[0];
    return `https://chessboardimage.com/${positionPart}.png`;
}

// Command line interface
if (process.argv[2]) {
    const fen = process.argv[2];
    console.log(fenToImageUrl(fen));
}
