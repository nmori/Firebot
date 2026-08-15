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
                <div>
                    警告: このエフェクトは非推奨です。今後は任意のエフェクトリストで <strong>順番実行（単体）</strong> 実行モードを使用してください。
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
                question: "このエフェクトを「エフェクトリスト実行」（順番実行（単体））に置き換えます。エフェクトの中身と設定はそのまま引き継がれます。よろしいですか？",
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

                    const result = effectHelperService.convertDeprecatedListEffect($scope.effect, "sequential");

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