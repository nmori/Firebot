"use strict";

(function() {
    const fsp = require("fs/promises");

    angular.module("firebotApp")
        .component("removeSetupModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">セットアップの削除</h4>
                </div>
                <div class="modal-body">
                    <div ng-hide="$ctrl.setupSelected">
                        <p class="muted">セットアップファイルを選択すると、Firebotは一致するすべての構成部品（コマンド、イベントなど）を検索し、それらを削除します。</p>
                        <file-chooser
                            model="$ctrl.setupFilePath"
                            on-update="$ctrl.onFileSelected(filepath)"
                            options="{filters: [ {name:'Firebot Setups',extensions:['firebotsetup']} ]}"
                            hide-manual-edit="true"
                        >
                        </file-chooser>
                    </div>
                    <div ng-if="$ctrl.setupSelected">
                        <div style="padding: 15px;background: #242529;border-radius: 5px;">
                            <div class="script-name" style="font-size: 30px;font-weight: 100;">{{$ctrl.setup.name || "Unnamed Setup"}} <span class="script-version muted">v{{$ctrl.setup.version}}</span></div>
                            <div style="font-size: 13px;">by <span class="script-author">{{$ctrl.setup.author}}</span></div>
                            <button ng-show="$ctrl.allowCancel" class="btn-sm btn-link" ng-click="$ctrl.resetSelectedFile()" style="margin-top: 3px;">キャンセル</button>
                        </div>
                        <div style="margin-top: 25px;" ng-show="$ctrl.hasComponentsToRemove">
                            <h4 class="muted">これらが削除されます:</h4>
                            <div ng-repeat="(key, name) in $ctrl.componentTypes">
                                <div ng-repeat="component in $ctrl.componentsToRemove[key]">
                                    <div style="display: flex;align-items: center;">
                                        <span style="padding: 2px 7px;font-size: 13px;background: #242529;border-radius: 3px;">{{name}}</span>
                                        <span style="margin-left: 5px;font-size: 20px;font-weight: 500;">{{component.name}}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p ng-hide="$ctrl.hasComponentsToRemove" style="margin-top: 15px;">
                            このセットアップに含まれる構成部品は保存されていないため、削除する必要はありません。
                        </p>

                        <div style="display:flex; justify-content: center;margin-top: 25px;">
                            <button ng-show="$ctrl.hasComponentsToRemove" type="button" class="btn btn-primary" ng-click="$ctrl.removeSetup()">セットアップの削除</button>
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
            controller: function($q, logger, ngToast, commandsService, countersService, currencyService,
                effectQueuesService, eventsService, hotkeyService, presetEffectListsService,
                timerService, viewerRolesService, quickActionsService, variableMacroService, viewerRanksService, backendCommunicator) {
                const $ctrl = this;

                $ctrl.setupFilePath = null;
                $ctrl.setupSelected = false;
                $ctrl.allowCancel = true;

                $ctrl.componentTypes = {
                    commands: "コマンド",
                    counters: "カウンタ",
                    currencies: "通貨",
                    effectQueues: "演出キュー",
                    events: "イベント",
                    eventGroups: "イベントセット",
                    hotkeys: "ホットキー",
                    presetEffectLists: "プリセット演出リスト",
                    timers: "タイマー",
                    variableMacros: "マクロ変数",
                    viewerRoles: "視聴者の役割",
                    viewerRankLadders: "視聴者ランク",
                    quickActions: "クイックアクション"
                };

                $ctrl.componentsToRemove = {
                    commands: [],
                    counters: [],
                    currencies: [],
                    effectQueues: [],
                    events: [],
                    eventGroups: [],
                    hotkeys: [],
                    presetEffectLists: [],
                    timers: [],
                    variableMacros: [],
                    viewerRoles: [],
                    viewerRankLadders: [],
                    quickActions: []
                };

                $ctrl.hasComponentsToRemove = false;

                $ctrl.currentIds = {};
                [
                    ...commandsService.getCustomCommands().map(i => i.id),
                    ...countersService.counters.map(i => i.id),
                    ...currencyService.getCurrencies().map(i => i.id),
                    ...effectQueuesService.getEffectQueues().map(i => i.id),
                    ...eventsService.getAllEvents().map(i => i.id),
                    ...eventsService.getAllEventGroups().map(i => i.id),
                    ...hotkeyService.getHotkeys().map(i => i.id),
                    ...presetEffectListsService.getPresetEffectLists().map(i => i.id),
                    ...timerService.getTimers().map(i => i.id),
                    ...variableMacroService.macros.map(i => i.id),
                    ...viewerRolesService.getCustomRoles().map(i => i.id),
                    ...viewerRanksService.rankLadders.map(i => i.id),
                    ...quickActionsService.quickActions.map(i => i.id)
                ].forEach((id) => {
                    $ctrl.currentIds[id] = true;
                });

                $ctrl.setup = null;

                $ctrl.resetSelectedFile = (message) => {
                    if (message) {
                        ngToast.create(message);
                    }
                    $ctrl.setupSelected = false;
                    $ctrl.setup = null;
                    $ctrl.setupFilePath = null;
                };

                $ctrl.onFileSelected = (filepath) => {
                    $q.when(fsp.readFile(filepath))
                        .then((setup) => {
                            setup = JSON.parse(setup);
                            if (setup == null || setup.components == null) {
                                $ctrl.resetSelectedFile("セットアップファイルをロードできません: 対応していないファイルです。");
                                return;
                            }
                            $ctrl.setup = setup;

                            Object.entries($ctrl.setup.components)
                                .forEach(([componentType, components]) => {
                                    components.forEach((component) => {
                                        if ($ctrl.currentIds[component.id]) {
                                            $ctrl.componentsToRemove[componentType].push({
                                                id: component.id,
                                                name: component.trigger || component.name
                                            });
                                            $ctrl.hasComponentsToRemove = true;
                                        }
                                    });
                                });

                            $ctrl.setupSelected = true;
                        }, (reason) => {
                            logger.error("Failed to load setup file", reason);
                            $ctrl.allowCancel = true;
                            $ctrl.resetSelectedFile("セットアップファイルをロードできません: 対応していないファイルです。");
                            return;
                        });
                };

                $ctrl.removeSetup = () => {

                    $.when(
                        backendCommunicator.fireEventAsync("remove-setup-components", {
                            components: $ctrl.componentsToRemove
                        })
                    )
                        .then((successful) => {
                            if (successful) {
                                ngToast.create({
                                    className: 'success',
                                    content: `構成部品を削除しました: ${$ctrl.setup.name}`
                                });
                                $ctrl.dismiss();
                            } else {
                                ngToast.create(`構成部品を削除に失敗しました: ${$ctrl.setup.name}`);
                            }
                        });
                };

                $ctrl.$onInit = () => {
                    if ($ctrl.resolve.setupFilePath) {
                        $ctrl.allowCancel = false;
                        $ctrl.setupFilePath = $ctrl.resolve.setupFilePath;
                        $ctrl.onFileSelected($ctrl.setupFilePath);
                    }
                };
            }
        });
})();
