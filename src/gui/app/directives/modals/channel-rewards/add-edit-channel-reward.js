"use strict";

(function() {
    angular.module("firebotApp")
        .component("addOrEditChannelReward", {
            template: `
                <scroll-sentinel element-class="edit-reward-header"></scroll-sentinel>
                <div class="modal-header sticky-header edit-reward-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">チャンネル特典を編集</h4>
                </div>
                <div class="modal-body" style="padding-top: 15px;">
                    <div ng-if="!$ctrl.reward.manageable" style="display: flex; flex-direction: column;">
                        <div style="font-size:30px;margin: 0 auto;">{{$ctrl.reward.twitchData.title}}</div>

                        <div style="margin: 10px auto; padding: 12.5px; border-radius: 6px; display: inline-flex; flex-direction: column; align-items: center; justify-content: center;" ng-style="{background: $ctrl.reward.twitchData.backgroundColor}">             
                            <img 
                                ng-src="{{$ctrl.reward.twitchData.image ? $ctrl.reward.twitchData.image.url4x : $ctrl.reward.twitchData.defaultImage.url4x}}" 
                                style="width: 75px; height: 75px; display: block;"
                            />
                        </div>
                        
                        <p class="help-block" style="text-align: center;">この特典はFirebotの外部で作成されている為、ここで設定を変更することはできません。しかし、演出を作成することはできます。この特典設定を更新したい場合は、Twitch上で行うことができます。</p>
                    </div>
                    <form ng-show="$ctrl.reward.manageable" name="rewardSettings">
                        <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('name')}">
                            <label for="name" class="control-label">チャンネル特典名</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                ng-maxlength="45"
                                ui-validate="'!$ctrl.rewardNameExists($value)'"
                                required 
                                class="form-control input-lg" 
                                placeholder="特典に名前をつける" 
                                ng-model="$ctrl.reward.twitchData.title" 
                            />
                        </div>

                        <div class="form-group">
                            <label for="description" class="control-label">概要</label>
                            <textarea 
                                id="description" 
                                maxlength="200" 
                                ng-model="$ctrl.reward.twitchData.prompt" 
                                class="form-control" 
                                style="font-size: 16px; padding: 10px 16px;" 
                                name="text" 
                                placeholder="視聴者に何をリクエストしてほしいか、ひとこと添えてください" 
                                rows="4" 
                                cols="40"
                            />
                            <p class="help-block">任意</p>
                        </div>

                        <div class="form-group flex-row jspacebetween">
                            <div>
                                <label class="control-label" style="margin:0;">視聴者にテキスト入力を求める</label>
                                <p class="help-block">有効にすると、特典を受け取る視聴者に入力を求める枠が表示されます。</p>
                            </div>
                            <div>
                                <toggle-button toggle-model="$ctrl.reward.twitchData.isUserInputRequired" auto-update-value="true" font-size="32"></toggle-button>
                            </div>
                        </div>

                        <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('cost')}">
                            <label for="cost" class="control-label">金額</label>
                            <input 
                                type="number" 
                                class="form-control input-lg" 
                                id="cost" 
                                name="cost"
                                placeholder="金額を入力" 
                                ng-model="$ctrl.reward.twitchData.cost"
                                required
                                min="0" 
                                style="width: 50%;" 
                            />
                            <p class="help-block">ヒント：視聴者は1時間あたり平均220ポイントを獲得。サブは最大2倍の倍率を獲得。</p>
                        </div>

                        <div class="form-group">
                            <label class="control-label">背景色</label>
                            <div style="margin-top:10px; width: 50%;">
                                <color-picker-input model="$ctrl.reward.twitchData.backgroundColor" lg-input="true" show-clear="false"></color-picker-input>
                            </div>
                        </div>

                        <div class="form-group flex-row jspacebetween">
                            <div>
                                <label class="control-label" style="margin:0;">特典を引き換え順待ちに入れずに引き換え済みにする</label>
                                <p class="help-block">有効にすると、引き換え待ちに入れず引き換え済みにします</p>
                            </div>
                            <div>
                                <toggle-button toggle-model="$ctrl.reward.twitchData.shouldRedemptionsSkipRequestQueue" auto-update-value="true" font-size="32"></toggle-button>
                            </div>
                        </div>

                        <div 
                            style="margin-bottom: 30px;" 
                            ng-class="{'has-error': $ctrl.formFieldHasError('cooldownSeconds')}"
                        >
                            <div class="form-group flex-row jspacebetween" style="margin-bottom: 0;">
                                <div>
                                    <label class="control-label" style="margin:0;">再実行可能になるまでの待ち時間</label>
                                    <p class="help-block">付与までの期間(最長7日間)</p>
                                </div>
                                <div>
                                    <toggle-button toggle-model="$ctrl.reward.twitchData.globalCooldownSetting.isEnabled" auto-update-value="true" font-size="32"></toggle-button>
                                </div>
                            </div>
                            <div style="width: 50%;">
                                <time-input
                                    ng-model="$ctrl.reward.twitchData.globalCooldownSetting.globalCooldownSeconds"
                                    name="cooldownSeconds"
                                    ui-validate="'!$ctrl.reward.twitchData.globalCooldownSetting.isEnabled || ($value != null && $value > -1 && $value <= 604800)'"
                                    ui-validate-watch="'$ctrl.reward.twitchData.globalCooldownSetting.isEnabled'" 
                                    large="true"
                                    disabled="!$ctrl.reward.twitchData.globalCooldownSetting.isEnabled"
                                />
                            </div>
                        </div>

                        <div 
                            style="margin-bottom: 30px;"
                            ng-class="{'has-error': $ctrl.formFieldHasError('maxPerStream')}"
                        >
                            <div 
                                class="form-group flex-row jspacebetween" 
                                style="margin-bottom: 0;"
                            >
                                <div>
                                    <label class="control-label" style="margin:0;">ストリームごとの利用制限</label>
                                    <p class="help-block">視聴者の最大合計償還額</p>
                                </div>
                                <div>
                                    <toggle-button toggle-model="$ctrl.reward.twitchData.maxPerStreamSetting.isEnabled" auto-update-value="true" font-size="32"></toggle-button>
                                </div>
                            </div>
                            <input 
                                type="number"
                                class="form-control input-lg" 
                                name="maxPerStream"
                                placeholder="金額を入力" 
                                ng-model="$ctrl.reward.twitchData.maxPerStreamSetting.maxPerStream" 
                                ng-disabled="!$ctrl.reward.twitchData.maxPerStreamSetting.isEnabled" 
                                ui-validate="'!$ctrl.reward.twitchData.maxPerStreamSetting.isEnabled || ($value != null && $value > -1)'"
                                ui-validate-watch="'$ctrl.reward.twitchData.maxPerStreamSetting.isEnabled'" 
                                style="width: 50%;"
                            />
                        </div>

                        <div 
                            style="margin-bottom: 30px;"
                            ng-class="{'has-error': $ctrl.formFieldHasError('maxPerUserPerStream') }"
                        >
                            <div 
                                class="form-group flex-row jspacebetween" 
                                style="margin-bottom: 0;" 
                            >
                                <div>
                                    <label class="control-label" style="margin:0;">1ユーザーあたりの利用回数制限</label>
                                    <p class="help-block">視聴者1人・1ストリームあたりの最大個人償還額</p>
                                </div>
                                <div>
                                    <toggle-button toggle-model="$ctrl.reward.twitchData.maxPerUserPerStreamSetting.isEnabled" auto-update-value="true" font-size="32"></toggle-button>
                                </div>
                            </div>
                            <input 
                                type="number" 
                                class="form-control input-lg" 
                                name="maxPerUserPerStream" 
                                placeholder="金額を入れる" 
                                ng-model="$ctrl.reward.twitchData.maxPerUserPerStreamSetting.maxPerUserPerStream" 
                                ng-disabled="!$ctrl.reward.twitchData.maxPerUserPerStreamSetting.isEnabled"
                                ui-validate="'!$ctrl.reward.twitchData.maxPerUserPerStreamSetting.isEnabled || ($value != null && $value > -1)'"
                                ui-validate-watch="'$ctrl.reward.twitchData.maxPerUserPerStreamSetting.isEnabled'" 
                                style="width: 50%;" 
                            />
                        </div>

                        <div class="form-group">
                            <label class="control-label" style="margin:0;">特典アイコン</label>
                            <p class="help-block"><b>Important</b>: 特典のアイコンはX(旧Twitch)でのみ変更可能</p>
                            <div>
                                <div style="display: inline-flex; align-items: center; justify-content: center;padding: 12.5px;border: 2px gray dashed;border-radius: 6px;">
                                    <img 
                                        ng-src="{{$ctrl.reward.twitchData.image ? $ctrl.reward.twitchData.image.url4x : $ctrl.reward.twitchData.defaultImage.url4x}}" 
                                        style="width: 75px; height: 75px;"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>

                    <div style="margin-top:15px;">
                        <effect-list effects="$ctrl.reward.effects" trigger="channel_reward" update="$ctrl.effectListUpdated(effects)"></effect-list>
                    </div>

                </div>
                <div class="modal-footer sticky-footer edit-reward-footer">
                    <button type="button" class="btn btn-default" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
                </div>
                <scroll-sentinel element-class="edit-reward-footer"></scroll-sentinel>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function($scope, ngToast, channelRewardsService) {
                const $ctrl = this;

                const generateRandomColor = () => `#${Math.floor(Math.random() * 8 ** 8).toString(16)}`;

                $ctrl.formFieldHasError = (fieldName) => {
                    return ($scope.rewardSettings.$submitted || $scope.rewardSettings[fieldName].$touched)
                        && $scope.rewardSettings[fieldName].$invalid;
                };

                $ctrl.rewardNameExists = (name) => {
                    if (name == null) {
                        return false;
                    }

                    return channelRewardsService.channelRewards.some(r => r
                        .twitchData.title.toLowerCase() === name.toLowerCase()
                        && r.id !== $ctrl.reward.id);
                };

                $ctrl.validationErrors = {};

                $ctrl.isNewReward = true;


                /**
                 * @type {import('../../../../../backend/channel-rewards/channel-reward-manager').SavedChannelReward}
                 */
                $ctrl.reward = {
                    id: null,
                    twitchData: {
                        id: null,
                        title: "",
                        prompt: "",
                        isEnabled: true,
                        isPaused: false,
                        isUserInputRequired: false,
                        shouldRedemptionsSkipRequestQueue: true,
                        cost: null,
                        defaultImage: {
                            url4x: "https://static-cdn.jtvnw.net/custom-reward-images/default-4.png"
                        },
                        backgroundColor: generateRandomColor(),
                        globalCooldownSetting: {
                            isEnabled: false,
                            globalCooldownSeconds: null
                        },
                        maxPerStreamSetting: {
                            isEnabled: false,
                            maxPerStream: null
                        },
                        maxPerUserPerStreamSetting: {
                            isEnabled: false,
                            maxPerUserPerStream: null
                        }
                    },
                    manageable: true,
                    sortTags: [],
                    effects: null
                };

                $ctrl.effectListUpdated = function(effects) {
                    $ctrl.reward.effects = effects;
                };

                $ctrl.$onInit = () => {
                    if ($ctrl.resolve.reward != null) {
                        $ctrl.reward = JSON.parse(angular.toJson($ctrl.resolve.reward));
                        $ctrl.isNewReward = false;
                    }
                };

                $ctrl.save = () => {
                    if ($ctrl.reward.manageable) {
                        $scope.rewardSettings.$setSubmitted();
                        if ($scope.rewardSettings.$invalid) {
                            return;
                        }
                    }

                    channelRewardsService.saveChannelReward($ctrl.reward).then(successful => {
                        if (successful) {
                            $ctrl.dismiss();
                        } else {
                            ngToast.create("Failed to save channel reward. Please try again or view logs for details.");
                        }
                    });
                };
            }
        });
}());
