"use strict";

/** @import { FirebotSetup } from "../../../../../types/setups" */

(function() {
    const sanitizeFileName = require("sanitize-filename");
    angular.module("firebotApp")
        .component("createSetupModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">新しいセットアップを作成</h4>
                </div>
                <div class="modal-body">
                    <h3>名前</h3>
                    <input type="text" class="form-control" ng-model="$ctrl.setup.name" placeholder="名前を入力">

                    <h3>説明</h3>
                    <textarea type="text" class="form-control" rows="3" ng-model="$ctrl.setup.description" placeholder="説明を入力（Markdown対応）"></textarea>

                    <h3>バージョン</h3>
                    <input type="number" class="form-control" ng-model="$ctrl.setup.version" placeholder="バージョンを入力">

                    <h3>コンポーネント</h3>
                    <p class="muted">この Firebot セットアップに含めるコンポーネントを選択してください。</p>
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
                        <label class="control-fb control--checkbox" style="margin-bottom: 0px; font-size: 13px;opacity.0.9;"> インポート前にユーザーへ通貨選択を必須化 <tooltip text="'インポート前に、ユーザー自身の通貨から1つを選択してもらいます。含まれるコンポーネント内の通貨エフェクト・変数・制限は選択された通貨を使うよう更新されます。チャットゲームに便利です。'"></tooltip>
                            <input type="checkbox" ng-model="$ctrl.setup.requireCurrency">
                            <div class="control__indicator"></div>
                        </label>
                    </div>

                    <h3>インポート質問 <tooltip text="'このセットアップをインポートする前に、ユーザーがこれらの質問に回答する必要があります。Firebot は指定されたトークンを自動的にユーザーの回答へ置換します。'"/></h3>
                    <div>
                        <div>
                            <div ng-repeat="question in $ctrl.setup.importQuestions track by question.id" class="list-item selectable" ng-click="$ctrl.addImportQuestion(question)">
                                <div uib-tooltip="クリックして編集" style="font-weight: 400;">
                                    <div><b>質問:</b> {{question.question}}</div>
                                    <div><b>置換トークン:</b> {{question.replaceToken}}</div>
                                    <div ng-show="question.defaultAnswer"><b>デフォルト回答:</b> {{question.defaultAnswer}}</div>
                                </div>
                                <span class="clickable" style="color: #fb7373;" ng-click="$ctrl.removeImportQuestion(question.id);$event.stopPropagation();" aria-label="項目を削除">
                                    <i class="fad fa-trash-alt" aria-hidden="true"></i>
                                </span>
                            </div>
                        </div>
                        <button class="filter-bar" ng-click="$ctrl.addImportQuestion()" uib-tooltip="インポート質問を追加" tooltip-append-to-body="true">
                            <i class="far fa-plus"></i>
                        </button>
                    </div>

                    <div style="margin-top: 20px;">
                        <div class="alert alert-warning" role="alert" style="opacity: 0.8;margin-bottom: 0;"><b>警告!</b> エフェクト内で参照されるメディアファイル（画像、動画、音声、カスタムスクリプトなど）は、このセットアップに<b>含まれません</b>。</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default pull-left" ng-click="$ctrl.loadPreviousSetup()">前回の設定を読み込む</button>
                    <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">セットアップを作成</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function(commandsService, countersService, currencyService,
                effectQueuesService, eventsService, hotkeyService, presetEffectListsService,
                timerService, scheduledTaskService, viewerRolesService, quickActionsService, variableMacroService, viewerRanksService, accountAccess, utilityService,
                ngToast, backendCommunicator, sortTagsService, overlayWidgetsService, settingsService) {

                const $ctrl = this;

                $ctrl.components = [
                    {
                        label: "コマンド",
                        all: commandsService.getCustomCommands(),
                        nameField: "trigger",
                        key: "commands"
                    },
                    {
                        label: "カウンター",
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
                        label: "エフェクトキュー",
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
                        all: hotkeyService.hotkeys,
                        nameField: "name",
                        key: "hotkeys"
                    },
                    {
                        label: "オーバーレイウィジェット",
                        all: overlayWidgetsService.overlayWidgetConfigs,
                        nameField: "name",
                        key: "overlayWidgetConfigs"
                    },
                    {
                        label: "プリセットエフェクトリスト",
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
                        label: "スケジュール済みエフェクトリスト",
                        all: scheduledTaskService.getScheduledTasks(),
                        nameField: "name",
                        key: "scheduledTasks"
                    },
                    {
                        label: "変数マクロ",
                        all: variableMacroService.macros,
                        nameField: "name",
                        key: "variableMacros"
                    },
                    {
                        label: "視聴者ロール",
                        all: viewerRolesService.getCustomRoles(),
                        nameField: "name",
                        key: "viewerRoles"
                    },
                    {
                        label: "視聴者ランクラダー",
                        all: viewerRanksService.rankLadders,
                        nameField: "name",
                        key: "viewerRankLadders"
                    },
                    {
                        label: "クイックアクション",
                        all: quickActionsService.quickActions.filter(qa => qa.type === "custom"),
                        nameField: "name",
                        key: "quickActions"
                    },
                    {
                        label: "グローバル値",
                        all: settingsService.getSetting("GlobalValues", true).map(v => ({
                            id: `GlobalValue:${v.name}`,
                            ...v
                        })),
                        nameField: "name",
                        key: "globalValues"
                    }
                ];

                $ctrl.addOrEditComponent = (componentConfig) => {
                    const components = componentConfig.all.map((c) => {
                        return {
                            id: c.id,
                            name: c[componentConfig.nameField],
                            tags: sortTagsService.getSortTagsForItem(componentConfig.key, c.sortTags).map(st => st.name)
                        };
                    });
                    const selectedIds = $ctrl.setup.components[componentConfig.key].map(c => c.id);
                    $ctrl.openComponentListModal(componentConfig.label, components, selectedIds, (newSelectedIds) => {
                        $ctrl.setup.components[componentConfig.key] = componentConfig.all.filter(c => newSelectedIds.includes(c.id));
                    });
                };

                /** @type { FirebotSetup } */
                $ctrl.setup = {
                    name: "",
                    description: "",
                    version: 1,
                    author: accountAccess.accounts.streamer.loggedIn ?
                        accountAccess.accounts.streamer.username : "Unknown",
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
                        scheduledTasks: [],
                        variableMacros: [],
                        viewerRoles: [],
                        viewerRankLadders: [],
                        quickActions: [],
                        overlayWidgetConfigs: [],
                        globalValues: []
                    },
                    requireCurrency: false,
                    importQuestions: []
                };

                $ctrl.save = async () => {
                    if ($ctrl.setup.name == null || $ctrl.setup.name === "") {
                        ngToast.create("セットアップ名を入力してください。");
                        return;
                    }

                    if ($ctrl.setup.description == null || $ctrl.setup.description === "") {
                        ngToast.create("セットアップの説明を入力してください。");
                        return;
                    }

                    if ($ctrl.setup.version == null || $ctrl.setup.version <= 0) {
                        ngToast.create("セットアップのバージョンは 0 より大きい値を指定してください。");
                        return;
                    }

                    if (Object.values($ctrl.setup.components)
                        .every(array => array == null || array.length < 1)) {
                        ngToast.create("少なくとも1つのコンポーネントを選択してください。");
                        return;
                    }

                    /**@type {Electron.SaveDialogOptions} */
                    const saveDialogOptions = {
                        buttonLabel: "セットアップを保存",
                        defaultPath: `${sanitizeFileName($ctrl.setup.name)}.firebotsetup`,
                        title: "セットアップファイルを保存",
                        filters: [
                            { name: "Firebot セットアップファイル", extensions: ['firebotsetup'] }
                        ],
                        properties: ["showOverwriteConfirmation", "createDirectory"]
                    };

                    const dialogResponse = await backendCommunicator.fireEventAsync("show-save-dialog", {
                        options: saveDialogOptions
                    });

                    if (dialogResponse.canceled) {
                        return;
                    }

                    const success = await backendCommunicator.fireEventAsync("setups:create-setup", {
                        setupFilePath: dialogResponse.filePath,
                        setup: angular.copy($ctrl.setup)
                    });

                    if (success) {
                        ngToast.create({
                            className: 'success',
                            content: 'Firebot セットアップを保存しました！'
                        });
                        $ctrl.close();
                    } else {
                        ngToast.create({
                            className: 'error',
                            content: 'Firebot セットアップの保存に失敗しました。'
                        });
                    }
                };

                $ctrl.$onInit = () => {};

                $ctrl.onFileSelected = async (filepath) => {
                    /** @type {import("../../../../../backend/setups/setup-manager").LoadSetupResult} */
                    const result = await backendCommunicator.fireEventAsync("setups:load-setup", filepath);

                    if (result.success) {
                        for (const [componentKey, componentList] of Object.entries(result.setup.components)) {
                            const componentConfig = $ctrl.components.find(c => c.key === componentKey);
                            if (!componentConfig) {
                                continue;
                            }

                            result.setup.components[componentConfig.key] = componentConfig.all
                                .filter(c => componentList.some(cy => cy.id === c.id));
                        }
                        $ctrl.setup = result.setup;
                    } else {
                        ngToast.create("前回の Firebot セットアップを読み込めませんでした。");
                    }
                };

                $ctrl.loadPreviousSetup = async () => {
                    const response = await backendCommunicator.fireEventAsync("open-file-browser", {
                        options: {
                            filters: [{ name: 'Firebot セットアップ', extensions: ['firebotsetup'] }]
                        }
                    });

                    if (response.path == null) {
                        return;
                    }

                    $ctrl.onFileSelected(response.path);
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
})();
