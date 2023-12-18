import { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import twitchApi from "../../twitch-api/api";
import logger from "../../logwrapper";

const model: EffectType<{
    action: "Raid Channel" | "Cancel Raid";
    username?: string;
}>  = {
    definition: {
        id: "firebot:raid",
        name: "Twitch チャネルへのRaid/Unraid",
        description: "他のTwitchチャンネルへのレイドを開始またはキャンセルする",
        icon: "fad fa-rocket-launch",
        categories: [ EffectCategory.COMMON, EffectCategory.TWITCH ],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="Action">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="list-effect-type">{{effect.action ? effect.action : 'Pick one'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                    <li ng-click="effect.action = 'Raid Channel'">
                        <a href>レイドする</a>
                    </li>
                    <li ng-click="effect.action = 'Cancel Raid'">
                        <a href>レイドをやめる</a>
                    </li>
                </ul>
            </div>
        </eos-container>
        
        <eos-container header="Target" pad-top="true" ng-show="effect.action === 'Raid Channel'">
            <firebot-input model="effect.username" placeholder-text="ユーザ名を入れる" />
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];
        const username = effect.username?.trim();

        if (effect.action == null) {
            errors.push("レイドをどうするか選ぶ必要があります");
        } else if (effect.action === "Raid Channel" && !username?.length) {
            errors.push("レイド先チャンネルを指定する必要があります。");
        }

        return errors;
    },
    optionsController: () => { },
    onTriggerEvent: async ({ effect }) => {
        if (effect.action === "Raid Channel") {
            const targetUserId = (await twitchApi.users.getUserByName(effect.username))?.id;

            if (targetUserId == null) {
                logger.error(`Unable to start raid. Twitch user ${effect.username} does not exist.`);
                return false;
            }

            await twitchApi.channels.raidChannel(targetUserId);
        } else {
            await twitchApi.channels.cancelRaid();
        }
    }
}

module.exports = model;