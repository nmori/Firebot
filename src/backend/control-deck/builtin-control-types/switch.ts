import type { ControlDeckControlType, EffectList } from "../../../types";

type SwitchParams = {
    orientation: "horizontal" | "vertical";
    color: string;
    initialState: "restore" | "off" | "on";
    runEffectsOnInit: boolean;
    onEffects: EffectList;
    offEffects: EffectList;
};

export const switchControlType: ControlDeckControlType<SwitchParams, boolean> = {
    id: "firebot:switch",
    name: "スイッチ",
    description: "オン/オフを切り替えたときに演出を実行するトグルスイッチ",
    icon: "fa-toggle-on",
    enableLabel: true,
    resizable: false,
    defaultSize: { width: 1, height: 1 },
    shell: "none",
    settingsSchema: [
        {
            name: "orientation",
            title: "向き",
            type: "radio-cards",
            default: "horizontal",
            options: [
                { value: "horizontal", label: "横", iconClass: "fa-arrows-h" },
                { value: "vertical", label: "縦", iconClass: "fa-arrows-v" }
            ],
            settings: {
                gridColumns: 2
            }
        },
        {
            name: "color",
            title: "オンのときの色",
            type: "hexcolor",
            default: "#41c98a"
        },
        {
            name: "initialState",
            title: "Firebot 起動時",
            type: "radio-cards",
            default: "restore",
            options: [
                { value: "restore", label: "復元", description: "前回の状態を復元します" },
                { value: "off", label: "オフ", description: "常にオフで開始します" },
                { value: "on", label: "オン", description: "常にオンで開始します" }
            ],
            settings: {
                gridColumns: 3
            }
        },
        {
            name: "runEffectsOnInit",
            title: "起動時に演出を実行",
            description: "有効にすると、起動時にスイッチの状態が初期化される際に、対応する演出が実行されます。",
            type: "boolean",
            useSwitch: true,
            default: false
        },
        {
            name: "onEffects",
            title: "オンのときの演出",
            type: "effectlist"
        },
        {
            name: "offEffects",
            title: "オフのときの演出",
            type: "effectlist"
        }
    ],
    state: {
        getInitialState: async ({ control, persistedState }, { triggerEffectList }) => {
            const mode = control.settings?.initialState ?? "restore";
            let value: boolean;
            if (mode === "on") {
                value = true;
            } else if (mode === "off") {
                value = false;
            } else {
                value = persistedState ?? false;
            }

            if (control.settings?.runEffectsOnInit === true) {
                await triggerEffectList(value ? control.settings.onEffects : control.settings.offEffects);
            }

            return value;
        }
    },
    onInteraction: async ({ control, action, data }, { getState, setState, triggerEffectList }) => {
        if (action !== "toggle") {
            return;
        }
        const next = typeof data === "boolean" ? data : !(getState() === true);
        await setState(next);
        await triggerEffectList(next ? control.settings?.onEffects : control.settings?.offEffects);
    }
};
