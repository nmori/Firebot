"use strict";

(function() {
    const sanitizeFileName = require("sanitize-filename");
    const fs = require("fs-extra");
    angular.module("firebotApp")
        .component("createSetupModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">新規セットアップスクリプト</h4>
                </div>
                <div class="modal-body">
                    <h3>名前</h3>
                    <input type="text" class="form-control" ng-model="$ctrl.setup.name" placeholder="名前を入力">

                    <h3>説明</h3>
                    <textarea type="text" class="form-control" rows="3" ng-model="$ctrl.setup.description" placeholder="説明を入力 (Markdown記法が使えます)"></textarea>

                    <h3>バージョン</h3>
                    <input type="number" class="form-control" ng-model="$ctrl.setup.version" placeholder="バージョンを入力">

                    <h3>構成部品</h3>
                    <p class="muted">Firebotセットアップに含める部品を選択します。.</p>
                    <div ng-repeat="componentConfig in $ctrl.components track by $index" style="margin-bottom: 20px;">
                        <h4>{{componentConfig.label}}</h4>
                        <div style="padding-left: 5px">
                            <div
                                style="margin-bottom: 13px;"
                                ng-repeat="component in $ctrl.setup.components[componentConfig.key] track by component.id">
                                <span style="font-weight: 800; font-size: 15px; padding: 5px; background: #494d54; border-radius: 10px;">
                                    {{component[componentConfig.nameField]}}
                                </span>
                            </div>
                        </div>
                        <button class="btn btn-link" ng-click="$ctrl.addOrEditComponent(componentConfig)">
                            <i class="fal" ng-class="!!$ctrl.setup.components[componentConfig.key].length ? 'fa-edit' : 'fa-plus'"></i> {{!!$ctrl.setup.components[componentConfig.key].length ? '編集' : '追加'}}
                        </button>
                    </div>

                    <h3>オプション</h3>
                    <div>
                        <label class="control-fb control--checkbox" style="margin-bottom: 0px; font-size: 13px;opacity.0.9;"> ユーザーに通貨を選択させる  <tooltip text="'設定を取り込む前に、ユーザーに通貨の種類を選択させます。Firebotは、選択された通貨を使用するように、含まれるコンポーネントのすべての通貨演出、変数、制限を更新します。これはチャットゲームに最適です。'"></tooltip>
                            <input type="checkbox" ng-model="$ctrl.setup.requireCurrency">
                            <div class="control__indicator"></div>
                        </label>
                    </div>

                    <h3>取り込みに関する質問 <tooltip text="'ユーザーは、このセットアップを取り込む前に、これらの質問に対する回答を提供する必要があります。Firebotは、指定されたトークンのすべての設定をユーザーの回答に自動的に置き換えます。'"/></h3>
                    <div>
                        <div>
                            <div ng-repeat="question in $ctrl.setup.importQuestions track by question.id" class="list-item selectable" ng-click="$ctrl.addImportQuestion(question)">
                                <div uib-tooltip="クリックして編集" style="font-weight: 400;">
                                    <div><b>Question:</b> {{question.question}}</div>
                                    <div><b>Replace Token:</b> {{question.replaceToken}}</div>
                                    <div ng-show="question.defaultAnswer"><b>初期値:</b> {{question.defaultAnswer}}</div>
                                </div>
                                <span class="clickable" style="color: #fb7373;" ng-click="$ctrl.removeImportQuestion(question.id);$event.stopPropagation();" aria-label="除外">
                                    <i class="fad fa-trash-alt" aria-hidden="true"></i>
                                </span>
                            </div>
                        </div>
                        <button class="filter-bar" ng-click="$ctrl.addImportQuestion()" uib-tooltip="質問の追加" tooltip-append-to-body="true">
                            <i class="far fa-plus"></i>
                        </button>
                    </div>

                    <div style="margin-top: 20px;">
                        <div class="alert alert-warning" role="alert" style="opacity: 0.8;margin-bottom: 0;"><b>注意</b> 演出で参照されるメディアファイル（画像、ビデオ、サウンド、スクリプトなど）は、このセットアップには<b>含まれません</b>。</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default pull-left" ng-click="$ctrl.loadPreviousSetup()">以前の設定を読み込む</button>
                    <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">セットアップを生成</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function(commandsService, countersService, currencyService,
                effectQueuesService, eventsService, hotkeyService, presetEffectListsService,
                timerService, viewerRolesService, quickActionsService, accountAccess, utilityService,
                ngToast, backendCommunicator, $q) {

                const $ctrl = this;

                $ctrl.components = [
                    {
                        label: "コマンド",
                        all: commandsService.getCustomCommands(),
                        nameField: "trigger",
                        key: "commands"
                    },
                    {
                        label: "カウンタ",
                        all: countersService.counters,
                        nameField: "name",
                        key: "counters"
                    },
                    {
                        label: "通貨",
                        all: currencyService.getCurrencies(),
                        nameField: "name",
                        key: "currencies"
                    },
                    {
                        label: "演出キュー",
                        all: effectQueuesService.getEffectQueues(),
                        nameField: "name",
                        key: "effectQueues"
                    },
                    {
                        label: "イベント",
                        all: eventsService.getAllEvents(),
                        nameField: "name",
                        key: "events"
                    },
                    {
                        label: "イベントセット",
                        all: eventsService.getAllEventGroups(),
                        nameField: "name",
                        key: "eventGroups"
                    },
                    {
                        label: "ホットキー",
                        all: hotkeyService.getHotkeys(),
                        nameField: "name",
                        key: "hotkeys"
                    },
                    {
                        label: "プリセット演出リスト",
                        all: presetEffectListsService.getPresetEffectLists(),
                        nameField: "name",
                        key: "presetEffectLists"
                    },
                    {
                        label: "タイマー",
                        all: timerService.getTimers(),
                        nameField: "name",
                        key: "timers"
                    },
                    {
                        label: "視聴者の役割",
                        all: viewerRolesService.getCustomRoles(),
                        nameField: "name",
                        key: "viewerRoles"
                    },
                    {
                        label: "クイックアクション",
                        all: quickActionsService.quickActions.filter(qa => qa.type === "custom"),
                        nameField: "name",
                        key: "quickActions"
                    }
                ];

                $ctrl.addOrEditComponent = (componentConfig) => {
                    const components = componentConfig.all.map(c => {
                        return {
                            id: c.id,
                            name: c[componentConfig.nameField]
                        };
                    });
                    const selectedIds = $ctrl.setup.components[componentConfig.key].map(c => c.id);
                    $ctrl.openComponentListModal(componentConfig.label, components, selectedIds, (newSelectedIds) => {
                        $ctrl.setup.components[componentConfig.key] = componentConfig.all.filter(c => newSelectedIds.includes(c.id));
                    });
                };

                $ctrl.setup = {
                    name: "",
                    description: "",
                    version: 1,
                    author: accountAccess.accounts.streamer.loggedIn ?
                        accountAccess.accounts.streamer.username : "不明",
                    components: {
                        commands: [],
                        counters: [],
                        currencies: [],
                        effectQueues: [],
                        events: [],
                        eventGroups: [],
                        hotkeys: [],
                        presetEffectLists: [],
                        timers: [],
                        viewerRoles: [],
                        quickActions: []
                    },
                    requireCurrency: false,
                    importQuestions: []
                };

                $ctrl.save = () => {
                    if ($ctrl.setup.name == null || $ctrl.setup.name === "") {
                        ngToast.create("セットアップ名を入れてください");
                        return;
                    }

                    if ($ctrl.setup.description == null || $ctrl.setup.description === "") {
                        ngToast.create("説明を入れてください");
                        return;
                    }

                    if ($ctrl.setup.version == null || $ctrl.setup.version <= 0) {
                        ngToast.create("バージョンは 0より大きくしてください");
                        return;
                    }

                    if (Object.values($ctrl.setup.components)
                        .every(array => array == null || array.length < 1)) {
                        ngToast.create("構成部品は１つ以上必要です");
                        return;
                    }

                    /**@type {Electron.SaveDialogOptions} */
                    const saveDialogOptions = {
                        buttonLabel: "セットアップ設定を保存",
                        defaultPath: sanitizeFileName($ctrl.setup.name),
                        title: "セットアップ設定ファイルの保存",
                        filters: [
                            {name: "Firebot Setup Files", extensions: ['firebotsetup']}
                        ],
                        properties: ["showOverwriteConfirmation", "createDirectory"]
                    };

                    $q.when(backendCommunicator.fireEventAsync("show-save-dialog", {
                        options: saveDialogOptions
                    }))
                        .then(saveResponse => {
                            if (saveResponse.cancelled) {
                                return;
                            }
                            fs.writeFile(saveResponse.filePath, angular.toJson($ctrl.setup), 'utf8');
                            ngToast.create({
                                className: '成功',
                                content: 'セットアップ設定を保存しました'
                            });
                            $ctrl.close();
                        });
                };

                $ctrl.$onInit = () => {};

                $ctrl.onFileSelected = (filepath) => {
                    $q.when(fs.readJson(filepath))
                        .then(setup => {
                            if (setup == null || setup.components == null) {
                                ngToast.create("以前の設定が読み込めませんでした");
                                return;
                            }
                            for (const [componentKey, componentList] of Object.entries(setup.components)) {
                                const componentConfig = $ctrl.components.find(c => c.key === componentKey);
                                if (!componentConfig) {
                                    continue;
                                }

                                setup.components[componentConfig.key] = componentConfig.all
                                    .filter(c => componentList.some(cy => cy.id === c.id));
                            }
                            $ctrl.setup = setup;
                        }, (reason) => {
                            console.log(reason);
                            ngToast.create("以前の設定が読み込めませんでした");
                            return;
                        });
                };

                $ctrl.loadPreviousSetup = () => {
                    $q
                        .when(backendCommunicator.fireEventAsync("open-file-browser", {
                            options: {
                                filters: [{name: 'Firebot Setups', extensions: ['firebotsetup']}]
                            }
                        }))
                        .then(response => {
                            if (response.path == null) {
                                return;
                            }

                            $ctrl.onFileSelected(response.path);
                        });
                };

                $ctrl.removeImportQuestion = (id) => {
                    $ctrl.setup.importQuestions = $ctrl.setup.importQuestions
                        .filter(q => q.id !== id);
                };

                $ctrl.addImportQuestion = (question) => {
                    utilityService.showModal({
                        component: "addOrEditSetupQuestion",
                        size: 'md',
                        resolveObj: {
                            question: () => question
                        },
                        closeCallback: (question) => {
                            if ($ctrl.setup.importQuestions == null) {
                                $ctrl.setup.importQuestions = [];
                            }
                            if (question) {
                                const index = $ctrl.setup.importQuestions
                                    .findIndex(q => q.id === question.id);
                                if (index > -1) {
                                    $ctrl.setup.importQuestions[index] = question;
                                } else {
                                    $ctrl.setup.importQuestions.push(question);
                                }
                            }
                        }
                    });
                };

                $ctrl.openComponentListModal = (label, allComponents, selectedIds, closeCallback) => {
                    utilityService.showModal({
                        component: "firebotComponentListModal",
                        size: 'sm',
                        resolveObj: {
                            label: () => label,
                            allComponents: () => allComponents,
                            selectedIds: () => selectedIds
                        },
                        closeCallback: closeCallback
                    });
                };
            }
        });
}());
