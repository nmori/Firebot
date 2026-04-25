"use strict";

import { sanitize } from "dompurify";
import { marked } from "marked";

import type {
    FirebotComponent,
    EffectList,
    EffectType,
    EffectHelperService,
    EffectInstance,
    SettingsService,
    NgToast,
    FirebotRootScope,
    ModalService,
    EffectDefinition,
    TriggerType,
    ModalFactory,
    ObjectCopyHelper,
    BackendCommunicator,
    PresetEffectListsService,
    EffectListRunMode
} from "../../../../../types";

type Bindings = {
    trigger?: TriggerType;
    triggerMeta: {
        rootEffects?: EffectList;
        presetListArgs?: Array<{
            name: string;
        }>;
        [x: string]: unknown;
    };
    effects: EffectList;
    update: (args: { effects: EffectList }) => void;
    modalId: string;
    header: string;
    mode?: EffectListRunMode;
    weighted?: boolean;
    dontRepeatUntilAllUsed?: boolean;
};

type Controller = {
    effectsData: EffectList;
    effectsUpdate: () => void;
    keyboardDragIndex: number | null;
    keyboardDragEffectId: string | null;
    keyboardOriginalEffects: EffectInstance[] | null;
    effectDefaultLabels: { [effectId: string]: string };
    showBottomPanel: (effect: EffectInstance) => boolean;
    openNewEffectModal: (index?: number) => void;
    getEffectLabel: (effect: EffectInstance) => string | undefined;
    getEffectComment: (effect: EffectInstance) => unknown;
    removeEffectAtIndex: (index: number) => void;
    removeAllEffects: () => void;
    openEditEffectModal: (effect: EffectInstance, index: number | null, trigger: TriggerType, isNew: boolean) => void;
    sortableOptions: {
        handle: string;
        'ui-floating': boolean;
        stop: () => void;
    };
    getEffectNameById: (id: string) => string;
    getEffectDefinitionById: (id: string) => EffectDefinition | undefined;
    isCommentEffect: (effect: EffectInstance) => boolean;
    isNoOpEffect: (effect: EffectInstance) => boolean;
    editLabelForEffectAtIndex: (index: number) => void;
    editTimeoutForEffectAtIndex: (index: number) => void;
    duplicateEffectAtIndex: (index: number) => void;
    hasCopiedEffects: () => boolean;
    pasteEffects: (append?: boolean) => void;
    pasteEffectsAtIndex: (index: number, above: boolean) => void;
    copyEffectAtIndex: (index: number) => void;
    copyEffects: () => void;
    moveEffectAtIndex: (fromIndex: number, toIndex: number) => void;
    handleEffectKeydown: (event: KeyboardEvent, index: number) => void;
    getPercentChanceForEffect: (effect: EffectInstance) => string;
    openSetTargetChancePercentageModal: (effect: EffectInstance) => void;
    testEffects: () => void;
    allEffectsMenuOptions: Array<unknown>;
    effectContextMenuOptions: Array<unknown>;
};

type ContextMenuItemScope = {
    $index: number;
    effect: EffectInstance;
};

(function () {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { randomUUID } = require("crypto");

    const effectList: FirebotComponent<Bindings, Controller> = {
        bindings: {
            trigger: "@?",
            triggerMeta: "<",
            effects: "<",
            update: "&",
            modalId: "@",
            header: "@",
            mode: "@?",
            weighted: "<?",
            dontRepeatUntilAllUsed: "<?"
        },
        template: `
            <div class="effect-list">
                <div class="flex-row-center jspacebetween effect-list-header">
                    <div class="flex items-center">
                        <h3 class="m-0" style="display:inline;font-weight: 600;font-size: 20px;">エフェクト管理</h3>
                        <span class="ml-1" style="font-size: 11px;"><tooltip text="$ctrl.header" ng-if="$ctrl.header"></tooltip></span>
                    </div>

                    <div class="flex items-center">
                        <div class="test-effects-btn clickable" uib-tooltip="エフェクトをテスト" aria-label="エフェクトをテスト" ng-click="$ctrl.testEffects()" role="button">
                            <i class="far fa-play-circle"></i>
                        </div>

                        <div>
                            <a
                                href role="button"
                                aria-label="エフェクトメニューを開く"
                                class="effects-actions-btn"
                                style="justify-content: flex-start;"
                                context-menu="$ctrl.allEffectsMenuOptions"
                                context-menu-on="click"
                                uib-tooltip="エフェクトメニューを開く"
                                tooltip-append-to-body="true"
                            >
                                <i class="fal fa-ellipsis-v"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <queue-panel effects-data="$ctrl.effectsData" on-update="$ctrl.effectsUpdate()"></queue-panel>

                <mode-panel effects-data="$ctrl.effectsData" on-update="$ctrl.effectsUpdate()" disabled="$ctrl.mode != null"></mode-panel>

                <div class="mx-6 pb-6">
                    <div ui-sortable="$ctrl.sortableOptions" ng-model="$ctrl.effectsData.list" class="effect-list-container" ng-class="{'show-connectors': $ctrl.effectsData.runMode === 'all', 'show-dividers': $ctrl.effectsData.runMode === 'random' || $ctrl.effectsData.runMode === 'sequential'}">
                        <div ng-repeat="effect in $ctrl.effectsData.list track by $index">
                            <div
                                context-menu="$ctrl.effectContextMenuOptions"
                                class="effect-list-item"
                                ng-class="{'is-first': $index === 0, 'is-last': $index === $ctrl.effectsData.list.length - 1, 'kb-dragging': $ctrl.keyboardDragIndex === $index }"
                                tabindex="0"
                                ng-keydown="$ctrl.handleEffectKeydown($event, $index)"
                            >

                                <div
                                    class="effect-item"
                                    ng-class="{'disabled': !effect.active, 'has-bottom-panel': $ctrl.showBottomPanel(effect), 'comment': $ctrl.isCommentEffect(effect)}"
                                >
                                    <div class="effect-drag-handle dragHandle">
                                        <i class="fas fa-grip-vertical"></i>
                                    </div>
                                    <effect-icon effect-id="effect.type" effect-definition="$ctrl.getEffectDefinitionById(effect.type)"></effect-icon>
                                    <div class="pr-4 flex flex-col justify-center" style="text-overflow: ellipsis;overflow: hidden;flex-grow: 1;">
                                        <div class="flex items-center">
                                            <div class="effect-name truncate">
                                                {{$ctrl.getEffectNameById(effect.type)}}
                                            </div>
                                            <span ng-if="!effect.active" class="effect-disabled-label">無効</span>
                                        </div>
                                        <div ng-if="$ctrl.getEffectLabel(effect)" class="muted truncate" style="font-size: 12px;">{{$ctrl.getEffectLabel(effect)}}</div>
                                    </div>
                                    <span class="flex-row-center" style="flex-shrink: 0;">
                                        <div
                                            ng-if="effect.async"
                                            uib-tooltip="このエフェクトは非同期で実行されます。次のエフェクトは完了を待たずに開始されます。"
                                            tooltip-append-to-body="true"
                                            class="effect-async-badge mr-5"
                                            aria-label="非同期エフェクト"
                                        >
                                            <div>ASYNC</div>
                                        </div>
                                        <button
                                            ng-if="effect.abortTimeout && effect.abortTimeout > 0"
                                            uib-tooltip="中断タイムアウト"
                                            tooltip-append-to-body="true"
                                            class="effect-timeout-btn mr-5"
                                            aria-label="エフェクト中断タイムアウト: {{effect.abortTimeout}} 秒"
                                            role="button"
                                            ng-click="$ctrl.editTimeoutForEffectAtIndex($index)"
                                        >
                                            <i class="fas fa-stopwatch" aria-hidden="true"></i>
                                            <div class="ml-1">{{effect.abortTimeout}}s</div>
                                        </button>
                                        <button
                                            class="effect-edit-btn"
                                            ng-click="$ctrl.openEditEffectModal(effect, $index, $ctrl.trigger, false)"
                                            aria-label="エフェクトを編集"
                                            uib-tooltip="エフェクトを編集"
                                            tooltip-append-to-body="true"
                                        >
                                            <i class="fas fa-pen"></i>
                                        </button>
                                        <div
                                            class="flex items-center justify-center"
                                            style="font-size: 20px;height: 38px;width: 35px;text-align: center;"
                                        >
                                            <a
                                                href
                                                class="effects-actions-btn"
                                                aria-label="エフェクトメニューを開く"
                                                uib-tooltip="エフェクトメニューを開く"
                                                tooltip-append-to-body="true"
                                                role="button"
                                                context-menu="$ctrl.effectContextMenuOptions"
                                                context-menu-on="click"
                                                context-menu-orientation="top"
                                            >
                                                <i class="fal fa-ellipsis-v"></i>
                                            </a>
                                        </div>
                                    </span>
                                </div>

                                <div ng-if="!!$ctrl.getEffectNameById(effect.type) && $ctrl.showBottomPanel(effect)" class="effect-bottom-panel" ng-class="{'comment': $ctrl.isCommentEffect(effect)}">
                                    <!-- Weighted Effect Panel -->
                                    <div ng-if="!$ctrl.isCommentEffect(effect)" class="flex items-center" style="width: 100%;">
                                        <div class="volume-slider-wrapper small-slider" style="flex-grow: 1">
                                            <i class="fas fa-balance-scale-left mr-5 muted" uib-tooltip="重み（左右で割合を微調整）"></i>
                                            <rzslider rz-slider-model="effect.percentWeight" rz-slider-options="{floor: 0.0001, ceil: 1.0, step: 0.0001, precision: 4, hideLimitLabels: true, hidePointerLabels: true, showSelectionBar: true}"></rzslider>
                                        </div>
                                        <div class="ml-5 mr-5" style="width: 1px;height: 70%;background: rgb(255 255 255 / 25%);border-radius: 2px;flex-grow: 0; flex-shrink: 0;"></div>
                                        <div
                                            class="clickable flex items-center"
                                            style="padding: 2px 6px; border-radius: 4px;"
                                            uib-tooltip="クリックして確率(%)を直接設定"
                                            tooltip-append-to-body="true"
                                            ng-click="$ctrl.openSetTargetChancePercentageModal(effect)"
                                            role="button"
                                            aria-label="確率を直接設定"
                                        >
                                            <i class="fas fa-dice mr-2"></i>
                                            <span style="font-family: monospace; font-size: 16px; font-weight: 600; min-width: 70px; display: inline-block; text-align: end;">{{$ctrl.getPercentChanceForEffect(effect)}}%</span>
                                            <i class="fas fa-edit ml-2 muted"></i>
                                        </div>
                                    </div>
                                    <!-- Comment Effect Panel -->
                                    <div ng-if="effect.effectComment" ng-bind-html="$ctrl.getEffectComment(effect) || 'コメントがありません'" />
                                </div>

                                <div ng-if="($ctrl.effectsData.runMode === 'random' || $ctrl.effectsData.runMode === 'sequential') && !$last" class="effect-divider" ng-class="{'is-dragging': $ctrl.keyboardDragIndex != null}"></div>
                            </div>
                        </div>
                    </div>

                    <div ng-if="($ctrl.effectsData.runMode === 'random' || $ctrl.effectsData.runMode === 'sequential') && $ctrl.effectsData.list.length > 0" class="effect-divider"></div>

                    <div class="effect-list-add-btn-wrapper" ng-class="{'show-connector': $ctrl.effectsData.runMode === 'all' && $ctrl.effectsData.list.length > 0}">
                        <button
                            type="button"
                            class="effect-list-add-btn"
                            ng-click="$ctrl.openNewEffectModal($ctrl.effectsData.list.length)"
                            aria-label="新しいエフェクトを追加"
                        >
                            <span class="effect-list-add-btn__icon-wrapper">
                                <i class="far fa-plus"></i>
                            </span>
                            <span class="effect-list-add-btn__label">
                                エフェクトを追加
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        `,
        controller: function (
            $q: angular.IQService,
            $rootScope: FirebotRootScope,
            $scope: angular.IScope,
            $sce: angular.ISCEService,
            $http: angular.IHttpService,
            $injector: angular.auto.IInjectorService,
            effectHelperService: EffectHelperService,
            settingsService: SettingsService,
            modalService: ModalService,
            modalFactory: ModalFactory,
            ngToast: NgToast,
            objectCopyHelper: ObjectCopyHelper,
            backendCommunicator: BackendCommunicator,
            presetEffectListsService: PresetEffectListsService
        ) {
            const $ctrl = this;

            let effectTypes: EffectType[] = [];

            $ctrl.effectsData = {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                id: randomUUID(),
                list: [],
                runMode: "all"
            };

            $ctrl.keyboardDragIndex = null;
            $ctrl.keyboardDragEffectId = null;
            $ctrl.keyboardOriginalEffects = null;

            $ctrl.sortableOptions = {
                handle: ".dragHandle",
                'ui-floating': false,
                stop: () => {
                    $ctrl.effectsUpdate();
                }
            };

            //#region Default Labels
            $ctrl.effectDefaultLabels = {};

            async function getDefaultLabels() {
                const effects = $ctrl.effectsData?.list ?? [];

                const promises: Promise<{ id: string, defaultLabel?: string }>[] = [];
                for (const effect of effects) {
                    if (!effect?.id) {
                        continue;
                    }

                    const effectType = effectTypes.find(e => e.definition.id === effect.type);

                    if (!effectType?.getDefaultLabel) {
                        continue;
                    }

                    const promise = Promise.resolve(
                        $injector.invoke(
                            effectType.getDefaultLabel,
                            {},
                            {
                                effect: effect
                            }
                        )
                    )
                        .then((label) => {
                            return {
                                id: effect.id,
                                defaultLabel: label
                            };
                        })
                        .catch(() => {
                            return {
                                id: effect.id,
                                defaultLabel: null
                            };
                        });

                    promises.push(promise);
                }

                return $q.when(
                    Promise.all(promises).then((results) => {
                        return results.reduce((acc, result) => {
                            if (result?.id && result?.defaultLabel != null) {
                                acc[result.id] = result.defaultLabel;
                            }
                            return acc;
                        }, {});
                    })
                );
            }

            function updateDefaultLabels() {
                void getDefaultLabels().then((labels) => {
                    $ctrl.effectDefaultLabels = labels;
                });
            }

            $ctrl.getEffectLabel = (effect: EffectInstance) => {
                if (effect.effectLabel?.length) {
                    return effect.effectLabel;
                }

                if (effect?.id && settingsService.getSetting("DefaultEffectLabelsEnabled")) {
                    const defaultLabel = $ctrl.effectDefaultLabels[effect.id];

                    if (defaultLabel != null) {
                        return defaultLabel;
                    }
                }
                return;
            };

            $ctrl.getEffectComment = (effect: EffectInstance) => {
                if (effect.effectComment?.length) {
                    return $sce.trustAsHtml(sanitize(marked.parseInline(effect.effectComment) as string));
                }

                return;
            };

            $ctrl.getEffectNameById = (id: string) => {
                if (!effectTypes || effectTypes.length < 1) {
                    return "";
                }

                return effectTypes.find(e => e.definition.id === id)?.definition?.name ?? `不明なエフェクト: ${id}`;
            };

            $ctrl.getEffectDefinitionById = (id: string) => {
                if (!effectTypes || effectTypes.length < 1) {
                    return undefined;
                }

                return effectTypes.find(e => e.definition.id === id)?.definition;
            };

            $ctrl.isCommentEffect = (effect: EffectInstance) => {
                return effect.type === "firebot:comment";
            };
            //#endregion

            //#region Weighted Effects

            $ctrl.isNoOpEffect = (effect: EffectInstance) => {
                const effectType = effectTypes.find(e => e.definition.id === effect.type);
                return effectType?.definition?.isNoOp === true;
            };

            $ctrl.showBottomPanel = (effect: EffectInstance) => {
                return ($ctrl.effectsData.weighted && effect?.active) || $ctrl.isCommentEffect(effect);
            };

            function ensureDefaultWeights(reset = false) {
                $ctrl.effectsData.list.forEach((e) => {
                    if (!$ctrl.effectsData.weighted) {
                        e.percentWeight = null;
                    } else if (e.percentWeight == null || reset) {
                        e.percentWeight = 0.5;
                    }
                });
            }

            const getSumOfAllWeights = () => {
                ensureDefaultWeights();
                const sumOfAllWeights = $ctrl
                    .effectsData.list
                    .filter(e => e.active && !$ctrl.isNoOpEffect(e))
                    .reduce((acc, e) => acc + (e.percentWeight ?? 0.5), 0);
                return sumOfAllWeights;
            };

            $ctrl.getPercentChanceForEffect = (effect: EffectInstance) => {
                const sumOfAllWeights = getSumOfAllWeights();
                const percentChance = (effect.percentWeight / sumOfAllWeights) * 100;
                return percentChance.toFixed(2);
            };

            $ctrl.openSetTargetChancePercentageModal = (effect: EffectInstance) => {
                modalFactory.openGetInputModal(
                    {
                        model: parseFloat($ctrl.getPercentChanceForEffect(effect) || "0.5"),
                        label: "目標割合を設定",
                        descriptionText: "このエフェクトの目標確率(%)を入力してください。目標値に合わせて他のエフェクトの重みも調整されます。",
                        inputType: "number",
                        saveText: "保存",
                        inputPlaceholder: "割合を入力",
                        validationFn: (value) => {
                            return new Promise((resolve) => {
                                if (value == null || isNaN(value) || value < 0.0001 || value >= 100.0) {
                                    resolve(false);
                                }
                                resolve(true);
                            });
                        },
                        validationText: "0より大きく100未満の有効な割合を入力してください"
                    },
                    (newPercentage) => {
                        const sumOfAllWeights = getSumOfAllWeights();
                        const currentThisWeight = effect.percentWeight ?? 0.5;
                        const sumOfOtherWeights = sumOfAllWeights - currentThisWeight;

                        const newThisWeight = (newPercentage / 100) * sumOfAllWeights;
                        effect.percentWeight = newThisWeight;

                        const newSumOfOtherWeights = sumOfAllWeights - newThisWeight;

                        const otherEffects = $ctrl.effectsData.list.filter(e => e.active && e.id !== effect.id);
                        let imperfect = false;
                        for (const otherEffect of otherEffects) {
                            let newWeight = (otherEffect.percentWeight ?? 0.5) * (newSumOfOtherWeights / sumOfOtherWeights);
                            if (newWeight < 0.0001) {
                                imperfect = true;
                                newWeight = 0.0001;
                            }
                            otherEffect.percentWeight = newWeight;
                        }

                        ngToast.create({
                            className: imperfect ? "warning" : "success",
                            content: imperfect ? "一部の重みが最小値に達したため、目標割合に完全一致できませんでした。" : "目標割合に合わせて重みを調整しました。"
                        });

                        $ctrl.effectsUpdate();
                    });
            };
            //#endregion

            $ctrl.effectsUpdate = function () {
                ensureDefaultWeights();
                updateDefaultLabels();
                $ctrl.update({ effects: $ctrl.effectsData });
            };

            $ctrl.$onInit = $ctrl.$onChanges = function () {
                $q.when(effectHelperService.getAllEffectTypes()).then((types) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    effectTypes = types;

                    if ($ctrl.effects != null && !Array.isArray($ctrl.effects)) {
                        $ctrl.effectsData = $ctrl.effects;
                    }
                    if ($ctrl.effectsData.list == null) {
                        $ctrl.effectsData.list = [];
                    }
                    if ($ctrl.effectsData.id == null) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                        $ctrl.effectsData.id = randomUUID();
                    }

                    $ctrl.effectsData.list.forEach((e) => {
                        if (e.active == null) {
                            e.active = true;
                        }
                    });

                    if ($ctrl.effectsData.runMode == null) {
                        $ctrl.effectsData.runMode = "all";
                    }

                    // if mode is being provided externally (ie from Run Random Effect effect), override effectsData.runMode and related settings
                    if ($ctrl.mode != null) {
                        $ctrl.effectsData.runMode = $ctrl.mode;

                        if ($ctrl.mode === "random") {
                            if ($ctrl.weighted != null) {
                                $ctrl.effectsData.weighted = $ctrl.weighted;
                            }

                            if ($ctrl.dontRepeatUntilAllUsed != null) {
                                $ctrl.effectsData.dontRepeatUntilAllUsed = $ctrl.dontRepeatUntilAllUsed;
                            }
                        }
                    }

                    $ctrl.effectsUpdate();

                    $scope.$broadcast("rzSliderForceRender");
                });
            };

            $ctrl.testEffects = function () {
                backendCommunicator.send('runEffectsManually', { effects: $ctrl.effectsData });
            };

            //#region Magic Variables
            function mergeArraysWithoutDuplicates<T>(initialArray: T[], arrayToAdd: T[], keyToCheck: keyof T) {
                const nonDupes = arrayToAdd.filter((item) => {
                    return !initialArray.some((i) => {
                        return i[keyToCheck] === item[keyToCheck];
                    });
                });
                return [...initialArray, ...nonDupes];
            }

            function stringCanBeShorthand(str: string) {
                return /^([a-z][a-z\d._-]+)([\s\S]*)$/i.test(str);
            }

            function checkEffectListForMagicVariables(
                effects: Array<EffectInstance & { name?: string }>,
                ignoreEffectId: string
            ) {
                const magicVariables = {
                    customVariables: [],
                    effectOutputs: []
                };

                if (!effects || !Array.isArray(effects)) {
                    return;
                }

                for (const effect of effects) {
                    if (effect == null || typeof effect !== "object" || effect.id === ignoreEffectId) {
                        continue;
                    }

                    if (effect.type === "firebot:customvariable" || effect.name?.length) {
                        const canBeShorthand = stringCanBeShorthand(effect.name);
                        magicVariables.customVariables = mergeArraysWithoutDuplicates(
                            magicVariables.customVariables,
                            [
                                {
                                    name: effect.name,
                                    handle: canBeShorthand ? `$$${effect.name}` : `$customVariable[${effect.name}]`,
                                    effectLabel: effect.effectLabel,
                                    examples: [
                                        ...(canBeShorthand
                                            ? [
                                                {
                                                    handle: `$$${effect.name}["path", "to", "property"]`,
                                                    description: `Access a property of "${effect.name}"`
                                                },
                                                {
                                                    handle: `$customVariable[${effect.name}]`,
                                                    description: `Long hand version of "${effect.name}"`
                                                }
                                            ]
                                            : []),
                                        {
                                            handle: `$customVariable[${effect.name}, "path.to.property"]`,
                                            description: `Access a property of "${effect.name}" using long hand`
                                        }
                                    ]
                                }
                            ],
                            "name"
                        );
                        continue;
                    }

                    const effectType = effectTypes.find(e => e.definition?.id === effect.type);
                    if (effectType != null && effectType.definition?.outputs?.length) {
                        const customOutputNames: Record<string, string> = effect.outputNames || {};

                        const outputs = effectType.definition?.outputs.map((output) => {
                            const name = customOutputNames[output.defaultName] ?? output.defaultName;
                            const canBeShorthand = stringCanBeShorthand(name);
                            return {
                                name,
                                handle: canBeShorthand ? `$&${name}` : `$effectOutput[${name}]`,
                                label: output.label,
                                description: output.description,
                                effectLabel: `${effectType.definition.name}${
                                    effect.effectLabel ? ` (${effect.effectLabel})` : ""
                                }`,
                                examples: [
                                    ...(canBeShorthand
                                        ? [
                                            {
                                                handle: `$&${name}["path", "to", "property"]`,
                                                description: `Access a property of "${name}"`
                                            },
                                            {
                                                handle: `$effectOutput[${name}]`,
                                                description: `Long hand version of "${name}"`
                                            }
                                        ]
                                        : []),
                                    {
                                        handle: `$effectOutput[${name}, "path.to.property"]`,
                                        description: `Access a property of "${name}" using long hand`
                                    }
                                ]
                            };
                        });

                        magicVariables.effectOutputs = mergeArraysWithoutDuplicates(
                            magicVariables.effectOutputs,
                            outputs,
                            "name"
                        );
                    }

                    for (const value of Object.values(effect)) {
                        if (Array.isArray(value)) {
                            const result = checkEffectListForMagicVariables(value as EffectInstance[], ignoreEffectId);
                            magicVariables.customVariables = mergeArraysWithoutDuplicates(
                                magicVariables.customVariables,
                                result.customVariables,
                                "name"
                            );
                            magicVariables.effectOutputs = mergeArraysWithoutDuplicates(
                                magicVariables.effectOutputs,
                                result.effectOutputs,
                                "name"
                            );
                        }
                    }
                }

                return magicVariables;
            }

            function determineMagicVariables(ignoreEffectId: string | null) {
                const magicVariables = {
                    customVariables: [],
                    effectOutputs: [],
                    presetListArgs:
                        $ctrl.triggerMeta?.presetListArgs?.map((a) => {
                            const canBeShorthand = stringCanBeShorthand(a.name);
                            return {
                                name: a.name,
                                handle: canBeShorthand ? `$#${a.name}` : `$presetListArg[${a.name}]`,
                                examples: canBeShorthand
                                    ? [
                                        {
                                            handle: `$presetListArg[${a.name}]`,
                                            description: "Long hand version of the preset list argument"
                                        }
                                    ]
                                    : undefined
                            };
                        }) || []
                };

                const effectsToCheck = $ctrl.triggerMeta?.rootEffects?.list || $ctrl.effectsData.list;
                const effectsResult = checkEffectListForMagicVariables(effectsToCheck, ignoreEffectId);
                magicVariables.customVariables = mergeArraysWithoutDuplicates(
                    magicVariables.customVariables,
                    effectsResult.customVariables,
                    "name"
                );
                magicVariables.effectOutputs = mergeArraysWithoutDuplicates(
                    magicVariables.effectOutputs,
                    effectsResult.effectOutputs,
                    "name"
                );

                return magicVariables;
            }
            //#endregion

            //#region List Modifications
            $ctrl.removeEffectAtIndex = function (index: number) {
                $ctrl.effectsData.list.splice(index, 1);
                $ctrl.effectsUpdate();
            };

            $ctrl.removeAllEffects = function () {
                $ctrl.effectsData.list = [];
                $ctrl.effectsUpdate();
            };

            $ctrl.duplicateEffectAtIndex = function (index: number) {
                const clonedEffect = objectCopyHelper.cloneEffect($ctrl.effectsData.list[index]);
                $ctrl.effectsData.list.splice(index + 1, 0, clonedEffect);
                $ctrl.effectsUpdate();
            };

            $ctrl.hasCopiedEffects = function () {
                return objectCopyHelper.hasCopiedEffects();
            };

            $ctrl.pasteEffects = async function (append = false) {
                if (objectCopyHelper.hasCopiedEffects()) {
                    if (append) {
                        $ctrl.effectsData.list = $ctrl.effectsData.list.concat(
                            await objectCopyHelper.getCopiedEffects($ctrl.trigger, $ctrl.triggerMeta)
                        );
                    } else {
                        $ctrl.effectsData.list = await objectCopyHelper.getCopiedEffects(
                            $ctrl.trigger,
                            $ctrl.triggerMeta
                        );
                    }
                    $ctrl.effectsUpdate();
                }
            };

            $ctrl.pasteEffectsAtIndex = async (index: number, above: boolean) => {
                if (objectCopyHelper.hasCopiedEffects()) {
                    if (!above) {
                        index++;
                    }
                    const copiedEffects = await objectCopyHelper.getCopiedEffects($ctrl.trigger, $ctrl.triggerMeta);
                    $ctrl.effectsData.list.splice(index, 0, ...copiedEffects);
                    $ctrl.effectsUpdate();
                }
            };

            $ctrl.copyEffectAtIndex = function (index: number) {
                objectCopyHelper.copyEffects([$ctrl.effectsData.list[index]]);
            };

            $ctrl.copyEffects = function () {
                objectCopyHelper.copyEffects($ctrl.effectsData.list);
            };

            $ctrl.moveEffectAtIndex = function (fromIndex: number, toIndex: number) {
                if (
                    fromIndex === toIndex ||
                    fromIndex < 0 ||
                    toIndex < 0 ||
                    fromIndex >= $ctrl.effectsData.list.length ||
                    toIndex >= $ctrl.effectsData.list.length
                ) {
                    return;
                }

                const item = $ctrl.effectsData.list[fromIndex];
                $ctrl.effectsData.list.splice(fromIndex, 1);
                $ctrl.effectsData.list.splice(toIndex, 0, item);
                $ctrl.effectsUpdate();

                setTimeout(() => {
                    const newElement = document.querySelectorAll(".effect-list-item")[toIndex] as HTMLElement;
                    newElement?.focus();
                }, 0);
            };

            $ctrl.handleEffectKeydown = function (event: KeyboardEvent, index: number) {
                const key = event.key;

                // Start drag mode with Enter/Return
                if (key === "Enter" && $ctrl.keyboardDragIndex == null) {
                    event.preventDefault();
                    // snapshot original order so cancel (Escape) can restore it
                    $ctrl.keyboardOriginalEffects = $ctrl.effectsData.list.slice();
                    $ctrl.keyboardDragEffectId = $ctrl.effectsData.list[index]?.id ?? null;
                    $ctrl.keyboardDragIndex = index;
                    return;
                }

                // If not currently in drag mode, ignore other keys
                if ($ctrl.keyboardDragIndex == null) {
                    return;
                }

                // Cancel drag with Escape
                if (key === "Escape") {
                    event.preventDefault();
                    if ($ctrl.keyboardOriginalEffects != null) {
                        $ctrl.effectsData.list = $ctrl.keyboardOriginalEffects.slice();
                        $ctrl.effectsUpdate();

                        setTimeout(() => {
                            let focusIndex = index;
                            if ($ctrl.keyboardDragEffectId != null) {
                                const restoredIndex = $ctrl.effectsData.list.findIndex(
                                    e => e.id === $ctrl.keyboardDragEffectId
                                );
                                if (restoredIndex >= 0) {
                                    focusIndex = restoredIndex;
                                }
                            }
                            const originalElement = document.querySelectorAll(".effect-list-item")[
                                focusIndex
                            ] as HTMLElement;
                            originalElement?.focus();

                            $ctrl.keyboardDragIndex = null;
                            $ctrl.keyboardDragEffectId = null;
                            $ctrl.keyboardOriginalEffects = null;
                        }, 0);
                    }
                    return;
                }

                // Drop item with Enter
                if (key === "Enter") {
                    event.preventDefault();
                    $ctrl.keyboardDragIndex = null;
                    $ctrl.keyboardDragEffectId = null;
                    $ctrl.keyboardOriginalEffects = null;
                    return;
                }

                const currentIndex = $ctrl.keyboardDragIndex;

                // Move item with Arrow keys while in drag mode
                if (key === "ArrowUp" && currentIndex > 0) {
                    event.preventDefault();
                    const newIndex = currentIndex - 1;
                    $ctrl.moveEffectAtIndex(currentIndex, newIndex);
                    $ctrl.keyboardDragIndex = newIndex;
                } else if (key === "ArrowDown" && currentIndex < $ctrl.effectsData.list.length - 1) {
                    event.preventDefault();
                    const newIndex = currentIndex + 1;
                    $ctrl.moveEffectAtIndex(currentIndex, newIndex);
                    $ctrl.keyboardDragIndex = newIndex;
                }
            };
            //#endregion

            //#region Effect Modals
            $ctrl.openEditEffectModal = (
                effect: EffectInstance,
                index: number | null,
                trigger: TriggerType,
                isNew: boolean
            ) => {
                const magicVariables = determineMagicVariables(effect.id);
                modalFactory.showEditEffectModal(
                    effect,
                    index,
                    trigger,
                    (response) => {
                        if (response.action === "add") {
                            $ctrl.effectsData.list.splice(index + 1, 0, response.effect);
                        } else if (response.action === "update") {
                            $ctrl.effectsData.list[response.index] = response.effect;
                        } else if (response.action === "delete") {
                            $ctrl.removeEffectAtIndex(response.index);
                        }
                        $ctrl.effectsUpdate();
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    { ...(($ctrl.triggerMeta as any) ?? {}), magicVariables },
                    isNew
                );
            };

            $ctrl.openNewEffectModal = (index?: number) => {
                modalService.showModal({
                    component: "addNewEffectModal",
                    backdrop: true,
                    windowClass: "no-padding-modal",
                    resolveObj: {
                        trigger: () => $ctrl.trigger,
                        triggerMeta: () => $ctrl.triggerMeta
                    },
                    closeCallback: (resp: { selectedEffectDef: EffectDefinition }) => {
                        if (resp == null) {
                            return;
                        }

                        const { selectedEffectDef } = resp;

                        const newEffect = {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                            id: randomUUID(),
                            type: selectedEffectDef.id,
                            active: true
                        };

                        if (index == null) {
                            $ctrl.openEditEffectModal(newEffect, null, $ctrl.trigger, true);
                            return;
                        }

                        $ctrl.openEditEffectModal(newEffect, index, $ctrl.trigger, true);
                    }
                });
            };

            $ctrl.editLabelForEffectAtIndex = function (index: number) {
                const effect = $ctrl.effectsData.list[index];
                const label = effect.effectLabel;

                modalFactory.openGetInputModal(
                    {
                        model: label,
                        label: label == null || label.length === 0 ? "ラベルを追加" : "ラベルを編集",
                        saveText: "ラベルを保存"
                    },
                    (newLabel) => {
                        if (newLabel == null || newLabel.length === 0) {
                            effect.effectLabel = null;
                        } else {
                            effect.effectLabel = newLabel;
                        }
                    }
                );
            };

            $ctrl.editTimeoutForEffectAtIndex = function (index: number) {
                const effect = $ctrl.effectsData.list[index];
                const timeout = effect.abortTimeout;
                modalFactory.openGetInputModal(
                    {
                        model: timeout,
                        label: "エフェクトタイムアウトを設定",
                        descriptionText:
                            "Firebotがこのエフェクトを自動中断するまでの待機秒数を入力してください。",
                        saveText: "タイムアウトを保存",
                        inputType: "number",
                        inputPlaceholder: "秒数を入力",
                        validationFn: (value) => {
                            return new Promise((resolve) => {
                                if (value == null) {
                                    resolve(true);
                                }
                                if (isNaN(value) || value < 0) {
                                    resolve(false);
                                }
                                resolve(true);
                            });
                        },
                        validationText: "有効な秒数を入力してください"
                    },
                    (newTimeout) => {
                        effect.abortTimeout = newTimeout;
                    }
                );
            };
            //#endregion

            function getSharedEffects(_code: string): angular.IPromise<{ effects: EffectInstance[] } | null> {
                ngToast.create({
                    className: 'warning',
                    content: 'エフェクト共有コードからのインポートはこのフォーク版では利用できません。'
                });
                return $q.resolve(null);
            }

            //#region Context Menus
            $ctrl.effectContextMenuOptions = [
                {
                    html: `<a href ><i class="far fa-edit mr-4"></i> エフェクトを編集</a>`,
                    click: function ($itemScope: ContextMenuItemScope) {
                        const $index = $itemScope.$index;
                        const effect = $itemScope.effect;
                        $ctrl.openEditEffectModal(effect, $index, $ctrl.trigger, false);
                    },
                    enabled: function ($itemScope: ContextMenuItemScope) {
                        const effect = $itemScope.effect;
                        return !!effectTypes.find(e => e.definition.id === effect.type);
                    }
                },
                {
                    html: `<a href ><i class="far fa-tag mr-4"></i> ラベルを編集</a>`,
                    click: function ($itemScope: ContextMenuItemScope) {
                        const $index = $itemScope.$index;
                        $ctrl.editLabelForEffectAtIndex($index);
                    }
                },
                {
                    html: `<a href ><i class="far fa-toggle-off mr-4"></i>  {{effect.active ? "エフェクトを無効化" : "エフェクトを有効化"}}</a>`,
                    compile: true,
                    click: function ($itemScope: ContextMenuItemScope) {
                        const effect = $itemScope.effect;
                        effect.active = !effect.active;
                    }
                },
                {
                    html: `<a href ><i class="far fa-clone mr-4"></i> 複製</a>`,
                    click: function ($itemScope: ContextMenuItemScope) {
                        const $index = $itemScope.$index;
                        $ctrl.duplicateEffectAtIndex($index);
                    }
                },
                {
                    html: `<a href ><span class="iconify mr-4" data-icon="mdi:content-copy"></span> コピー</a>`,
                    click: function ($itemScope: ContextMenuItemScope) {
                        const $index = $itemScope.$index;
                        $ctrl.copyEffectAtIndex($index);
                    }
                },
                {
                    html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt mr-4"></i> 削除</a>`,
                    click: function ($itemScope: ContextMenuItemScope) {
                        const $index = $itemScope.$index;
                        $ctrl.removeEffectAtIndex($index);
                    }
                },
                {
                    text: "詳細...",
                    hasTopDivider: true,
                    children: [
                        {
                            html: `<a href role="menuitem"><i class="far mr-4 fa-code-branch"></i> 非同期を切り替え <tooltip text="'このエフェクトを同期/非同期で実行するか切り替えます。非同期の場合、次のエフェクトは完了を待たずに開始されます。'" placement="top-right" /></a>`,
                            compile: true,
                            enabled: function ($itemScope: ContextMenuItemScope) {
                                const effect = $itemScope.effect;
                                const effectType = effectTypes.find(e => e.definition.id === effect.type);
                                return !effectType?.definition.exemptFromAsync;
                            },
                            click: function ($itemScope: ContextMenuItemScope) {
                                const effect = $itemScope.effect;
                                effect.async = !effect.async;
                            }
                        },
                        {
                            html: `<a href role="menuitem"><i class="far fa-stopwatch mr-4"></i> タイムアウトを編集</a>`,
                            enabled: function ($itemScope: ContextMenuItemScope) {
                                const effect = $itemScope.effect;
                                const effectType = effectTypes.find(e => e.definition.id === effect.type);
                                return !effectType?.definition.exemptFromTimeouts;
                            },
                            click: function ($itemScope: ContextMenuItemScope) {
                                const $index = $itemScope.$index;
                                $ctrl.editTimeoutForEffectAtIndex($index);
                            }
                        },
                        {
                            html: `<a href role="menuitem"><i class="fal fa-fingerprint mr-4"></i> エフェクトIDをコピー</a>`,
                            click: function ($itemScope: ContextMenuItemScope) {
                                const effect = $itemScope.effect;
                                $rootScope.copyTextToClipboard(effect.id);
                                ngToast.create({
                                    className: "success",
                                    content: `${effect.id} をクリップボードにコピーしました。`
                                });
                            }
                        }
                    ]
                },
                {
                    text: "貼り付け...",
                    hasTopDivider: true,
                    enabled: function () {
                        return $ctrl.hasCopiedEffects();
                    },
                    children: [
                        {
                            html: `<a href><span class="iconify mr-4" data-icon="mdi:content-paste"></span> 前に貼り付け</a>`,
                            click: function ($itemScope: ContextMenuItemScope) {
                                const $index = $itemScope.$index;
                                if ($ctrl.hasCopiedEffects()) {
                                    $ctrl.pasteEffectsAtIndex($index, true);
                                }
                            }
                        },
                        {
                            html: `<a href><span class="iconify mr-4" data-icon="mdi:content-paste"></span> 後に貼り付け</a>`,
                            click: function ($itemScope: ContextMenuItemScope) {
                                const $index = $itemScope.$index;
                                if ($ctrl.hasCopiedEffects()) {
                                    $ctrl.pasteEffectsAtIndex($index, false);
                                }
                            }
                        }
                    ]
                },
                {
                    text: "新規追加...",
                    children: [
                        {
                            html: `<a href><i class="far fa-plus mr-4"></i> 前に追加</a>`,
                            click: function ($itemScope: ContextMenuItemScope) {
                                const $index = $itemScope.$index;
                                $ctrl.openNewEffectModal($index - 1);
                            }
                        },
                        {
                            html: `<a href><i class="far fa-plus mr-4"></i> 後に追加</a>`,
                            click: function ($itemScope: ContextMenuItemScope) {
                                const $index = $itemScope.$index;
                                $ctrl.openNewEffectModal($index);
                            }
                        }
                    ]
                }
            ];

            $ctrl.allEffectsMenuOptions = [
                {
                    html: `<a href role="menuitem"><span class="iconify mr-4" data-icon="mdi:content-copy"></span> すべてのエフェクトをコピー</a>`,
                    click: () => {
                        $ctrl.copyEffects();
                    },
                    enabled: function () {
                        return $ctrl.effectsData.list.length > 0;
                    }
                },
                {
                    html: `<a href role="menuitem"><span class="iconify mr-4" data-icon="mdi:content-paste"></span> エフェクトを貼り付け</a>`,
                    click: function () {
                        $ctrl.pasteEffects(true);
                    },
                    enabled: function () {
                        return $ctrl.hasCopiedEffects();
                    }
                },
                {
                    html: `<a href role="menuitem" style="color: #fb7373;"><i class="far fa-trash-alt mr-4"></i>  すべてのエフェクトを削除</a>`,
                    click: function () {
                        $ctrl.removeAllEffects();
                    },
                    enabled: function () {
                        return $ctrl.effectsData.list.length > 0;
                    }
                },
                {
                    text: "詳細...",
                    hasTopDivider: true,
                    children: [
                        {
                            html: `<a href role="menuitem"><i class="fal fa-magic mr-4"></i> プリセットエフェクトリストに変換</a>`,
                            click: function () {
                                $q.when(presetEffectListsService.showAddEditPresetEffectListModal({
                                    effects: {
                                        list: $ctrl.effectsData.list
                                    } as EffectList
                                })).then((savedPresetEffectsList) => {
                                    if (!savedPresetEffectsList) {
                                        return;
                                    }

                                    $ctrl.effectsData.list = [{
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                                        id: randomUUID(),
                                        type: "firebot:run-effect-list",
                                        active: true,
                                        listType: "preset",
                                        presetListId: savedPresetEffectsList.id,
                                        presetListArgs: {}
                                    }];
                                });
                            },
                            enabled: function () {
                                return $ctrl.effectsData.list.length > 0;
                            }
                        },
                        {
                            html: `<a href role="menuitem"><i class="fal fa-fingerprint mr-4"></i> エフェクトリストIDをコピー</a>`,
                            click: function () {
                                $rootScope.copyTextToClipboard($ctrl.effectsData.id);
                                ngToast.create({
                                    className: "success",
                                    content: `${$ctrl.effectsData.id} をクリップボードにコピーしました。`
                                });
                            }
                        }
                    ]
                },
                {
                    html: `<a href role="menuitem"><i class="far fa-share-alt mr-4"></i> エフェクトを共有</a>`,
                    click: async function () {
                        const shareCode = await backendCommunicator.fireEventAsync<string>("getEffectsShareCode", $ctrl.effectsData.list);
                        if (shareCode == null) {
                            ngToast.create("エフェクトを共有できませんでした。");
                        } else {
                            modalService.showModal({
                                component: "copyShareCodeModal",
                                size: 'sm',
                                resolveObj: {
                                    shareCode: () => shareCode,
                                    title: () => "エフェクト共有コード",
                                    message: () => "以下のコードを共有すると、他の人がこのエフェクトをインポートできます。"
                                }
                            });
                        }
                    },
                    enabled: function () {
                        return $ctrl.effectsData.list.length > 0;
                    },
                    hasTopDivider: true
                },
                {
                    html: `<a href ><i class="far fa-cloud-download-alt mr-4"></i> 共有エフェクトをインポート</a>`,
                    click: function () {
                        modalFactory.openGetInputModal(
                            {
                                model: "",
                                label: "エフェクト共有コードを入力",
                                saveText: "追加",
                                inputPlaceholder: "コードを入力",
                                validationFn: (shareCode) => {
                                    return new Promise(async (resolve) => {
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
                                validationText: "有効なエフェクト共有コードではありません。"

                            },
                            async (shareCode) => {
                                const effectsData = await getSharedEffects(shareCode);
                                if (effectsData.effects != null) {
                                    $ctrl.effectsData.list = $ctrl.effectsData.list.concat(effectsData.effects);
                                    ensureDefaultWeights();
                                }
                            });
                    }
                }
            ];
            //#endregion
        }
    };


    // @ts-ignore
    angular.module("firebotApp").component("effectList", effectList);
})();
