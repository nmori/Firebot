import { EffectType } from "../../../../types/effects";
import { runEffects } from "../../../common/effect-runner";

interface SwitchCase {
    label?: string;
    type?: "compare" | "range";
    value?: string;
    min?: string; // These are strings because of HTML inputs.
    max?: string;
    effectList?: unknown;
    fallthrough?: boolean;
}

interface EffectModel {
    value: string;
    cases: SwitchCase[];
    defaultCase: SwitchCase;
    bubbleOutputs: boolean;
}

type Scope = ng.IScope & {
    effect: EffectModel;
    openFirst: boolean;
    sortableOptions: unknown;
    addCase(): void;
    duplicateCase(index: number): void;
    deleteCase(index: number): void;
    effectListUpdated(effects: unknown, index: number | "default"): void;
    getAutomaticLabel(switchCase: SwitchCase): string;
};

const model: EffectType<EffectModel> = {
    definition: {
        id: "firebot:switch-statement",
        name: "スイッチ分岐",
        description: "1つの入力値で分岐処理を行うシンプルな条件分岐エフェクト",
        icon: "far fa-code-branch",
        categories: ["advanced", "scripting"]
    },
    optionsTemplate: `
        <setting-container header="スイッチ値">
            <firebot-input model="effect.value" placeholder-text="値を入力" use-text-area="true" rows="4" cols="40"
                menu-position="under" />
        </setting-container>

        <setting-container header="分岐ケース" pad-top="true">
            <div ui-sortable="sortableOptions" class="eos-container" ng-model="effect.cases">
                <div ng-repeat="switchCase in effect.cases" style="margin-bottom: 15px;">
                    <switch-section label="switchCase.label" header="{{switchCase.fallthrough ? 'フォールスルー' : 'ケース'}}"
                        auto-label="getAutomaticLabel(switchCase)" initially-open="$index === 0 && openFirst">
                        <div style="margin-bottom: 15px;">
                            <firebot-select options="{ compare: '数値またはテキスト比較', range: '数値範囲' }"
                                selected="switchCase.type"></firebot-select>
                        </div>

                        <firebot-input input-title="値" disable-variables="true" model="switchCase.value"
                            placeholder-text="期待値を入力"
                            ng-show="switchCase.type !== 'range'" style="margin-bottom: 15px;"></firebot-input>
                        <div ng-show="switchCase.type === 'range'" class="input-group" style="margin-bottom: 15px;">
                            <span class="input-group-addon">最小</span>
                            <input type="text" class="form-control" type="number" ng-model="switchCase.min">
                            <span class="input-group-addon">最大</span>
                            <input type="text" class="form-control" type="number" ng-model="switchCase.max">
                        </div>

                        <div ng-style="{'margin-bottom': switchCase.fallthrough ? '0' : '15px'}">
                            <firebot-checkbox model="switchCase.fallthrough" label="フォールスルー"
                                tooltip="このケースに一致した場合に、次のケースも続けて実行するかどうか。" />
                        </div>

                        <effect-list effects="switchCase.effectList" trigger="{{trigger}}" trigger-meta="triggerMeta"
                            update="effectListUpdated(effects, $index)" modalId="{{modalId}}" ng-hide="switchCase.fallthrough"></effect-list>

                        <div style="margin-top: 10px">
                            <button class="btn btn-default" ng-click="duplicateCase($index)" title="ケースを複製">
                                <i class="far fa-clone"></i>
                            </button>
                            <button class="btn btn-danger" ng-click="deleteCase($index)" title="ケースを削除">
                                <i class="far fa-trash"></i>
                            </button>
                        </div>
                    </switch-section>
                </div>
            </div>

            <button class="btn btn-link" ng-click="addCase()"><i class="fal fa-plus"></i> ケースを追加</button>

            <div style="margin-top: 15px;">
                <switch-section label="effect.defaultCase.label" header="デフォルト" draggable="false">
                    <effect-list effects="effect.defaultCase.effectList" trigger="{{trigger}}" trigger-meta="triggerMeta"
                        update="effectListUpdated(effects, 'default')" modalId="{{modalId}}"></effect-list>
                </switch-section>
            </div>
        </setting-container>

        <setting-container header="オプション" pad-top="true">
            <firebot-checkbox model="effect.bubbleOutputs" label="エフェクト出力を親リストに適用"
                tooltip="このエフェクトの出力を親エフェクトリストで利用可能にするかどうか。" />
        </setting-container>
    `,
    optionsController: ($scope: Scope, utilityService, objectCopyHelper) => {
        $scope.sortableOptions = {
            handle: ".dragHandle",
            stop: () => { }
        };

        $scope.addCase = () => {
            $scope.effect.cases.push({
                type: "compare"
            });
        };

        $scope.getAutomaticLabel = (switchCase: SwitchCase) => {
            if (!switchCase || !switchCase.type) {
                return "条件なし";
            }

            if (switchCase.type === "compare") {
                return switchCase.value || "値なし";
            }

            if (switchCase.type === "range" && (switchCase.min == null || switchCase.max == null || isNaN(Number(switchCase.min)) || isNaN(Number(switchCase.max)) || Number(switchCase.min) >= Number(switchCase.max))) {
                return "無効な数値範囲";
            }

            return `${switchCase.min}-${switchCase.max}`;
        };

        $scope.duplicateCase = (index: number) => {
            const newCase = objectCopyHelper.copyAndReplaceIds($scope.effect.cases[index]) as SwitchCase;
            const currentLabel = newCase.label?.length
                ? newCase.label
                : $scope.getAutomaticLabel(newCase);
            newCase.label = currentLabel?.length
                ? `${currentLabel} コピー`
                : "コピー";

            $scope.effect.cases.splice(index + 1, 0, newCase);
        };

        $scope.deleteCase = (index: number) => {
            utilityService.showConfirmationModal({
                title: "ケースを削除",
                question: "このスイッチケースを削除しますか？",
                confirmLabel: "削除",
                confirmBtnType: "btn-danger"
            }).then((confirmed: boolean) => {
                if (confirmed) {
                    $scope.effect.cases.splice(index, 1);
                }
            });
        };

        $scope.effectListUpdated = (effects: unknown, index: number | "default") => {
            if (index === "default") {
                $scope.effect.defaultCase.effectList = effects;
            } else {
                $scope.effect.cases[index].effectList = effects;
            }
        };

        if ($scope.effect.cases == null) {
            $scope.openFirst = true;
            $scope.effect.cases = [{
                type: "compare"
            }];
        }

        if ($scope.effect.defaultCase == null) {
            $scope.effect.defaultCase = {};
        }
    },
    optionsValidator: (effect) => {
        if (!effect.value || effect.value.toString().trim() === "") {
            return ["値は必須です。"];
        }

        if (effect.cases.some((switchCase) => {
            return switchCase.type === "range" &&
                    (switchCase.min == null || switchCase.max == null ||
                        Number.isNaN(Number(switchCase.min)) || Number.isNaN(Number(switchCase.max)) ||
                        Number(switchCase.min) >= Number(switchCase.max));
        })) {
            return ["1つ以上のケースで数値範囲が無効です。最小値と最大値を正しく設定してください。"];
        }
    },
    onTriggerEvent: async (event) => {
        const { effect, trigger, outputs, abortSignal } = event;
        const value = effect.value;
        const stringValue = typeof value === "string" ? value : String(value);
        const numberValue = typeof value === "number" ? value : Number(value);

        let fallthrough = false;

        let effectList: unknown;

        for (const switchCase of effect.cases) {
            if (fallthrough && !switchCase.fallthrough) {
                effectList = switchCase.effectList;
                break;
            } else if (fallthrough && switchCase.fallthrough) {
                continue;
            }

            if (switchCase.type === "compare") {
                if ((switchCase.value === "" || switchCase.value == null) && (stringValue === "" || stringValue == null) || stringValue === switchCase.value) {
                    if (switchCase.fallthrough) {
                        fallthrough = true;
                    } else {
                        effectList = switchCase.effectList;
                        break;
                    }
                }
            } else {
                if (switchCase.min != null && switchCase.max != null &&
                        numberValue >= Number(switchCase.min) &&
                        numberValue <= Number(switchCase.max)) {
                    if (switchCase.fallthrough) {
                        fallthrough = true;
                    } else {
                        effectList = switchCase.effectList;
                        break;
                    }
                }
            }
        }

        if (!effectList) {
            effectList = effect.defaultCase.effectList;
        }

        if (!effectList || abortSignal?.aborted) {
            return;
        }

        const result = await runEffects({
            trigger: trigger,
            outputs,
            effects: effectList
        });

        if (result?.success && result?.stopEffectExecution) {
            return {
                success: true,
                outputs: effect.bubbleOutputs ? result?.outputs : undefined,
                execution: {
                    stop: true,
                    bubbleStop: true
                }
            };
        }

        return {
            success: true,
            outputs: effect.bubbleOutputs ? result?.outputs : undefined
        };
    }
};

export = model;