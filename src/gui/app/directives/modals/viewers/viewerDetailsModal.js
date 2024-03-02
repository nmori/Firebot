"use strict";
(function() {
    const moment = require("moment");
    moment.locale(firebotAppDetails.locale);

    angular
        .module("firebotApp")
        .component("viewerDetailsModal", {
            template: `
            <div class="modal-header">
                <button type="button" class="close" style="font-size: 45px;font-weight: 100;position: absolute;top: 2px;right: 10px;z-index: 100000;" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
            </div>
            <div class="modal-body">
                <div ng-show="$ctrl.loading" style="height: 464px;display: flex;align-items: center;justify-content: center;">
                    <div class="bubble-spinner">
                        <div class="bounce1"></div>
                        <div class="bounce2"></div>
                        <div class="bounce3"></div>
                    </div>
                </div>
                <div ng-if="!$ctrl.loading">
                    <img ng-src="{{ $ctrl.isTwitchOrNewUser() && $ctrl.viewerDetails.twitchData ? $ctrl.viewerDetails.twitchData.profilePicUrl : '../images/placeholders/default-profile-pic.png'}}"
                        style="width: 200px;height: 200px;border-radius: 200px;position: absolute;left: -50px;top: -50px;"/>
                    <div style="padding-left: 150px;min-height: 125px;">
                        <div style="display:flex;align-items: center;">
                            <div style="font-size:40px;font-weight: 200;">{{$ctrl.isTwitchOrNewUser() && $ctrl.viewerDetails.twitchData ? $ctrl.viewerDetails.twitchData.displayName : $ctrl.viewerDetails.firebotData.username }}</div>
                            <a
                                ng-if="$ctrl.isTwitchOrNewUser() && $ctrl.viewerDetails.twitchData"
                                ng-click="$ctrl.openLink('https://twitch.tv/' + $ctrl.viewerDetails.twitchData.username)"
                                class="clickable"
                                style="line-height: 1;margin-left: 5px;background: #9147FF;padding: 5px;border-radius: 100%;color: white;font-size: 15px;"
                                uib-tooltip="プロフィールを見る"
                                aria-label="プロフィールを見る"
                                tooltip-append-to-body="true">
                                    <i class="fab fa-twitch" style="transform: translateY(2px);" />
                            </a>
                        </div>
                        <div ng-show="$ctrl.isTwitchOrNewUser() && $ctrl.viewerDetails.twitchData && $ctrl.viewerDetails.twitchData.username.toLowerCase() !== $ctrl.viewerDetails.twitchData.displayName.toLowerCase()" style="display:flex;">
                            <div style="margin-right: 11px; font-size: 20px;" class="muted">{{$ctrl.viewerDetails.twitchData.username}}</div>
                        </div>
                        <div ng-show="$ctrl.isTwitchOrNewUser() && $ctrl.viewerDetails.twitchData" style="display:flex;margin-top:10px;">
                            <div style="margin-right: 11px;" uib-tooltip="Twitch歴"><i class="fas fa-user-circle"></i> {{$ctrl.getAccountAge($ctrl.viewerDetails.twitchData.creationDate)}}</div>
                        </div>
                        <div ng-show="$ctrl.isTwitchOrNewUser() && $ctrl.viewerDetails.twitchData" style="display:flex;margin-top:7px;">
                            <div style="margin-right: 11px;" uib-tooltip="ID"><i class="fas fa-id-card-clip"></i> {{$ctrl.viewerDetails.twitchData.username}}</div>
                        </div>
                        <div ng-show="$ctrl.isTwitchOrNewUser() && $ctrl.viewerDetails.twitchData" style="display:flex;margin-top:10px;">
                            <div ng-repeat="role in $ctrl.roles | orderBy : 'rank'" uib-tooltip="{{role.tooltip}}" ng-style="role.style" style="margin-right: 10px;font-size: 13px;text-transform: uppercase;font-weight: bold;font-family: "Roboto";">{{role.name}}</div>
                        </div>
                        <div ng-show="$ctrl.isTwitchOrNewUser() && $ctrl.viewerDetails.twitchData" style="display:flex;margin-top:10px;">
                            <div ng-repeat="action in $ctrl.actions" ng-click="action.onClick()" class="clickable" aria-label="{{action.name}}" uib-tooltip="{{action.name}}" style="margin-right: 10px; display:flex; width: 30px; height:30px; align-items:center; justify-content: center; border-radius: 18px; border: 1.5px solid whitesmoke;">
                                <i ng-class="action.icon"></i>
                            </div>
                        </div>
                    </div>

                    <div ng-if="$ctrl.viewerDbEnabled" style="margin-top: 45px;margin-left: 10px;">
                        <div style="display:flex;margin-bottom:5px;">
                            <div style="font-size:13px;font-weight: bold;opacity:0.9;">データ</div>
                            <span ng-show="$ctrl.hasFirebotData" ng-click="$ctrl.removeViewer()" style="color:#f96f6f;margin-left: 10px;font-size:12px;" class="clickable" uib-tooltip="この視聴者のデータを削除する" aria-label="この視聴者のデータを削除する"><i class="far fa-trash-alt"></i></span>
                        </div>

                        <div class="viewer-detail-data" ng-show="$ctrl.hasFirebotData" style="margin-top: 10px;">
                            <div class="detail-data clickable" ng-repeat="dataPoint in $ctrl.dataPoints" ng-click="dataPoint.onClick()" aria-label="編集 {{dataPoint.name}}">
                                <div class="data-title">
                                    <i class="far" ng-class="dataPoint.icon"></i> {{dataPoint.name}}
                                </div>
                                <div class="data-point">{{dataPoint.display}}<span class="edit-data-btn muted"><i class="fas fa-edit"></i></span></div>
                            </div>
                        </div>

                        <div ng-show="$ctrl.hasFirebotData" style="margin-top:20px; margin-bottom: 30px;">
                            <label class="control-fb control--checkbox"> 統計の自動加算を無効にする <tooltip text="'この視聴者が通貨、視聴時間、その他の統計値を自動的に増加しないようにします。これらの値は手動編集できます。'"></tooltip>
                                <input type="checkbox" ng-model="$ctrl.viewerDetails.firebotData.disableAutoStatAccrual" ng-change="$ctrl.disableAutoStatAccuralChange()">
                                <div class="control__indicator"></div>
                            </label>
                        </div>

                        <div ng-show="$ctrl.hasFirebotData" style="margin-top:20px; margin-bottom: 30px;">
                            <label class="control-fb control--checkbox"> アクティブユーザーリストで許可しない <tooltip text="'randomActiveViewer変数などのアクティブなユーザリストにユーザが表示されないようにします。'"></tooltip>
                                <input type="checkbox" ng-model="$ctrl.viewerDetails.firebotData.disableActiveUserList" ng-change="$ctrl.disableActiveUserListChange()">
                                <div class="control__indicator"></div>
                            </label>
                        </div>

                        <div ng-show="$ctrl.hasFirebotData" style="margin-top:20px; margin-bottom: 30px;">
                            <label class="control-fb control--checkbox"> 視聴者リストに表示しない <tooltip text="'チャットの隣のビューアリストにユーザーが表示されないようにします。'"></tooltip>
                                <input type="checkbox" ng-model="$ctrl.viewerDetails.firebotData.disableViewerList" ng-change="$ctrl.disableViewerListChange()">
                                <div class="control__indicator"></div>
                            </label>
                        </div>

                        <div ng-hide="$ctrl.hasFirebotData" style="padding: left: 15px;">
                            <p class="muted">このTwitchユーザーのFirebotデータは保存されていません。</p>
                            <button type="button" class="btn btn-default" ng-click="$ctrl.saveUser()">この視聴者を保存</button>
                        </div>
                    </div>

                    <div ng-if="$ctrl.hasFirebotData && $ctrl.viewerDetails.firebotData.metadata" style="margin: 20px 10px;">
                        <div style="font-size:13px;font-weight: bold;opacity:0.9;margin-bottom:5px;">メタデータ</div>
                        <div style="margin-top: 10px" ng-show="$ctrl.userHasMetadata()">
                            <table class="fb-table-alt" style="width:100%;">
                                <thead>
                                    <tr style="font-size: 11px;">
                                        <th class="not-clickable">キー</th>
                                        <th class="not-clickable">データ</th>
                                        <th style="width: 70px;"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="viewer-row" ng-repeat="(key, value) in $ctrl.viewerDetails.firebotData.metadata">
                                        <td>
                                            {{key}}
                                        </td>
                                        <td class="ellipsis">
                                            <span>{{value}}</span>
                                        </td>
                                        <td style="display:flex; align-items: center; justify-content: flex-end;">
                                            <i
                                                class="fal fa-edit clickable"
                                                style="margin-right: 10px;"
                                                ng-click="$ctrl.showAddOrEditMetadataModal({ key: key, value: value })"
                                                uib-tooltip="編集する"
                                                tooltip-append-to-body="true">
                                            </i>
                                            <i
                                                class="fal fa-trash-alt clickable"
                                                style="color:#ff3737;"
                                                ng-click="$ctrl.deleteMetadata(key)"
                                                uib-tooltip="削除する"
                                                tooltip-append-to-body="true">
                                            </i>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="role-bar clickable" style="margin-top: 5px;" ng-click="$ctrl.showAddOrEditMetadataModal()" uib-tooltip="メタデータの追加" tooltip-append-to-body="true">
                            <i class="far fa-plus"></i>
                        </div>
                    </div>

                    <div style="margin: 10px 10px 0;" ng-show="$ctrl.hasCustomRoles && $ctrl.viewerDetails.twitchData != null">
                        <div style="font-size:13px;font-weight: bold;opacity:0.9;margin-bottom:5px;">役割</div>
                        <div class="role-bar" ng-repeat="customRole in $ctrl.customRoles track by customRole.id">
                            <span>{{customRole.name}}</span>
                            <span class="clickable" style="padding-left: 10px;" ng-click="$ctrl.removeViewerFromRole(customRole.id, customRole.name)" uib-tooltip="役割を外す" tooltip-append-to-body="true">
                                <i class="far fa-times"></i>
                            </span>
                        </div>
                        <div class="role-bar clickable" ng-if="$ctrl.hasCustomRolesAvailable" ng-click="$ctrl.openAddCustomRoleModal()" uib-tooltip="役割を付与" tooltip-append-to-body="true">
                            <i class="far fa-plus"></i>
                        </div>
                    </div>

                </div>
            </div>
            <div class="modal-footer"></div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function($rootScope, $q, backendCommunicator, viewersService, currencyService, utilityService, viewerRolesService, connectionService, settingsService) {
                const $ctrl = this;

                $ctrl.loading = true;

                $ctrl.openLink = $rootScope.openLinkExternally;

                $ctrl.viewerDetails = {};

                $ctrl.hasFirebotData = false;

                $ctrl.viewerDbEnabled = settingsService.getViewerDB();

                $ctrl.getAccountAge = function(date) {
                    return moment(date).fromNow(true);
                };

                $ctrl.showAddOrEditMetadataModal = (metadata) => {
                    utilityService.showModal({
                        component: "addOrEditMetadataModal",
                        size: "sm",
                        resolveObj: {
                            metadata: () => metadata
                        },
                        closeCallback: ({ key, value }) => {

                            try {
                                value = JSON.parse(value);
                            } catch (error) { /* silently fail */ }

                            backendCommunicator.fireEvent("update-viewer-metadata", {
                                username: $ctrl.viewerDetails.twitchData.username,
                                key,
                                value
                            });

                            $ctrl.viewerDetails.firebotData.metadata[key] = value;
                        }
                    });
                };

                $ctrl.deleteMetadata = (key) => {

                    utilityService.showConfirmationModal({
                        title: "メタデータを削除",
                        question: `メタデータ "${key}" を削除しますか?`,
                        confirmLabel: "削除する",
                        confirmBtnType: "btn-danger"
                    }).then((confirmed) => {
                        if (confirmed) {
                            backendCommunicator.fireEvent("delete-viewer-metadata", {
                                username: $ctrl.viewerDetails.twitchData.username,
                                key
                            });

                            delete $ctrl.viewerDetails.firebotData.metadata[key];
                        }
                    });
                };

                $ctrl.userHasMetadata = () => !!Object.keys($ctrl.viewerDetails.firebotData.metadata || {}).length;

                $ctrl.channelProgressionImgSrc = "";

                $ctrl.roles = [];

                const bannedRole = {
                    name: "追放(BAN)",
                    style: {color: 'red'},
                    rank: -1
                };
                const modRole = {
                    name: "モデレータ",
                    style: {color: '#37ED3B'},
                    rank: 3
                };

                function loadRoles() {
                    const twitchRoles = $ctrl.viewerDetails.twitchData.userRoles;
                    const teamRoles = $ctrl.viewerDetails.twitchData.teamRoles;

                    const userFollowsStreamer = $ctrl.viewerDetails.userFollowsStreamer;
                    let followDateDisplay;
                    if (userFollowsStreamer) {
                        followDateDisplay = moment($ctrl.viewerDetails.twitchData.followDate).format("L");
                    }

                    const roles = [];
                    if (userFollowsStreamer) {
                        roles.push({
                            name: "フォロワー",
                            tooltip: followDateDisplay ? `Since ${followDateDisplay}` : undefined,
                            style: {color: '#47AED2'},
                            rank: 2
                        });
                    }
                    if ($ctrl.viewerDetails.twitchData.isBanned) {
                        roles.push(bannedRole);
                    }
                    for (const role of twitchRoles) {
                        switch (role) {
                            case "vip":
                                roles.push({
                                    name: "VIP",
                                    style: {color: '#E175FF'},
                                    rank: 4
                                });
                                continue;
                            case "mod":
                                roles.push(modRole);
                                continue;
                            case "sub":
                                roles.push({
                                    name: "Subscriber",
                                    style: {color: '#C9CCDB'},
                                    rank: 5
                                });
                                continue;
                            case "broadcaster":
                                roles.push({
                                    name: "Channel Owner",
                                    style: {color: 'white'},
                                    rank: 0
                                });
                                continue;
                            case "tier1":
                                roles.push({
                                    name: "Tier 1 Sub",
                                    style: {color: '#d6d7dc'},
                                    rank: 6
                                });
                                continue;
                            case "tier2":
                                roles.push({
                                    name: "Tier 2 Sub",
                                    style: {color: '#b1c5d4'},
                                    rank: 7
                                });
                                continue;
                            case "tier3":
                                roles.push({
                                    name: "Tier 3 Sub",
                                    style: {color: '#71879a'},
                                    rank: 8
                                });
                                continue;
                        }
                    }

                    for (const teamRole of teamRoles) {
                        const rank = 8;

                        roles.push({
                            name: teamRole.name,
                            style: {color: '#7954b1'},
                            rank: rank + 1
                        });
                    }

                    $ctrl.roles = roles;
                }

                class ViewerAction {
                    constructor(id, value, nameFunc, iconFunc, actionfunc, confirmBtnType = 'btn-primary') {
                        this.id = id;
                        this.toggleValue = value;
                        this._nameFunc = nameFunc;
                        this._iconFunc = iconFunc;
                        this._actionFunc = actionfunc;
                        this._confirmBtnType = confirmBtnType;
                        this.updateNameAndIcon();
                    }

                    updateNameAndIcon() {
                        this.name = this._nameFunc(this.toggleValue);
                        this.icon = this._iconFunc(this.toggleValue);
                    }

                    onClick() {

                        utilityService
                            .showConfirmationModal({
                                title: this.name,
                                question: `変更しますか？ ${this.name.toLowerCase()} ${$ctrl.viewerDetails.twitchData.displayName}?`,
                                confirmLabel: this.name,
                                confirmBtnType: this._confirmBtnType
                            })
                            .then((confirmed) => {
                                if (confirmed) {
                                    this.toggleValue = this._actionFunc(this.toggleValue);
                                    this.updateNameAndIcon();
                                }
                            });

                    }
                }

                $ctrl.actions = [];

                function buildActions() {

                    const userRoles = $ctrl.viewerDetails.twitchData.userRoles;
                    if (userRoles.includes("broadcaster")) {
                        return;
                    }

                    const actions = [];

                    if (connectionService.connections['chat'] === 'connected') {
                        const isMod = userRoles.includes("mod");
                        actions.push(new ViewerAction(
                            "mod",
                            isMod,
                            (mod) => {
                                return mod ? "Unmod" : "Mod";
                            },
                            (mod) => {
                                return mod ? "fas fa-user-minus" : "fal fa-user-plus";
                            },
                            (mod) => {
                                const newMod = !mod;
                                viewersService.updateModStatus($ctrl.viewerDetails.twitchData.username, newMod);
                                if (newMod) {
                                    $ctrl.roles.push(modRole);
                                } else {
                                    $ctrl.roles = $ctrl.roles.filter(r => r.name !== "Moderator");
                                }

                                return newMod;
                            }
                        )
                        );

                        const isBanned = $ctrl.viewerDetails.twitchData.isBanned;
                        actions.push(new ViewerAction(
                            "ban",
                            isBanned,
                            (banned) => {
                                return banned ? "Unban" : "Ban";
                            },
                            (banned) => {
                                return banned ? "fas fa-ban" : "fal fa-ban";
                            },
                            (banned) => {
                                const newBanned = !banned;
                                viewersService.updateBannedStatus($ctrl.viewerDetails.twitchData.username, newBanned);
                                if (newBanned) {
                                    $ctrl.roles.push(bannedRole);
                                } else {
                                    $ctrl.roles = $ctrl.roles.filter(r => r.name !== "Banned");
                                }
                                return newBanned;
                            },
                            "btn-danger"
                        )
                        );
                    }

                    $ctrl.actions = actions;
                }

                $ctrl.disableAutoStatAccuralChange = () => {
                    backendCommunicator.fireEvent("update-firebot-viewer-data-field", {
                        userId: $ctrl.resolve.userId,
                        field: "disableAutoStatAccrual",
                        value: $ctrl.viewerDetails.firebotData.disableAutoStatAccrual
                    });
                };

                $ctrl.disableActiveUserListChange = () => {
                    backendCommunicator.fireEvent("update-firebot-viewer-data-field", {
                        userId: $ctrl.resolve.userId,
                        field: "disableActiveUserList",
                        value: $ctrl.viewerDetails.firebotData.disableActiveUserList
                    });
                };

                $ctrl.disableViewerListChange = () => {
                    backendCommunicator.fireEvent("update-firebot-viewer-data-field", {
                        userId: $ctrl.resolve.userId,
                        field: "disableViewerList",
                        value: $ctrl.viewerDetails.firebotData.disableViewerList
                    });
                };

                class ViewerDataPoint {
                    constructor(name, icon, value, displayFunc, fieldName, valueType, beforeEditFunc, afterEditFunc) {
                        this.name = name;
                        this.icon = icon;
                        this.value = value;
                        this._displayFunc = displayFunc;
                        this._fieldName = fieldName;
                        this._valueType = valueType;
                        this._beforeEditFunc = beforeEditFunc;
                        this._afterEditFunc = afterEditFunc;
                        this.display = this._displayFunc(this.value);
                    }

                    onClick() {
                        const valueToEdit = this._beforeEditFunc(this.value);

                        if (this._valueType === "text" || this._valueType === "number") {
                            utilityService.openGetInputModal(
                                {
                                    model: valueToEdit,
                                    label: "編集 " + this.name,
                                    saveText: "保存",
                                    inputPlaceholder: this.name.toLowerCase() + "を入力",
                                    validationFn: (value) => {
                                        return new Promise((resolve) => {
                                            if (typeof value === 'string') {
                                                if (value == null || value.trim().length < 1) {
                                                    return resolve(false);
                                                }
                                            }
                                            resolve(true);
                                        });
                                    },
                                    validationText: "値を入力してください"

                                },
                                (editedValue) => {
                                    this.value = this._afterEditFunc(editedValue);
                                    this.display = this._displayFunc(this.value);
                                    this.saveValue();
                                }
                            );
                        } else if (this._valueType === "date") {
                            utilityService.openDateModal(
                                {
                                    model: valueToEdit,
                                    label: this.name + " を編集",
                                    saveText: "保存",
                                    inputPlaceholder: this.name.toLowerCase() + " を入力"
                                },
                                (editedValue) => {
                                    this.value = this._afterEditFunc(editedValue);
                                    this.display = this._displayFunc(this.value);
                                    this.saveValue();
                                }
                            );
                        }
                    }

                    saveValue() {
                        backendCommunicator.fireEvent("update-firebot-viewer-data-field", {
                            userId: $ctrl.resolve.userId,
                            field: this._fieldName,
                            value: this.value
                        });
                    }
                }

                $ctrl.dataPoints = [];
                function buildDataPoints() {
                    /**
                     * @type ViewerDataPoint[]
                     */
                    const dataPoints = [];

                    if (!$ctrl.hasFirebotData) {
                        return;
                    }

                    const joinDate = $ctrl.viewerDetails.firebotData.joinDate;
                    dataPoints.push(new ViewerDataPoint(
                        "参加",
                        "fa-sign-in",
                        joinDate,
                        (value) => {
                            return value ? moment(value).format("L") : "未保存";
                        },
                        "joinDate",
                        "date",
                        (value) => {
                            return value ? moment(value).toDate() : new Date();
                        },
                        (value) => {
                            return moment(value).valueOf();
                        }
                    ));

                    const lastSeen = $ctrl.viewerDetails.firebotData.lastSeen;
                    dataPoints.push(new ViewerDataPoint(
                        "最終視聴",
                        "fa-eye",
                        lastSeen,
                        (value) => {
                            return value ? moment(value).format("L") : "未保存";
                        },
                        "lastSeen",
                        "date",
                        (value) => {
                            return value ? moment(value).toDate() : new Date();
                        },
                        (value) => {
                            return moment(value).valueOf();
                        }
                    ));

                    const minsInChannel = $ctrl.viewerDetails.firebotData.minutesInChannel || 0;
                    dataPoints.push(new ViewerDataPoint(
                        "視聴時間",
                        "fa-tv",
                        minsInChannel,
                        (value) => {
                            return value < 60 ? '１時間未満' : parseInt(value / 60) + " 時間";
                        },
                        "minutesInChannel",
                        "number",
                        (value) => {
                            return value ? parseInt(value / 60) : 0;
                        },
                        (value) => {
                            const mins = parseInt(value) * 60;

                            return mins;
                        }
                    ));

                    const chatMessages = $ctrl.viewerDetails.firebotData.chatMessages || 0;
                    dataPoints.push(new ViewerDataPoint(
                        "チャット",
                        "fa-comments",
                        chatMessages,
                        value => value,
                        "chatMessages",
                        "number",
                        (value) => {
                            return value ? parseInt(value) : 0;
                        },
                        (value) => {
                            return value ? parseInt(value) : 0;
                        }
                    ));

                    const currencies = currencyService.getCurrencies();

                    for (const currency of currencies) {
                        dataPoints.push(new ViewerDataPoint(
                            currency.name,
                            "fa-money-bill",
                            $ctrl.viewerDetails.firebotData.currency[currency.id] || 0,
                            value => value,
                            `currency.${currency.id}`,
                            "number",
                            (value) => {
                                return value ? parseInt(value) : 0;
                            },
                            (value) => {
                                return value ? parseInt(value) : 0;
                            }
                        ));
                    }

                    $ctrl.dataPoints = dataPoints;
                }

                $ctrl.hasCustomRoles = viewerRolesService.getCustomRoles().length > 0;
                $ctrl.customRoles = [];
                function loadCustomRoles() {
                    const userId = $ctrl.viewerDetails.twitchData.id;

                    const viewerRoles = viewerRolesService.getCustomRoles();
                    $ctrl.hasCustomRolesAvailable = viewerRoles
                        .filter(r => !r.viewers.some(v => v.id === userId))
                        .length > 0;
                    $ctrl.customRoles = viewerRoles.filter(vr => vr.viewers.some(v => v.id === userId));
                }

                $ctrl.openAddCustomRoleModal = () => {
                    const userId = $ctrl.viewerDetails.twitchData.id;
                    const options = viewerRolesService.getCustomRoles()
                        .filter(r => !r.viewers.some(v => v.id === userId))
                        .map((r) => {
                            return {
                                id: r.id,
                                name: r.name
                            };
                        });
                    utilityService.openSelectModal(
                        {
                            label: "役割の追加",
                            options: options,
                            saveText: "追加",
                            validationText: "役割を選択してください"

                        },
                        (roleId) => {
                            if (!roleId) {
                                return;
                            }

                            const user = {
                                id: $ctrl.viewerDetails.twitchData.id,
                                username: $ctrl.viewerDetails.twitchData.username,
                                displayName: $ctrl.viewerDetails.twitchData.displayName
                            };

                            viewerRolesService.addViewerToRole(roleId, user);
                            loadCustomRoles();
                        });
                };

                $ctrl.removeViewerFromRole = (roleId, roleName) => {
                    const userId = $ctrl.viewerDetails.twitchData.id;
                    utilityService.showConfirmationModal({
                        title: "役割を外す",
                        question: `視聴者に付与されている役割 ${roleName} を外しますか?`,
                        confirmLabel: "外す",
                        confirmBtnType: "btn-danger"
                    }).then((confirmed) => {
                        if (confirmed) {
                            viewerRolesService.removeViewerFromRole(roleId, userId);
                            loadCustomRoles();
                        }
                    });
                };

                function init() {
                    $ctrl.hasFirebotData = Object.keys($ctrl.viewerDetails.firebotData).length > 0;
                    buildDataPoints();
                    if ($ctrl.viewerDetails.twitchData != null) {
                        buildActions();
                        loadRoles();
                        loadCustomRoles();
                        if ($ctrl.hasFirebotData && $ctrl.viewerDetails.firebotData.metadata == null) {
                            $ctrl.viewerDetails.firebotData.metadata = {};
                        }
                    }
                }

                $ctrl.isTwitchOrNewUser = () => {
                    return !Object.keys($ctrl.viewerDetails.firebotData).length || !!$ctrl.viewerDetails.firebotData.twitch;
                };

                $ctrl.removeViewer = function() {
                    if (!$ctrl.hasFirebotData) {
                        return;
                    }

                    const displayName = $ctrl.isTwitchOrNewUser() && $ctrl.viewerDetails.twitchData ?
                        $ctrl.viewerDetails.twitchData.displayName :
                        $ctrl.viewerDetails.firebotData.displayName;

                    utilityService
                        .showConfirmationModal({
                            title: `視聴者データを消す`,
                            question: `視聴者 ${displayName} のデータを削除しますか?`,
                            confirmLabel: "削除",
                            confirmBtnType: "btn-danger"
                        })
                        .then((confirmed) => {
                            if (confirmed) {

                                $ctrl.hasFirebotData = false;
                                $ctrl.viewerDetails.firebotData = {};
                                $ctrl.dataPoints = [];

                                backendCommunicator.fireEvent("remove-viewer-from-db", $ctrl.resolve.userId);
                            }
                        });
                };

                $ctrl.saveUser = function() {
                    if ($ctrl.hasFirebotData) {
                        return;
                    }

                    const relationshipData = $ctrl.viewerDetails.twitchData.relationship;
                    const channelRoles = relationshipData ? relationshipData.roles : [];

                    const createViewerRequest = {
                        id: $ctrl.resolve.userId,
                        username: $ctrl.viewerDetails.twitchData.username,
                        displayName: $ctrl.viewerDetails.twitchData.displayName,
                        profilePicUrl: $ctrl.viewerDetails.twitchData.profilePicUrl,
                        twitchRoles: channelRoles
                    };

                    $q((resolve) => {
                        backendCommunicator.fireEventAsync("create-firebot-viewer-data", createViewerRequest)
                            .then((viewerFirebotData) => {
                                resolve(viewerFirebotData);
                            });
                    }).then((viewerFirebotData) => {
                        $ctrl.viewerDetails.firebotData = viewerFirebotData || {};
                        $ctrl.hasFirebotData = Object.keys($ctrl.viewerDetails.firebotData).length > 0;
                        buildDataPoints();
                    });
                };

                $ctrl.$onInit = function() {
                    const userId = $ctrl.resolve.userId;

                    $q((resolve) => {
                        backendCommunicator.fireEventAsync("get-viewer-details", userId)
                            .then((viewerDetails) => {
                                resolve(viewerDetails);
                            });
                    }).then((viewerDetails) => {
                        console.log(viewerDetails);
                        $ctrl.viewerDetails = viewerDetails;
                        init();
                        $ctrl.loading = false;
                    });
                };
            }
        });
}());