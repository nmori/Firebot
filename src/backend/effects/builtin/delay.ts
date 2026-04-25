import type { EffectType } from "../../../types/effects";
import { wait } from "../../utils";

const effect: EffectType<{
    delay: number;
}> = {
    definition: {
        id: "firebot:delay",
        name: "待機",
        description: "エフェクト間で待機します",
        icon: "fad fa-stopwatch",
        categories: ["common", "advanced", "scripting"],
        dependencies: [],
        exemptFromTimeouts: true,
        exemptFromAsync: true
    },
    optionsTemplate: `
        <eos-container header="待機時間">
            <div class="input-group">
                <span class="input-group-addon" id="delay-length-effect-type">秒数</span>
                <input ng-model="effect.delay" type="text" class="form-control" aria-describedby="delay-length-effect-type" type="text" menu-position="under" replace-variables="number">
            </div>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.delay == null || (effect.delay.toString()).length < 1) {
            errors.push("待機時間を入力してください。");
        }
        return errors;
    },
    getDefaultLabel: (effect) => {
        return effect.delay != null ? `${effect.delay}秒` : undefined;
    },
    onTriggerEvent: async ({ effect }) => {
        await wait(effect.delay * 1000);
        return true;
    }
};

export = effect;