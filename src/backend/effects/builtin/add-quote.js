"use strict";

const TwitchApi = require("../../twitch-api/api");
const quotesManager = require("../../quotes/quotes-manager");
const { EffectCategory } = require('../../../shared/effect-constants');
const moment = require("moment");

const addQuoteEffect = {
    definition: {
        id: "firebot:add-quote",
        name: "引用文の追加",
        description: "引用文をデータベースに追加します",
        icon: "fad fa-quote-right",
        categories: [EffectCategory.FUN],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `    
        <eos-container header="引用の作成">
            <p class="muted">引用エントリーを作成する人の名前です。</p>
            <input ng-model="effect.creator" type="text" class="form-control" id="chat-text-setting" placeholder="Enter quote creator" replace-variables/>
        </eos-container>

        <eos-container header="引用元" pad-top="true">
            <p class="muted">実際の引用元</p>
            <input ng-model="effect.originator" type="text" class="form-control" id="chat-text-setting" placeholder="Enter quote originator" replace-variables/>
        </eos-container>

        <eos-container header="引用文" pad-top="true">
            <p class="muted">実際の引用文</p>
            <input ng-model="effect.text" type="text" class="form-control" id="chat-text-setting" placeholder="Enter quote text" replace-variables/>
        </eos-container>
    `,
    optionsController: () => {},
    optionsValidator: effect => {
        const errors = [];
        if (effect.creator == null || effect.creator === "") {
            errors.push("引用の作成者を教えてください");
        }

        if (effect.originator == null || effect.originator === "") {
            errors.push("引用元を教えてください");
        }

        if (effect.text == null || effect.text === "") {
            errors.push("引用文を教えてください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const { effect } = event;

        const channelData = await TwitchApi.channels.getChannelInformation();

        const currentGameName = channelData && channelData.gameName ? channelData.gameName : "不明なゲーム";

        const newQuote = {
            text: effect.text,
            originator: effect.originator.replace(/@/g, ""),
            creator: effect.creator.replace(/@/g, ""),
            game: currentGameName,
            createdAt: moment().toISOString()
        };

        quotesManager.addQuote(newQuote);

        return true;
    }
};

module.exports = addQuoteEffect;