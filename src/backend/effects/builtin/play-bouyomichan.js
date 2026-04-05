"use strict";

const logger = require("../../logwrapper");
const { EffectCategory } = require("../../../shared/effect-constants");

const effect = {
    definition: {
        id: "firebot:playbouyomichan",
        name: "棒読みちゃんで発話",
        description: "指定した文章を読み上げます",
        icon: "fad fa-waveform",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="メッセージ" pad-top="true">
            <textarea ng-model="effect.message" class="form-control" name="text" placeholder="メッセージの入力" rows="4" cols="40" replace-variables></textarea>
        </eos-container>

        <eos-container header="通信設定" pad-top="true">
            <dropdown-select options="['HTTP']" selected="effect.communicateMode"></dropdown-select>
            <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('cost')}">
                <label for="port" class="control-label">ポート</label>
                <input
                    type="number"
                    class="form-control input-lg"
                    id="port"
                    name="port"
                    placeholder="ポート"
                    ng-model="effect.port"
                    required
                    min="0"
                    style="width: 50%;"
                />
                <p class="help-block">通常は50080を指定</p>
            </div>

            <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('cost')}">
                <label for="voiceid" class="control-label">音声ID</label>
                <input
                    type="number"
                    class="form-control input-lg"
                    id="voiceid"
                    name="voiceid"
                    placeholder="音声ID（初期値をつかうなら-1）"
                    ng-model="effect.voiceid"
                    required
                    min="0"
                    style="width: 50%;"
                />
                <p class="help-block">音声番号を指定</p>
            </div>
        </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.communicateMode == null) {
            $scope.effect.communicateMode = "HTTP";
        }
        if ($scope.effect.port == null) {
            $scope.effect.port = 50080;
        }
        if ($scope.effect.voiceid == null) {
            $scope.effect.voiceid = 0;
        }
    },
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.port === "" || effect.port == null) {
            errors.push("ポート番号を指定してください");
        }
        if (effect.voiceid === "" || effect.voiceid == null) {
            errors.push("音声IDを入れてください。");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;

        try {
            await fetch(
                `http://localhost:${effect.port}/talk?text=${encodeURIComponent(effect.message)}&voice=${effect.voiceid}`,
                { method: "GET" }
            );
        } catch (error) {
            logger.error("Error running http request", error.message);
        }

        return {
            success: true
        };
    },
    overlayExtension: {
        dependencies: {
            css: [],
            js: []
        },
        event: {}
    }
};

module.exports = effect;
