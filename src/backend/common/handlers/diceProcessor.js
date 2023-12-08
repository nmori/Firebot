"use strict";

const Roll = require("roll");

const diceRoller = new Roll();

const twitchChat = require("../../chat/twitch-chat");

function processDice(diceConfig, showEach) {

    diceConfig = diceConfig?.replace(/ /g, "");

    if (!diceRoller.validate(diceConfig)) {
        return null;
    }

    const { result, rolled } = diceRoller.roll(diceConfig);

    if (!showEach) {
        return result;
    }

    return `${result} (${rolled.join(", ")})`;
}

async function handleDiceEffect(effect, trigger) {

    const { dice, chatter, whisper, resultType } = effect;

    const showEach = resultType === "individual";

    const output = processDice(dice, showEach);

    const username = trigger.metadata.username;

    const message = output != null ?
        `サイコロ: ${username}は${dice}で${output}を出しました。` :
        `正しいフォーマットでないため、"${dice}"を振ることができません`;

    await twitchChat.sendChatMessage(message, whisper, chatter);
}

exports.handleDiceEffect = handleDiceEffect;
exports.processDice = processDice;
