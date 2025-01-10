import twitchApi from "../../twitch-api/api";
import quotesManager from "../../quotes/quotes-manager";
import { EffectCategory } from '../../../shared/effect-constants';
import moment from "moment";
import { EffectType } from "../../../types/effects";

const model: EffectType<{
    creator: string;
    originator: string;
    text: string;
}> = {
    definition: {
        id: "firebot:add-quote",
        name: "引用文の追加",
        description: "引用文をデータベースに追加します",
        icon: "fad fa-quote-right",
        categories: [EffectCategory.FUN],
        dependencies: [],
        outputs: [
            {
                label: "Quote ID",
                description: "ID of the created quote",
                defaultName: "quoteId"
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="引用の作成">
            <p class="muted">引用エントリーを作成する人の名前です。</p>
            <input ng-model="effect.creator" type="text" class="form-control" id="chat-text-setting" placeholder="Enter quote creator" menu-position="under" replace-variables/>
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
    optionsValidator: (effect) => {
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
    onTriggerEvent: async (event) => {
        const { effect } = event;

        const channelData = await twitchApi.channels.getChannelInformation();

        const currentGameName = channelData && channelData.gameName ? channelData.gameName : "不明なゲーム";

        const newQuote = {
            text: effect.text,
            originator: effect.originator.replace(/@/g, ""),
            creator: effect.creator.replace(/@/g, ""),
            game: currentGameName,
            createdAt: moment().toISOString()
        };

        const id = await quotesManager.addQuote(newQuote);

        return {
            success: true,
            outputs: {
                quoteId: id
            }
        };
    }
};

export = model;