"use strict";

const gameManager = require("./game-manager");

exports.loadGames = () => {
    [
        'bid/bid',
        'heist/heist',
        'slots/slots',
        'trivia/trivia',
        'omikuji/omikuji',
        'otoshidama/otoshidama'
    ].forEach(filename => {
        const definition = require(`./builtin/${filename}.js`);
        gameManager.registerGame(definition);
    });
};