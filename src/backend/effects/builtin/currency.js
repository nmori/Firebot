"use strict";

const currencyDatabase = require("../../database/currencyDatabase");
const twitchChat = require("../../chat/twitch-chat");
const logger = require("../../logwrapper");
const { EffectCategory } = require('../../../shared/effect-constants');

/**
 * The Currency effect
 */
const currency = {
    /**
   * The definition of the Effect
   */
    definition: {
        id: "firebot:currency",
        name: "通貨を更新",
        description: "視聴者の通貨を更新",
        icon: "fad fa-money-bill",
        categories: [EffectCategory.COMMON, EffectCategory.FUN],
        dependencies: [],
        outputs: [
            {
                label: "通貨金額",
                description: "ランダムな金額を使用する場合に便利。",
                defaultName: "currencyAmount"
            }
        ]
    },
    /**
   * Global settings that will be available in the Settings tab
   */
    globalSettings: {},
    /**
   * The HTML template for the Options view (ie options when effect is added to something such as a button.
   * You can alternatively supply a url to a html file via optionTemplateUrl
   */
    optionsTemplate: `

    <eos-container header="通貨">
        <div class="btn-group">
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="currency-name">{{effect.currency ? getCurrencyName(effect.currency) : '選択...'}}</span> <span class="caret"></span>
            </button>
            <ul class="dropdown-menu currency-name-dropdown">
                <li ng-repeat="currency in currencies"
                    ng-click="effect.currency = currency.id">
                    <a href>{{getCurrencyName(currency.id)}}</a>
                </li>
            </ul>
        </div>
    </eos-container>

    <div ng-if="effect.currency">
        <eos-container header="操作内容" pad-top="true">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="currency-action">{{effect.action ? effect.action : 'Pick one'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu currency-action-dropdown">
                    <li ng-click="effect.action = 'Add'">
                        <a href>追加</a>
                    </li>
                    <li ng-click="effect.action = 'Remove'">
                        <a href>削除</a>
                    </li>
                    <li ng-click="effect.action = 'Set'">
                        <a href>設定</a>
                    </li>
                </ul>
            </div>
        </eos-container>



        <div ng-if="effect.action">

            <eos-container header="対象" pad-top="true">

                <div class="permission-type controls-fb">
                    <label class="control-fb control--radio">ユーザ
                        <input type="radio" ng-model="effect.target" value="individual"/>
                        <div class="control__indicator"></div>
                    </label>
                    <label class="control-fb control--radio">オンライン状態の役割
                        <input type="radio" ng-model="effect.target" value="group"/>
                        <div class="control__indicator"></div>
                    </label>
                    <label class="control-fb control--radio">全オンライン視聴者
                        <input type="radio" ng-model="effect.target" value="allOnline"/>
                        <div class="control__indicator"></div>
                    </label>
                    <label class="control-fb control--radio">全視聴者
                        <input type="radio" ng-model="effect.target" value="allViewers"/>
                        <div class="control__indicator"></div>
                    </label>
                </div>

                <div class="settings-permission" style="padding-bottom:1em">
                    <div class=" viewer-group-list" ng-if="effect.target === 'group'">
                        <div ng-show="hasCustomRoles" style="margin-bottom: 10px;">
                            <div style="font-size: 16px;font-weight: 900;color: #b9b9b9;font-family: 'Quicksand';margin-bottom: 5px;">カスタム</div>
                            <label ng-repeat="customRole in getCustomRoles()" class="control-fb control--checkbox">{{customRole.name}}
                                <input type="checkbox" ng-click="toggleRole(customRole)" ng-checked="isRoleChecked(customRole)"  aria-label="..." >
                                <div class="control__indicator"></div>
                            </label>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <div style="font-size: 16px;font-weight: 900;color: #b9b9b9;font-family: 'Quicksand';margin-bottom: 5px;">Firebot</div>
                            <label ng-repeat="firebotRole in getFirebotRoles()" class="control-fb control--checkbox">{{firebotRole.name}}
                                <input type="checkbox" ng-click="toggleRole(firebotRole)" ng-checked="isRoleChecked(firebotRole)"  aria-label="..." >
                                <div class="control__indicator"></div>
                            </label>
                        </div>
                        <div ng-show="hasTeamRoles" style="margin-bottom: 10px;">
                            <div style="font-size: 16px;font-weight: 900;color: #b9b9b9;font-family: 'Quicksand';margin-bottom: 5px;">チーム</div>
                            <label ng-repeat="teamRole in getTeamRoles()" class="control-fb control--checkbox">{{teamRole.name}}
                                <input type="checkbox" ng-click="toggleRole(teamRole)" ng-checked="isRoleChecked(teamRole)"  aria-label="..." >
                                <div class="control__indicator"></div>
                            </label>
                        </div>
                        <div>
                            <div style="font-size: 16px;font-weight: 900;color: #b9b9b9;font-family: 'Quicksand';margin-bottom: 5px;">Twitch</div>
                            <label ng-repeat="twitchRole in getTwitchRoles()" class="control-fb control--checkbox">{{twitchRole.name}}
                                <input type="checkbox" ng-click="toggleRole(twitchRole)" ng-checked="isRoleChecked(twitchRole)"  aria-label="..." >
                                <div class="control__indicator"></div>
                            </label>
                        </div>
                    </div>
                    <div ng-if="effect.target === 'individual'" class="input-group">
                        <span class="input-group-addon" id="basic-addon3">視聴者名</span>
                        <input type="text" class="form-control" aria-describedby="basic-addon3" ng-model="effect.userTarget" replace-variables>
                    </div>
                </div>

            </eos-container>

            <eos-container header="Amount" ng-if="effect.target != null" pad-top="true">
                <div class="input-group">
                    <span class="input-group-addon" id="currency-units-type">金額</span>
                    <input type="text" ng-model="effect.amount" class="form-control" id="currency-units-setting" aria-describedby="currency-units-type" type="text" replace-variables="number">
                </div>
            </eos-container>

        </div>

        <div ng-if="effect.target">
            <label class="control-fb control--checkbox" style="margin: 30px 0px 10px 10px"> 送るチャットメッセージ
                <input type="checkbox" ng-model="effect.sendChat">
                <div class="control__indicator"></div>
            </label>

            <div ng-show="effect.sendChat">
                <eos-chatter-select effect="effect" title="Chat as"></eos-chatter-select>

                <eos-container header="送信メッセージ" pad-top="true">
                    <textarea ng-model="effect.message" class="form-control" name="text" placeholder="Enter message" rows="4" cols="40" replace-variables></textarea>
                    <div style="color: #fb7373;" ng-if="effect.message && effect.message.length > 360">チャットメッセージは360文字を超えることはできません。すべての置換変数が入力された後でも長すぎる場合、このメッセージは自動的にトリミングされます。</div>
                    <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 10px 0 10px; align-items: center;">
                        <label class="control-fb control--checkbox" style="margin: 0px 15px 0px 0px"> ささやく
                            <input type="checkbox" ng-init="whisper = (effect.whisper != null && effect.whisper !== '')" ng-model="whisper" ng-click="effect.whisper = ''">
                            <div class="control__indicator"></div>
                        </label>
                        <div ng-show="whisper">
                            <div class="input-group">
                                <span class="input-group-addon" id="chat-whisper-effect-type">宛先</span>
                                <input ng-model="effect.whisper" type="text" class="form-control" id="chat-whisper-setting" aria-describedby="chat-text-effect-type" placeholder="ユーザ名">
                            </div>
                        </div>
                    </div>
                </eos-container>
            </div>
        </div>
    </div>
    `,
    /**
   * The controller for the front end Options
   * Port over from effectHelperService.js
   */
    optionsController: ($scope, currencyService, viewerRolesService) => {


        if (!$scope.effect.roleIds) {
            $scope.effect.roleIds = [];
        }

        $scope.currencies = currencyService.getCurrencies();

        $scope.getCurrencyName = function(currencyId) {
            const currency = currencyService.getCurrencies(currencyId);
            return currency.name;
        };

        $scope.hasCustomRoles = viewerRolesService.getCustomRoles().length > 0;
        $scope.hasTeamRoles = viewerRolesService.getTeamRoles().length > 0;
        $scope.getCustomRoles = viewerRolesService.getCustomRoles;
        $scope.getFirebotRoles = viewerRolesService.getFirebotRoles;
        $scope.getTwitchRoles = viewerRolesService.getTwitchRoles;
        $scope.getTeamRoles = viewerRolesService.getTeamRoles;

        $scope.isRoleChecked = function(role) {
            return $scope.effect.roleIds.includes(role.id);
        };

        $scope.toggleRole = function(role) {
            if ($scope.isRoleChecked(role)) {
                $scope.effect.roleIds = $scope.effect.roleIds.filter(id => id !== role.id);
            } else {
                $scope.effect.roleIds.push(role.id);
            }
        };
    },
    /**
   * When the effect is triggered by something
   * Used to validate fields in the option template.
   */
    optionsValidator: effect => {
        const errors = [];
        if (effect.currency == null) {
            errors.push("使用する通貨を選択してください。");
        }
        return errors;
    },
    /**
   * When the effect is triggered by something
   */
    onTriggerEvent: event => {
        return new Promise(async resolve => {
            // Make sure viewer DB is on before continuing.
            if (!currencyDatabase.isViewerDBOn()) {
                return resolve(true);
            }

            // What should this do when triggered.
            const userTarget = event.effect.userTarget;
            const adjustType = event.effect.action;
            const amount = event.effect.amount;

            if (isNaN(amount)) {
                return resolve({
                    success: false,
                    reason: "数字ではない金額： " + amount
                });
            }

            // If "Remove" make number negative, otherwise just use number.
            const currency = event.effect.action === "Remove" ? -Math.abs(amount) : Math.abs(amount);

            // PEOPLE GONNA GET PAID
            try {
                switch (event.effect.target) {
                    case "individual":
                    // Give currency to one person.
                        await currencyDatabase.adjustCurrencyForUser(
                            userTarget,
                            event.effect.currency,
                            currency,
                            adjustType
                        );
                        break;
                    case "allOnline":
                    // Give currency to all online.
                        await currencyDatabase.addCurrencyToOnlineUsers(
                            event.effect.currency,
                            currency,
                            true,
                            adjustType
                        );
                        break;
                    case "allViewers":
                    // Give currency to all viewers.
                        await currencyDatabase.adjustCurrencyForAllUsers(
                            event.effect.currency,
                            currency,
                            true,
                            adjustType
                        );
                        break;
                    case "group":
                    // Give currency to group.
                        await currencyDatabase.addCurrencyToUserGroupOnlineUsers(
                            event.effect.roleIds,
                            event.effect.currency,
                            currency,
                            true,
                            adjustType
                        );
                        break;
                    default:
                        logger.error("Invalid target passed to currency effect. currency.js");
                }

                // Send chat if we have it.
                if (event.effect.sendChat) {
                    const { message, whisper, chatter } = event.effect;
                    await twitchChat.sendChatMessage(message, whisper, chatter);
                }
            } catch (error) {
                logger.error("Error updating currency", error);
            }

            return resolve({
                success: true,
                outputs: {
                    currencyAmount: amount
                }
            });
        });
    },
    /**
   * Code to run in the overlay
   */
    overlayExtension: {
        dependencies: {
            css: [],
            js: []
        },
        event: {
            name: "currency",
            onOverlayEvent: () => {

            } //End event trigger
        }
    }
};

module.exports = currency;
