"use strict";
(function() {

    const uuidv1 = require("uuid/v1");

    angular
        .module('firebotApp')
        .component("effectList", {
            bindings: {
                trigger: "@",
                triggerMeta: "<",
                effects: "<",
                update: '&',
                modalId: "@",
                header: "@",
                headerClasses: "@",
                effectContainerClasses: "@",
                hideNumbers: "<"
            },
            template: `
            <div class="effect-list">
                <div class="flex-row-center jspacebetween effect-list-header">
                    <div class="flex items-center">
                        <h3 class="{{$ctrl.headerClasses}} m-0" style="display:inline;font-weight: 600;">演出</h3>
                        <span class="ml-1" style="font-size: 11px;"><tooltip text="$ctrl.header" ng-if="$ctrl.header"></tooltip></span>
                    </div>

                    <div class="flex items-center">
                        <div class="mr-7" ng-if="$ctrl.getSelectedQueueModeIsCustom()">
                            <div style="font-size: 10px;opacity: 0.8;text-align: right;" aria-label="演出の持続時間： キューがこの演出リストを起動した後、次の演出を実行するまでに待つべき合計時間 (秒)。">
                                演出の持続時間
                                <tooltip role="tooltip" aria-label="The total duration in seconds the queue should wait after triggering this effect list before running the next one." text="'この演出リストを起動してキューにいれた後、次の演出リストを実行するまでの合計時間（秒）。'"></tooltip>
                            </div>
                            <div
                                class="flex justify-end items-center"
                                style="font-size: 12px;"
                                ng-click="$ctrl.openEditQueueDurationModal()"
                                aria-label="演出の持続時間: {{$ctrl.effectsData.queueDuration || 0}} 秒"
                                role="button"
                            >
                                <b>{{$ctrl.effectsData.queueDuration || 0}}</b>s<span class="muted ml-2" style="font-size: 9px;"><i class="fal fa-edit"></i></span>
                            </div>
                        </div>

                        <div class="mr-7" ng-if="$ctrl.validQueueSelected()">
                            <div style="font-size: 10px;opacity: 0.8;text-align: right;" aria-label="Queue Priority: If an effect list has priority, it will get added in front of other lists in the queue that do not have priority.">
                                キューの優先順位
                                <tooltip role="tooltip" aria-label="If an effect list has priority, it will get added in front of other lists in the queue that do not have priority." text="'演出リストに優先順位がある場合、キュー内の優先順位を持たない他のリストの前に追加されます。'"></tooltip>
                            </div>
                            <div class="text-dropdown filter-mode-dropdown" uib-dropdown uib-dropdown-toggle>
                                <a href role="button" class="ddtext" style="font-size: 12px;" aria-label="Selected: {{$ctrl.getSelectedQueuePriority() === 'Yes' ? '高' : 'なし'}}">
                                    {{$ctrl.getSelectedQueuePriority()}}<span class="fb-arrow down ddtext"></span>
                                </a>
                                <ul class="dropdown-menu" uib-dropdown-menu role="menu">
                                    <li role="none">
                                        <a href ng-click="$ctrl.effectsData.queuePriority = 'high'" class="pl-4" role="menuitem" aria-label="高">Yes</a>
                                    </li>
                                    <li role="none">
                                        <a href ng-click="$ctrl.effectsData.queuePriority = 'none'" class="pl-4" role="menuitem" aria-label="なし">No</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="flex flex-col items-end mr-8">
                            <div style="font-size: 10px;opacity: 0.8;text-align: right;">
                                キュー
                                <tooltip role="tooltip" aria-label="演出キューでは、演出が重ならないようにキューに入れて順番に実行することができます。特にイベントに便利です。" text="'演出キューは、演出が重ならないようにキューに入れて順番に実行することができます。特にイベントに役立ちます'"></tooltip>
                            </div>
                            <div class="text-dropdown filter-mode-dropdown" uib-dropdown uib-dropdown-toggle>
                                <a href role="button" class="ddtext" style="font-size: 12px;"> "{{$ctrl.getSelectedEffectQueueName()}}" <span class="fb-arrow down ddtext"></span></a>
                                <ul class="dropdown-menu" uib-dropdown-menu role="menu">
                                    <li role="none">
                                        <a
                                            href
                                            class="pl-4"
                                            ng-click="$ctrl.effectsData.queue = null"
                                            role="menuitem"
                                        >
                                            解除 <tooltip role="tooltip" aria-label="Effects will always play immediately when triggered" text="'演出は起動されると即座に再生されます'"></tooltip>
                                            <span ng-show="$ctrl.effectsData.queue == null" style="color:green;display: inline-block;"><i class="fas fa-check"></i></span>
                                        </a>
                                    </li>

                                    <li ng-repeat="queue in $ctrl.eqs.getEffectQueues() track by queue.id" role="none">
                                        <a href class="pl-4" ng-click="$ctrl.toggleQueueSelection(queue.id)" role="menuitem" aria-label="Queue: {{queue.name}}">
                                            <span>{{queue.name}}</span>
                                            <span ng-show="$ctrl.effectsData.queue === queue.id" style="color:green;display: inline-block;"><i class="fas fa-check"></i></span>
                                        </a>
                                    </li>

                                    <li ng-show="$ctrl.eqs.getEffectQueues().length < 1" role="none">
                                        <a class="muted pl-4" role="menuitem">キューは作成されていません.</a>
                                    </li>

                                    <li role="separator" class="divider"></li>
                                    <li role="none">
                                        <a href class="pl-4" ng-click="$ctrl.showAddEditEffectQueueModal()" role="menuitem">キューを作成</a>
                                    </li>

                                    <li role="none" ng-show="$ctrl.validQueueSelected()">
                                        <a href class="pl-4" ng-click="$ctrl.showAddEditEffectQueueModal($ctrl.effectsData.queue)" role="menuitem">編集："{{$ctrl.getSelectedEffectQueueName()}}"</a>
                                    </li>

                                    <li role="none" ng-show="$ctrl.validQueueSelected()">
                                        <a href class="pl-4" ng-click="$ctrl.showDeleteEffectQueueModal($ctrl.effectsData.queue)" role="menuitem">削除："{{$ctrl.getSelectedEffectQueueName()}}"</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="test-effects-btn clickable" uib-tooltip="演出のテスト実行" aria-label="Test effects" ng-click="$ctrl.testEffects()" role="button">
                            <i class="far fa-play-circle"></i>
                        </div>

                        <div>
                            <a
                                href role="button"
                                aria-label="演出メニューを開く"
                                class="effects-actions-btn"
                                context-menu="$ctrl.createAllEffectsMenuOptions()"
                                context-menu-on="click"
                                uib-tooltip="演出メニューを開く"
                                tooltip-append-to-body="true"
                            >
                                <i class="fal fa-ellipsis-v"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="{{$ctrl.effectContainerClasses}} mx-6 pb-6">
                    <div ui-sortable="$ctrl.sortableOptions" ng-model="$ctrl.effectsData.list">
                        <div ng-repeat="effect in $ctrl.effectsData.list track by $index" context-menu="$ctrl.createEffectMenuOptions(effect)">
                            <div
                                role="button"
                                class="effect-bar clickable-dark"
                                ng-class="{'disabled': !effect.active}"
                                ng-click="$ctrl.openEditEffectModal(effect, $index, $ctrl.trigger, false)"
                                ng-mouseenter="hovering = true"
                                ng-mouseleave="hovering = false">
                                    <span class="pr-4" style="display: inline-block;text-overflow: ellipsis;overflow: hidden;line-height: 20px;white-space: nowrap;">
                                        <span class="muted" ng-hide="$ctrl.hideNumbers === true">{{$index + 1}}. </span>
                                        {{$ctrl.getEffectNameById(effect.type)}}
                                        <span ng-if="effect.effectLabel" class="muted"> ({{effect.effectLabel}})</span>
                                    </span>
                                    <span class="flex-row-center">
                                        <span class="dragHandle flex items-center justify-center" style="height: 38px; width: 15px;" ng-class="{'hiddenHandle': !hovering}" ng-click="$event.stopPropagation()">
                                            <i class="fal fa-bars"></i>
                                        </span>
                                        <div
                                            class="flex items-center justify-center"
                                            style="font-size: 20px;height: 38px;width: 35px;text-align: center;"
                                            ng-click="$event.stopPropagation()"
                                        >
                                            <a
                                                href
                                                class="effects-actions-btn"
                                                aria-label="Open effect menu"
                                                uib-tooltip="Open effect menu"
                                                tooltip-append-to-body="true"
                                                role="button"
                                                context-menu="$ctrl.createEffectMenuOptions(effect)"
                                                context-menu-on="click"
                                                context-menu-orientation="top"
                                            >
                                                <i class="fal fa-ellipsis-v"></i>
                                            </a>
                                        </div>
                                    </span>
                            </div>
                        </div>
                    </div>

                    <div class="add-more-functionality mt-7 ml-5">
                        <a href role="button" class="clickable" ng-click="$ctrl.openNewEffectModal($ctrl.effectsData.list.length)" aria-label="Add new effect">
                            <i class="far fa-plus-circle mr-2"></i>演出の追加
                        </a>
                    </div>
                </div>

            </div>
            `,
            controller: function(utilityService, effectHelperService, objectCopyHelper, effectQueuesService,
                backendCommunicator, ngToast, $http) {
                const ctrl = this;

                ctrl.effectsData = {
                    list: []
                };

                let effectDefinitions = [];

                function createEffectsData() {
                    if (ctrl.effects != null && !Array.isArray(ctrl.effects)) {
                        ctrl.effectsData = ctrl.effects;
                    }
                    if (ctrl.effectsData.list == null) {
                        ctrl.effectsData.list = [];
                    }
                    if (ctrl.effectsData.id == null) {
                        ctrl.effectsData.id = uuidv1();
                    }

                    ctrl.effectsData.list.forEach(e => {
                        if (e.active == null) {
                            e.active = true;
                        }
                    });

                    ctrl.effectsUpdate();
                }

                ctrl.createAllEffectsMenuOptions = () => {
                    const allEffectsMenuOptions = [
                        {
                            html: `<a href role="menuitem"><i class="far fa-copy mr-4"></i> コピー</a>`,
                            click: () => {
                                ctrl.copyEffects();
                            },
                            enabled: ctrl.effectsData.list.length > 0
                        },
                        {
                            html: `<a href role="menuitem"><i class="far fa-paste mr-4"></i> ・ペースト</a>`,
                            click: function () {
                                ctrl.pasteEffects(true);
                            },
                            enabled: ctrl.hasCopiedEffects()
                        },
                        {
                            html: `<a href role="menuitem" style="color: #fb7373;"><i class="far fa-trash-alt mr-4"></i>  すべて削除</a>`,
                            click: function () {
                                ctrl.removeAllEffects();
                            },
                            enabled: ctrl.effectsData.list.length > 0
                        },
                        {
                            html: `<a href role="menuitem"><i class="far fa-share-alt mr-4"></i> 共有</a>`,
                            click: function () {
                                ctrl.shareEffects();
                            },
                            enabled: ctrl.effectsData.list.length > 0,
                            hasTopDivider: true
                        },
                        {
                            html: `<a href ><i class="far fa-cloud-download-alt mr-4"></i> 共有演出を取り込み</a>`,
                            click: function () {
                                ctrl.importSharedEffects();
                            }
                        }
                    ];

                    return allEffectsMenuOptions;
                };

                ctrl.createEffectMenuOptions = (effect) => {
                    const effectMenuOptions = [
                        {
                            html: `<a href ><i class="far fa-tag mr-4"></i> ラベルを編集</a>`,
                            click: function ($itemScope) {
                                const $index = $itemScope.$index;
                                ctrl.editLabelForEffectAtIndex($index);
                            }
                        },
                        {
                            html: `<a href ><i class="far fa-edit mr-4"></i> 演出を編集</a>`,
                            click: function ($itemScope) {
                                const $index = $itemScope.$index;
                                const effect = $itemScope.effect;
                                ctrl.openEditEffectModal(effect, $index, ctrl.trigger, false);
                            }
                        },
                        {
                            html: `<a href ><i class="fal fa-toggle-off mr-4"></i> 有効化の切り替え</a>`,
                            click: function ($itemScope) {
                                const $index = $itemScope.$index;
                                ctrl.toggleEffectActiveState($index);
                            }
                        },
                        {
                            html: `<a href ><i class="far fa-clone mr-4"></i> 複製</a>`,
                            click: function ($itemScope) {
                                const $index = $itemScope.$index;
                                ctrl.duplicateEffectAtIndex($index);
                            }
                        },
                        {
                            html: `<a href ><i class="far fa-copy mr-4"></i> コピー</a>`,
                            click: function ($itemScope) {
                                const $index = $itemScope.$index;
                                ctrl.copyEffectAtIndex($index);
                            }
                        },
                        {
                            html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt mr-4"></i> 削除</a>`,
                            click: function ($itemScope) {
                                const $index = $itemScope.$index;
                                ctrl.removeEffectAtIndex($index);
                            }
                        },
                        {
                            text: "貼り付け...",
                            hasTopDivider: true,
                            enabled: ctrl.hasCopiedEffects(),
                            children: [
                                {
                                    html: `<a href><i class="far fa-paste mr-4"></i> 前に</a>`,
                                    click: function ($itemScope) {
                                        const $index = $itemScope.$index;
                                        if (ctrl.hasCopiedEffects()) {
                                            ctrl.pasteEffectsAtIndex($index, true);
                                        }
                                    }
                                },
                                {
                                    html: `<a href><i class="far fa-paste mr-4"></i> 後に</a>`,
                                    click: function ($itemScope) {
                                        const $index = $itemScope.$index;
                                        if (ctrl.hasCopiedEffects()) {
                                            ctrl.pasteEffectsAtIndex($index, false);
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            text: "新規...",
                            children: [
                                {
                                    html: `<a href><i class="far fa-plus mr-4"></i> 前に</a>`,
                                    click: function ($itemScope) {
                                        const $index = $itemScope.$index;
                                        ctrl.openNewEffectModal($index - 1);
                                    }
                                },
                                {
                                    html: `<a href><i class="far fa-plus mr-4"></i> 後に</a>`,
                                    click: function ($itemScope) {
                                        const $index = $itemScope.$index;
                                        ctrl.openNewEffectModal($index);
                                    }
                                }
                            ]
                        }
                    ];

                    return effectMenuOptions;
                };

                ctrl.shareEffects = async () => {
                    const shareCode = await backendCommunicator.fireEventAsync("getEffectsShareCode", ctrl.effectsData.list);
                    if (shareCode == null) {
                        ngToast.create("共有演出を有効にできません");
                    } else {
                        utilityService.showModal({
                            component: "copyShareCodeModal",
                            size: 'sm',
                            resolveObj: {
                                shareCode: () => shareCode,
                                title: () => "演出の共有コード",
                                message: () => "他の人がこれらの演出を取り込むには、以下のコードを共有してください。"
                            }
                        });
                    }
                };

                function getSharedEffects(code) {
                    return $http.get(`https://bytebin.lucko.me/${code}`)
                        .then(resp => {
                            if (resp.status === 200) {
                                return JSON.parse(unescape(JSON.stringify(resp.data)));
                            }
                            return null;
                        }, () => {
                            return null;
                        });
                }

                ctrl.importSharedEffects = () => {
                    utilityService.openGetInputModal(
                        {
                            model: "",
                            label: "共有演出を受信するためのコードを入力",
                            saveText: "追加する",
                            inputPlaceholder: "コードの入力",
                            validationFn: (shareCode) => {
                                return new Promise(async resolve => {
                                    if (shareCode == null || shareCode.trim().length < 1) {
                                        resolve(false);
                                    }

                                    const effectsData = await getSharedEffects(shareCode);

                                    if (effectsData == null || effectsData.effects == null) {
                                        resolve(false);
                                    } else {
                                        resolve(true);
                                    }
                                });
                            },
                            validationText: "有効な演出コードではない."

                        },
                        async (shareCode) => {
                            const effectsData = await getSharedEffects(shareCode);
                            if (effectsData.effects != null) {
                                ctrl.effectsData.list = ctrl.effectsData.list.concat(effectsData.effects);
                            }
                        });
                };

                // when the element is initialized
                ctrl.$onInit = async function() {
                    createEffectsData();
                    effectDefinitions = await effectHelperService.getAllEffectDefinitions();
                };

                ctrl.getEffectNameById = id => {
                    if (!effectDefinitions || effectDefinitions.length < 1) {
                        return "";
                    }

                    return effectDefinitions.find(e => e.id === id).name;
                };

                ctrl.$onChanges = function() {
                    createEffectsData();
                };

                ctrl.effectsUpdate = function() {
                    ctrl.update({ effects: ctrl.effectsData });
                };

                ctrl.effectTypeChanged = function(effectType, index) {
                    ctrl.effectsData.list[index].type = effectType.id;
                };
                ctrl.testEffects = function() {
                    ipcRenderer.send('runEffectsManually', { effects: ctrl.effectsData });
                };

                ctrl.getLabelButtonTextForLabel = function(labelModel) {
                    if (labelModel == null || labelModel.length === 0) {
                        return "ラベルの追加";
                    }
                    return "ラベルの編集";
                };

                ctrl.editLabelForEffectAtIndex = function(index) {
                    const effect = ctrl.effectsData.list[index];
                    const label = effect.effectLabel;
                    utilityService.openGetInputModal(
                        {
                            model: label,
                            label: ctrl.getLabelButtonTextForLabel(label),
                            saveText: "ラベルを保存"
                        },
                        (newLabel) => {
                            if (newLabel == null || newLabel.length === 0) {
                                effect.effectLabel = null;
                            } else {
                                effect.effectLabel = newLabel;
                            }
                        });
                };

                ctrl.toggleEffectActiveState = (index) => {
                    const effect = ctrl.effectsData.list[index];
                    effect.active = !effect.active;
                };

                ctrl.duplicateEffectAtIndex = function(index) {
                    const effect = JSON.parse(angular.toJson(ctrl.effectsData.list[index]));
                    effect.id = uuidv1();
                    ctrl.effectsData.list.splice(index + 1, 0, effect);
                    ctrl.effectsUpdate();
                };

                ctrl.sortableOptions = {
                    handle: ".dragHandle",
                    stop: () => {
                        ctrl.effectsUpdate();
                    }
                };

                ctrl.removeEffectAtIndex = function(index) {
                    ctrl.effectsData.list.splice(index, 1);
                    ctrl.effectsUpdate();
                };

                ctrl.removeAllEffects = function() {
                    ctrl.effectsData.list = [];
                    ctrl.effectsUpdate();
                };

                ctrl.hasCopiedEffects = function() {
                    return objectCopyHelper.hasCopiedEffects();
                };

                ctrl.pasteEffects = async function(append = false) {
                    if (objectCopyHelper.hasCopiedEffects()) {
                        if (append) {
                            ctrl.effectsData.list = ctrl.effectsData.list.concat(
                                await objectCopyHelper.getCopiedEffects(ctrl.trigger, ctrl.triggerMeta)
                            );
                        } else {
                            ctrl.effectsData.list = await objectCopyHelper.getCopiedEffects(ctrl.trigger, ctrl.triggerMeta);
                        }
                        ctrl.effectsUpdate();
                    }
                };

                ctrl.pasteEffectsAtIndex = async (index, above) => {
                    if (objectCopyHelper.hasCopiedEffects()) {
                        if (!above) {
                            index++;
                        }
                        const copiedEffects = await objectCopyHelper.getCopiedEffects(ctrl.trigger, ctrl.triggerMeta);
                        ctrl.effectsData.list.splice(index, 0, ...copiedEffects);
                        ctrl.effectsUpdate();
                    }
                };

                ctrl.copyEffectAtIndex = function(index) {
                    objectCopyHelper.copyEffects([ctrl.effectsData.list[index]]);
                };

                ctrl.copyEffects = function() {
                    objectCopyHelper.copyEffects(ctrl.effectsData.list);
                };

                ctrl.openNewEffectModal = index => {
                    utilityService.showModal({
                        component: "addNewEffectModal",
                        backdrop: true,
                        windowClass: "no-padding-modal",
                        resolveObj: {
                            trigger: () => ctrl.trigger,
                            triggerMeta: () => ctrl.triggerMeta
                        },
                        closeCallback: resp => {
                            if (resp == null) {
                                return;
                            }

                            const { selectedEffectDef } = resp;

                            const newEffect = {
                                id: uuidv1(),
                                type: selectedEffectDef.id,
                                active: true
                            };

                            if (index == null) {
                                ctrl.openEditEffectModal(newEffect, null, ctrl.trigger, true);
                                return;
                            }

                            ctrl.openEditEffectModal(newEffect, index, ctrl.trigger, true);
                        }
                    });
                };

                ctrl.openEditEffectModal = (effect, index, trigger, isNew) => {
                    utilityService.showEditEffectModal(effect, index, trigger, response => {
                        if (response.action === "add") {
                            ctrl.effectsData.list.splice(index + 1, 0, response.effect);
                        } else if (response.action === "update") {
                            ctrl.effectsData.list[response.index] = response.effect;
                        } else if (response.action === "delete") {
                            ctrl.removeEffectAtIndex(response.index);
                        }
                        ctrl.effectsUpdate();
                    }, ctrl.triggerMeta, isNew);
                };

                //effect queue

                ctrl.eqs = effectQueuesService;

                ctrl.getSelectedEffectQueueName = () => {
                    const unsetDisplay = "未設定";
                    if (ctrl.effectsData.queue == null) {
                        return unsetDisplay;
                    }

                    const queue = effectQueuesService.getEffectQueue(ctrl.effectsData.queue);
                    if (queue == null) {
                        return unsetDisplay;
                    }

                    return queue.name;
                };

                ctrl.getSelectedQueuePriority = () => {
                    const priority = ctrl.effectsData.queuePriority;
                    return priority === 'high' ? 'はい' : 'いいえ';
                };

                ctrl.getSelectedQueueModeIsCustom = () => {
                    if (ctrl.effectsData.queue == null) {
                        return false;
                    }

                    const queue = effectQueuesService.getEffectQueue(ctrl.effectsData.queue);
                    if (queue == null) {
                        return false;
                    }

                    return queue.mode === "custom";
                };

                ctrl.toggleQueueSelection = (queueId) => {
                    if (ctrl.effectsData.queue !== queueId) {
                        ctrl.effectsData.queue = queueId;
                    } else {
                        ctrl.effectsData.queue = null;
                    }
                };

                ctrl.validQueueSelected = () => {
                    if (ctrl.effectsData.queue == null) {
                        return false;
                    }

                    const queue = effectQueuesService.getEffectQueue(ctrl.effectsData.queue);
                    return queue != null;
                };

                ctrl.showAddEditEffectQueueModal = (queueId) => {
                    effectQueuesService.showAddEditEffectQueueModal(queueId)
                        .then(id => {
                            ctrl.effectsData.queue = id;
                        });
                };

                ctrl.showDeleteEffectQueueModal = (queueId) => {
                    effectQueuesService.showDeleteEffectQueueModal(queueId)
                        .then(confirmed => {
                            if (confirmed) {
                                ctrl.effectsData.queue = undefined;
                            }
                        });
                };

                ctrl.openEditQueueDurationModal = () => {
                    utilityService.openGetInputModal(
                        {
                            model: ctrl.effectsData.queueDuration || 0,
                            label: "時間の編集",
                            saveText: "保存",
                            inputPlaceholder: "秒数を入力",
                            validationFn: (value) => {
                                return new Promise(resolve => {
                                    if (value == null || value < 0) {
                                        return resolve(false);
                                    }
                                    resolve(true);
                                });
                            },
                            validationText: "数字は０より大きい必要があります."

                        },
                        (newDuration) => {
                            ctrl.effectsData.queueDuration = newDuration;
                        }
                    );
                };

            }
        });
}());
