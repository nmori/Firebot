"use strict";

(function() {
    const fs = require("fs-extra");

    const marked = require("marked");
    const { sanitize } = require("dompurify");

    angular.module("firebotApp")
        .component("importSetupModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">セットアップ設定の取り込み</h4>
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
                        <div style="padding: 15px;background: #242529;border-radius: 5px;">
                            <div class="script-name" style="font-size: 30px;font-weight: 100;">{{$ctrl.setup.name || "Unnamed Setup"}} <span class="script-version muted">v{{$ctrl.setup.version}}</span></div>
                            <div style="font-size: 13px;">by <span class="script-author">{{$ctrl.setup.author}}</span></div>
                            <div class="script-description" ng-bind-html="$ctrl.setup.description"></div>
                            <button ng-show="$ctrl.allowCancel" class="btn-sm btn-default" ng-click="$ctrl.resetSelectedFile()" style="margin-top: 3px;">キャンセル</button>
                            <button class="btn-sm btn-default pull-right" ng-click="$ctrl.popoutDescription()" style="margin-top: 3px;">ポップアウトの説明</button>
                        </div>
                        <div style="margin-top: 25px;">
                            <h4 class="muted">This Setup Adds:</h4>
                            <div ng-repeat="(key, name) in $ctrl.componentTypes">
                                <div ng-repeat="component in $ctrl.setup.components[key]">
                                    <div style="display: flex;align-items: center;">
                                        <span style="padding: 2px 7px;font-size: 13px;background: #242529;border-radius: 3px;">{{name}}</span>
                                        <span style="margin-left: 5px;font-size: 20px;font-weight: 500;">{{component.trigger || component.name}}</span>
                                        <span ng-show="$ctrl.currentIds[component.id]" style="color:red;margin-left: 4px;"><i class="far fa-exclamation-triangle" uib-tooltip="{{name}} はすでに存在増します. 取り込むには {{name}} このセットアップのバージョンに上書きされます。"></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div ng-show="$ctrl.setup.requireCurrency" style="margin-top: 25px;">
                            <h4 class="muted">使用する通貨単位:</h4>
                            <p class="muted">このセットアップでは、含まれる演出、変数、制限で使用できるように、通貨のいずれかを選択する必要があります。</p>
                            <select
                                class="fb-select"
                                ng-model="$ctrl.selectedCurrency"
                                ng-options="currency as currency.name for currency in $ctrl.currencies">
                                <option value="" disabled selected>通貨を選んでください...</option>
                            </select>
                        </div>

                        <div ng-if="$ctrl.setup.importQuestions && $ctrl.setup.importQuestions.length > 0" style="margin-top:25px">
                            <h4 class="muted">取り込みに関する質問</h4>
                            <div ng-repeat="question in $ctrl.setup.importQuestions track by question.id">
                                <h5>{{question.question}} <tooltip ng-show="question.helpText" text="question.helpText" /></h5>
                                <input type="{{question.answerType || 'text'}}" class="form-control" ng-model="question.answer" placeholder="質問に答えてください" />
                            </div>
                        </div>

                        <div style="display:flex; justify-content: center;margin-top: 25px;">
                            <button type="button" class="btn btn-primary" ng-click="$ctrl.importSetup()">セットアップ開始</button>
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
                timerService, viewerRolesService, quickActionsService, backendCommunicator, $sce) {
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
                    ...hotkeyService.getHotkeys().map(i => i.id),
                    ...presetEffectListsService.getPresetEffectLists().map(i => i.id),
                    ...timerService.getTimers().map(i => i.id),
                    ...viewerRolesService.getCustomRoles().map(i => i.id),
                    ...quickActionsService.quickActions
                        .filter(qa => qa.type === "custom")
                        .map(i => i.id)
                ].forEach(id => {
                    $ctrl.currentIds[id] = true;
                });

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
                    viewerRoles: "視聴者の役割",
                    quickActions: "クイックアクション"
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
                        <div style="font-size: 30px;font-weight: 100;">Firebot セットアップ - ${$ctrl.setup.name}</div>
                        <div>${$ctrl.setup.description}</div>
                    `);

                    modal.document.title = `Firebot セットアップ - ${$ctrl.setup.name}`;
                    modal.document.body.style.color = "white";
                    modal.document.body.style.fontFamily = "sans-serif";
                };

                $ctrl.onFileSelected = (filepath) => {
                    $q.when(fs.readJson(filepath))
                        .then(setup => {
                            if (setup == null || setup.components == null) {
                                $ctrl.resetSelectedFile("セットアップファイルをロードできません:対応していない設定ファイルです。");
                                return;
                            }
                            $ctrl.setup = setup;
                            // parse markdown
                            $ctrl.setup.description = $sce.trustAsHtml(
                                sanitize(marked($ctrl.setup.description, {}))
                            );
                            //set default answers
                            if ($ctrl.setup.importQuestions) {
                                $ctrl.setup.importQuestions = $ctrl.setup.importQuestions.map(q => {
                                    if (q.defaultAnswer) {
                                        q.answer = q.defaultAnswer;
                                    }
                                    return q;
                                });
                            }
                            $ctrl.setupSelected = true;
                        }, (reason) => {
                            logger.error("Failed to load setup file", reason);
                            $ctrl.allowCancel = true;
                            $ctrl.resetSelectedFile("セットアップファイルをロードできません: 対応していない設定ファイルです。");
                            return;
                        });
                };

                $ctrl.importSetup = () => {

                    if ($ctrl.setup.requireCurrency && $ctrl.selectedCurrency == null) {
                        ngToast.create("使用する通貨を選択してください。通貨が表示されない場合は、「通貨」タブで通貨設定を追加し、このセットアップを再度取り込んでください。");
                        return;
                    }

                    if ($ctrl.setup.importQuestions &&
                        $ctrl.setup.importQuestions.some(q => q.answer == null)) {
                        ngToast.create("すべての質問に答える必要があります");
                        return;
                    }

                    $q.when(
                        backendCommunicator.fireEventAsync("import-setup", {
                            setup: $ctrl.setup,
                            selectedCurrency: $ctrl.selectedCurrency
                        })
                    )
                        .then(successful => {
                            if (successful) {
                                ngToast.create({
                                    className: 'success',
                                    content: `セットアップの取り込みに成功しました: ${$ctrl.setup.name}`
                                });
                                $ctrl.dismiss();
                            } else {
                                ngToast.create(`セットアップの取り込みに失敗しました: ${$ctrl.setup.name}`);
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
}());
