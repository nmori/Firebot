"use strict";
(function() {
    angular
        .module('firebotApp')
        .component("chatMessage", {
            bindings: {
                message: "=",
                compactDisplay: "<",
                hideDeletedMessages: "<",
                showSharedChatInfo: "<",
                showAvatar: "<",
                showTimestamp: "<",
                showBttvEmotes: "<",
                showFfzEmotes: "<",
                showSevenTvEmotes: "<",
                showPronoun: "<",
                hideReplyBanner: "<?",
                disableInteractions: "<?",
                updateChatInput: "&?",
                onReplyClicked: "&?",
                chatSizeStyle: "@?",
                fontFamilyStyle: "@?"
            },
            template: `
                <div class="chat-message-wrapper">
                    <div
                        ng-if="$ctrl.message.isAnnouncement"
                        class="announcement-bar"
                        ng-class="$ctrl.message.announcementColor"
                    >
                    </div>
                    <div
                        ng-if="$ctrl.message.isAutoModHeld"
                        class="automod-bar"
                        ng-class="$ctrl.message.autoModStatus"
                    >
                    </div>
                    <div
                        ng-if="$ctrl.message.isFirstChat || $ctrl.message.isReturningChatter || $ctrl.message.isRaider || $ctrl.message.isSuspiciousUser"
                        class="chat-highlight-bar"
                        ng-class="{'first-chat': $ctrl.message.isFirstChat, returning: $ctrl.message.isReturningChatter, raider: $ctrl.message.isRaider, suspicious: $ctrl.message.isSuspiciousUser}"
                    >
                    </div>
                    <div
                        ng-if="$ctrl.message.customHighlightColor"
                        class="chat-highlight-bar"
                        ng-style="{'background-color': $ctrl.message.customHighlightColor}">
                    </div>
                    <div ng-if="$ctrl.message.isAnnouncement" class="chat-message-banner">
                        <i class="fad fa-bullhorn"></i> お知らせ
                    </div>
                    <div ng-if="$ctrl.message.isFirstChat" class="chat-message-banner">
                        <i class="fad fa-sparkles"></i> 初回チャット
                    </div>
                    <div ng-if="$ctrl.message.isReturningChatter" class="chat-message-banner">
                        <i class="fad fa-repeat"></i> 復帰チャッター
                    </div>
                    <div ng-if="$ctrl.message.isRaider" class="chat-message-banner">
                        <i class="fad fa-siren-on"></i> {{$ctrl.message.raidingFrom}} からレイド
                    </div>
                    <div ng-if="$ctrl.message.isSuspiciousUser" class="chat-message-banner">
                        <i class="fad fa-exclamation-triangle"></i> 要注意ユーザー
                    </div>
                    <div ng-if="$ctrl.message.customBannerText" class="chat-message-banner">
                        <i ng-if="$ctrl.message.customBannerIcon" class="{{$ctrl.message.customBannerIcon}}"></i>
                        {{$ctrl.message.customBannerText}}
                    </div>
                    <div ng-if="$ctrl.message.isReply && !$ctrl.hideReplyBanner" class="chat-message-banner mini-banner muted truncate" ng-click="$ctrl.replyBannerClicked()">
                        <i class="fad fa-comment-alt-dots"></i> @{{$ctrl.message.replyParentMessageSenderDisplayName}} への返信: {{$ctrl.message.replyParentMessageText}}</span>
                    </div>
                    <div ng-if="$ctrl.message.reward" class="reward-redemption" ng-class="{ isHighlight: $ctrl.message.reward.id === 'highlight-message' }">
                        <img ng-src="{{$ctrl.message.reward.imageUrl}}" />
                        <b>{{$ctrl.message.userDisplayName}}{{($ctrl.message.userDisplayName.toLowerCase() !== $ctrl.message.username.toLowerCase() ? " (" + $ctrl.message.username + ")" : "")}}</b> <span>が引き換え</span> <b>{{$ctrl.message.reward.name}}</b>
                    </div>
                    <div
                        ng-if="$ctrl.message.sharedChatRoomDisplayName && !$ctrl.compactDisplay"
                        ng-show="$ctrl.showSharedChatInfo"
                        class="shared-chat-banner"
                    >
                        <img ng-if="$ctrl.message.sharedChatRoomProfilePicUrl" ng-src="{{ $ctrl.message.sharedChatRoomProfilePicUrl }}" />
                        {{ $ctrl.message.sharedChatRoomDisplayName }} のチャンネルから送信
                    </div>
                    <div class="chat-message"
                        ng-class="{
                            isAction: $ctrl.message.action,
                            isWhisper: $ctrl.message.whisper,
                            isDeleted: $ctrl.message.deleted,
                            isTagged: $ctrl.message.tagged,
                            isCompact: $ctrl.compactDisplay,
                            spoilers: $ctrl.hideDeletedMessages,
                            isHighlighted: $ctrl.message.isHighlighted,
                            isCustomReward: $ctrl.message.customRewardId != null
                        }"
                        ng-attr-messageId="{{$ctrl.message.id}}"
                        context-menu="$ctrl.getMessageContextMenu($ctrl.message)"
                        context-menu-class="chat-message-context-menu"
                        context-menu-on="{{$ctrl.message.isExtension || $ctrl.disableInteractions ? 'disabled' : 'contextmenu'}}"
                    >
                        <div
                            ng-if="!$ctrl.compactDisplay"
                            ng-show="$ctrl.showAvatar"
                            class="chat-user-avatar-wrapper"
                            context-menu="$ctrl.getMessageContextMenu($ctrl.message)"
                            context-menu-class="chat-message-context-menu"
                            context-menu-on="{{$ctrl.message.isExtension || $ctrl.disableInteractions ? 'disabled' : 'click'}}"
                        >
                            <img class="chat-user-avatar" ng-src="{{$ctrl.message.profilePicUrl}}">
                        </div>
                        <div>
                            <div
                                ng-if="$ctrl.message.sharedChatRoomProfilePicUrl && $ctrl.compactDisplay"
                                class="chat-user-avatar-wrapper"
                                ng-show="$ctrl.showSharedChatInfo"
                                uib-tooltip="{{ $ctrl.message.sharedChatRoomDisplayName }} のチャンネルから送信"
                                tooltip-append-to-body="true"
                            >
                                <img class="shared-chat-user-avatar" ng-src="{{$ctrl.message.sharedChatRoomProfilePicUrl}}">
                            </div>

                            <span ng-if="$ctrl.compactDisplay" ng-show="$ctrl.showTimestamp" class="muted chat-timestamp">
                                {{$ctrl.message.timestampDisplay}}
                            </span>

                            <div
                                ng-if="$ctrl.compactDisplay"
                                class="chat-user-avatar-wrapper"
                                ng-show="$ctrl.showAvatar"
                                context-menu="$ctrl.getMessageContextMenu($ctrl.message)"
                                context-menu-class="chat-message-context-menu"
                                context-menu-on="{{$ctrl.message.isExtension || $ctrl.disableInteractions ? 'disabled' : 'click'}}"
                            >
                                <img class="chat-user-avatar" ng-src="{{$ctrl.message.profilePicUrl}}">
                            </div>

                            <div
                                class="chat-username"
                                context-menu="$ctrl.getMessageContextMenu($ctrl.message)"
                                context-menu-class="chat-message-context-menu"
                                context-menu-on="{{$ctrl.message.isExtension || $ctrl.disableInteractions ? 'disabled' : 'click'}}"
                            >
                                <div ng-show="$ctrl.message.badges.length > 0" class="user-badges">
                                    <img ng-repeat="badge in $ctrl.message.badges"
                                        ng-src="{{badge.url}}"
                                        uib-tooltip="{{badge.title}}"
                                        tooltip-append-to-body="true" />
                                </div>
                                <span
                                    class="pronoun"
                                    uib-tooltip="代名詞"
                                    tooltip-append-to-body="true"
                                    ng-click="$root.openLinkExternally('https://pronouns.alejo.io/')"
                                    ng-show="$ctrl.showPronoun && $ctrl.pronouns.pronounCache[$ctrl.message.username] != null"
                                >{{$ctrl.pronouns.pronounCache[$ctrl.message.username]}}</span>

                                <span
                                    class="rank-role-badge"
                                    ng-repeat="badge in $ctrl.rankAndRoleBadges"
                                    uib-tooltip="{{badge.tooltip}}"
                                    tooltip-append-to-body="true"
                                ><i class="{{badge.icon}}" style="font-size: 10px;"></i> {{badge.text}}</span>

                                <b ng-style="{'color': $ctrl.message.color}">{{$ctrl.message.userDisplayName != null ? $ctrl.message.userDisplayName : $ctrl.message.username}}</b>
                                <span
                                    ng-if="$ctrl.message.username && $ctrl.message.userDisplayName && $ctrl.message.username.toLowerCase() !== $ctrl.message.userDisplayName.toLowerCase()"
                                    style="font-weight: 100"
                                    ng-style="{'color': $ctrl.message.color}"
                                    class="muted"
                                >&nbsp;({{$ctrl.message.username}})</span>
                                <span
                                    ng-if="$ctrl.compactDisplay && !$ctrl.message.action"
                                    style="color:white;font-weight:200;"
                                >:</span>
                                <span ng-if="!$ctrl.compactDisplay" ng-show="$ctrl.showTimestamp" class="muted chat-timestamp">
                                    {{$ctrl.message.timestampDisplay}}
                                </span>
                            </div>
                            <div class="chatContent" ng-class="{ gigantify: $ctrl.message.isGigantified }">
                                <span ng-repeat="part in $ctrl.message.parts" class="chat-content-wrap">

                                    <span ng-if="part.type === 'text'" style="{{$ctrl.chatSizeStyle}}{{$ctrl.fontFamilyStyle}}" ng-class="{ highlightText: part.flagged }">{{part.text}}</span>

                                    <a ng-if="part.type === 'link'" style="{{$ctrl.chatSizeStyle}}{{$ctrl.fontFamilyStyle}}" ng-href="{{part.url}}" target="_blank">{{part.text}}</a>

                                    <span
                                        ng-if="part.type === 'cheer'"
                                        class="chatEmoticon"
                                        uib-tooltip="{{part.name}}"
                                        tooltip-append-to-body="true"
                                    >
                                        <img ng-if="part.animatedUrl != '' && part.animatedUrl != null" ng-src="{{part.animatedUrl}}" style="height: 100%;" alt="{{part.name || part.text || ''}}">
                                        <img ng-if="part.animatedUrl == '' || part.animatedUrl == null" ng-src="{{part.url}}" style="height: 100%;" alt="{{part.name || part.text || ''}}">
                                    </span>
                                    <span ng-if="part.type === 'cheer'" style="{{$ctrl.chatSizeStyle}}{{$ctrl.fontFamilyStyle}}; font-weight: bold;" ng-style="{ color: part.color }" >{{part.amount}}</span>

                                    <span
                                        ng-if="part.type === 'emote'"
                                        class="chatEmoticon"
                                        uib-tooltip="{{part.origin}}: {{part.name}}"
                                        tooltip-append-to-body="true"
                                    >
                                        <img ng-if="part.animatedUrl != '' && part.animatedUrl != null" ng-src="{{part.animatedUrl}}" style="height: 100%;" alt="{{part.name || part.text || ''}}">
                                        <img ng-if="part.animatedUrl == '' || part.animatedUrl == null" ng-src="{{part.url}}" style="height: 100%;" alt="{{part.name || part.text || ''}}">
                                    </span>

                                    <span
                                        ng-if="part.origin === 'BTTV' && $ctrl.showBttvEmotes"
                                        class="chatEmoticon"
                                        uib-tooltip="{{part.origin}}: {{part.name}}"
                                        tooltip-append-to-body="true"
                                    >
                                        <img ng-src="{{part.url}}" style="height: 100%;" alt="{{part.name || part.text || ''}}" />
                                    </span>
                                    <span ng-if="part.origin === 'BTTV' && !$ctrl.showBttvEmotes" style="{{$ctrl.chatSizeStyle}}{{$ctrl.fontFamilyStyle}}">{{part.name}}</span>

                                    <span
                                        ng-if="part.origin === 'FFZ' && $ctrl.showFfzEmotes"
                                        class="chatEmoticon"
                                        uib-tooltip="{{part.origin}}: {{part.name}}"
                                        tooltip-append-to-body="true"
                                    >
                                        <img ng-src="{{part.url}}" style="height: 100%;" alt="{{part.name || part.text || ''}}" />
                                    </span>
                                    <span ng-if="part.origin === 'FFZ' && !$ctrl.showFfzEmotes" style="{{$ctrl.chatSizeStyle}}{{$ctrl.fontFamilyStyle}}">{{part.name}}</span>

                                    <span
                                        ng-if="part.origin === '7TV' && $ctrl.showSevenTvEmotes"
                                        class="chatEmoticon"
                                        uib-tooltip="{{part.origin}}: {{part.name}}"
                                        tooltip-append-to-body="true"
                                    >
                                        <img ng-src="{{part.url}}" style="height: 100%;" alt="{{part.name || part.text || ''}}" />
                                    </span>
                                    <span ng-if="part.origin === '7TV' && !$ctrl.showSevenTvEmotes" style="{{$ctrl.chatSizeStyle}}{{$ctrl.fontFamilyStyle}}">{{part.name}}</span>
                                </span>
                            </div>
                            <div ng-show="$ctrl.message.whisper" class="muted">({{ $ctrl.message.whisperTarget }} にささやき)</div>
                        </div>
                    </div>
                    <div class="automod-tag" ng-show="$ctrl.message.isAutoModHeld">
                        <div ng-if="$ctrl.message.autoModStatus === 'pending' && !$ctrl.message.autoModErrorMessage">
                            <i class="fal fa-question-circle pending"></i>
                            <span>AutoMod によりフラグ ({{$ctrl.message.autoModReason}}): </span>
                            <span ng-if="!$ctrl.respondedToAutoMod">
                                <a href style="font-weight: 700;" ng-click="$ctrl.allowAutoModMessage()">許可</a>
                                <span> • </span>
                                <a href style="font-weight: 700;" ng-click="$ctrl.denyAutoModMessage()">拒否</a>
                            </span>
                            <span ng-if="$ctrl.respondedToAutoMod" class="muted">
                                送信中...
                            </span>
                        </div>
                        <div ng-if="$ctrl.message.autoModStatus === 'pending' && $ctrl.message.autoModErrorMessage">
                            <span style="color: rgb(255 149 149)">{{$ctrl.message.autoModErrorMessage}}</span>
                        </div>
                        <div ng-if="$ctrl.message.autoModStatus === 'approved'">
                            <i class="far fa-check approved"></i>
                            <span>{{$ctrl.message.autoModResolvedBy}} が許可</span>
                        </div>
                        <div ng-if="$ctrl.message.autoModStatus === 'denied'">
                            <i class="far fa-times denied"></i>
                            <span>{{$ctrl.message.autoModResolvedBy}} が拒否</span>
                        </div>
                        <div ng-if="$ctrl.message.autoModStatus === 'expired'">
                            <i class="far fa-clock expired"></i>
                            <span>AutoMod によりフラグ ({{$ctrl.message.autoModReason}}): 期限切れ</span>
                        </div>
                    </div>
                    <div ng-if="$ctrl.message.isAnnouncement || $ctrl.message.isFirstChat || $ctrl.message.isReturningChatter || $ctrl.message.isRaider || $ctrl.message.isSuspiciousUser || $ctrl.message.customBannerText || $ctrl.message.customBannerIcon" style="margin-bottom:5px">
                </div>
            `,
            controller: function(
                chatMessagesService,
                viewerRolesService,
                utilityService,
                connectionService,
                pronounsService,
                backendCommunicator
            ) {

                const $ctrl = this;

                $ctrl.pronouns = pronounsService;

                $ctrl.respondedToAutoMod = false;

                $ctrl.allowAutoModMessage = () => {
                    if ($ctrl.respondedToAutoMod) {
                        return;
                    }
                    $ctrl.respondedToAutoMod = true;
                    backendCommunicator.fireEvent("process-automod-message", { messageId: $ctrl.message.id, allow: true });
                };

                $ctrl.denyAutoModMessage = () => {
                    if ($ctrl.respondedToAutoMod) {
                        return;
                    }
                    $ctrl.respondedToAutoMod = true;
                    backendCommunicator.fireEvent("process-automod-message", { messageId: $ctrl.message.id, allow: false });
                };

                $ctrl.showUserDetailsModal = (userId) => {
                    if (userId == null) {
                        return;
                    }

                    const closeFunc = () => {};
                    utilityService.showModal({
                        component: "viewerDetailsModal",
                        backdrop: true,
                        resolveObj: {
                            userId: () => userId
                        },
                        closeCallback: closeFunc,
                        dismissCallback: closeFunc
                    });
                };

                function updateChatField(text) {
                    if (!$ctrl.updateChatInput) {
                        return;
                    }
                    $ctrl.updateChatInput({
                        text: text
                    });
                }

                $ctrl.replyBannerClicked = () => {
                    if (!$ctrl.onReplyClicked) {
                        return;
                    }
                    $ctrl.onReplyClicked({
                        threadOrReplyMessageId: $ctrl.message.threadParentMessageId || $ctrl.message.replyParentMessageId
                    });
                };

                $ctrl.getActionLabel = (actionName) => {
                    const labels = {
                        "Details": "詳細",
                        "Delete Message": "メッセージを削除",
                        "Mention": "メンション",
                        "Reply To Message": "メッセージに返信",
                        "Quote Message": "メッセージを引用",
                        "Whisper": "ささやき",
                        "Spotlight Message": "メッセージをスポットライト",
                        "Shoutout": "シャウトアウト",
                        "Unmod": "モデレーター解除",
                        "Mod": "モデレーター付与",
                        "Remove VIP": "VIP解除",
                        "Add as VIP": "VIP付与",
                        "Timeout": "タイムアウト",
                        "Ban": "BAN"
                    };
                    return labels[actionName] || actionName;
                };

                $ctrl.getMessageContextMenu = (message) => {
                    const actions = [];

                    actions.push({
                        name: "Details",
                        icon: "fa-info-circle"
                    });

                    actions.push({
                        name: "Delete Message",
                        icon: "fa-trash-alt"
                    });

                    actions.push({
                        name: "Mention",
                        icon: "fa-at"
                    });

                    actions.push({
                        name: "Reply To Message",
                        icon: "fa-reply"
                    });

                    actions.push({
                        name: "Quote Message",
                        icon: "fa-quote-right"
                    });

                    if (message.username.toLowerCase() !== connectionService.accounts.streamer.username.toLowerCase() &&
                        message.username.toLowerCase() !== connectionService.accounts.bot.username.toLowerCase()) {

                        actions.push({
                            name: "Whisper",
                            icon: "fa-envelope"
                        });

                        actions.push({
                            name: "Spotlight Message",
                            icon: "fa-lightbulb-on"
                        });

                        actions.push({
                            name: "Shoutout",
                            icon: "fa-megaphone"
                        });

                        if (message.roles.includes("mod")) {
                            actions.push({
                                name: "Unmod",
                                icon: "fa-user-times"
                            });
                        } else {
                            actions.push({
                                name: "Mod",
                                icon: "fa-user-plus"
                            });

                            if (message.roles.includes("vip")) {
                                actions.push({
                                    name: "Remove VIP",
                                    icon: "fa-gem"
                                });
                            } else {
                                actions.push({
                                    name: "Add as VIP",
                                    icon: "fa-gem"
                                });
                            }
                        }

                        actions.push({
                            name: "Timeout",
                            icon: "fa-clock"
                        });

                        actions.push({
                            name: "Ban",
                            icon: "fa-ban"
                        });
                    }

                    return [
                        {
                            html: `<div class="name-wrapper">
                                    <img class="user-avatar" src="${message.profilePicUrl}">
                                    <span style="margin-left: 10px" class="user-name">${message.userDisplayName}${message.username && message.username.toLowerCase() !== message.userDisplayName.toLowerCase() ? ` (${message.username})` : ""}</span>
                                </div>`,
                            enabled: false
                        },
                        ...actions.map((a) => {
                            let html = "";
                            if (a.name === "Remove VIP") {
                                html = `
                                    <div class="message-action">
                                        <span class="fa-stack fa-1x mr-3" style="width: 18px">
                                            <i class="fad fa-gem fa-stack-1x ml-px mt-1" style="opacity: 0.5"></i>
                                            <i class="far fa-slash fa-stack-1x text-2xl"></i>
                                        </span>
                                        <span class="action-name">${$ctrl.getActionLabel(a.name)}</span>
                                    </div>
                                `;
                            } else {
                                html = `
                                    <div class="message-action">
                                        <span class="action-icon"><i class="fad ${a.icon}"></i></span>
                                        <span class="action-name">${$ctrl.getActionLabel(a.name)}</span>
                                    </div>
                                `;
                            }
                            return {
                                html: html,
                                click: () => {
                                    $ctrl.messageActionSelected(a.name, message.username, message.userId, message.displayName, message.id, message.rawText, message);
                                }
                            };
                        })];
                };

                $ctrl.messageActionSelected = (action, username, userId, displayName, msgId, rawText, message) => {
                    switch (action.toLowerCase()) {
                        case "delete message":
                            chatMessagesService.deleteMessage(msgId);
                            break;
                        case "timeout":
                            updateChatField(`/timeout @${username} 300`);
                            break;
                        case "ban":
                            utilityService
                                .showConfirmationModal({
                                    title: "ユーザーをBAN",
                                    question: `${username} をBANしますか？`,
                                    confirmLabel: "BAN",
                                    confirmBtnType: "btn-danger"
                                })
                                .then((confirmed) => {
                                    if (confirmed) {
                                        backendCommunicator.fireEvent("update-user-banned-status", { username: username, shouldBeBanned: true });
                                    }
                                });
                            break;
                        case "mod":
                            viewerRolesService.updateModRoleForUser(username, true);
                            break;
                        case "unmod":
                            utilityService
                                .showConfirmationModal({
                                    title: "モデレーター解除",
                                    question: `${username} のモデレーターを解除しますか？`,
                                    confirmLabel: "解除",
                                    confirmBtnType: "btn-danger"
                                })
                                .then((confirmed) => {
                                    if (confirmed) {
                                        viewerRolesService.updateModRoleForUser(username, false);
                                    }
                                });
                            break;
                        case "add as vip":
                            viewerRolesService.updateVipRoleForUser(username, true);
                            break;
                        case "remove vip":
                            viewerRolesService.updateVipRoleForUser(username, false);
                            break;
                        case "whisper":
                            updateChatField(`/w @${username} `);
                            break;
                        case "mention":
                            updateChatField(`@${username} `);
                            break;
                        case "reply to message":
                            $ctrl.onReplyClicked({
                                threadOrReplyMessageId: $ctrl.message.id
                            });
                            break;
                        case "quote message":
                            updateChatField(`!quote add @${username} ${rawText}`);
                            break;
                        case "spotlight message":
                            chatMessagesService.highlightMessage(username, userId, displayName, rawText, message);
                            break;
                        case "shoutout":
                            updateChatField(`!so @${username}`);
                            break;
                        case "details": {
                            $ctrl.showUserDetailsModal(userId);
                            break;
                        }
                        default:
                            return;
                    }
                };

                $ctrl.rankAndRoleBadges = [];

                $ctrl.$onInit = () => {
                    if ($ctrl.message.viewerRanks) {
                        for (const [ladderName, rankName] of Object.entries($ctrl.message.viewerRanks)) {
                            $ctrl.rankAndRoleBadges.push({
                                text: rankName,
                                icon: "far fa-chevron-double-down",
                                tooltip: `ランク: ${ladderName} の ${rankName}`
                            });
                        }
                    }
                    if ($ctrl.message.viewerCustomRoles) {
                        for (const roleName of $ctrl.message.viewerCustomRoles) {
                            $ctrl.rankAndRoleBadges.push({
                                text: roleName,
                                icon: "far fa-user-tag",
                                tooltip: "カスタムロール"
                            });
                        }
                    }
                };

                /*
                    $scope.getWhisperData = function(data) {
                        let target = data.target;
                        return "Whispered to " + target + ".";
                    };
                */

            }
        });
}());
