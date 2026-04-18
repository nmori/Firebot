"use strict";

(function() {
    const { randomUUID } = require("crypto");

    angular.module("firebotApp")
        .component("addOrEditFukubikiPrizeModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">{{$ctrl.isNew ? '賞を追加' : '賞を編集'}}</h4>
                </div>
                <div class="modal-body">
                    <form name="prizeForm">

                        <div class="form-group" ng-class="{'has-error': prizeForm.name.$invalid && prizeForm.name.$touched}">
                            <label class="control-label">賞の名前 <span class="text-danger">*</span></label>
                            <input
                                type="text"
                                name="name"
                                class="form-control"
                                placeholder="例: 1等"
                                ng-model="$ctrl.prize.name"
                                required
                            />
                            <span class="help-block" ng-show="prizeForm.name.$invalid && prizeForm.name.$touched">賞の名前は必須です</span>
                        </div>

                        <div class="form-group" ng-class="{'has-error': prizeForm.chance.$invalid && prizeForm.chance.$touched}">
                            <label class="control-label">当選確率の重み <span class="text-danger">*</span></label>
                            <input
                                type="number"
                                name="chance"
                                class="form-control"
                                placeholder="例: 10 （数値が大きいほど出やすい）"
                                ng-model="$ctrl.prize.chance"
                                min="1"
                                required
                            />
                            <p class="help-block muted" style="font-size:11px;">全賞の重みの合計に対する割合が実際の確率になります。例: 1等=5, 2等=15, ハズレ=80 → 1等は5%</p>
                            <span class="help-block" ng-show="prizeForm.chance.$invalid && prizeForm.chance.$touched">1以上の値を入力してください</span>
                        </div>

                        <div class="form-group" ng-class="{'has-error': prizeForm.stock.$invalid && prizeForm.stock.$touched}">
                            <label class="control-label">払い出せる総数（ストック）</label>
                            <input
                                type="number"
                                name="stock"
                                class="form-control"
                                placeholder="0 = 無制限"
                                ng-model="$ctrl.prize.stock"
                                min="0"
                            />
                            <p class="help-block muted" style="font-size:11px;">0にすると無制限。1以上にするとその数を超えると引けなくなります。</p>
                        </div>

                        <div class="form-group">
                            <label class="control-label">チャットメッセージ <span class="text-danger">*</span></label>
                            <textarea
                                name="message"
                                class="form-control"
                                placeholder="例: {displayName}さん、1等おめでとうございます！🎉"
                                ng-model="$ctrl.prize.message"
                                rows="3"
                                required
                            ></textarea>
                            <p class="help-block muted" style="font-size:11px;">使える変数: {username}, {displayName}, {prizeName}</p>
                        </div>

                        <div class="form-group">
                            <label class="control-label">個別チャットメッセージ（ウィスパー）</label>
                            <textarea
                                name="whisperMessage"
                                class="form-control"
                                placeholder="例: {displayName}さん、当選おめでとうございます！"
                                ng-model="$ctrl.prize.whisperMessage"
                                rows="3"
                            ></textarea>
                            <p class="help-block muted" style="font-size:11px;">使える変数: {username}, {displayName}, {prizeName}</p>
                        </div>

                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.save()" ng-disabled="prizeForm.$invalid">保存</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function() {
                const $ctrl = this;

                $ctrl.isNew = true;
                $ctrl.prize = {
                    id: randomUUID(),
                    name: "",
                    chance: 10,
                    stock: 0,
                    message: "{displayName}さん、{prizeName}が当たりました！",
                    whisperMessage: ""
                };

                $ctrl.$onInit = () => {
                    if ($ctrl.resolve.prize) {
                        $ctrl.isNew = false;
                        $ctrl.prize = JSON.parse(JSON.stringify($ctrl.resolve.prize));
                    }
                    if (!$ctrl.prize.id) {
                        $ctrl.prize.id = randomUUID();
                    }
                    if ($ctrl.prize.whisperMessage == null) {
                        $ctrl.prize.whisperMessage = "";
                    }
                };

                $ctrl.save = () => {
                    // stock のデフォルト
                    if ($ctrl.prize.stock == null || $ctrl.prize.stock === "") {
                        $ctrl.prize.stock = 0;
                    }
                    $ctrl.close({ $value: $ctrl.prize });
                };
            }
        });
}());
