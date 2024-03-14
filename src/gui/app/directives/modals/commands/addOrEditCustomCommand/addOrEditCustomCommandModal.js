"use strict";

// Modal for adding or editing a command

(function() {
    const uuid = require("uuid/v4");

    angular.module("firebotApp").component("addOrEditCustomCommandModal", {
        templateUrl:
      "./directives/modals/commands/addOrEditCustomCommand/addOrEditCustomCommandModal.html",
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function($scope, utilityService, commandsService, ngToast, settingsService) {
            const $ctrl = this;

            $ctrl.command = {
                active: true,
                simple: !settingsService.getDefaultToAdvancedCommandMode(),
                sendCooldownMessage: true,
                cooldownMessage: "再実行可能になるまでの待ち時間: 残り {timeLeft} 秒",
                cooldown: {},
                effects: {
                    id: uuid(),
                    list: []
                },
                restrictionData: {
                    restrictions: [],
                    mode: "all",
                    sendFailMessage: true
                },
                aliases: [],
                sortTags: [],
                treatQuotedTextAsSingleArg: false
            };

            $scope.trigger = "command";

            $scope.aliasesListOptions = {
                useTextArea: false,
                addLabel: "新規",
                editLabel: "編集",
                validationText: "空欄は許容できません",
                noDuplicates: true
            };

            $ctrl.switchCommandMode = () => {
                const currentlyAdvanced = !$ctrl.command.simple;
                if (currentlyAdvanced) {
                    const willBeRemoved = [];
                    if ($ctrl.command.effects.list.length > 1 ||
                            $ctrl.command.effects.list.some(e => e.type !== "firebot:chat")) {
                        willBeRemoved.push("単一のチャット演出を除く、すべての演出");
                    }
                    if ($ctrl.command.restrictionData.restrictions.length > 1 ||
                        $ctrl.command.restrictionData.restrictions.some(r => r.type !== "firebot:permissions")) {
                        willBeRemoved.push("許可されたもの以外のすべて制限");
                    }
                    if ($ctrl.command.fallbackSubcommand != null ||
                        ($ctrl.command.subCommands && $ctrl.command.subCommands.length > 0)) {
                        willBeRemoved.push("すべてのサブコマンド");
                    }
                    if (willBeRemoved.length > 0) {
                        utilityService.showConfirmationModal({
                            title: "簡単モードに戻す",
                            question: `簡単モードに切り替えると ${willBeRemoved.join(", ")} が消えます。切り替えますか？`,
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
                        !settingsService.getDefaultToAdvancedCommandMode() &&
                        !settingsService.getSeenAdvancedCommandModePopup()) {
                        settingsService.setSeenAdvancedCommandModePopup(true);
                        utilityService.showConfirmationModal({
                            title: "最初の状態",
                            question: `応用モードを使う様にしますか？`,
                            tip: "この決定は、いつでも 設定 > コマンド で戻せます",
                            confirmLabel: "はい",
                            confirmBtnType: "btn-default",
                            cancelLabel: "やめる",
                            cancelBtnType: "btn-default"
                        }).then((confirmed) => {
                            if (confirmed) {
                                settingsService.setDefaultToAdvancedCommandMode(true);
                                ngToast.create({
                                    className: 'success',
                                    content: "最初の状態を応用モードにしました",
                                    timeout: 7000
                                });
                            }
                        });
                    }
                }
            };

            $ctrl.$onInit = function() {
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

                if ($ctrl.command.cooldownMessage == null) {
                    $ctrl.command.cooldownMessage = "再実行可能になるまでの待ち時間: 残り {timeLeft} 秒";
                }

                if ($ctrl.command.aliases == null) {
                    $ctrl.command.aliases = [];
                }

                if ($ctrl.command.treatQuotedTextAsSingleArg == null) {
                    $ctrl.command.treatQuotedTextAsSingleArg = false;
                }

                const modalId = $ctrl.resolve.modalId;
                utilityService.addSlidingModal(
                    $ctrl.modalInstance.rendered.then(() => {
                        const modalElement = $(`.${modalId}`).children();
                        return {
                            element: modalElement,
                            name: "編集",
                            id: modalId,
                            instance: $ctrl.modalInstance
                        };
                    })
                );

                $scope.$on("modal.closing", function() {
                    utilityService.removeSlidingModal();
                });
            };

            $ctrl.effectListUpdated = function(effects) {
                $ctrl.command.effects = effects;
            };

            $ctrl.deleteSubcommand = (id) => {
                let name = "fallback";

                if (id !== "fallback-subcommand") {
                    const subCmd = $ctrl.command.subCommands.find(c => c.id === id);

                    switch (subCmd.type) {
                        case "Username":
                            name = "username";
                            break;

                        case "Number":
                            name = "number";
                            break;

                        case "Custom":
                            name = `"${subCmd.arg}"`;
                            break;
                    }
                }

                utilityService.showConfirmationModal({
                    title: "削除",
                    question: `本当にこのコマンドを削除しますか?`,
                    confirmLabel: "削除する",
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
                        otherArgNames: () => $ctrl.command.subCommands && $ctrl.command.subCommands.filter(c => !c.regex && (arg ? c.arg !== arg.arg : true)).map(c => c.arg.toLowerCase()) || []
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

            $ctrl.delete = function() {
                if ($ctrl.isNewCommand) {
                    return;
                }
                utilityService.showConfirmationModal({
                    title: "削除",
                    question: `本当にこのコマンドを削除しますか？`,
                    confirmLabel: "削除",
                    confirmBtnType: "btn-danger"
                }).then((confirmed) => {
                    if (confirmed) {
                        $ctrl.close({ $value: { command: $ctrl.command, action: "delete" } });
                    }
                });
            };

            $ctrl.save = function() {
                if ($ctrl.command.trigger == null || $ctrl.command.trigger === "") {
                    ngToast.create("起動をセットしてください.");
                    return;
                }

                if ($ctrl.command.simple) {
                    const responseMessage = $ctrl.command.effects.list[0] && $ctrl.command.effects.list[0].message && $ctrl.command.effects.list[0].message.trim();
                    if (!responseMessage || responseMessage === "") {
                        ngToast.create("メッセージを送信してください");
                        return;
                    }
                }

                if (commandsService.triggerExists($ctrl.command.trigger, $ctrl.command.id)) {
                    ngToast.create("この起動コマンドはすでに存在します");
                    return;
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
