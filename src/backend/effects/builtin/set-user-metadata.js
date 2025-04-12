"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');

const effect = {
    definition: {
        id: "firebot:set-user-metadata",
        name: "ユーザのメタデータを設定",
        description: "指定したユーザーに関連するメタデータを保存する",
        icon: "fad fa-user-cog",
        categories: [EffectCategory.ADVANCED, EffectCategory.SCRIPTING],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="ユーザ名">
            <input type="text" class="form-control" aria-describedby="basic-addon3" ng-model="effect.username" placeholder="名前を入れる" replace-variables menu-position="below" />
        </eos-container>

        <eos-container header="メタデータのキー名" pad-top="true">
            <p class="muted">このキーは、$userMetadataの置換フレーズを使って、他の場所で参照するときに使います。.</p>
            <input ng-model="effect.key" type="text" class="form-control" id="chat-text-setting" placeholder="キーを入れる" replace-variables>
        </eos-container>

        <eos-container header="Data" pad-top="true">
            <p class="muted">This is the data that will be saved under the above key in the user's data. Can be text or another replace phrase.</p>
            <selectable-input-editors
                editors="editors"
                initial-editor-label="initialEditorLabel"
                model="effect.data"
            />
            <p class="muted" style="font-size: 11px;"><b>Note:</b> If data is a valid JSON string, it will be parsed into an object or array.</p>

            <div style="margin-top: 10px;">
                <eos-collapsable-panel show-label="応用" hide-label="応用を隠す" hide-info-box="true">
                    <h4>プロパティのパス (任意)</h4>
                    <p class="muted">メタデータ・キーがすでにオブジェクトまたは配列の形で保存されたデータを持っている場合、上記のデータで更新する特定のプロパティまたはインデックスへのパス（ドット記法を使用）を定義することができます。何も指定しない場合は、メタデータエントリ全体が置き換えられます。既存のデータがなく、プロパティのパスが指定された場合は、何も起こりません。/p>
                    <eos-collapsable-panel show-label="使用例を表示" hide-label="使用例を隠す" hide-info-box="true">
                        <span>例:</span>
                        <ul>
                            <li>some.property</li>
                            <li>1</li>
                            <li>1.value</li>
                        </ul>
                    </eos-collapsable-panel>
                    <input ng-model="effect.propertyPath" type="text" class="form-control" id="propertyPath" placeholder="パスを入力" replace-variables>
                </eos-collapsable-panel>
            </div>
        </eos-container>
    `,
    optionsController: ($scope) => {
        $scope.editors = [
            {
                label: "Basic",
                inputType: "text",
                useTextArea: true,
                placeholderText: "Enter text/data"
            },
            {
                label: "JSON",
                inputType: "codemirror",
                placeholderText: "Enter text/data",
                codeMirrorOptions: {
                    mode: { name: "javascript", json: true },
                    theme: 'blackboard',
                    lineNumbers: true,
                    autoRefresh: true,
                    showGutter: true
                }
            }
        ];

        $scope.initialEditorLabel = $scope.effect?.data?.startsWith("{") || $scope.effect?.data?.startsWith("[") ? "JSON" : "Basic";
    },
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.username == null || effect.username === "") {
            errors.push("ユーザ名を入れてください.");
        }
        if (effect.key == null || effect.key === "") {
            errors.push("キー名を入れてください");
        }
        return errors;
    },
    getDefaultLabel: (effect) => {
        return `${effect.username} - ${effect.key}`;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;
        const { username, key, data, propertyPath } = effect;

        const viewerMetadataManager = require("../../viewers/viewer-metadata-manager");

        await viewerMetadataManager.updateViewerMetadata(username, key, data, propertyPath);

        return true;
    }
};

module.exports = effect;
