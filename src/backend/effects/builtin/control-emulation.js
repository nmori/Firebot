"use strict";

const { emulateKeyPress, typeString } = require("../../common/handlers/controlEmulation/emulate-control");
const { EffectCategory } = require('../../../shared/effect-constants');

const effect = {
    definition: {
        id: "firebot:controlemulation",
        name: "エミュレート制御",
        description: "キーボードのキーやマウスのクリックをエミュレート",
        icon: "fad fa-keyboard",
        categories: [EffectCategory.ADVANCED, EffectCategory.FUN],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
    <eos-container header="Mode">
        <dropdown-select options="{ keyPress: 'Key Press', typeString: 'Type Text'}" selected="effect.mode"></dropdown-select>
    </eos-container>

    <div ng-if="effect.mode == 'typeString'">
        <eos-container header="テキストを打つ" pad-top="true">
            <firebot-input placeholder-text="テキストを入れる" model="effect.text" />
        </eos-container>
    </div>

    <div ng-if="effect.mode == 'keyPress'">
        <eos-container header="キーを押す" pad-top="true">
            <div class="input-group game-press">
                <span class="input-group-addon" id="button-press-effect-type">Press</span>
                <input type="text" ng-model="effect.press" uib-typeahead="control for control in validControls | filter:$viewValue | limitTo:8" class="form-control" id="game-control-press-setting" aria-describedby="button-press-effect-type">
            </div>
        </eos-container>

        <eos-container header="装飾キー" pad-top="true">
            <div class="button-press-modifier-effect-type" style="padding-left: 15px;">
                <label ng-repeat="modifier in validModifiers" class="control-fb control--checkbox">{{modifier}}
                    <input type="checkbox" ng-click="modifierArray(effect.modifiers,modifier)" ng-checked="modifierCheckboxer(effect.modifiers,modifier)"  aria-label="..." >
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="押している時間" pad-top="true">
            <firebot-input model="effect.pressDuration" input-title="秒" data-type="number" placeholder-text="任意" />
            <p style="padding-top:5px;">コントロールを何秒間押すか。空白の場合、初期値は0.03秒。</p>
        </eos-container>
    </div>


    <eos-container>
        <div class="effect-info alert alert-info">
        エミュレートされたコントロールは、すべてのゲームやプログラムで動作するとは限りません。ゲーム/アプリでコントロールが動作しない場合は、Firebotまたはゲーム/アプリを管理者権限で実行してみてください。
        </div>
    </eos-container>

    `,
    optionsController: ($scope, effectHelperService) => {

        if ($scope.effect.mode == null) {
            $scope.effect.mode = "keyPress";
        }

        $scope.validControls = [
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h",
            "i",
            "j",
            "k",
            "l",
            "m",
            "n",
            "o",
            "p",
            "q",
            "r",
            "s",
            "t",
            "u",
            "v",
            "w",
            "x",
            "y",
            "z",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "0",
            "backspace",
            "delete",
            "enter",
            "space",
            "tab",
            "escape",
            "up",
            "down",
            "left",
            "right",
            "home",
            "end",
            "pageup",
            "pagedown",
            "printscreen",
            "f1",
            "f2",
            "f3",
            "f4",
            "f5",
            "f6",
            "f7",
            "f8",
            "f9",
            "f10",
            "f11",
            "f12",
            "f13",
            "f14",
            "f15",
            "f16",
            "f17",
            "f18",
            "f19",
            "f20",
            "f21",
            "f22",
            "f23",
            "f24",
            "alt",
            "control",
            "shift",
            "numpad_0",
            "numpad_1",
            "numpad_2",
            "numpad_3",
            "numpad_4",
            "numpad_5",
            "numpad_6",
            "numpad_7",
            "numpad_8",
            "numpad_9",
            "leftmouse",
            "middlemouse",
            "rightmouse",
            "audio_mute",
            "audio_vol_down",
            "audio_vol_up",
            "audio_play",
            "audio_stop",
            "audio_pause",
            "audio_prev",
            "audio_next"
        ];

        $scope.validModifiers = ["Control", "Alt", "Shift", "Windows Key/Command"];

        // This sets the effect.modifier to an array of checked items.
        $scope.modifierArray = function(list, item) {
            $scope.effect.modifiers = effectHelperService.getCheckedBoxes(list, item);
        };

        // This checks if an item is in the effect.modifier array and returns true.
        // This allows us to check boxes when loading up this button effect.
        $scope.modifierCheckboxer = function(list, item) {
            return effectHelperService.checkSavedArray(list, item);
        };
    },
    optionsValidator: effect => {
        const errors = [];
        if (effect.mode === "keyPress") {
            if (effect.press == null) {
                errors.push("押すコントロールを選択してください");
            }
            if (effect.pressDuration != null && !isNaN(effect.pressDuration) && parseFloat(effect.pressDuration) <= 0) {
                errors.push("押している時間は0より大きいか、空白である必要があります");
            }
        }
        if (effect.mode === "typeString" && (effect.text == null || effect.text.length < 1)) {
            errors.push("タイプするテキストを入力してください");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        if (effect.mode == null || effect.mode === "keyPress") {
            emulateKeyPress(effect.press, effect.modifiers, effect.pressDuration);
        } else if (effect.mode === "typeString") {
            typeString(effect.text);
        }
        return true;
    }
};

module.exports = effect;
