"use strict";
(function() {
    angular
        .module("firebotApp")
        .controller("commandsController", function(
            $scope,
            $rootScope,
            commandsService,
            utilityService,
            backendCommunicator,
            objectCopyHelper,
            sortTagsService,
            ngToast
        ) {
            // Cache commands on app load.
            commandsService.refreshCommands();

            $scope.commandsService = commandsService;
            $scope.sts = sortTagsService;

            $scope.manuallyTriggerCommand = (id) => {
                backendCommunicator.send("command-manual-trigger", id);
            };

            $scope.toggleCustomCommandActiveState = (command) => {
                if (command == null) {
                    return;
                }

                command.active = !command.active;
                commandsService.saveCustomCommand(command);
            };

            $scope.toggleCustomCommandVisibilityState = (command) => {
                if (command == null) {
                    return;
                }

                command.hidden = !command.hidden;
                commandsService.saveCustomCommand(command);
            };

            $scope.deleteCustomCommand = (command) => {
                utilityService.showConfirmationModal({
                    title: "コマンドを削除",
                    question: `コマンド '${command.trigger}' を削除してもよろしいですか？`,
                    confirmLabel: "削除",
                    confirmBtnType: "btn-danger"
                }).then((confirmed) => {
                    if (confirmed) {
                        commandsService.deleteCustomCommand(command);
                    }
                });
            };

            $scope.duplicateCustomCommand = (command) => {
                const copiedCommand = objectCopyHelper.copyObject("command", command);

                // Make sure fallback ID is correct
                if (copiedCommand.fallbackSubcommand?.id != null) {
                    copiedCommand.fallbackSubcommand.id = "fallback-subcommand";
                }

                while (commandsService.triggerExists(copiedCommand.trigger)) {
                    copiedCommand.trigger += "copy";
                }

                commandsService.saveCustomCommand(copiedCommand);
            };

            $scope.openAddOrEditCustomCommandModal = function(command) {
                utilityService.showModal({
                    component: "addOrEditCustomCommandModal",
                    breadcrumbName: command ? "コマンドを編集" : "コマンドを追加",
                    size: "mdlg",
                    resolveObj: {
                        command: () => command
                    },
                    closeCallback: (resp) => {
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
                    }
                });
            };

            $scope.openFirebotProfilePage = async () => {
                ngToast.create({
                    className: "info",
                    content: "Firebot のプロフィールページを開いています..."
                });
                const channelName = await backendCommunicator.fireEventAsync("sync-profile-data-to-crowbar-api");
                if (channelName) {
                    $rootScope.openLinkExternally(`https://firebot.app/profile/${channelName}`);
                }
            };

            $scope.resetActiveCooldowns = () => {
                commandsService.resetActiveCooldowns();
            };

            $scope.resetCooldownsForCommand = (command) => {
                commandsService.resetCooldownsForCommand(command.id);
            };

            $scope.resetAllPerStreamCommandUsages = () => {
                commandsService.resetAllPerStreamCommandUsages();
            };

            $scope.resetPerStreamUsagesForCommand = (command) => {
                commandsService.resetPerStreamUsagesForCommand(command.id);
            };

            $scope.saveCustomCommand = (command) => {
                commandsService.saveCustomCommand(command);
            };

            $scope.saveAllCommands = (commands) => {
                commandsService.saveAllCustomCommands(commands ?? commandsService.commandsCache.customCommands);
            };

            $scope.commandMenuOptions = (item) => {
                const command = item;
                return [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 編集</a>`,
                        click: () => {
                            $scope.openAddOrEditCustomCommandModal(command);
                        }
                    },
                    {
                        html: `<a href ><i class="iconify" data-icon="mdi:clock-fast" style="margin-right: 10px;"></i> クールダウンをクリア</a>`,
                        click: () => {
                            $scope.resetCooldownsForCommand(command);
                        }
                    },
                    {
                        html: `<a href ><i class="iconify" data-icon="mdi:tally-mark-5" style="margin-right: 10px;"></i> 配信ごとの使用回数をクリア</a>`,
                        click: () => {
                            $scope.resetPerStreamUsagesForCommand(command);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-toggle-off" style="margin-right: 10px;"></i> ${item.active ? "コマンドを無効化" : "コマンドを有効化"}</a>`,
                        click: () => {
                            $scope.toggleCustomCommandActiveState(command);
                        }
                    },
                    {
                        html: `<a href ><i class="${item.hidden ? "fas fa-eye" : "fas fa-eye-slash"}" style="margin-right: 10px;"></i> ${item.hidden ? "コマンドを表示" : "コマンドを非表示"}</a>`,
                        click: () => {
                            $scope.toggleCustomCommandVisibilityState(command);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-clone" style="margin-right: 10px;"></i> 複製</a>`,
                        click: () => {
                            $scope.duplicateCustomCommand(command);
                        }
                    },
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                        click: () => {
                            $scope.deleteCustomCommand(command);
                        }
                    }
                ];
            };

            $scope.customCommandHeaders = [
                {
                    name: "TRIGGER",
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
                            text="'説明: ' + data.regexDescription"
                        ></tooltip>
                        <span
                            class="muted ml-2"
                            style="font-size: 11px"
                            ng-if="data.hidden"
                            uib-tooltip="!commands 一覧で非表示"
                            tooltip-append-to-body="true"
                        >
                            <i class="fas fa-eye-slash"></i>
                        </span>
                    `
                },
                {
                    name: "COOLDOWNS",
                    icon: "fa-clock",
                    cellTemplate: `
                        <span
                            style="min-width: 51px; display: inline-block"
                            uib-tooltip="グローバルクールダウン"
                        >
                            <i class="far fa-globe-americas"></i>
                            {{data.cooldown.global ? data.cooldown.global + "s" : "-" }}
                        </span>
                        <span uib-tooltip="ユーザークールダウン">
                            <i class="far fa-user"></i> {{data.cooldown.user ? data.cooldown.user + "s" : "-" }}
                        </span>
                    `
                },
                {
                    name: "PERMISSIONS",
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
                                    return "ロールとランク";
                                } else if (permissions.mode === "viewer") {
                                    return "視聴者";
                                }
                            } else {
                                return "なし";
                            }
                        };

                        $scope.getPermissionTooltip = (command) => {

                            const permissions = command.restrictionData && command.restrictionData.restrictions &&
                    command.restrictionData.restrictions.find(r => r.type === "firebot:permissions");

                            if (permissions) {
                                const isInverted = permissions.invertCondition === true;
                                if (permissions.mode === "roles") {
                                    const roleIds = permissions.roleIds;
                                    let rolesOutput = "未選択";
                                    if (roleIds.length > 0) {
                                        rolesOutput = roleIds
                                            .filter(id => viewerRolesService.getRoleById(id) != null)
                                            .map(id => viewerRolesService.getRoleById(id).name)
                                            .join(", ");
                                    }
                                    const rolesDisplay = `ロール (${rolesOutput})`;

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
                                    const ranksDisplay = `ランク (${ranksOutput})`;

                                    const itemsToDisplay = [];
                                    if (rolesOutput !== "未選択") {
                                        itemsToDisplay.push(rolesDisplay);
                                    }
                                    if (ranksOutput !== "未選択") {
                                        itemsToDisplay.push(ranksDisplay);
                                    }
                                    return itemsToDisplay.length > 0 ? (isInverted ? "除外: " : "") + itemsToDisplay.join(", ") : "ロール/ランク（未選択）";
                                } else if (permissions.mode === "viewer") {
                                    return `${isInverted ? "除外: " : ""}視聴者 (${permissions.username ? permissions.username : '名前なし'})`;
                                }
                            } else {
                                return "このコマンドは全員が利用できます";
                            }
                        };
                    }
                }
            ];
        });
}());