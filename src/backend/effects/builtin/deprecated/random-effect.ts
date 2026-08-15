import type { EffectList, EffectType } from "../../../../types/effects";

import effectRunner from "../../../common/effect-runner";

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
        categories: ["advanced", "scripting"],
        hidden: true,
        deprecated: true
    },
    optionsTemplate: `
        <eos-container>
            <div class="effect-info alert alert-warning">
                <div>
                    警告: このエフェクトは非推奨です。今後は任意のエフェクトリストで <strong>ランダム</strong> 実行モードを使用してください。
                </div>
                <div class="mt-3">
                    <button
                        type="button"
                        class="btn btn-default btn-sm"
                        ng-click="convertToRunEffectList()"
                        ng-disabled="isConverting"
                        aria-label="このエフェクトを「エフェクトリスト実行」に変換"
                        uib-tooltip="設定とエフェクトの中身を引き継いだまま「エフェクトリスト実行」エフェクトに置き換えます。保存するまで確定しません。"
                        tooltip-append-to-body="true"
                    >
                        <i class="fas fa-exchange-alt" aria-hidden="true"></i>
                        <span class="ml-2">「エフェクトリスト実行」に変換</span>
                    </button>
                </div>
            </div>
        </eos-container>

        <eos-container pad-top="true">
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
    optionsController: ($scope, effectHelperService, utilityService, ngToast, $timeout) => {
        if ($scope.effect.effectList == null) {
            $scope.effect.effectList = {} as EffectList;
        }

        $scope.isConverting = false;

        $scope.effectListUpdated = (effects: EffectList) => {
            $scope.effect.effectList = effects;
        };

        $scope.convertToRunEffectList = () => {
            if ($scope.isConverting) {
                return;
            }
            $scope.isConverting = true;

            utilityService.showConfirmationModal({
                title: "「エフェクトリスト実行」に変換",
                question: "このエフェクトを「エフェクトリスト実行」（ランダム実行）に置き換えます。エフェクトの中身と設定はそのまま引き継がれます。よろしいですか？",
                tip: "変換してもすぐには保存されません。取り消したい場合は、この画面を保存せずにキャンセルしてください。",
                confirmLabel: "変換する",
                confirmBtnType: "btn-primary",
                cancelLabel: "キャンセル"
            }).then((confirmed: boolean) => {
                // showConfirmationModal はネイティブ Promise を返すため、
                // 解決時にはダイジェスト外にいる。$timeout で $apply に載せる。
                $timeout(() => {
                    $scope.isConverting = false;

                    if (!confirmed) {
                        return;
                    }

                    const result = effectHelperService.convertDeprecatedListEffect($scope.effect, "random");

                    if (!result.success) {
                        ngToast.create({
                            className: "danger",
                            content: `変換に失敗しました: ${result.errors.join(" / ")}`
                        });
                        return;
                    }

                    // 検証を全て通過した場合のみ、ここで元のエフェクトが置き換わる
                    $scope.$emit("effectOptions.replaceEffect", result.effect);

                    ngToast.create({
                        className: "success",
                        content: "「エフェクトリスト実行」に変換しました。保存すると確定します。"
                    });
                });
            });
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