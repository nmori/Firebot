"use strict";
(function() {
    angular
        .module("firebotApp")
        .controller("commandsController", function(
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

            $scope.openAddOrEditCustomCommandModal = function(command) {
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
            };

            $scope.commandMenuOptions = (command) => {
                const options = [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 編集</a>`,
                        click: ($itemScope) => {
                            const command = $itemScope.command;
                            $scope.openAddOrEditCustomCommandModal(command);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-toggle-off" style="margin-right: 10px;"></i> 有効化の切り替え</a>`,
                        click: ($itemScope) => {
                            const command = $itemScope.command;
                            $scope.toggleCustomCommandActiveState(command);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-clone" style="margin-right: 10px;"></i> 複製</a>`,
                        click: ($itemScope) => {
                            const command = $itemScope.command;
                            $scope.duplicateCustomCommand(command);
                        }
                    },
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                        click: ($itemScope) => {
                            const command = $itemScope.command;
                            $scope.deleteCustomCommand(command);
                        }
                    },
                    {
                        text: `キュー...`,
                        children: $scope.getEffectQueueMenuOptions(command),
                        hasTopDivider: true
                    }
                ];

                return options;
            };
        });
}());
