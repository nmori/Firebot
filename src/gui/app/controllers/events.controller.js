"use strict";
(function() {

    // This handles the Events tab
    angular
        .module("firebotApp")
        .controller("eventsController", function($scope, eventsService, utilityService,
            listenerService, objectCopyHelper) {

            $scope.es = eventsService;

            const sources = listenerService.fireEventSync("getAllEventSources");

            function friendlyEventTypeName(sourceId, eventId) {
                const source = sources.find(s => s.id === sourceId);
                if (source != null) {
                    const event = source.events.find(e => e.id === eventId);
                    if (event != null) {
                        return `${event.name} (${source.name})`;
                    }
                }
                return null;
            }

            $scope.tableConfig = [
                {
                    name: "名前",
                    icon: "fa-tag",
                    headerStyles: {
                        'min-width': '150px'
                    },
                    cellTemplate: `{{data.name}}`,
                    cellController: () => {}
                },
                {
                    name: "種類",
                    icon: "fa-exclamation-square",
                    headerStyles: {
                        'min-width': '100px'
                    },
                    cellTemplate: `{{data.eventId && data.sourceId ?
                        friendlyEventTypeName(data.sourceId, data.eventId) : "なし"}}`,
                    cellController: ($scope) => {
                        $scope.friendlyEventTypeName = friendlyEventTypeName;
                    }
                }
            ];

            $scope.getSelectedEvents = function() {
                const selectedTab = eventsService.getSelectedTab();
                if (selectedTab === "mainevents") {
                    return eventsService.getMainEvents();
                }

                if (eventsService.getEventGroup(selectedTab) == null) {
                    return eventsService.getMainEvents();
                }

                return eventsService.getEventGroup(selectedTab).events;
            };

            function updateEvent(groupId, event) {
                if (groupId === "mainevents") {
                    const mainEvents = eventsService.getMainEvents();
                    const index = mainEvents.findIndex(e => e.id === event.id);
                    mainEvents[index] = event;
                    eventsService.saveMainEvents();
                } else {
                    const group = eventsService.getEventGroup(groupId);
                    const index = group.events.findIndex(e => e.id === event.id);
                    group.events[index] = event;
                    eventsService.saveGroup(group);
                }
            }

            function deleteEvent(groupId, eventId) {
                if (groupId === "mainevents") {
                    const mainEvents = eventsService.getMainEvents();
                    const index = mainEvents.findIndex(e => e.id === eventId);
                    mainEvents.splice(index, 1);
                    eventsService.saveMainEvents();
                } else {
                    const group = eventsService.getEventGroup(groupId);
                    const index = group.events.findIndex(e => e.id === eventId);
                    group.events.splice(index, 1);
                    eventsService.saveGroup(group);
                }
            }

            $scope.updateEventsForCurrentGroup = (events) => {
                eventsService.updateEventsForCurrentGroup(events);
            };

            $scope.showCreateEventGroupModal = function() {
                utilityService.openGetInputModal(
                    {
                        model: "",
                        label: "新規イベントセットの作成",
                        saveText: "作成",
                        validationFn: (value) => {
                            return new Promise(resolve => {
                                if (value == null || value.trim().length < 1) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                        },
                        validationText: "イベントセット名は空欄にできません."

                    },
                    (name) => {
                        eventsService.createGroup(name);
                    });
            };

            $scope.showRenameEventGroupModal = function(group) {
                utilityService.openGetInputModal(
                    {
                        model: group.name,
                        label: "イベントセットの名前を変える",
                        saveText: "保存",
                        validationFn: (value) => {
                            return new Promise(resolve => {
                                if (value == null || value.trim().length < 1) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                        },
                        validationText: "イベントセット名は空欄にできません."

                    },
                    (name) => {
                        group.name = name;
                        eventsService.saveGroup(group);
                    });
            };

            $scope.showDeleteGroupModal = function(group) {
                utilityService
                    .showConfirmationModal({
                        title: "イベントセットの削除",
                        question: `イベントセット「"${group.name}"」を削除しますか? （イベントセット内に登録したイベントは消えます）`,
                        confirmLabel: "Delete",
                        confirmBtnType: "btn-danger"
                    })
                    .then(confirmed => {
                        if (confirmed) {
                            eventsService.deleteGroup(group.id);
                        }
                    });
            };

            $scope.showAddOrEditEventModal = function(eventId) {

                const selectedGroupId = eventsService.getSelectedTab();
                let event;

                if (eventId != null) {
                    const selectedEvents = $scope.getSelectedEvents();
                    event = selectedEvents.find(e => e.id === eventId);
                }

                utilityService.showModal({
                    component: "addOrEditEventModal",
                    resolveObj: {
                        event: () => event,
                        groupId: () => selectedGroupId
                    },
                    closeCallback: resp => {
                        const { action, event, groupId } = resp;

                        switch (action) {
                            case "add":
                                if (groupId === "mainevents") {
                                    eventsService.getMainEvents().push(event);
                                    eventsService.saveMainEvents();
                                } else {
                                    const group = eventsService.getEventGroup(groupId);
                                    group.events.push(event);
                                    eventsService.saveGroup(group);
                                }
                                break;
                            case "update":
                                updateEvent(groupId, event);
                                break;
                            case "delete":
                                deleteEvent(groupId, event.id);
                                break;
                        }
                    }
                });
            };

            $scope.showDeleteEventModal = function(eventId, name) {
                utilityService
                    .showConfirmationModal({
                        title: "イベントの削除",
                        question: `イベント「"${name}"」を消しますか?`,
                        confirmLabel: "削除する",
                        confirmBtnType: "btn-danger"
                    })
                    .then(confirmed => {
                        if (confirmed) {
                            const groupId = eventsService.getSelectedTab();
                            deleteEvent(groupId, eventId);
                        }
                    });
            };

            $scope.toggleEventActiveStatus = function(eventId) {
                const groupId = eventsService.getSelectedTab();
                if (groupId === "mainevents") {
                    const event = eventsService.getMainEvents().find(e => e.id === eventId);
                    event.active = !event.active;
                    eventsService.saveMainEvents();
                } else {
                    const group = eventsService.getEventGroup(groupId);
                    const event = group.events.find(e => e.id === eventId);
                    event.active = !event.active;
                    eventsService.saveGroup(group);
                }
            };

            function addEventToGroup(event, groupId) {
                if (groupId === "mainevents") {
                    eventsService.getMainEvents().push(event);
                    eventsService.saveMainEvents();
                } else {
                    const group = eventsService.getEventGroup(groupId);
                    group.events.push(event);
                    eventsService.saveGroup(group);
                }
            }

            function moveEventToGroup(event, groupId) {
                const currentGroupId = eventsService.getSelectedTab();
                deleteEvent(currentGroupId, event.id);
                addEventToGroup(event, groupId);
            }

            $scope.duplicateEvent = function(eventId) {
                const groupId = eventsService.getSelectedTab();
                if (groupId === "mainevents") {
                    const event = eventsService.getMainEvents().find(e => e.id === eventId);

                    const copiedEvent = objectCopyHelper.copyObject("events", [event])[0];
                    copiedEvent.name += " copy";

                    eventsService.getMainEvents().push(copiedEvent);
                    eventsService.saveMainEvents();
                } else {
                    const group = eventsService.getEventGroup(groupId);
                    const event = group.events.find(e => e.id === eventId);

                    const copiedEvent = objectCopyHelper.copyObject("events", [event])[0];

                    copiedEvent.name += " copy";

                    group.events.push(copiedEvent);
                    eventsService.saveGroup(group);
                }
            };

            $scope.copyEvent = function(eventId) {
                const groupId = eventsService.getSelectedTab();
                if (groupId === "mainevents") {
                    const event = eventsService.getMainEvents().find(e => e.id === eventId);
                    objectCopyHelper.copyObject("events", [event]);
                } else {
                    const group = eventsService.getEventGroup(groupId);
                    const event = group.events.find(e => e.id === eventId);
                    objectCopyHelper.copyObject("events", [event]);
                }
            };

            $scope.hasCopiedEvents = function() {
                return objectCopyHelper.hasObjectCopied("events");
            };

            $scope.copyEvents = function(groupId) {
                if (groupId === "mainevents") {
                    const events = eventsService.getMainEvents();
                    objectCopyHelper.copyObject("events", events);
                } else {
                    const group = eventsService.getEventGroup(groupId);
                    objectCopyHelper.copyObject("events", group.events);
                }
            };

            $scope.pasteEvents = function(groupId) {
                if (!$scope.hasCopiedEvents()) {
                    return;
                }

                if (groupId === "mainevents") {
                    const copiedEvents = objectCopyHelper.getCopiedObject("events");

                    for (const copiedEvent of copiedEvents) {
                        eventsService.getMainEvents().push(copiedEvent);
                    }

                    eventsService.saveMainEvents();

                } else {
                    const group = eventsService.getEventGroup(groupId);
                    const copiedEvents = objectCopyHelper.getCopiedObject("events");

                    for (const copiedEvent of copiedEvents) {
                        group.events.push(copiedEvent);

                    }
                    eventsService.saveGroup(group);
                }

                eventsService.setSelectedTab(groupId);
            };

            $scope.eventMenuOptions = function(event) {

                const currentGroupId = eventsService.getSelectedTab();
                const availableGroups = [
                    { id: 'mainevents', name: "メインイベント"},
                    ...eventsService.getEventGroups().map(g => ({ id: g.id, name: g.name }))
                ].filter(g => g.id !== currentGroupId);

                const options = [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 編集</a>`,
                        click: () => {
                            $scope.showAddOrEditEventModal(event.id);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-toggle-off" style="margin-right: 10px;"></i> 有効化の切り替え</a>`,
                        click: () => {
                            $scope.toggleEventActiveStatus(event.id);
                        }
                    },
                    {
                        html: `<a href ><span class="iconify" data-icon="mdi:content-copy" style="margin-right: 10px;"></span> コピー</a>`,
                        click: () => {
                            $scope.copyEvent(event.id);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-clone" style="margin-right: 10px;"></i> 複製</a>`,
                        click: () => {
                            $scope.duplicateEvent(event.id);
                        }
                    },
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                        click: () => {
                            $scope.showDeleteEventModal(event.id, event.name ? event.name : '名無し');
                        }
                    },
                    {
                        text: "移動先...",
                        children: availableGroups.map(g => {
                            return {
                                html: `<a href>${g.name}</a>`,
                                click: () => {
                                    moveEventToGroup(event, g.id);
                                }
                            };
                        }),
                        hasTopDivider: true
                    }
                ];

                return options;
            };

            $scope.eventSetMenuOptions = function(group) {

                return [
                    {
                        html: `<a href ><i class="far fa-pen mr-4"></i> 名前の変更</a>`,
                        click: () => {
                            $scope.showRenameEventGroupModal(group);
                        }
                    },
                    {
                        html: `<a href ><i class="fas mr-4 ${group.active ? 'fa-toggle-off' : 'fa-toggle-on'}"></i> ${group.active ? 'OFF' : 'ON'}</a>`,
                        click: () => {
                            eventsService.toggleEventGroupActiveStatus(group.id);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-clone mr-4"></i> 複製</a>`,
                        click: () => {
                            eventsService.duplicateEventGroup(group);
                        }
                    },
                    {
                        html: `<a href style="color: #fb7373"><i class="far fa-trash-alt mr-4"></i> 削除</a>`,
                        click: () => {
                            $scope.showDeleteGroupModal(group);
                        }
                    },
                    {
                        html: `<a href ><span class="iconify mr-4" data-icon="mdi:content-copy"></span> コピー</a>`,
                        click: () => {
                            $scope.copyEvents(group.id);
                        },
                        hasTopDivider: true
                    },
                    {
                        html: `<a href><span class="iconify mr-4" data-icon="mdi:content-paste" ng-class="{'disabled': !hasCopiedEvents()}"></span> 貼り付け</a>`,
                        click: () => {
                            $scope.pasteEvents(group.id);
                        },
                        enabled: $scope.hasCopiedEvents()
                    }
                ];
            };

            $scope.simulateEventsByType = function() {
                utilityService.showModal({
                    component: "simulateGroupEventsModal",
                    size: "sm"
                });
            };

            /**
             * Returns an integer of total number of effects in an event.
             */
            $scope.getEventEffectsCount = function(event) {
                if (event.effects && event.effects.list) {
                    return event.effects.list.length;
                }
                return 0;
            };

            // Fire event manually
            $scope.fireEventManually = function(eventId) {
                const event = $scope.getSelectedEvents().find(e => e.id === eventId);
                if (event != null) {
                    ipcRenderer.send("triggerManualEvent", {
                        eventId: event.eventId,
                        sourceId: event.sourceId,
                        eventSettingsId: event.id
                    });
                }
            };
        });
}());
