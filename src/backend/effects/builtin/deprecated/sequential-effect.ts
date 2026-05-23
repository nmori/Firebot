import type { EffectList, EffectType } from "../../../../types/effects";
import effectRunner from "../../../common/effect-runner";

const effect: EffectType<{
    id: string;
    effectList: EffectList;
    outputs: Record<string, unknown>;
}> = {
    definition: {
        id: "firebot:sequentialeffect",
        name: "順次エフェクト実行",
        description: "エフェクトリストから1つずつ順番に実行します",
        icon: "fad fa-list-ol",
        categories: ["advanced", "scripting"],
        dependencies: [],
        hidden: true,
        deprecated: true
    },
    optionsTemplate: `
    <eos-container>
            <div class="effect-info alert alert-warning">
                警告: このエフェクトは非推奨です。今後は任意のエフェクトリストで <strong>順次（単体）</strong> 実行モードを使用してください。
            </div>
        </eos-container>

    <eos-container pad-top="true">
        <p>下のリストからエフェクトを 1 つずつ順番に実行します。特にタイマーで便利です。</p>
    </eos-container>

    <eos-container pad-top="true">
        <effect-list effects="effect.effectList"
            trigger="{{trigger}}"
            trigger-meta="triggerMeta"
            update="effectListUpdated(effects)"
            header="エフェクト"
            mode="sequential"
            modalId="{{modalId}}"></effect-list>
    </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.effectList == null) {
            $scope.effect.effectList = {} as EffectList;
        }

        $scope.effectListUpdated = (effects: EffectList) => {
            $scope.effect.effectList = effects;
        };
    },
    onTriggerEvent: async ({ effect, trigger }) => {
        const effectList = effect.effectList;
        const outputs = effect.outputs;

        if (effectList?.list == null) {
            return true;
        }

        // ensure effect list is sequential and settings are applied (for backwards compatibility)
        effectList.runMode = "sequential";

        const result = await effectRunner.processEffects({
            effects: effectList,
            trigger,
            outputs
        });

        if (result?.success === true) {
            if (result.stopEffectExecution) {
                return {
                    success: true,
                    execution: {
                        stop: true,
                        bubbleStop: true
                    }
                };
            }
        }
        return true;
    }
};

export = effect;