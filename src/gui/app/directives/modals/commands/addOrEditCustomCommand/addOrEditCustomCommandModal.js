"use strict";

// Modal for adding or editing a command

(function () {
    const { randomUUID } = require("crypto");

    angular.module("firebotApp").component("addOrEditCustomCommandModal", {
        templateUrl:
            "./directives/modals/commands/addOrEditCustomCommand/addOrEditCustomCommandModal.html",
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function ($scope, utilityService, commandsService, ngToast, settingsService) {
            const $ctrl = this;

            $ctrl.command = {
                active: true,
                simple: !settingsService.getSetting("DefaultToAdvancedCommandMode"),
                sendCooldownMessage: true,
                cooldownMessage: "このコマンドはまだクールダウン中です: {timeLeft}",
                cooldown: {},
                effects: {
                    id: randomUUID(),
                    list: []
                },
                restrictionData: {
                    restrictions: [],
                    mode: "all",
                    sendFailMessage: true
                },
                aliases: [],
                sortTags: [],
                treatQuotedTextAsSingleArg: false,
                allowTriggerBySharedChat: "inherit"
            };

            $ctrl.sharedChatRadioOptions = {
                true: "許可",
                false: "無視",
                inherit: { text: "継承", tooltip: "設定 > トリガー > 共有チャットでコマンド実行を許可 の設定を継承します" }
            };

            $scope.trigger = "command";

            $scope.aliasesListOptions = {
                useTextArea: false,
                addLabel: "新しいエイリアス",
                editLabel: "エイリアスを編集",
                validationText: "エイリアスは空にできません",
                noDuplicates: true
            };

            $ctrl.switchCommandMode = () => {
                const currentlyAdvanced = !$ctrl.command.simple;
                if (currentlyAdvanced) {
                    const willBeRemoved = [];
                    if ($ctrl.command.effects.list.length > 1 ||
                        $ctrl.command.effects.list.some(e => e.type !== "firebot:chat")) {
                        willBeRemoved.push("チャットエフェクトを1つ残し、それ以外のエフェクト");
                    }
                    if ($ctrl.command.restrictionData.restrictions.length > 1 ||
                        $ctrl.command.restrictionData.restrictions.some(r => r.type !== "firebot:permissions")) {
                        willBeRemoved.push("権限以外の制限");
                    }
                    if ($ctrl.command.fallbackSubcommand != null ||
                        ($ctrl.command.subCommands && $ctrl.command.subCommands.length > 0)) {
                        willBeRemoved.push("すべてのサブコマンド");
                    }
                    if (willBeRemoved.length > 0) {
                        utilityService.showConfirmationModal({
                            title: "シンプルモードに切り替え",
                            question: `シンプルモードへ切り替えると、${willBeRemoved.join("、")}が削除されます。切り替えますか？`,
                            confirmLabel: "切り替える",
                            confirmBtnType: "btn-danger"
                        }).then((confirmed) => {
                            if (confirmed) {
                                $ctrl.command.simple = !$ctrl.command.simple;
                                $ctrl.command.subCommands = [];
                                $ctrl.command.fallbackSubcommand = null;
                            }
                        });
                    } else {
                        $ctrl.command.simple = !$ctrl.command.simple;
                    }

                } else {
                    // remove the chat message if the user didnt input anything
                    const responseMessage = $ctrl.command.effects.list[0] && $ctrl.command.effects.list[0].message && $ctrl.command.effects.list[0].message.trim();
                    if (!responseMessage || responseMessage === "") {
                        $ctrl.command.effects.list = [];
                    }
                    $ctrl.command.simple = !$ctrl.command.simple;

                    if ($ctrl.isNewCommand &&
                        !settingsService.getSetting("DefaultToAdvancedCommandMode") &&
                        !settingsService.getSetting("SeenAdvancedCommandModePopup")) {
                        settingsService.saveSetting("SeenAdvancedCommandModePopup", true);
                        utilityService.showConfirmationModal({
                            title: "デフォルトモード",
                            question: `新しいコマンドで常に詳細モードを使用しますか？`,
                            tip: "補足: この設定は 設定 > トリガー でいつでも変更できます",
                            confirmLabel: "はい",
                            confirmBtnType: "btn-default",
                            cancelLabel: "今はしない",
                            cancelBtnType: "btn-default"
                        }).then((confirmed) => {
                            if (confirmed) {
                                settingsService.saveSetting("DefaultToAdvancedCommandMode", true);
                                ngToast.create({
                                    className: 'success',
                                    content: "新しいコマンドのデフォルトを詳細モードにしました。",
                                    timeout: 7000
                                });
                            }
                        });
                    }
                }
            };

            $ctrl.$onInit = function () {
                $ctrl.activeTab = 'general';

                if ($ctrl.resolve.command == null) {
                    $ctrl.isNewCommand = true;
                } else {
                    $ctrl.command = JSON.parse(JSON.stringify($ctrl.resolve.command));
                    if ($ctrl.command.simple == null) {
                        $ctrl.command.simple = false;
                    }
                }

                if ($ctrl.command.sendCooldownMessage == null) {
                    $ctrl.command.sendCooldownMessage = true;
                }

                if ($ctrl.command.sendCooldownMessageAsReply == null) {
                    $ctrl.command.sendCooldownMessageAsReply = true;
                }

                if ($ctrl.command.cooldownMessage == null) {
                    $ctrl.command.cooldownMessage = "このコマンドはまだクールダウン中です: {timeLeft}";
                }

                if ($ctrl.command.aliases == null) {
                    $ctrl.command.aliases = [];
                }

                if ($ctrl.command.treatQuotedTextAsSingleArg == null) {
                    $ctrl.command.treatQuotedTextAsSingleArg = false;
                }

                if ($ctrl.command.allowTriggerBySharedChat == null) {
                    $ctrl.command.allowTriggerBySharedChat = "inherit";
                }
                $ctrl.command.allowTriggerBySharedChat = String($ctrl.command.allowTriggerBySharedChat);
            };

            $ctrl.effectListUpdated = function (effects) {
                $ctrl.command.effects = effects;
            };

            $ctrl.deleteSubcommand = (id) => {
                let name = "フォールバック";

                if (id !== "fallback-subcommand") {
                    const subCmd = $ctrl.command.subCommands.find(c => c.id === id);

                    switch (subCmd.type) {
                        case "Username":
                            name = "ユーザー名";
                            break;

                        case "Number":
                            name = "数値";
                            break;

                        case "Custom":
                            name = `"${subCmd.arg}"`;
                            break;
                    }
                }

                utilityService.showConfirmationModal({
                    title: "サブコマンドを削除",
                    question: `${name} サブコマンドを削除してもよろしいですか？`,
                    confirmLabel: "削除",
                    confirmBtnType: "btn-danger"
                }).then((confirmed) => {
                    if (confirmed) {
                        if (id === "fallback-subcommand") {
                            $ctrl.command.fallbackSubcommand = null;
                        } else if ($ctrl.command.subCommands) {
                            $ctrl.command.subCommands = $ctrl.command.subCommands.filter(sc => sc.id !== id);
                        }
                    }
                });
            };

            $ctrl.editSubcommand = (id) => {
                let subcommand;
                if (id === "fallback-subcommand") {
                    subcommand = $ctrl.command.fallbackSubcommand;
                } else if ($ctrl.command.subCommands) {
                    subcommand = $ctrl.command.subCommands.find(sc => sc.id === id);
                }
                if (subcommand) {
                    $ctrl.openAddSubcommandModal(subcommand);
                }
            };

            $ctrl.openAddSubcommandModal = (arg) => {
                utilityService.showModal({
                    component: "addOrEditSubcommandModal",
                    size: "sm",
                    resolveObj: {
                        arg: () => arg,
                        hasAnyArgs: () => !!$ctrl.command.subCommands?.length,
                        hasNumberArg: () => $ctrl.command.subCommands && $ctrl.command.subCommands.some(sc => sc.arg === "\\d+"),
                        hasUsernameArg: () => $ctrl.command.subCommands && $ctrl.command.subCommands.some(sc => sc.arg === "@\\w+"),
                        hasFallbackArg: () => $ctrl.command.fallbackSubcommand != null,
                        otherArgNames: () => $ctrl.command.subCommands && $ctrl.command.subCommands.filter(c => !c.regex && (arg ? c.arg !== arg.arg : true)).map(c => c.arg.toLowerCase()) || [],
                        parentTrigger: () => $ctrl.command.trigger
                    },
                    closeCallback: (newArg) => {
                        if (newArg.fallback) {
                            $ctrl.command.fallbackSubcommand = newArg;
                        } else {
                            if ($ctrl.command.subCommands == null) {
                                $ctrl.command.subCommands = [newArg];
                            } else {
                                $ctrl.command.subCommands = $ctrl.command.subCommands.filter(sc => sc.id !== newArg.id);
                                $ctrl.command.subCommands.push(newArg);
                            }
                        }
                    }
                });
            };

            $ctrl.delete = function () {
                if ($ctrl.isNewCommand) {
                    return;
                }
                utilityService.showConfirmationModal({
                    title: "コマンドを削除",
                    question: `このコマンドを削除してもよろしいですか？`,
                    confirmLabel: "削除",
                    confirmBtnType: "btn-danger"
                }).then((confirmed) => {
                    if (confirmed) {
                        $ctrl.close({ $value: { command: $ctrl.command, action: "delete" } });
                    }
                });
            };

            $ctrl.save = function () {
                if ($ctrl.command.trigger == null || $ctrl.command.trigger === "") {
                    ngToast.create("トリガーを入力してください。");
                    return;
                }

                if ($ctrl.command.simple) {
                    const responseMessage = $ctrl.command.effects.list[0] && $ctrl.command.effects.list[0].message && $ctrl.command.effects.list[0].message.trim();
                    if (!responseMessage || responseMessage === "") {
                        ngToast.create("返信メッセージを入力してください。");
                        return;
                    }
                }

                if (commandsService.triggerExists($ctrl.command.trigger, $ctrl.command.id)) {
                    ngToast.create("このトリガーを使ったカスタムコマンドは既に存在します。");
                    return;
                }

                if ($ctrl.command.allowTriggerBySharedChat === "true") {
                    $ctrl.command.allowTriggerBySharedChat = true;
                } else if ($ctrl.command.allowTriggerBySharedChat === "false") {
                    $ctrl.command.allowTriggerBySharedChat = false;
                }

                const action = $ctrl.isNewCommand ? "add" : "update";
                $ctrl.close({
                    $value: {
                        command: $ctrl.command,
                        action: action
                    }
                });
            };
        }
    });
}());
