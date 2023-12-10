"use strict";

const https = require('https');

const axiosDefault = require("axios").default;
const logger = require("../../logwrapper");

const axios = axiosDefault.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

// Capitalize Name
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

async function randomAdvice() {
    const url = "http://api.adviceslip.com/advice";

    return await axios.get(url)
        .then(function(response) {
            const advice = response.data.slip["advice"];
            logger.info("Advice: " + advice);
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
}

async function randomCatFact() {
    //http://catfacts-api.appspot.com/api/facts
    const url = "https://catfact.ninja/fact";

    return await axios.get(url)
        .then(function(response) {
            const fact = response.data.fact;
            logger.info("Cat Fact: " + fact);
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
}

async function randomDogFact() {
    //https://dog-api.kinduff.com/api/facts
    const url = "https://dog-api.kinduff.com/api/facts";

    return await axios.get(url)
        .then(function(response) {
            const fact = response.data.facts[0];
            logger.info("Dog Fact: " + fact);
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
}

async function randomPokemon() {
    //http://pokeapi.co/api/v2/pokemon/NUMBER (811 max)
    const random = Math.floor(Math.random() * 721) + 1,
        url = "http://pokeapi.co/api/v2/pokemon/" + random + "/";

    return await axios.get(url)
        .then(function(response) {
            const name = response.data.name;
            const nameCap = toTitleCase(name);
            const info = "http://pokemondb.net/pokedex/" + name;

            const moveset = response.data.moves;
            const movedata = moveset[Math.floor(Math.random() * moveset.length)];
            const move = movedata["move"];
            const movename = move.name;
            const text = "I choose you " + nameCap + "! " + nameCap + " used " + movename + "! " + info;

            logger.info("Pokemon: " + text);
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
}

async function numberTrivia() {
    // http://numbersapi.com/random
    const url = "http://numbersapi.com/random";

    return await axios.get(url)
        .then(function(response) {
            logger.info("Random Number Trivia:" + response.data);
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
}

async function dadJoke() {
    const options = {
        url: "https://icanhazdadjoke.com/",
        headers: {
            'Accept': "Application/json",
            'User-Agent': "Firebot - (https://firebot.app) - @firebotapp"
        }
    };

    return await axios.get(options.url, options)
        .then(function(response) {
            const joke = response.data.joke;
            logger.info("Dad Joke: " + joke);
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
