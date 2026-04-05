"use strict";

(function() {
    const { marked } = require("marked");
    const { sanitize } = require("dompurify");

    angular.module("firebotApp")
        .component("importSetupModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">セットアップをインポート</h4>
                </div>
                <div class="modal-body">
                    <div ng-hide="$ctrl.setupSelected">
                        <file-chooser
                            model="$ctrl.setupFilePath"
                            on-update="$ctrl.onFileSelected(filepath)"
                            options="{filters: [ {name:'Firebot Setups',extensions:['firebotsetup']} ]}"
                            hide-manual-edit="true"
                        >
                        </file-chooser>
                    </div>
                    <div ng-if="$ctrl.setupSelected">
                        <div class="effect-list" style="padding: 15px;border-radius: 5px;">
                            <div class="script-name" style="font-size: 30px;font-weight: 100;">{{$ctrl.setup.name || "名前未設定のセットアップ"}} <span class="script-version muted">v{{$ctrl.setup.version}}</span></div>
                            <div style="font-size: 13px;">by <span class="script-author">{{$ctrl.setup.author}}</span></div>
                            <div class="script-description" ng-bind-html="$ctrl.setup.description"></div>
                            <button ng-show="$ctrl.allowCancel" class="btn-sm btn-default" ng-click="$ctrl.resetSelectedFile()" style="margin-top: 3px;">キャンセル</button>
                            <button class="btn-sm btn-default pull-right" ng-click="$ctrl.popoutDescription()" style="margin-top: 3px;">説明をポップアウト</button>
                        </div>
                        <div style="margin-top: 25px;">
                            <h4 class="muted">このセットアップで追加されるもの:</h4>
                            <div ng-repeat="(key, name) in $ctrl.componentTypes">
                                <div ng-repeat="component in $ctrl.setup.components[key]">
                                    <div style="display: flex;align-items: center;">
                                        <span class="list-group-item" style="padding: 2px 7px;font-size: 13px;border-radius: 3px;">{{name}}</span>
                                        <span style="margin-left: 5px;font-size: 20px;font-weight: 500;">{{component.trigger || component.name}}</span>
                                        <span ng-show="$ctrl.currentIds[component.id]" style="color:red;margin-left: 4px;"><i class="far fa-exclamation-triangle" uib-tooltip="この {{name}} はすでに存在します。このセットアップをインポートすると、既存の {{name}} はこのセットアップ内の内容で置き換えられます。"></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div ng-show="$ctrl.setup.requireCurrency" style="margin-top: 25px;">
                            <h4 class="muted">使用する通貨:</h4>
                            <h5>このセットアップには通貨の選択が必要です。含まれるエフェクト、変数、制限で選択した通貨が使用されます。</h5>
                            <select
                                class="form-control fb-select"
                                ng-model="$ctrl.selectedCurrency"
                                ng-options="currency as currency.name for currency in $ctrl.currencies">
                                <option value="" disabled selected>通貨を選択...</option>
                            </select>
                        </div>

                        <div ng-if="$ctrl.setup.importQuestions && $ctrl.setup.importQuestions.length > 0" style="margin-top:25px">
                            <h4 class="muted">インポート時の質問</h4>
                            <div ng-repeat="question in $ctrl.setup.importQuestions track by question.id">
                                <h5>{{question.question}} <tooltip ng-show="question.helpText" text="question.helpText" /></h5>
                                <input ng-if="question.answerType !== 'preset'" type="{{question.answerType || 'text'}}" class="form-control" ng-model="question.answer" placeholder="回答を入力" />
                                <select ng-if="question.answerType === 'preset'" class="fb-select" ng-model="question.answer">
                                    <option ng-repeat="preset in question.presetOptions" label="{{preset}}" value="{{preset}}">{{preset}}</option>
                                </select>
                            </div>
                        </div>

                        <div style="display:flex; justify-content: center;margin-top: 25px;">
                            <button type="button" class="btn btn-primary" ng-click="$ctrl.importSetup()">セットアップをインポート</button>
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
            controller: function(ngToast, commandsService, countersService, currencyService,
                effectQueuesService, eventsService, hotkeyService, presetEffectListsService,
                timerService, scheduledTaskService, viewerRolesService, quickActionsService,
                variableMacroService, viewerRanksService, backendCommunicator, $sce,
                overlayWidgetsService, settingsService) {
                const $ctrl = this;

                $ctrl.setupFilePath = null;
                $ctrl.setupSelected = false;
                $ctrl.allowCancel = true;

                $ctrl.currencies = currencyService.getCurrencies();
                $ctrl.selectedCurrency = null;

                $ctrl.currentIds = {};
                [
                    ...commandsService.getCustomCommands().map(i => i.id),
                    ...countersService.counters.map(i => i.id),
                    ...currencyService.getCurrencies().map(i => i.id),
                    ...effectQueuesService.getEffectQueues().map(i => i.id),
                    ...eventsService.getAllEvents().map(i => i.id),
                    ...eventsService.getAllEventGroups().map(i => i.id),
                    ...hotkeyService.hotkeys.map(i => i.id),
                    ...presetEffectListsService.getPresetEffectLists().map(i => i.id),
                    ...timerService.getTimers().map(i => i.id),
                    ...scheduledTaskService.getScheduledTasks().map(i => i.id),
                    ...variableMacroService.macros.map(i => i.id),
                    ...viewerRolesService.getCustomRoles().map(i => i.id),
                    ...viewerRanksService.rankLadders.map(i => i.id),
                    ...overlayWidgetsService.overlayWidgetConfigs.map(i => i.id),
                    ...quickActionsService.quickActions
                        .filter(qa => qa.type === "custom")
                        .map(i => i.id),
                    ...settingsService.getSetting("GlobalValues", true).map(v =>
                        `GlobalValue:${v.name}`
                    )
                ].forEach((id) => {
                    $ctrl.currentIds[id] = true;
                });

                $ctrl.componentTypes = {
                    commands: "Command",
                    counters: "Counter",
                    currencies: "Currency",
                    effectQueues: "Effect Queue",
                    events: "Event",
                    eventGroups: "Event Sets",
                    hotkeys: "Hotkey",
                    presetEffectLists: "Preset Effect List",
                    timers: "Timer",
                    scheduledTasks: "Scheduled Effect List",
                    variableMacros: "Variable Macro",
                    viewerRoles: "Viewer Role",
                    viewerRankLadders: "Viewer Rank Ladder",
                    quickActions: "Quick Action",
                    overlayWidgetConfigs: "Overlay Widget",
                    globalValues: "Global Value"
                };

                $ctrl.setup = null;

                $ctrl.resetSelectedFile = (message) => {
                    if (message) {
                        ngToast.create(message);
                    }
                    $ctrl.setupSelected = false;
                    $ctrl.setup = null;
                    $ctrl.setupFilePath = null;
                };

                $ctrl.popoutDescription = () => {
                    const modal = window.open('', 'modal');

                    modal.document.write(`
                        <div style="font-size: 30px;font-weight: 100;">Firebot Setup - ${$ctrl.setup.name}</div>
                        <div>${$ctrl.setup.description}</div>
                    `);

                    modal.document.title = `Firebot Setup - ${$ctrl.setup.name}`;
                    modal.document.body.style.fontFamily = "sans-serif";
                };

                $ctrl.onFileSelected = async (filepath) => {
                    /** @type {import("../../../../../backend/setups/setup-manager").LoadSetupResult} */
                    const result = await backendCommunicator.fireEventAsync("setups:load-setup", filepath);

                    if (result.success) {
                        $ctrl.setup = result.setup;
                        $ctrl.setup.description = $sce.trustAsHtml(
                            sanitize(marked($ctrl.setup.description, {}))
                        );

                        //set default answers
                        if ($ctrl.setup.importQuestions) {
                            $ctrl.setup.importQuestions = $ctrl.setup.importQuestions.map((q) => {
                                if (q.defaultAnswer) {
                                    q.answer = q.defaultAnswer;
                                }
                                return q;
                            });
                        }
                        $ctrl.setupSelected = true;
                    } else {
                        $ctrl.allowCancel = true;
                        $ctrl.resetSelectedFile(result.error ?? "セットアップファイルの読み込みに失敗しました");
                        return;
                    }
                };

                $ctrl.importSetup = async () => {
                    if ($ctrl.setup.requireCurrency && $ctrl.selectedCurrency == null) {
                        ngToast.create("使用する通貨を選択してください。通貨がない場合は通貨タブで作成してから、再度このセットアップをインポートしてください。");
                        return;
                    }

                    if ($ctrl.setup.importQuestions &&
                        $ctrl.setup.importQuestions.some(q => q.answer == null)) {
                        ngToast.create("すべてのインポート質問に回答してください。");
                        return;
                    }

                    const success = await backendCommunicator.fireEventAsync("setups:import-setup", {
                        setup: $ctrl.setup,
                        selectedCurrency: $ctrl.selectedCurrency
                    });

                    if (success) {
                        ngToast.create({
                            className: 'success',
                            content: `セットアップをインポートしました: ${$ctrl.setup.name}`
                        });
                        $ctrl.dismiss();
                    } else {
                        ngToast.create(`セットアップのインポートに失敗しました: ${$ctrl.setup.name}`);
                    }
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