"use strict";

const customVariableManager = require("../../common/custom-variable-manager");
const { EffectCategory } = require('../../../shared/effect-constants');

const fileWriter = {
    definition: {
        id: "firebot:customvariable",
        name: "カスタム変数",
        description: "データをカスタム変数に保存し、他の場所で使用することができます。",
        icon: "fad fa-value-absolute",
        categories: [EffectCategory.SCRIPTING],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="変数名">
            <p class="muted">この名前は、 $customVariable[name] を経由して他の場所で参照する際に使用します</p>
            <input ng-model="effect.name" type="text" class="form-control" id="chat-text-setting" placeholder="名前を入れる" replace-variables menu-position="below">
        </eos-container>

        <eos-container header="変数の中身" pad-top="true">
            <p class="muted">変数に保存されるデータ。テキストまたは別の置換フレーズを指定できます。</p>
            <textarea ng-model="effect.variableData" rows="3" class="form-control" id="chat-text-setting" placeholder="テキストを入力" replace-variables></textarea>
            <p class="muted" style="font-size: 11px;"><b>Note:</b> If variable data is a valid JSON string, it will be parsed into an object or array.</p>
        </eos-container>

        <eos-container header="プロパティのパス（任意）" pad-top="true">
            <p class="muted">変数にすでにオブジェクトや配列の形でデータが保存されている場合、上記のデータで更新する特定のプロパティやインデックスへのパス（ドット記法を使用）を定義することができます。何も指定しなければ、変数全体が置き換えられる。既存のデータがなく、プロパティのパスが提供された場合は、何も起こりません。</p>
            <eos-collapsable-panel show-label="Show examples" hide-label="Hide examples" hide-info-box="true">
                <span>例:</span>
                <ul>
                    <li>some.property</li>
                    <li>1</li>
                    <li>1.value</li>
                </ul>
            </eos-collapsable-panel>
            <input ng-model="effect.propertyPath" type="text" class="form-control" id="propertyPath" placeholder="パスを入力">
        </eos-container>

        <eos-container header="有効期間(オプション)" pad-top="true">
            <p class="muted">この変数がキャッシュに保持される期間(秒)。無期限(Firebotが再起動するまで)には0を使用します。 </p>
            <input ng-model="effect.ttl" type="number" class="form-control" id="chat-text-setting" placeholder="秒数を入力">
        </eos-container>

        <eos-container pad-top="true">
            <div class="effect-info well">
                デバッグのためにリアルタイムで変数を確認したいですか？ <a ng-click="openVariableInspector()" style="color:#53afff;cursor:pointer;">変数確認画面</a>を開いてみてください。
            </div>
        </eos-container>
    `,
    optionsController: ($scope, backendCommunicator) => {
        if ($scope.effect.ttl === undefined) {
            $scope.effect.ttl = 0;
        }

        $scope.openVariableInspector = function() {
            backendCommunicator.fireEvent("show-variable-inspector");
        };
    },
    optionsValidator: effect => {
        const errors = [];
        if (effect.name == null || effect.name === "") {
            errors.push("変数名を入れてください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const { effect } = event;

        customVariableManager.addCustomVariable(effect.name, effect.variableData, effect.ttl, effect.propertyPath);

        return true;
    }
};

module.exports = fileWriter;
