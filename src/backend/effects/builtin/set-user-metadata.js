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

        <eos-container header="データ" pad-top="true">
            <p class="muted">ユーザーデータの上記キーの下に保存されるデータです。テキストまたは別の置換フレーズを使用できます。</p>
            <textarea ng-model="effect.data" rows="3" class="form-control" id="data" placeholder="データテキストを入力" replace-variables></textarea>
            <p class="muted" style="font-size: 11px;"><b>情報:</b> データが有効なJSON文字列の場合、オブジェクトまたは配列にパースされます。</p>

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
    optionsController: () => {},
    optionsValidator: effect => {
        const errors = [];
        if (effect.username == null || effect.username === "") {
            errors.push("ユーザ名を入れてください.");
        }
        if (effect.key == null || effect.key === "") {
            errors.push("キー名を入れてください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const { effect } = event;
        const { username, key, data, propertyPath } = effect;

        const userDb = require("../../database/userDatabase");

        await userDb.updateUserMetadata(username, key, data, propertyPath);

        return true;
    }
};

module.exports = effect;
