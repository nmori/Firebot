"use strict";
(function() {
    angular
        .module('firebotApp')
        .component("commandCooldownSettings", {
            bindings: {
                command: "=",
                messageSettingDisabled: "<?",
                disabled: "<?"
            },
            template: `
                <div class="input-group pb-0">
                    <span class="input-group-addon">全体</span>
                    <input
                        class="form-control"
                        type="number"
                        min="0"
                        placeholder="秒"
                        ng-disabled="$ctrl.disabled"
                        ng-model="$ctrl.command.cooldown.global"
                    />
                    <span class="input-group-addon">ユーザー</span>
                    <input
                        class="form-control"
                        type="number"
                        min="0"
                        placeholder="秒"
                        ng-disabled="$ctrl.disabled"
                        ng-model="$ctrl.command.cooldown.user"
                    />
                </div>

                <div
                    class="mt-8 ml-3.5"
                    ng-show="!$ctrl.messageSettingDisabled && ($ctrl.command.cooldown.global > 0 || $ctrl.command.cooldown.user > 0)"
                >
                    <label class="control-fb control--checkbox">
                        クールダウン中にチャットメッセージを送信
                        <input
                            type="checkbox"
                            ng-model="$ctrl.command.sendCooldownMessage"
                        />
                        <div class="control__indicator"></div>
                    </label>

                    <div ng-show="$ctrl.command.sendCooldownMessage">
                        <firebot-checkbox label="クールダウンメッセージを返信として送信"
                            model="$ctrl.command.sendCooldownMessageAsReply"
                        />

                        <label class="control-fb control--checkbox">
                            カスタムクールダウンメッセージを使用
                            <input
                                type="checkbox"
                                ng-model="$ctrl.command.useCustomCooldownMessage"
                            />
                            <div class="control__indicator"></div>
                        </label>

                        <div ng-if="$ctrl.command.useCustomCooldownMessage">
                            <firebot-input
                                model="$ctrl.command.cooldownMessage"
                                disable-variables="true"
                                input-title="メッセージ"
                        />
                            <p class="muted">利用可能な変数: {user}, {timeLeft}</p>
                        </div>
                    </div>
                </div>
            `
        });
}());
