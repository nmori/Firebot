"use strict";

// Basic template for a modal component, copy this and rename to build a modal.

(function() {
    angular.module("firebotApp")
        .component("simulateGroupEventsModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">イベントを模擬</h4>
                </div>
                <div class="modal-body">
                    <p class="muted">保存した演出をテストするために、模擬するイベントを選択します。</p>
                    <div class="form-group" ng-class="{'has-error': $ctrl.eventError}">
                        <label class="control-label">イベント</label>
                        <searchable-event-dropdown
                            selected="{ eventId: $ctrl.event.eventId, sourceId: $ctrl.event.sourceId }"
                            style="width:100%"
                            update="$ctrl.eventChanged(event)"
                        ></searchable-event-dropdown>
                    </div>

                    <div>
                        <label class="control-fb control--checkbox"> イベントの強制実行 <tooltip text="'模擬されたイベントは確実に実行します'"></tooltip>
                            <input type="checkbox" ng-model="$ctrl.eventData.forceRetrigger">
                            <div class="control__indicator"></div>
                        </label>
                    </div>

                    <div ng-if="$ctrl.metadata">
                        <command-option
                            ng-repeat="data in $ctrl.metadata"
                            name="data.title"
                            metadata="data"
                            on-update="$ctrl.isAnon(value)"
                        ></command-option>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.simulate()">模擬実行</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function(backendCommunicator, ngToast) {
                const $ctrl = this;

                $ctrl.metadata = [];
                $ctrl.eventData = {
                    eventId: null,
                    sourceId: null,
                    metadata: {},
                    forceRetrigger: false
                };
                $ctrl.eventError = false;

                $ctrl.changeUsername = (key, usernameType, isAnon) => {
                    const username = $ctrl.metadata.find(md => md.key === key);
                    if (username === undefined)
                    {
                        $ctrl.metadata[key] = "";
                    } else {
                        if (username && isAnon) {
                            username.value = `An Anonymous ${usernameType}`;
                        } else {
                            username.value = "";
                        }
                    }
                    const index = $ctrl.metadata.findIndex(md => md.key === key);
                    $ctrl.metadata[index] = username;
                };

                $ctrl.isAnon = (isAnon) => {
                    if ($ctrl.eventData.eventId === 'subs-gifted' || $ctrl.eventData.eventId === 'community-subs-gifted') {
                        $ctrl.changeUsername('gifterUsername', 'Gifter', isAnon);
                        $ctrl.changeUsername('gifterDisplayName', 'Gifter', isAnon);
                        return;
                    } else if ($ctrl.eventData.eventId === 'cheer') {
                        $ctrl.changeUsername('username', 'Cheerer', isAnon);
                        $ctrl.changeUsername('displayName', 'Cheerer', isAnon);
                    }
                };

                const getTitle = (metadata) => {
                    const titleArray = metadata.split(/(?=[A-Z])/);

                    const capitalized = titleArray.map(word => word.charAt(0).toUpperCase() + word.slice(1, word.length));
                    return capitalized.join(" ");
                };

                $ctrl.eventChanged = async (event) => {
                    $ctrl.eventData.eventId = event.eventId;
                    $ctrl.eventData.sourceId = event.sourceId;
                    $ctrl.eventData.metadata = {};

                    const eventSource = await backendCommunicator.fireEventAsync("getEventSource", event);
                    if (eventSource.manualMetadata) {
                        $ctrl.metadata = Object.keys(eventSource.manualMetadata).map(mmd => {
                            const meta = eventSource.manualMetadata[mmd];
                            const dataType = meta == null ? "string" : meta.type || typeof meta;
                            const data = {
                                key: mmd,
                                title: getTitle(mmd),
                                type: dataType,
                                options: meta?.options || {}
                            };

                            return data;
                        });
                    } else {
                        $ctrl.metadata = [];
                    }
                };

                $ctrl.simulate = () => {
                    $ctrl.eventError = false;

                    if ($ctrl.eventData.sourceId == null) {
                        $ctrl.eventError = true;
                        return;
                    }

                    if ($ctrl.metadata.length > 0) {
                        $ctrl.metadata.forEach(md => $ctrl.eventData.metadata[md.key] = md.value);
                    }

                    backendCommunicator.fireEventSync("simulateEvent", $ctrl.eventData);
                    ngToast.create({
                        className: 'success',
                        content: "イベントの模擬を実行しました"
                    });
                    $ctrl.close();
                };
            }
        });
}());
