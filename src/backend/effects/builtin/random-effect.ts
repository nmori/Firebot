import type { EffectList, EffectType } from "../../../types/effects";

import effectRunner from "../../common/effect-runner";

const effect: EffectType<{
    effectList: EffectList;
    weighted: boolean;
    dontRepeat: boolean;
    bubbleOutputs: boolean;
    outputs: unknown;
}> = {
    definition: {
        id: "firebot:randomeffect",
        name: "ランダムエフェクト実行",
        description: "エフェクトリストからランダムで1つ実行します",
        icon: "fad fa-random",
        categories: ["advanced", "scripting"]
    },
    optionsTemplate: `
        <eos-container>
            <p>下のリストからランダムにエフェクトを 1 つ実行します。</p>

            <div style="padding-top: 10px;">
                <firebot-checkbox
                    model="effect.weighted"
                    label="重み付き確率"
                    tooltip="チェックを入れると、各エフェクトの確率はその重み値によって決まります。チェックを外すと、各エフェクトが等確率で選択されます。"
                    style="margin-bottom: 0"
                />
            </div>
        </eos-container>

        <eos-container pad-top="true">
            <effect-list effects="effect.effectList"
                trigger="{{trigger}}"
                trigger-meta="triggerMeta"
                update="effectListUpdated(effects)"
                header="エフェクト"
                modalId="{{modalId}}"
                mode="random"
                weighted="effect.weighted"
                dont-repeat-until-all-used="effect.dontRepeat"
            ></effect-list>
        </eos-container>

        <eos-container header="オプション" pad-top="true">
            <firebot-checkbox
                ng-hide="effect.weighted"
                model="effect.dontRepeat"
                label="繰り返しを防ぐ"
                tooltip="チェックを入れると、リストが再シャッフルされる前に各エフェクトが一度ずつ再生され、同じエフェクトが連続して繰り返されるのを防ぎます。"
            />
            <firebot-checkbox
                model="effect.bubbleOutputs"
                label="エフェクトの出力を親リストに適用"
                tooltip="エフェクトの出力を親エフェクトリストで利用可能にするかどうかを設定します。"
            />
        </eos-container>
    `,
    optionsController: ($scope) => {
        $scope.effectListUpdated = (effects: EffectList) => {
            $scope.effect.effectList = effects;
        };
    },
    onTriggerEvent: async ({ effect, trigger }) => {
        const effectList = effect.effectList;

        const outputs = effect.outputs as Record<string, unknown>;

        if (effectList?.list == null) {
            return true;
        }

        // ensure effect list is random and settings are applied (for backwards compatibility)
        effectList.runMode = "random";
        effectList.weighted = effect.weighted;
        effectList.dontRepeatUntilAllUsed = effect.dontRepeat;

        const result = await effectRunner.processEffects({
            effects: effectList,
            trigger,
            outputs
        });

        if (result != null && result.success === true) {
            if (result.stopEffectExecution) {
                return {
                    success: true,
                    outputs: effect.bubbleOutputs ? result.outputs : undefined,
                    execution: {
                        stop: true,
                        bubbleStop: true
                    }
                };
            }
        }

        return {
            success: true,
            outputs: effect.bubbleOutputs ? result?.outputs : undefined
        };
    }
};

export = effect;