import type { EffectType } from "../../../types/effects";
import viewerMetadataManager from "../../viewers/viewer-metadata-manager";

const effect: EffectType<{
    username: string;
    key: string;
}> = {
    definition: {
        id: "firebot:remove-user-metadata",
        name: "ユーザーメタデータ削除",
        description: "指定したユーザーに紐づくメタデータからキーを削除します",
        icon: "fad fa-user-cog",
        categories: ["advanced", "scripting", "firebot control"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="ユーザー名">
            <input type="text" class="form-control" aria-describedby="basic-addon3" ng-model="effect.username" placeholder="ユーザー名を入力" replace-variables menu-position="below" />
        </eos-container>

        <eos-container header="メタデータキー" pad-top="true">
            <p class="muted">このユーザーのメタデータから削除したいキー名を指定します。</p>
            <input ng-model="effect.key" type="text" class="form-control" id="chat-text-setting" placeholder="キー名を入力" replace-variables>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.username == null || effect.username === "") {
            errors.push("ユーザー名を入力してください。");
        }
        if (effect.key == null || effect.key === "") {
            errors.push("キー名を入力してください。");
        }
        return errors;
    },
    getDefaultLabel: (effect) => {
        return `${effect.username} - ${effect.key}`;
    },
    onTriggerEvent: async ({ effect }) => {
        const { username, key } = effect;

        await viewerMetadataManager.removeViewerMetadata(username, key);

        return true;
    }
};

export = effect;