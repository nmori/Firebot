"use strict";
(function() {

    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        };
    }

    function getWordByPosition(str, pos) {
        const leftSideString = str.substr(0, pos);
        const rightSideString = str.substr(pos);

        const leftMatch = leftSideString.match(/[^.,\s]*$/);
        const rightMatch = rightSideString.match(/^[^.,\s]*/);

        let resultStr = '';

        if (leftMatch) {
            resultStr += leftMatch[0];
        }

        if (rightMatch) {
            resultStr += rightMatch[0];
        }

        return {
            index: leftMatch.index,
            endIndex: leftMatch.index + resultStr.length,
            text: resultStr
        };
    }

    angular.module("firebotApp")
        .directive("chatAutoCompleteMenu", function($compile, $document) {
            return {
                priority: 1,
                restrict: "A",
                scope: {
                    modelValue: '=ngModel',
                    inputId: "@",
                    onAutocomplete: "&?",
                    menuPosition: "@"
                },
                controller: function($scope, $element, $q, backendCommunicator, $timeout,
                    commandsService, chatMessagesService) {

                    const firebotCommandMenuItems = [
                        ...commandsService.getCustomCommands(),
                        ...commandsService.getSystemCommands()
                    ]
                        .filter(c => c.active && !c.triggerIsRegex)
                        .map(c => [
                            {
                                display: c.trigger,
                                description: c.description,
                                text: c.trigger
                            },
                            ...(c.subCommands ? c.subCommands
                                .filter(sc => !sc.regex)
                                .map(sc => ({
                                    display: `${c.trigger} ${sc.usage ? sc.usage : sc.arg}`,
                                    description: sc.description,
                                    text: `${c.trigger} ${sc.arg}`
                                })) : []),
                            ...(c.aliases ? c.aliases
                                .map(alias => ({
                                    display: alias,
                                    description: `Alias of ${c.trigger}.`,
                                    text: alias
                                })) : [])
                        ]).flat();

                    const chatUsersCategory = {
                        onlyStart: false,
                        token: "@",
                        items: []
                    };

                    const emotesCategory = {
                        onlyStart: false,
                        token: ":",
                        minQueryLength: 3,
                        items: []
                    };

                    const categories = [
                        {
                            onlyStart: true,
                            token: "!",
                            items: firebotCommandMenuItems
                        },
                        {
                            onlyStart: true,
                            token: "/",
                            items: [
                                {
                                    display: "/announce [message]",
                                    description: "チャンネルのブランドカラーでお知らせを送信",
                                    text: "/announce"
                                },
                                {
                                    display: "/announceblue [message]",
                                    description: "青色でお知らせを送信",
                                    text: "/announceblue"
                                },
                                {
                                    display: "/announcegreen [message]",
                                    description: "緑色でお知らせを送信",
                                    text: "/announcegreen"
                                },
                                {
                                    display: "/announceorange [message]",
                                    description: "オレンジ色でお知らせを送信",
                                    text: "/announceorange"
                                },
                                {
                                    display: "/announcepurple [message]",
                                    description: "紫色でお知らせを送信",
                                    text: "/announcepurple"
                                },
                                {
                                    display: "/ban @username",
                                    description: "ユーザーをBAN",
                                    text: "/ban"
                                },
                                {
                                    display: "/unban @username",
                                    description: "ユーザーのBANを解除",
                                    text: "/unban"
                                },
                                {
                                    display: "/clear",
                                    description: "チャット表示をクリア",
                                    text: "/clear"
                                },
                                {
                                    display: "/mod @username",
                                    description: "ユーザーをモデレーター化",
                                    text: "/mod"
                                },
                                {
                                    display: "/unmod @username",
                                    description: "ユーザーのモデレーターを解除",
                                    text: "/unmod"
                                },
                                {
                                    display: "/timeout @username [duration] [reason]",
                                    description: "ユーザーを一定時間チャット禁止",
                                    text: "/timeout"
                                },
                                {
                                    display: "/untimeout @username",
                                    description: "ユーザーのタイムアウトを解除",
                                    text: "/untimeout"
                                },
                                {
                                    display: "/vip @username",
                                    description: "ユーザーにVIPを付与",
                                    text: "/vip"
                                },
                                {
                                    display: "/unvip @username",
                                    description: "ユーザーのVIPを解除",
                                    text: "/unvip"
                                },
                                {
                                    display: "/followers [1m / 1h / 1d / 1w / 1mo]",
                                    description: "フォロー期間に応じてフォロワー限定にする",
                                    text: "/followers"
                                },
                                {
                                    display: "/followersoff",
                                    description: "フォロワー限定モードをオフ",
                                    text: "/followersoff"
                                },
                                {
                                    display: "/raid @username",
                                    description: "配信終了時に他チャンネルへレイド",
                                    text: "/raid"
                                },
                                {
                                    display: "/shoutout @username",
                                    description: "他チャンネルへシャウトアウト",
                                    text: "/shoutout"
                                },
                                {
                                    display: "/unraid",
                                    description: "進行中のレイドをキャンセル",
                                    text: "/unraid"
                                },
                                {
                                    display: "/subscribers",
                                    description: "サブスク限定モードにする",
                                    text: "/subscribers"
                                },
                                {
                                    display: "/subscribersoff",
                                    description: "サブスク限定モードをオフ",
                                    text: "/subscribersoff"
                                },
                                {
                                    display: "/slow [seconds]",
                                    description: "メッセージ送信間隔を制限",
                                    text: "/slow"
                                },
                                {
                                    display: "/slowoff",
                                    description: "スローモードをオフ",
                                    text: "/slowoff"
                                },
                                {
                                    display: "/emoteonly",
                                    description: "エモートのみモードにする",
                                    text: "/emoteonly"
                                },
                                {
                                    display: "/emoteonlyoff",
                                    description: "エモートのみモードをオフ",
                                    text: "/emoteonlyoff"
                                },
                                {
                                    display: "/uniquechat",
                                    description: "重複メッセージを制限",
                                    text: "/uniquechat"
                                },
                                {
                                    display: "/uniquechatoff",
                                    description: "ユニークチャットモードをオフ",
                                    text: "/uniquechatoff"
                                },
                                {
                                    display: "/commercial [30, 60, 90, 120, 150, 180]",
                                    description: "指定秒数の広告をチャンネルで実行",
                                    text: "/commercial"
                                }
                            ]
                        },
                        chatUsersCategory,
                        emotesCategory
                    ];

                    $scope.chatMessagesService = chatMessagesService;

                    function buildChatUserItems() {
                        return chatMessagesService.chatUsers.map(user => ({
                            display: user.username && user.username.toLowerCase() !== user.displayName.toLowerCase()
                                ? `${user.displayName} (${user.username})`
                                : user.displayName,
                            text: `@${user.username}`
                        }));
                    }

                    chatUsersCategory.items = buildChatUserItems();
                    $scope.$watchCollection("chatMessagesService.chatUsers", () => {
                        chatUsersCategory.items = buildChatUserItems();
                    });

                    function buildEmoteItems() {
                        const sender = chatMessagesService.chatSender === "Bot" ? "bot" : "streamer";
                        const emotes = [
                            ...chatMessagesService.filteredEmotes[sender],
                            ...chatMessagesService.filteredEmotes.thirdParty
                        ].map(emote => ({
                            display: emote.code,
                            text: emote.code,
                            url: emote.animatedUrl ?? emote.url,
                            origin: emote.origin
                        })).sort((e1, e2) => e1.display.toLowerCase().localeCompare(e2.display.toLowerCase()));
                        return emotes;
                    }

                    emotesCategory.items = buildEmoteItems();
                    $scope.$watchCollection("chatMessagesService.filteredEmotes", () => {
                        emotesCategory.items = buildEmoteItems();
                    });

                    $scope.$watch("chatMessagesService.chatSender", () => {
                        emotesCategory.items = buildEmoteItems();
                    });

                    function ensureMenuItemVisible() {
                        const autocompleteMenu = $(".chat-autocomplete-menu .completions");
                        const menuItem = autocompleteMenu.children()[$scope.selectedIndex];

                        menuItem.scrollIntoView({
                            block: "nearest"
                        });
                    }

                    let currentWord = {};

                    $scope.selectItem = (index) => {
                        $scope.modelValue = `${$scope.modelValue.substring(0, currentWord.index)
                                + $scope.menuItems[index].text
                                + $scope.modelValue.substring(currentWord.endIndex, $scope.modelValue.length)} `;
                        $scope.$apply();
                    };

                    $scope.selectedIndex = 0;
                    $(`#${$scope.inputId}`).bind("keydown", function (event) {
                        if (!$scope.menuOpen) {
                            return;
                        }

                        const key = event.key;
                        if (key === "ArrowUp" && $scope.selectedIndex > 0) {
                            $scope.selectedIndex -= 1;
                            $scope.$apply();
                            ensureMenuItemVisible();
                        } else if (key === "ArrowDown" && $scope.selectedIndex < $scope.menuItems.length - 1) {
                            $scope.selectedIndex += 1;
                            $scope.$apply();
                            ensureMenuItemVisible();
                        } else if (key === "Tab") {
                            $scope.selectItem($scope.selectedIndex);
                        }
                        if (key === "ArrowUp" || key === "ArrowDown" || key === "Tab") {
                            event.stopPropagation();
                            event.preventDefault();
                            event.stopImmediatePropagation();
                        }

                        if (key === "Escape") {
                            $scope.setMenuOpen(false);
                        }
                    });

                    $scope.menuOpen = false;
                    $scope.menuItems = [];

                    $scope.$watch("modelValue", debounce((value) => {
                        let matchingMenuItems = [];

                        if (value && value.length > 0) {
                            const cursorIndex = $(`#${$scope.inputId}`).prop("selectionStart");

                            currentWord = getWordByPosition(value, cursorIndex);

                            const token = currentWord.text[0];

                            categories.forEach((c) => {
                                if (token === c.token && (!c.onlyStart || currentWord.index === 0)) {
                                    const minQueryLength = c.minQueryLength || 0;
                                    if (currentWord.text.length >= minQueryLength) {
                                        const tokenAndWord = `${c.token}?${currentWord.text.replace(c.token, "")}`;
                                        const searchRegex = c.onlyStart === true
                                            ? new RegExp(`^${tokenAndWord}`, "i")
                                            : new RegExp(`${currentWord.text.replace(c.token, "")}`, "i");
                                        matchingMenuItems = c.items.filter(i => searchRegex.test(i.text) && i.text !== currentWord.text);
                                    }
                                }
                            });
                        }

                        if ($scope.menuItems.length > 0 || matchingMenuItems.length > 0) {
                            $scope.menuItems = matchingMenuItems;
                            $scope.selectedIndex = 0;
                            $scope.setMenuOpen(!!matchingMenuItems.length);
                            $scope.$apply();
                        }
                    }, 150));

                    $scope.toggleMenu = () => {
                        $scope.setMenuOpen(!$scope.menuOpen);
                    };

                    $scope.setMenuOpen = (value) => {
                        $scope.menuOpen = value;
                        if (!value) {
                            $timeout(() => {
                                $element.focus();
                            }, 10);
                        }
                    };
                },
                link: function(scope, element) {

                    const wrapper = angular.element(`
                        <div style="position: relative;width:100%;"></div>`
                    );
                    const compiled = $compile(wrapper)(scope);
                    element.wrap(compiled);

                    if (scope.menuPosition == null) {
                        scope.menuPosition = "above";
                    }

                    const menu = angular.element(`
                        <div class="chat-autocomplete-menu" ng-show="menuOpen" ng-class="menuPosition">
                            <div class="tip"><b>Tab</b> キーでハイライト中の候補を確定します</div>
                            <div class="completions">
                                <div ng-click="selectItem($index)" class="autocomplete-menu-item" ng-class="{ selected: selectedIndex == $index }" ng-repeat="item in menuItems track by item.text">
                                    <div class="item-image" ng-show="item.url != null">
                                        <img ng-src="{{item.url}}" />
                                    </div>
                                    <div style="width: 100%; display: flex; flex-direction: column; justify-content: center;">
                                        <div class="item-display">{{item.display}}</div>
                                        <div ng-show="item.description != null" class="item-description">{{item.description}}</div>
                                        <div ng-show="item.origin != null" class="item-description">{{item.origin}}</div>
                                    </div>
                                </div>
                            </div>
                        </div>`
                    );
                    $compile(menu)(scope);
                    menu.insertAfter(element);

                    function documentClick(event) {
                        if (
                            scope.menuOpen &&
                            !wrapper[0].contains(event.target) &&
                            !menu[0].contains(event.target)
                        ) {
                            scope.setMenuOpen(false);
                        }
                    }

                    $document.bind("mousedown", documentClick);

                    scope.$on("$destroy", function() {
                        $document.unbind("mousedown", documentClick);
                    });
                }
            };
        });
}());
