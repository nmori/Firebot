"use strict";

(function() {
    angular.module("firebotApp")
        .component("addOrEditChannelReward", {
            template: `
                <scroll-sentinel element-class="edit-reward-header"></scroll-sentinel>
                <div class="modal-header sticky-header edit-reward-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">チャンネル報酬を編集</h4>
                </div>
                <div class="modal-body" style="padding-top: 15px;">
                    <div ng-if="!$ctrl.reward.manageable" style="display: flex; flex-direction: column; padding-left: 15px; padding-right: 15px;">
                        <div style="font-size:30px;margin: 0 auto;">{{$ctrl.reward.twitchData.title}}</div>

                        <div style="margin: 10px auto; padding: 12.5px; border-radius: 6px; display: inline-flex; flex-direction: column; align-items: center; justify-content: center;" ng-style="{background: $ctrl.reward.twitchData.backgroundColor}">
                            <img
                                ng-src="{{$ctrl.reward.twitchData.image ? $ctrl.reward.twitchData.image.url4x : $ctrl.reward.twitchData.defaultImage.url4x}}"
                                style="width: 75px; height: 75px; display: block;"
                            />
                        </div>

                        <p class="help-block" style="text-align: center;">
                            この報酬は Firebot 外部で作成されたか、古い Firebot で作成されたため、ここでは設定を変更できません。エフェクトの作成は可能です。設定を更新する場合は Twitch 側で行ってください。
                        </p>
                        <collapsable-panel header="編集を有効にする / チャンネル報酬を更新する方法">
                            <p>Firebot でこのチャンネル報酬を編集したい、または <strong>チャンネル報酬を更新</strong> エフェクトを使いたい場合は、<strong>チャンネル報酬</strong> 画面でこの報酬を <strong>複製</strong> してください。これにより、現在の設定（画像を除く）とエフェクトを維持できます。</p>
                            <p>その後、Twitch ダッシュボードから古い報酬を削除できます。既存の <strong>チャンネル報酬を更新</strong> エフェクトは、新しく作成した報酬を参照するよう更新してください。</p>
                        </collapsable-panel>
                    </div>
                    <form ng-show="$ctrl.reward.manageable" name="rewardSettings" style="padding-left: 15px; padding-right: 15px;">
                        <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('name')}">
                            <label for="name" class="control-label">報酬名</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                ng-maxlength="45"
                                ui-validate="'!$ctrl.rewardNameExists($value)'"
                                required
                                class="form-control input-lg"
                                placeholder="報酬名を入力"
                                ng-model="$ctrl.reward.twitchData.title"
                            />
                        </div>

                        <div class="form-group">
                            <label for="description" class="control-label">説明</label>
                            <textarea
                                id="description"
                                maxlength="200"
                                ng-model="$ctrl.reward.twitchData.prompt"
                                class="form-control"
                                style="font-size: 16px; padding: 10px 16px;"
                                name="text"
                                placeholder="視聴者にリクエストしてほしい内容を入力"
                                rows="4"
                                cols="40"
                            />
                            <p class="help-block">任意</p>
                        </div>

                        <div class="form-group flex-row jspacebetween">
                            <div>
                                <label class="control-label" style="margin:0;">視聴者にテキスト入力を必須化</label>
                                <p class="help-block">有効にすると、報酬の引き換え時に視聴者へ必須入力欄が表示されます。</p>
                            </div>
                            <div>
                                <toggle-button toggle-model="$ctrl.reward.twitchData.isUserInputRequired" auto-update-value="true" font-size="32"></toggle-button>
                            </div>
                        </div>

                        <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('cost')}">
                            <label for="cost" class="control-label">コスト</label>
                            <input
                                type="number"
                                class="form-control input-lg"
                                id="cost"
                                name="cost"
                                placeholder="数量を入力"
                                ng-model="$ctrl.reward.twitchData.cost"
                                required
                                min="0"
                                style="width: 50%;"
                            />
                            <p class="help-block">ヒント: 視聴者は平均で1時間あたり220ポイントを獲得します。サブスクは最大2倍の倍率が適用されます。</p>
                        </div>

                        <div class="form-group">
                            <label class="control-label">背景色</label>
                            <div style="margin-top:10px; width: 50%;">
                                <color-picker-input model="$ctrl.reward.twitchData.backgroundColor" lg-input="true" show-clear="false"></color-picker-input>
                            </div>
                        </div>

                        <div class="form-group flex-row jspacebetween">
                            <div>
                                <label class="control-label" style="margin:0;">Twitch 報酬リクエストのキューをスキップ</label>
                                <p class="help-block">有効にすると、今後の視聴者リクエストのみ審査キューをスキップします。</p>
                                <p class="help-block">リクエストは Twitch により即時承認され、払い戻しできません。</p>
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
                                    <label class="control-label" style="margin:0;">引き換えクールダウン</label>
                                    <p class="help-block">引き換え間隔（最大7日）</p>
                                </div>
                                <div>
                                    <toggle-button toggle-model="$ctrl.reward.twitchData.globalCooldownSetting.isEnabled" auto-update-value="true" font-size="32"></toggle-button>
                                </div>
                            </div>
                            <div style="width: 50%;">
                                <time-input
                                    ng-model="$ctrl.reward.twitchData.globalCooldownSetting.globalCooldownSeconds"
                                    max-time-unit="'Days'"
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
                                    <label class="control-label" style="margin:0;">配信ごとの引き換え回数を制限</label>
                                    <p class="help-block">視聴者全体の引き換え最大回数</p>
                                </div>
                                <div>
                                    <toggle-button toggle-model="$ctrl.reward.twitchData.maxPerStreamSetting.isEnabled" auto-update-value="true" font-size="32"></toggle-button>
                                </div>
                            </div>
                            <input
                                type="number"
                                class="form-control input-lg"
                                name="maxPerStream"
                                placeholder="数量を入力"
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
                                    <label class="control-label" style="margin:0;">配信ごとのユーザー別引き換え回数を制限</label>
                                    <p class="help-block">視聴者1人あたりの引き換え最大回数</p>
                                </div>
                                <div>
                                    <toggle-button toggle-model="$ctrl.reward.twitchData.maxPerUserPerStreamSetting.isEnabled" auto-update-value="true" font-size="32"></toggle-button>
                                </div>
                            </div>
                            <input
                                type="number"
                                class="form-control input-lg"
                                name="maxPerUserPerStream"
                                placeholder="数量を入力"
                                ng-model="$ctrl.reward.twitchData.maxPerUserPerStreamSetting.maxPerUserPerStream"
                                ng-disabled="!$ctrl.reward.twitchData.maxPerUserPerStreamSetting.isEnabled"
                                ui-validate="'!$ctrl.reward.twitchData.maxPerUserPerStreamSetting.isEnabled || ($value != null && $value > -1)'"
                                ui-validate-watch="'$ctrl.reward.twitchData.maxPerUserPerStreamSetting.isEnabled'"
                                style="width: 50%;"
                            />
                        </div>

                        <div class="form-group">
                            <label class="control-label" style="margin:0;">報酬アイコン</label>
                            <p class="help-block"><b>重要</b>: 報酬アイコンは Twitch 上でのみ変更できます</p>
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

                    <div ng-if="$ctrl.reward.twitchData.shouldRedemptionsSkipRequestQueue" style="padding-left: 15px; padding-right: 15px;">
                        <div class="mt-10" ng-if="$ctrl.reward.manageable">
                            <h3 class="mb-2">
                                制限
                                <span class="muted pl-1 text-xl" style="font-family: 'Quicksand';">（権限、通貨コストなど）</span>
                            </h3>
                            <restrictions-list
                                restriction-data="$ctrl.reward.restrictionData"
                                trigger="channel_reward"
                                trigger-meta="{}"
                            >
                            </restrictions-list>
                            <div
                                class="ml-3.5"
                                ng-if="!$ctrl.reward.twitchData.shouldRedemptionsSkipRequestQueue && $ctrl.reward.restrictionData.restrictions.length > 0"
                            >
                                <firebot-checkbox
                                    label="制限条件の結果に基づいて引き換えを自動承認/自動拒否する"
                                    model="$ctrl.reward.autoApproveRedemptions"
                                />
                            </div>
                        </div>

                        <effect-list
                            effects="$ctrl.reward.effects"
                            trigger="channel_reward"
                            trigger-meta="{ rootEffects: $ctrl.reward.effects }"
                            update="$ctrl.effectListUpdated(effects)"
                        ></effect-list>
                    </div>

                    <div ng-if="!$ctrl.reward.twitchData.shouldRedemptionsSkipRequestQueue">
                        <setting-container header="引き換え時" collapsed="false">
                            <div class="mt-10" ng-if="$ctrl.reward.manageable">
                                <h3 class="mb-2">
                                    制限
                                    <span class="muted pl-1 text-xl" style="font-family: 'Quicksand';">（権限、通貨コストなど）</span>
                                </h3>
                                <restrictions-list
                                    restriction-data="$ctrl.reward.restrictionData"
                                    trigger="channel_reward"
                                    trigger-meta="{}"
                                >
                                </restrictions-list>
                                <div
                                    class="ml-3.5"
                                    ng-if="!$ctrl.reward.twitchData.shouldRedemptionsSkipRequestQueue && $ctrl.reward.restrictionData.restrictions.length > 0"
                                >
                                    <firebot-checkbox
                                        label="制限条件の結果に基づいて引き換えを自動承認/自動拒否する"
                                        model="$ctrl.reward.autoApproveRedemptions"
                                    />
                                </div>
                            </div>

                            <effect-list
                                effects="$ctrl.reward.effects"
                                trigger="channel_reward"
                                trigger-meta="{ rootEffects: $ctrl.reward.effects }"
                                update="$ctrl.effectListUpdated(effects)"
                            ></effect-list>
                        </setting-container>

                        <setting-container header="承認時" collapsed="true" pad-top="true">
                            <effect-list
                                effects="$ctrl.reward.effectsFulfilled"
                                trigger="channel_reward"
                                trigger-meta="{ rootEffects: $ctrl.reward.effectsFulfilled }"
                                update="$ctrl.fulfilledEffectListUpdated(effects)"
                            ></effect-list>
                        </setting-container>

                        <setting-container header="拒否時" collapsed="true" pad-top="true">
                            <effect-list
                                effects="$ctrl.reward.effectsCanceled"
                                trigger="channel_reward"
                                trigger-meta="{ rootEffects: $ctrl.reward.effectsCanceled }"
                                update="$ctrl.canceledEffectListUpdated(effects)"
                            ></effect-list>
                        </setting-container>
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

                const generateRandomColor = () => `#${Math.floor(Math.random() * 8 ** 8).toString(16).padStart(6, '0')}`;

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
                 * @type {import('../../../../../types/channel-rewards').SavedChannelReward}
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

                $ctrl.fulfilledEffectListUpdated = function(effects) {
                    $ctrl.reward.effectsFulfilled = effects;
                };

                $ctrl.canceledEffectListUpdated = function(effects) {
                    $ctrl.reward.effectsCanceled = effects;
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

                    channelRewardsService.saveChannelReward($ctrl.reward).then((successful) => {
                        if (successful) {
                            $ctrl.dismiss();
                        } else {
                            ngToast.create("チャンネル報酬の保存に失敗しました。再試行するか、ログを確認してください。");
                        }
                    });
                };
            }
        });
}());
