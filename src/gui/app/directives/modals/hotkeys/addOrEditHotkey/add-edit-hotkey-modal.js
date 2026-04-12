"use strict";

(function() {
    angular.module("firebotApp").component("addOrEditHotkeyModal", {
        template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()">&times;</span></button>
                <h4 class="modal-title">
                    {{$ctrl.isNewHotkey ? '新しいホットキーを追加' : 'ホットキーを編集' }}
                </h4>
            </div>
            <div class="modal-body">
                <div class="function-button-settings">
                    <div class="alert alert-info" ng-show="$ctrl.isNewHotkey">
                        <b>重要なホットキーの注意事項:</b>
                        <ul>
                            <li>他のアプリで予約済みのホットキーは Firebot で上書きできません。</li>
                            <li>他のアプリとのホットキー競合は Firebot では検出できません。</li>
                            <li>単一キー（例: A）に割り当てると、他アプリでその文字が入力できなくなります。</li>
                            <li>このモーダルが開いている間はホットキーは一時的に無効になります。</li>
                        </ul>
                    </div>

                    <h4>名前</h4>
                    <input type="text" class="form-control" ng-model="$ctrl.hotkey.name" placeholder="名前を入力">

                    <h4 style="margin-top:20px;">キー割り当て</h4>
                    <hotkey-capture on-capture="$ctrl.onHotkeyCapture(hotkey)" hotkey="$ctrl.hotkey.code"></hotkey-capture>

                    <eos-collapsable-panel show-label="詳細設定" hide-label="詳細設定を隠す">
                        <h4>仮想ボタンを追加</h4>
                        <p style="margin-bottom:10px";>通常のキーボードでは押せないキーですが、一部アプリではキーの組み合わせとして送信できます。</p>
                        <dropdown-select options="['F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19', 'F20', 'F21', 'F22', 'F23', 'F24']" ng-init="$ctrl.virtualBtn = 'F13'" selected="$ctrl.virtualBtn"></dropdown-select>
                        <button class="btn btn-link" ng-click="$ctrl.onAddVirtualButtonToHotkey()" style="color: #092965;">ホットキーに追加</button>
                    </eos-collapsable-panel>

                    <div style="margin-top:20px;">
                        <effect-list
                            header="このホットキーで何を実行しますか？"
                            effects="$ctrl.hotkey.effects"
                            trigger="hotkey"
                            trigger-meta="{ rootEffects: $ctrl.hotkey.effects }"
                            update="$ctrl.effectListUpdated(effects)"
                        ></effect-list>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
            </div>
        `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function(hotkeyService, ngToast, backendCommunicator) {
            const $ctrl = this;

            $ctrl.isNewHotkey = true;

            $ctrl.hotkey = {
                name: "",
                active: true,
                code: "",
                warning: "",
                sortTags: []
            };

            $ctrl.$onInit = () => {
                backendCommunicator.send("hotkeys:pause-hotkeys");

                if ($ctrl.resolve.hotkey) {
                    $ctrl.hotkey = JSON.parse(
                        angular.toJson($ctrl.resolve.hotkey)
                    );

                    if ($ctrl.hotkey.sortTags == null) {
                        $ctrl.hotkey.sortTags = [];
                    }

                    $ctrl.isNewHotkey = false;
                }
            };

            $ctrl.save = () => {
                if (!hotkeyValid()) {
                    return;
                }

                const successful = hotkeyService.saveHotkey($ctrl.hotkey);
                if (successful) {
                    $ctrl.close({
                        $value: {
                            hotkey: $ctrl.hotkey
                        }
                    });
                } else {
                    ngToast.create("ホットキーの保存に失敗しました。再試行するか、ログを確認してください。");
                }
            };

            $ctrl.onHotkeyCapture = (hotkey) => {
                $ctrl.hotkey.code = hotkey;
            };

            $ctrl.onAddVirtualButtonToHotkey = () => {
                const button = $ctrl.virtualBtn;
                if ($ctrl.hotkey.code != null && $ctrl.hotkey.code.length !== 0) {
                    if (!$ctrl.hotkey.code.includes(button)) {
                        $ctrl.hotkey.code += `+${button}`;
                    }
                } else {
                    $ctrl.hotkey.code = button;
                }
            };

            $ctrl.effectListUpdated = (effects) => {
                $ctrl.hotkey.effects = effects;
            };

            const hotkeyValid = () => {
                if ($ctrl.hotkey.name === "") {
                    ngToast.create("ホットキー名を入力してください。");
                    return false;
                }

                if ($ctrl.hotkey.code === "") {
                    ngToast.create("ホットキーを入力してください。");
                    return false;
                }

                if (hotkeyService.hotkeyCodeExists($ctrl.hotkey.id, $ctrl.hotkey.code)) {
                    ngToast.create("このホットキーはすでに存在します。");
                    return false;
                }

                return true;
            };
        }
    });
}());