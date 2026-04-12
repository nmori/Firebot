"use strict";

(function() {
    angular.module("firebotApp")
        .component("editStreamInfoModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">配信情報を編集</h4>
                </div>
                <div class="modal-body">

                    <div ng-hide="$ctrl.dataLoaded" style="height: 150px;display: flex;align-items: center;justify-content: center;">
                        <div class="bubble-spinner">
                            <div class="bounce1"></div>
                            <div class="bounce2"></div>
                            <div class="bounce3"></div>
                        </div>
                    </div>

                    <form ng-show="$ctrl.dataLoaded" name="streamInfo">
                        <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('title')}">
                            <label for="title" class="control-label">配信タイトル</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                class="form-control input-lg"
                                placeholder="配信タイトルを入力"
                                ng-model="$ctrl.streamInfo.title"
                            />
                        </div>

                        <div class="form-group">
                            <label for="game" class="control-label">カテゴリ</label>
                            <div style="display:flex">
                                <ui-select style="width: 100%; min-width: 0;" ng-model="$ctrl.selectedGame" required input-id="game" theme="bootstrap" spinner-enabled="true" on-select="$ctrl.gameSelected($item)">
                                    <ui-select-match placeholder="カテゴリを検索...">
                                        <div style="height: 25px; display:flex; flex-direction: row; align-items: center;">
                                            <img style="height: 21px; border-radius: 5px; margin-right:5px;" ng-src="{{$select.selected.boxArtUrl}}">
                                            <div style="font-weight: 100; font-size: 17px; overflow: hidden; text-overflow: ellipsis;">{{$select.selected.name}}</div>
                                        </div>
                                    </ui-select-match>
                                    <ui-select-choices minimum-input-length="1" repeat="game in $ctrl.games | filter: $select.search" refresh="$ctrl.searchGames($select.search)" refresh-delay="200" style="position:relative;">
                                        <div style="height: 35px; display:flex; flex-direction: row; align-items: center;">
                                            <img style="height: 30px; border-radius: 5px; margin-right:10px;" ng-src="{{game.boxArtUrl}}">
                                            <div style="font-weight: 100;font-size: 17px; overflow: hidden; text-overflow: ellipsis;">{{game.name}}</div>
                                        </div>
                                    </ui-select-choices>
                                </ui-select>
                                <div ng-show="$ctrl.selectedGame != null" style="margin-left: 3px">
                                    <button
                                        class="btn btn-default"
                                        aria-label="カテゴリをクリア"
                                        uib-tooltip="カテゴリをクリア"
                                        ng-click="$ctrl.removeCategory()">
                                        <i class="far fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="tags" class="control-label">配信タグ</label>
                            <div style="display: block" role="list">
                                <div class="role-bar" id="tags" ng-repeat="tag in $ctrl.streamInfo.tags" role="listitem">
                                    <span>{{tag}}</span>
                                    <span
                                        role="button"
                                        class="clickable"
                                        style="padding-left: 10px;"
                                        aria-label="{{tag}} タグを削除"
                                        uib-tooltip="タグを削除"
                                        tooltip-append-to-body="true"
                                        ng-click="$ctrl.removeStreamTag(tag)"
                                    >
                                        <i class="far fa-times"></i>
                                    </span>
                                </div>
                                <div
                                    class="role-bar clickable"
                                    ng-show="$ctrl.streamInfo.tags.length < 10"
                                    role="button"
                                    aria-label="タグを追加"
                                    uib-tooltip="タグを追加"
                                    tooltip-append-to-body="true"
                                    ng-click="$ctrl.openAddStreamTagsModal()"
                                >
                                    <i class="far fa-plus"></i>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function($scope, ngToast, utilityService, backendCommunicator) {
                const $ctrl = this;

                $ctrl.dataLoaded = false;

                $ctrl.games = [];

                $ctrl.originalGame = {
                    id: 0,
                    name: ""
                };

                $ctrl.streamInfo = {
                    title: "",
                    gameId: 0,
                    gameName: "",
                    tags: []
                };

                $ctrl.selectedGame = null;

                $ctrl.formFieldHasError = (fieldName) => {
                    return ($scope.streamInfo.$submitted || $scope.streamInfo[fieldName].$touched)
                        && $scope.streamInfo[fieldName].$invalid;
                };

                $ctrl.$onInit = async () => {
                    $ctrl.streamInfo = await backendCommunicator.fireEventAsync("get-channel-info");

                    if ($ctrl.streamInfo) {
                        if ($ctrl.streamInfo.gameId) {
                            const game = await backendCommunicator.fireEventAsync("get-twitch-game", $ctrl.streamInfo.gameId);

                            if (game != null) {
                                $ctrl.originalGame = {
                                    id: game.id,
                                    name: game.name
                                };
                                $ctrl.selectedGame = game;
                            }
                        }

                        $ctrl.dataLoaded = true;
                    }
                };

                $ctrl.openAddStreamTagsModal = function() {
                    utilityService.openGetInputModal(
                        {
                            label: "配信タグを追加",
                            saveText: "追加",
                            inputPlaceholder: "タグを入力",
                            validationFn: (value) => {
                                return new Promise((resolve) => {
                                    // Must be alphanumeric no more than 25 characters
                                    const tagRegExp = /^[a-z0-9]{1,25}$/ig;

                                    if (value == null || value.trim().length < 1) {
                                        resolve(false);
                                    } else if (!tagRegExp.test(value)) {
                                        resolve(false);
                                    } else if ($ctrl.streamInfo.tags.findIndex(element => value.toLowerCase() === element.toLowerCase()) !== -1) {
                                        resolve(false);
                                    } else {
                                        resolve(true);
                                    }
                                });
                            },
                            validationText: "タグ名は空欄不可、英数字25文字以内、スペース不可、かつ重複不可です。"
                        },
                        (tag) => {
                            $ctrl.streamInfo.tags.push(tag);
                        });
                };

                $ctrl.searchGames = function(gameQuery) {
                    backendCommunicator.fireEventAsync("search-twitch-games", gameQuery)
                        .then((games) => {
                            if (games != null) {
                                $ctrl.games = games;
                            }
                        });
                };

                $ctrl.gameSelected = function(game) {
                    if (game != null) {
                        $ctrl.streamInfo.gameId = game.id;
                        $ctrl.streamInfo.gameName = game.name;
                    }
                };

                $ctrl.removeCategory = function() {
                    $ctrl.selectedGame = null;
                    $ctrl.streamInfo.gameId = '';
                    $ctrl.streamInfo.gameName = null;
                };

                $ctrl.removeStreamTag = function(tag) {
                    $ctrl.streamInfo.tags = $ctrl.streamInfo.tags.filter(element => tag.toLowerCase() !== element.toLowerCase());
                };

                $ctrl.save = async () => {
                    await backendCommunicator.fireEventAsync("set-channel-info", $ctrl.streamInfo);
                    if ($ctrl.streamInfo.gameId !== $ctrl.originalGame.id) {
                        backendCommunicator.fireEvent("category-changed", $ctrl.streamInfo.gameName);
                    }
                    ngToast.create({
                        className: 'success',
                        content: "配信情報を更新しました！"
                    });
                    $ctrl.dismiss();
                };
            }
        });
}());
