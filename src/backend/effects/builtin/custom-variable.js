"use strict";

const customVariableManager = require("../../common/custom-variable-manager");
const { EffectCategory } = require('../../../shared/effect-constants');

const fileWriter = {
    definition: {
        id: "firebot:customvariable",
        name: "繧ｫ繧ｹ繧ｿ繝螟画焚",
        description: "繝・・繧ｿ繧偵き繧ｹ繧ｿ繝螟画焚縺ｫ菫晏ｭ倥＠縲∽ｻ悶・蝣ｴ謇縺ｧ菴ｿ逕ｨ縺吶ｋ縺薙→縺後〒縺阪∪縺吶・,
        icon: "fad fa-value-absolute",
        categories: [EffectCategory.SCRIPTING],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="螟画焚蜷・>
            <p class="muted">縺薙・蜷榊燕縺ｯ縲・$customVariable[name] 繧堤ｵ檎罰縺励※莉悶・蝣ｴ謇縺ｧ蜿ら・縺吶ｋ髫帙↓菴ｿ逕ｨ縺励∪縺・/p>
            <input ng-model="effect.name" type="text" class="form-control" id="chat-text-setting" placeholder="蜷榊燕繧貞・繧後ｋ" replace-variables menu-position="below">
        </eos-container>

        <eos-container header="螟画焚縺ｮ荳ｭ霄ｫ" pad-top="true">
            <p class="muted">螟画焚縺ｫ菫晏ｭ倥＆繧後ｋ繝・・繧ｿ縲ゅユ繧ｭ繧ｹ繝医∪縺溘・蛻･縺ｮ鄂ｮ謠帙ヵ繝ｬ繝ｼ繧ｺ繧呈欠螳壹〒縺阪∪縺吶・/p>
            <selectable-input-editors
                editors="editors"
                initial-editor-label="initialEditorLabel"
                model="effect.variableData"
            />
            <p class="muted" style="font-size: 11px;"><b>Note:</b> If variable data is a valid JSON string, it will be parsed into an object or array.</p>
        </eos-container>

        <eos-container header="繝励Ο繝代ユ繧｣縺ｮ繝代せ・井ｻｻ諢擾ｼ・ pad-top="true">
            <p class="muted">螟画焚縺ｫ縺吶〒縺ｫ繧ｪ繝悶ず繧ｧ繧ｯ繝医ｄ驟榊・縺ｮ蠖｢縺ｧ繝・・繧ｿ縺御ｿ晏ｭ倥＆繧後※縺・ｋ蝣ｴ蜷医∽ｸ願ｨ倥・繝・・繧ｿ縺ｧ譖ｴ譁ｰ縺吶ｋ迚ｹ螳壹・繝励Ο繝代ユ繧｣繧・う繝ｳ繝・ャ繧ｯ繧ｹ縺ｸ縺ｮ繝代せ・医ラ繝・ヨ險俶ｳ輔ｒ菴ｿ逕ｨ・峨ｒ螳夂ｾｩ縺吶ｋ縺薙→縺後〒縺阪∪縺吶ゆｽ輔ｂ謖・ｮ壹＠縺ｪ縺代ｌ縺ｰ縲∝､画焚蜈ｨ菴薙′鄂ｮ縺肴鋤縺医ｉ繧後ｋ縲よ里蟄倥・繝・・繧ｿ縺後↑縺上√・繝ｭ繝代ユ繧｣縺ｮ繝代せ縺梧署萓帙＆繧後◆蝣ｴ蜷医・縲∽ｽ輔ｂ襍ｷ縺薙ｊ縺ｾ縺帙ｓ縲・/p>
            <p class="muted">If no property path is provided and the existing variable does NOT contain an array, the entire variable is replaced. If the existing variable contains an array and the new value is NOT an array, the new value will be appended to the array.</p>
            <eos-collapsable-panel show-label="Show examples" hide-label="Hide examples" hide-info-box="true">
                <span>萓・</span>
                <ul>
                    <li>some.property</li>
                    <li>1</li>
                    <li>1.value</li>
                </ul>
            </eos-collapsable-panel>
            <input ng-model="effect.propertyPath" type="text" class="form-control" id="propertyPath" placeholder="繝代せ繧貞・蜉・>
        </eos-container>

        <eos-container header="譛牙柑譛滄俣(繧ｪ繝励す繝ｧ繝ｳ)" pad-top="true">
            <p class="muted">縺薙・螟画焚縺後く繝｣繝・す繝･縺ｫ菫晄戟縺輔ｌ繧区悄髢・遘・縲ら┌譛滄剞(Firebot縺悟・襍ｷ蜍輔☆繧九∪縺ｧ)縺ｫ縺ｯ0繧剃ｽｿ逕ｨ縺励∪縺吶・</p>
            <input ng-model="effect.ttl" type="number" class="form-control" id="chat-text-setting" placeholder="遘呈焚繧貞・蜉・>
        </eos-container>

        <eos-container pad-top="true">
            <div class="effect-info well">
                繝・ヰ繝・げ縺ｮ縺溘ａ縺ｫ繝ｪ繧｢繝ｫ繧ｿ繧､繝縺ｧ螟画焚繧堤｢ｺ隱阪＠縺溘＞縺ｧ縺吶°・・<a ng-click="openVariableInspector()" style="color:#53afff;cursor:pointer;">螟画焚遒ｺ隱咲判髱｢</a>繧帝幕縺・※縺ｿ縺ｦ縺上□縺輔＞縲・            </div>
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
            errors.push("螟画焚蜷阪ｒ蜈･繧後※縺上□縺輔＞");
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
