"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');

const effect = {
    definition: {
        id: "firebot:remove-user-metadata",
        name: "ユーザーメタデータの削除",
        description: "指定した視聴者に関連付けられたメタデータからキーを削除する",
        icon: "fad fa-user-cog",
        categories: [EffectCategory.ADVANCED, EffectCategory.SCRIPTING],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="Username">
            <input type="text" class="form-control" aria-describedby="basic-addon3" ng-model="effect.username" placeholder="視聴者名を入力" replace-variables menu-position="below" />
        </eos-container>

        <eos-container header="Metadata Key" pad-top="true">
            <p class="muted">このユーザーのメタデータから削除するキーを定義します。</p>
            <input ng-model="effect.key" type="text" class="form-control" id="chat-text-setting" placeholder="キー名を入力" replace-variables>
        </eos-container>
    `,
    optionsController: () => {},
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.username == null || effect.username === "") {
            errors.push("ユーザー名を入力してください");
        }
        if (effect.key == null || effect.key === "") {
            errors.push("キーの名前を記入してください");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;
        const { username, key } = effect;

        const viewerMetadataManager = require("../../viewers/viewer-metadata-manager");

        await viewerMetadataManager.removeViewerMetadata(username, key);

        return true;
    }
};

module.exports = effect;
