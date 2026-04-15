import { GameManager } from "./game-manager";

import bidGame from "./builtin/bid/bid";
import fukubikiGame from "./builtin/fukubiki/fukubiki";
import heistGame from "./builtin/heist/heist";
import lotteryGame from "./builtin/lottery/lottery";
import omikujiGame from "./builtin/omikuji/omikuji";
import otoshidamaGame from "./builtin/otoshidama/otoshidama";
import slotsGame from "./builtin/slots/slots";
import triviaGame from "./builtin/trivia/trivia";

const defaultGames = [
    bidGame,
    fukubikiGame,
    heistGame,
    lotteryGame,
    omikujiGame,
    otoshidamaGame,
    slotsGame,
    triviaGame
];

function loadGames() {
    for (const game of defaultGames) {
        GameManager.registerGame(game);
    }
};

export = { loadGames };