import { EffectType } from "../../../../types/effects";
import { EffectCategory } from "../../../../shared/effect-constants";
import accountAccess from "../../../common/account-access";
import twitchApi from "../../../twitch-api/api";

const model: EffectType<{
    title: string;
}> = {
    definition: {
        id: "firebot:streamtitle",
        name: "配信タイトルの設定",
        description: "配信タイトルを設定する。",
        icon: "fad fa-comment-dots",
        categories: [EffectCategory.COMMON, EffectCategory.MODERATION, EffectCategory.TWITCH],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="New Title" pad-top="true">
            <input ng-model="effect.title" class="form-control" type="text" placeholder="テキストを入力" replace-variables menu-position="below">
            <p ng-show="trigger == 'command'" class="muted" style="font-size:11px;margin-top:6px;"><b>ヒント:</b> <b>$arg[all]</b> は、!triggerの後に続くすべての単語を含む</p>
        </eos-container>
    `,
    optionsController: () => {},
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.title == null) {
            errors.push("ストリームに使用したいタイトルを入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const client = twitchApi.streamerClient;

        await client.channels.updateChannelInfo(accountAccess.getAccounts().streamer.userId, {
            title: event.effect.title
        });
        return true;
    }
};

module.exports = model;
