"use strict";
(function () {
    angular
        .module("firebotApp")
        .controller("commandsController", function (
            $scope,
            triggerSearchFilter,
            sortTagSearchFilter,
            commandsService,
            utilityService,
            listenerService,
            viewerRolesService,
            objectCopyHelper,
            sortTagsService,
            effectQueuesService
        ) {
            // Cache commands on app load.
            commandsService.refreshCommands();

            $scope.activeCmdTab = 0;

            $scope.commandsService = commandsService;
            $scope.sts = sortTagsService;

<<<<<<< HEAD
            function filterCommands() {
                return triggerSearchFilter(sortTagSearchFilter(commandsService.getCustomCommands(), sortTagsService.getSelectedSortTag("commands")), commandsService.customCommandSearch);
            }

            $scope.filteredCommands = filterCommands();

            $scope.getPermissionType = command => {

                const permissions = command.restrictionData && command.restrictionData.restrictions &&
                    command.restrictionData.restrictions.find(r => r.type === "firebot:permissions");

                if (permissions) {
                    if (permissions.mode === "roles") {
                        return "役割";
                    } else if (permissions.mode === "viewer") {
                        return "視聴者";
                    }
                } else {
                    return "なし";
                }
            };

            $scope.getPermissionTooltip = command => {

                const permissions = command.restrictionData && command.restrictionData.restrictions &&
                    command.restrictionData.restrictions.find(r => r.type === "firebot:permissions");

                if (permissions) {
                    if (permissions.mode === "roles") {
                        const roleIds = permissions.roleIds;
                        let output = "未選択";
                        if (roleIds.length > 0) {
                            output = roleIds
                                .filter(id => viewerRolesService.getRoleById(id) != null)
                                .map(id => viewerRolesService.getRoleById(id).name)
                                .join(", ");
                        }
                        return `役割 (${output})`;
                    } else if (permissions.mode === "viewer") {
                        return `視聴者 (${permissions.username ? permissions.username : '名無し'})`;
                    }
                } else {
                    return "このコマンドは誰でも利用できます";
                }
            };

            $scope.manuallyTriggerCommand = id => {
                listenerService.fireEvent(
                    listenerService.EventType.COMMAND_MANUAL_TRIGGER,
                    id
                );
            };

            $scope.toggleCustomCommandActiveState = command => {
=======
            $scope.manuallyTriggerCommand = (id) => {
                backendCommunicator.send("command-manual-trigger", id);
            };

            $scope.toggleCustomCommandActiveState = (command) => {
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
                if (command == null) {
                    return;
                }

                command.active = !command.active;
                commandsService.saveCustomCommand(command);
                commandsService.refreshCommands();
            };

            $scope.deleteCustomCommand = command => {
                utilityService.showConfirmationModal({
                    title: "コマンドの削除",
                    question: `コマンド「'${command.trigger}'」を削除しますか？`,
                    confirmLabel: "Delete",
                    confirmBtnType: "btn-danger"
                }).then(confirmed => {
                    if (confirmed) {
                        commandsService.deleteCustomCommand(command);
                        commandsService.refreshCommands();
                    }
                });
            };

            $scope.duplicateCustomCommand = command => {
                const copiedCommand = objectCopyHelper.copyObject("command", command);

                // Make sure fallback ID is correct
                if (copiedCommand.fallbackSubcommand?.id != null) {
                    copiedCommand.fallbackSubcommand.id = "fallback-subcommand";
                }

                while (commandsService.triggerExists(copiedCommand.trigger)) {
                    copiedCommand.trigger += "copy";
                }

                commandsService.saveCustomCommand(copiedCommand);
                commandsService.refreshCommands();
            };

            $scope.openAddOrEditCustomCommandModal = function (command) {
                utilityService.showModal({
                    component: "addOrEditCustomCommandModal",
                    resolveObj: {
                        command: () => command
                    },
                    closeCallback: resp => {
                        const action = resp.action,
                            command = resp.command;

                        switch (action) {
                            case "add":
                            case "update":
                                commandsService.saveCustomCommand(command);
                                break;
                            case "delete":
                                commandsService.deleteCustomCommand(command);
                                break;
                        }

                        // Refresh Commands
                        commandsService.refreshCommands();
                    }
                });
            };

            $scope.sortableOptions = {
                handle: ".dragHandle",
                'ui-preserve-size': true,
                stop: (e, ui) => {
                    console.log(e, ui);
                    if (sortTagsService.getSelectedSortTag("commands") != null &&
                        (commandsService.customCommandSearch == null ||
                            commandsService.customCommandSearch.length < 1)) {
                        return;
                    }

                    commandsService.saveAllCustomCommands(commandsService.commandsCache.customCommands);
                }
            };

            $scope.addToEffectQueue = (command, queueId) => {
                if (command == null) {
                    return;
                }

                if (command.effects) {
                    command.effects.queue = queueId;
                }

                commandsService.saveCustomCommand(command);
                commandsService.refreshCommands();
            };

            $scope.clearEffectQueue = (command) => {
                command.effects.queue = null;
            };

<<<<<<< HEAD
            $scope.getEffectQueueMenuOptions = (command) => {
                const queues = effectQueuesService.getEffectQueues();
                if (command.effects != null && queues != null && queues.length > 0) {
                    const children = queues.map(q => {
                        const isSelected = command.effects.queue && command.effects.queue === q.id;
                        return {
                            html: `<a href><i class="${isSelected ? 'fas fa-check' : ''}" style="margin-right: ${isSelected ? '10' : '27'}px;"></i> ${q.name}</a>`,
                            click: () => {
                                $scope.addToEffectQueue(command, q.id);
                            }
                        };
                    });

                    const hasEffectQueue = command.effects.queue != null && command.effects.queue !== "";
                    children.push({
                        html: `<a href><i class="${!hasEffectQueue ? 'fas fa-check' : ''}" style="margin-right: ${!hasEffectQueue ? '10' : '27'}px;"></i> なし</a>`,
                        click: () => {
                            $scope.clearEffectQueue(command);
                        },
                        hasTopDivider: true
                    });

                    return children;
                }
=======
            $scope.resetAllPerStreamCommandUsages = () => {
                commandsService.resetAllPerStreamCommandUsages();
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
            };

            $scope.commandMenuOptions = (command) => {
                const options = [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 編集</a>`,
<<<<<<< HEAD
                        click: ($itemScope) => {
                            const command = $itemScope.command;
=======
                        click: () => {
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
                            $scope.openAddOrEditCustomCommandModal(command);
                        }
                    },
                    {
<<<<<<< HEAD
                        html: `<a href ><i class="far fa-toggle-off" style="margin-right: 10px;"></i> 有効化の切り替え</a>`,
                        click: ($itemScope) => {
                            const command = $itemScope.command;
=======
                        html: `<a href ><i class="iconify" data-icon="mdi:clock-fast" style="margin-right: 10px;"></i> 再実行待ちを解除</a>`,
                        click: () => {
                            $scope.resetCooldownsForCommand(command);
                        }
                    },
                    {
                        html: `<a href ><i class="iconify" data-icon="mdi:tally-mark-5" style="margin-right: 10px;"></i> 使用量をクリア</a>`,
                        click: () => {
                            $scope.resetPerStreamUsagesForCommand(command);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-toggle-off" style="margin-right: 10px;"></i> ${item.active ? "無効にする" : "有効にする"}</a>`,
                        click: () => {
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
                            $scope.toggleCustomCommandActiveState(command);
                        }
                    },
                    {
<<<<<<< HEAD
                        html: `<a href ><i class="far fa-clone" style="margin-right: 10px;"></i> 複製</a>`,
                        click: ($itemScope) => {
                            const command = $itemScope.command;
=======
                        html: `<a href ><i class="${item.hidden ? "fas fa-eye" : "fas fa-eye-slash"}" style="margin-right: 10px;"></i> ${item.hidden ? "コマンドを表示" : "コマンドを隠す"}</a>`,
                        click: () => {
                            $scope.toggleCustomCommandVisibilityState(command);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-clone" style="margin-right: 10px;"></i> 複製</a>`,
                        click: () => {
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
                            $scope.duplicateCustomCommand(command);
                        }
                    },
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
<<<<<<< HEAD
                        click: ($itemScope) => {
                            const command = $itemScope.command;
                            $scope.deleteCustomCommand(command);
                        }
                    },
                    {
                        text: `キュー...`,
                        children: $scope.getEffectQueueMenuOptions(command),
                        hasTopDivider: true
=======
                        click: () => {
                            $scope.deleteCustomCommand(command);
                        }
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
                    }
                ];

                return options;
            };
<<<<<<< HEAD
=======

            $scope.customCommandHeaders = [
                {
                    name: "トリガー",
                    icon: "fa-exclamation",
                    dataField: "trigger",
                    sortable: true,
                    cellClass: "command-trigger-cell",
                    cellTemplate: `
                        <span
                            class="trigger"
                            uib-tooltip="{{data.trigger}}"
                            tooltip-popup-delay="500"
                            tooltip-append-to-body="true"
                        >{{data.trigger}}</span>
                        <tooltip
                            ng-if="data.triggerIsRegex"
                            text="'概要: ' + data.regexDescription"
                        ></tooltip>
                        <span
                            class="muted ml-2"
                            style="font-size: 11px"
                            ng-show="data.hidden"
                            uib-tooltip="!commands リストに表示しない"
                            tooltip-append-to-body="true"
                        >
                            <i class="fas fa-eye-slash"></i>
                        </span>
                    `,
                    cellController: () => { }
                },
                {
                    name: "再実行時間",
                    icon: "fa-clock",
                    cellTemplate: `
                        <span
                            style="min-width: 51px; display: inline-block"
                            uib-tooltip="再実行待ち時間（全体）"
                        >
                            <i class="far fa-globe-americas"></i>
                            {{data.cooldown.global ? data.cooldown.global + "秒" : "-" }}
                        </span>
                        <span uib-tooltip="再実行待ち時間（ユーザ）">
                            <i class="far fa-user"></i> {{data.cooldown.user ? data.cooldown.user + "秒" : "-" }}
                        </span>
                    `,
                    cellController: () => { }
                },
                {
                    name: "権限",
                    icon: "lock-alt",
                    cellTemplate: `
                        <span style="text-transform: capitalize">{{getPermissionType(data)}}</span>
                        <tooltip
                            type="info"
                            text="getPermissionTooltip(data)"
                        ></tooltip>
                    `,
                    cellController: ($scope, viewerRolesService, viewerRanksService) => {
                        $scope.getPermissionType = (command) => {

                            const permissions = command.restrictionData && command.restrictionData.restrictions &&
                                command.restrictionData.restrictions.find(r => r.type === "firebot:permissions");

                            if (permissions) {
                                if (permissions.mode === "roles") {
                                    return "Roles & Ranks";
                                } else if (permissions.mode === "viewer") {
                                    return "Viewer";
                                }
                            } else {
                                return "None";
                            }
                        };

                        $scope.getPermissionTooltip = (command) => {

                            const permissions = command.restrictionData && command.restrictionData.restrictions &&
                                command.restrictionData.restrictions.find(r => r.type === "firebot:permissions");

                            if (permissions) {
                                if (permissions.mode === "roles") {
                                    const roleIds = permissions.roleIds;
                                    let rolesOutput = "未選択";
                                    if (roleIds.length > 0) {
                                        rolesOutput = roleIds
                                            .filter(id => viewerRolesService.getRoleById(id) != null)
                                            .map(id => viewerRolesService.getRoleById(id).name)
                                            .join(", ");
                                    }
                                    const rolesDisplay = `Roles (${rolesOutput})`;

                                    const ranks = permissions.ranks ?? [];
                                    let ranksOutput = "未選択";
                                    if (ranks.length > 0) {
                                        const groupedByLadder = ranks.reduce((acc, r) => {
                                            if (!acc.some(l => l.ladderId === r.ladderId)) {
                                                acc.push({ ladderId: r.ladderId, rankIds: [] });
                                            }
                                            const ladder = acc.find(l => l.ladderId === r.ladderId);
                                            ladder.rankIds.push(r.rankId);
                                            return acc;
                                        }, []);
                                        ranksOutput = groupedByLadder
                                            .filter(r => viewerRanksService.getRankLadder(r.ladderId) != null)
                                            .map((r) => {
                                                const ladder = viewerRanksService.getRankLadder(r.ladderId);
                                                const rankNames = r.rankIds
                                                    .map(id => ladder.ranks.find(rank => rank.id === id))
                                                    .filter(rank => rank != null)
                                                    .map(rank => rank.name);
                                                return `${ladder.name}: ${rankNames.join(", ")}`;
                                            })
                                            .join(", ");
                                    }
                                    const ranksDisplay = `Ranks (${ranksOutput})`;

                                    const itemsToDisplay = [];
                                    if (rolesOutput !== "未選択") {
                                        itemsToDisplay.push(rolesDisplay);
                                    }
                                    if (ranksOutput !== "未選択") {
                                        itemsToDisplay.push(ranksDisplay);
                                    }
                                    return itemsToDisplay.length > 0 ? itemsToDisplay.join(", ") : "役割/ランク (未選択)";
                                } else if (permissions.mode === "viewer") {
                                    return `Viewer (${permissions.username ? permissions.username : 'No name'})`;
                                }
                            } else {
                                return "このコマンドは誰でも利用できます";
                            }
                        };
                    }
                }
            ];
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        });
}());
