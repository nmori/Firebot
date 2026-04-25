import { EffectType } from "../../../types/effects";
import * as cloudSync from "../../cloud-sync";

const effect: EffectType<{
    profilePage: "commands" | "quotes";
}> = {
    definition: {
        id: "firebot:sync-profile-data",
        name: "プロフィールページへデータ同期",
        description: "データを Firebot プロフィールページへ同期します",
        icon: "fad fa-sync",
        categories: ["advanced", "scripting", "firebot control"],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="デフォルトのプロフィールページ">
            <firebot-select
                options="{ commands: 'コマンド', quotes: '名言' }"
                selected="effect.profilePage"
            />
        </eos-container>

        <eos-container pad-top="true">
            <div class="effect-info alert alert-warning">
                プロフィールデータの同期はこのフォーク版では利用できません。
            </div>
        </eos-container>
    `,
    optionsController: ($scope, accountAccess) => {
        $scope.username = accountAccess.accounts.streamer.username;

        if (!$scope.effect.profilePage) {
            $scope.effect.profilePage = "commands";
        }
    },
    getDefaultLabel: (effect) => {
        const pageMap: Record<string, string> = {
            commands: "コマンド",
            quotes: "名言"
        };
        return `デフォルトページ: ${pageMap[effect.profilePage] ?? effect.profilePage}`;
    },
    onTriggerEvent: async (event) => {
        await cloudSync.syncProfileData({
            username: event.trigger.metadata.username,
            userRoles: [],
            profilePage: event.effect.profilePage ?? "commands"
        });
    }
};

export = effect;