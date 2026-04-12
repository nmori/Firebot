"use strict";

const https = require('https');

const axiosDefault = require("axios").default;
const logger = require("../../logwrapper");

const axios = axiosDefault.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

// Capitalize Name
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

async function randomAdvice() {
    const url = "http://api.adviceslip.com/advice";
<<<<<<< HEAD

    return await axios.get(url)
        .then(function(response) {
            const advice = response.data.slip["advice"];
            logger.info(`Advice: ${advice}`);
            return advice;
        })
        .catch(function(err) {
            logger.debug(err.message);
            renderWindow.webContents.send(
                "error",
                "アドバイスAPIに接続できませんでした。システムダウンしている可能性があります。"
            );
            return "[Error getting API response]";
        });
=======
    try {
        const response = await fetch(url);
        const advice = (await response.json()).slip["advice"];
        logger.info(`Advice: ${advice}`);
        return advice;
    } catch (err) {
        logger.debug(err.message);
        frontendCommunicator.send(
            "error",
            "アドバイスAPIに接続できませんでした。システムダウンしている可能性があります。"
        );
        return "[Error getting API response]";
    }
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
}

async function randomCatFact() {
    //http://catfacts-api.appspot.com/api/facts
    const url = "https://catfact.ninja/fact";

<<<<<<< HEAD
    return await axios.get(url)
        .then(function(response) {
            const fact = response.data.fact;
            logger.info(`Cat Fact: ${fact}`);
            return fact;
        })
        .catch(function(err) {
            logger.debug(err.message);
            renderWindow.webContents.send(
                "error",
                "チャットに猫の情報を送信する際にエラーが発生しました。"
            );
            return "[API応答エラー]";
        });
=======
    try {
        const response = await fetch(url);
        const fact = (await response.json()).fact;
        logger.info(`Cat Fact: ${fact}`);
        return fact;
    } catch (err) {
        logger.debug(err.message);
        frontendCommunicator.send(
            "error",
            "チャットに猫の情報を送信する際にエラーが発生しました。"
        );
        return "[API応答エラー]";
    }
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
}

async function randomDogFact() {
    //https://dog-api.kinduff.com/api/facts
    const url = "https://dog-api.kinduff.com/api/facts";

<<<<<<< HEAD
    return await axios.get(url)
        .then(function(response) {
            const fact = response.data.facts[0];
            logger.info(`Dog Fact: ${fact}`);
            return fact;
        })
        .catch(function(err) {
            logger.debug(err.message);
            renderWindow.webContents.send(
                "error",
                "チャットに犬の情報を送信する際にエラーが発生しました。"
            );
            return "[API応答エラー]";
        });
=======
    try {
        const response = await fetch(url);
        const fact = (await response.json()).facts[0];
        logger.info(`Dog Fact: ${fact}`);
        return fact;
    } catch (err) {
        logger.debug(err.message);
        frontendCommunicator.send(
            "error",
            "チャットに犬の情報を送信する際にエラーが発生しました。"
        );
        return "[API応答エラー]";
    }
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
}

async function randomPokemon() {
    //http://pokeapi.co/api/v2/pokemon/NUMBER (811 max)
    const random = Math.floor(Math.random() * 721) + 1,
        url = `http://pokeapi.co/api/v2/pokemon/${random}/`;

    return await axios.get(url)
        .then(function(response) {
            const name = response.data.name;
            const nameCap = toTitleCase(name);
            const info = `http://pokemondb.net/pokedex/${name}`;

            const moveset = response.data.moves;
            const movedata = moveset[Math.floor(Math.random() * moveset.length)];
            const move = movedata["move"];
            const movename = move.name;
            const text = `I choose you ${nameCap}! ${nameCap} used ${movename}! ${info}`;

<<<<<<< HEAD
            logger.info(`Pokemon: ${text}`);
            return text;
        })
        .catch(function(err) {
            logger.debug(err.message);
            renderWindow.webContents.send(
                "error",
                "チャットにポケモン情報を送信する際にエラーが発生しました。"
            );
            return "[API応答エラー]";
        });
=======
        logger.info(`Pokemon: ${text}`);
        return text;
    } catch (err) {
        logger.debug(err.message);
        frontendCommunicator.send(
            "error",
            "チャットにポケモン情報を送信する際にエラーが発生しました。"
        );
        return "[API応答エラー]";
    }
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
}

async function numberTrivia() {
    // http://numbersapi.com/random
    const url = "http://numbersapi.com/random";

<<<<<<< HEAD
    return await axios.get(url)
        .then(function(response) {
            logger.info(`Random Number Trivia:${response.data}`);
            return response.data;
        })
        .catch(function(err) {
            logger.debug(err.message);
            renderWindow.webContents.send(
                "error",
                "チャットにトリビア情報を送信する際にエラーが発生しました。"
            );
            return "[API応答エラー]";
        });
=======
    try {
        const response = await fetch(url);
        const data = await response.text();
        logger.info(`Random Number Trivia: ${data}`);
        return data;
    } catch (err) {
        logger.debug(err.message);
        frontendCommunicator.send(
            "error",
            "チャットにトリビア情報を送信する際にエラーが発生しました。"
        );
        return "[API応答エラー]";
    }
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
}

async function dadJoke() {
    const options = {
        url: "https://icanhazdadjoke.com/",
        headers: {
            'Accept': "Application/json",
            'User-Agent': "Firebot - (https://firebot.app) - @firebotapp"
        }
    };

<<<<<<< HEAD
    return await axios.get(options.url, options)
        .then(function(response) {
            const joke = response.data.joke;
            logger.info(`Dad Joke: ${joke}`);
            return joke;
        })
        .catch(function(err) {
            logger.debug(err.message);
            renderWindow.webContents.send(
                "error",
                "チャットにジョーク情報を送信する際にエラーが発生しました。"
            );
            return "[API応答エラー]";
        });
=======
    try {
        const response = await fetch(options.url, options);
        const joke = (await response.json()).joke;
        logger.info(`Dad Joke: ${joke}`);
        return joke;
    } catch (err) {
        logger.debug(err.message);
        frontendCommunicator.send(
            "error",
            "チャットにジョーク情報を送信する際にエラーが発生しました。"
        );
        return "[API応答エラー]";
    }
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
}

// API Processor
async function apiProcessor(apiType) {
    let apiResponse = "[API応答エラー]";

    if (apiType === "Advice") {
        apiResponse = await randomAdvice();
    } else if (apiType === "Cat Fact") {
        apiResponse = await randomCatFact();
    } else if (apiType === "Dog Fact") {
        apiResponse = await randomDogFact();
    } else if (apiType === "Pokemon") {
        apiResponse = await randomPokemon();
    } else if (apiType === "Number Trivia") {
        apiResponse = await numberTrivia();
    } else if (apiType === "Dad Joke") {
        apiResponse = await dadJoke();
    }

    return apiResponse;
}

// Export Functions
exports.getApiResponse = apiProcessor;
