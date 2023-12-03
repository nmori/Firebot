"use strict";

(function() {

    const moment = require("moment");
    const electron = require('electron');

    angular.module("firebotApp")
        .component("addOrEditQuoteModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">{{$ctrl.isNewQuote ? '引用IDの追加' : '引用IDの編集 ' + $ctrl.quote._id}}</h4>
                </div>
                <div class="modal-body">
                    <div>
                        <div class="modal-subheader" style="padding: 0 0 4px 0">
                            QUOTE TEXT
                        </div>
                        <div style="width: 100%; position: relative;">
                            <div class="form-group" ng-class="{'has-error': $ctrl.textError}">
                                <textarea id="textField" ng-model="$ctrl.quote.text" class="form-control" name="text" placeholder="テキストを入力" rows="4" cols="40" aria-describedby="textHelpBlock"></textarea>
                                <span id="textHelpBlock" class="help-block" ng-show="$ctrl.textError">引用文をいれてください</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="modal-subheader" style="padding: 0 0 4px 0">
                            作成者
                        </div>
                        <div style="width: 100%; position: relative;">
                            <div class="form-group" ng-class="{'has-error': $ctrl.authorError}">
                                <input type="text" id="authorField" class="form-control" ng-model="$ctrl.quote.originator" ng-keyup="$event.keyCode == 13 && $ctrl.save() " aria-describedby="authorHelpBlock" placeholder="ユーザ名を入力">
                                <span id="authorHelpBlock" class="help-block" ng-show="$ctrl.authorError">ユーザ名を入れてください.</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="modal-subheader" style="padding: 0 0 4px 0">
                            作成日
                        </div>
                        <div style="width: 100%; position: relative;">
                            <div class="form-group">
                                <div class="input-group">
                                    <input type="text" class="form-control" uib-datepicker-popup="{{$ctrl.dateFormat}}" ng-model="$ctrl.createdAtDate" is-open="$ctrl.datePickerOpen" datepicker-options="$ctrl.dateOptions" ng-required="true" show-button-bar="false" placeholder="作成日を入力" aria-describedby="dateHelpBlock"/>
                                    <span class="input-group-btn">
                                        <button type="button" class="btn btn-default" ng-click="$ctrl.datePickerOpen = true"><i class="fas fa-calendar"></i></button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="modal-subheader" style="padding: 0 0 4px 0">
                            カテゴリ/ゲーム
                        </div>
                        <div style="width: 100%; position: relative;">
                            <div class="form-group" ng-class="{'has-error': $ctrl.gameError}">
                                <input type="text" id="gameField" class="form-control" ng-model="$ctrl.quote.game" ng-keyup="$event.keyCode == 13 && $ctrl.save() " aria-describedby="gameHelpBlock" placeholder="ゲーム名を入力">
                                <span id="gameHelpBlock" class="help-block" ng-show="$ctrl.gameError">カテゴリかゲーム名を入れてください</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger pull-left" ng-click="$ctrl.delete()" ng-hide="$ctrl.isNewQuote">削除</button>
                    <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function(accountAccess) {
                const $ctrl = this;

                $ctrl.isNewQuote = true;

                const isUSLocale = electron.remote.app.getLocale() === "en-US";
                const isJPLocale = electron.remote.app.getLocale() === "ja-JP";
                $ctrl.dateFormat = isUSLocale ? "MM/dd/yyyy" : (isJPLocale ? "yyyy/MM/dd" : "dd/MM/yyyy");

                $ctrl.quote = {
                    text: "",
                    originator: "",
                    creator: accountAccess.accounts.streamer.username || "Streamer"
                };

                $ctrl.createdAtDate = new Date();
                $ctrl.datePickerOpen = false;
                $ctrl.dateOptions = {
                    showWeeks: false
                };

                $ctrl.$onInit = function() {
                    if ($ctrl.resolve.quote != null) {
                        const copiedQuote = JSON.parse(angular.toJson($ctrl.resolve.quote));

                        $ctrl.createdAtDate = moment(copiedQuote.createdAt).toDate();

                        $ctrl.quote = copiedQuote;
                        $ctrl.isNewQuote = false;
                    }
                };

                $ctrl.delete = () => {
                    if ($ctrl.isNewQuote) {
                        return;
                    }

                    $ctrl.close({
                        $value: {
                            quote: $ctrl.quote,
                            action: "delete"
                        }
                    });
                };

                $ctrl.textError = false;
                $ctrl.authorError = false;
                $ctrl.save = () => {
                    $ctrl.textError = false;
                    $ctrl.authorError = false;

                    if ($ctrl.quote.text == null || $ctrl.quote.text.trim() === "") {
                        $ctrl.textError = true;
                    }

                    if ($ctrl.quote.originator == null || $ctrl.quote.originator.trim() === "") {
                        $ctrl.authorError = true;
                    }

                    if ($ctrl.textError) {
                        return;
                    }

                    $ctrl.quote.createdAt = $ctrl.createdAtDate != null ? moment($ctrl.createdAtDate).toISOString() : null;

                    const action = $ctrl.isNewQuote ? "add" : "update";
                    $ctrl.close({
                        $value: {
                            quote: $ctrl.quote,
                            action: action
                        }
                    });
                };
            }
        });
}());
