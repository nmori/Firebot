import { OverlayWidgetType } from "../../../../types/overlay-widgets";
import { FontOptions } from "../../../../types/parameters";
import overlayWidgetConfigManager from "../../overlay-widget-config-manager";
import { ChannelPrediction } from "../../../../types";
import { InternalBus } from "../../../internal-bus";
import { loadComponentExtension } from "../../builtin-widget-helpers";

export const TWITCH_PREDICTION_TYPE_ID = "firebot:twitch-prediction";

export type PredictionSettings = {
    fontOptions?: FontOptions;
    backgroundColor: string;
    timeBarColor: string;
    showUsers: boolean;
    /** How long (seconds) to keep the final results visible after the prediction ends. */
    lingerSeconds: number;
};

export type PredictionState = {
    prediction: ChannelPrediction | null;
};

// Per-widget timers used to clear the results after a prediction ends.
const lingerTimers = new Map<string, NodeJS.Timeout>();

function clearLingerTimer(widgetId: string) {
    const timer = lingerTimers.get(widgetId);
    if (timer) {
        clearTimeout(timer);
        lingerTimers.delete(widgetId);
    }
}

function updateAllPredictionWidgets(prediction: ChannelPrediction) {
    const configs = overlayWidgetConfigManager.getConfigsOfType(TWITCH_PREDICTION_TYPE_ID);
    for (const config of configs) {
        if (config.active === false) {
            continue;
        }
        clearLingerTimer(config.id);
        overlayWidgetConfigManager.setWidgetStateById(config.id, { prediction }, false);
    }
}

function handlePredictionEnd(prediction: ChannelPrediction) {
    const configs = overlayWidgetConfigManager.getConfigsOfType(TWITCH_PREDICTION_TYPE_ID);
    for (const config of configs) {
        if (config.active === false) {
            continue;
        }
        clearLingerTimer(config.id);
        overlayWidgetConfigManager.setWidgetStateById(config.id, { prediction }, false);

        const settings = (config.settings ?? {}) as Partial<PredictionSettings>;
        const lingerMs = Math.max(0, (settings.lingerSeconds ?? 10)) * 1000;
        const timer = setTimeout(() => {
            lingerTimers.delete(config.id);
            overlayWidgetConfigManager.setWidgetStateById(config.id, { prediction: null } as PredictionState, false);
        }, lingerMs);
        lingerTimers.set(config.id, timer);
    }
}

function handlePredictionEvent(event: "begin" | "progress" | "lock" | "end", prediction: ChannelPrediction) {
    // Only do work if there's at least one prediction widget configured.
    if (overlayWidgetConfigManager.getConfigsOfType(TWITCH_PREDICTION_TYPE_ID).length === 0) {
        return;
    }

    try {
        switch (event) {
            case "begin":
            case "progress":
            case "lock":
                updateAllPredictionWidgets(prediction);
                break;
            case "end":
                handlePredictionEnd(prediction);
                break;
            default:
                break;
        }
    } catch {}
}

InternalBus.on("channel-prediction-begin", (prediction) => {
    handlePredictionEvent("begin", prediction);
});

InternalBus.on("channel-prediction-progress", (prediction) => {
    handlePredictionEvent("progress", prediction);
});

InternalBus.on("channel-prediction-lock", (prediction) => {
    handlePredictionEvent("lock", prediction);
});

InternalBus.on("channel-prediction-end", (prediction) => {
    handlePredictionEvent("end", prediction);
});

function generateSamplePrediction(): PredictionState {
    return {
        prediction: {
            title: "今回のトライでレイドをクリアできる？",
            startDate: new Date(),
            lockDate: new Date(Date.now() + 2 * 60 * 1000),
            outcomes: [
                { id: "1", title: "できる、GG", channelPoints: 18400, users: 142, color: "blue" },
                { id: "2", title: "無理、全滅", channelPoints: 9600, users: 88, color: "pink" }
            ],
            winningOutcomeId: null,
            status: "active"
        }
    };
}

export const twitchPrediction: OverlayWidgetType<PredictionSettings, PredictionState> = {
    id: TWITCH_PREDICTION_TYPE_ID,
    name: "Twitch 予想",
    description: "実行中の Twitch 予想を、リアルタイムのチャンネルポイント合計とともに表示します。予想が行われていないときは何も表示しません。",
    icon: "fa-question-circle",
    settingsSchema: [
        {
            name: "fontOptions",
            title: "フォント設定",
            type: "font-options",
            default: {
                family: "Inter",
                weight: 600,
                size: 20,
                italic: false,
                color: "#FFFFFF"
            },
            allowAlpha: false
        },
        {
            name: "backgroundColor",
            title: "背景色",
            type: "hexcolor",
            default: "#18181B",
            allowAlpha: true
        },
        {
            name: "timeBarColor",
            title: "残り時間バーの色",
            description: "予想の受付中に下部に表示されるカウントダウンバーの色です。",
            type: "hexcolor",
            default: "#9147FF",
            showBottomHr: true
        },
        {
            name: "showUsers",
            title: "予想した人数を表示",
            description: "各選択肢を予想したユーザー数を表示します。",
            type: "boolean",
            default: true
        },
        {
            name: "lingerSeconds",
            title: "結果の表示時間（秒）",
            description: "予想終了後に最終結果を画面に表示し続ける時間です。",
            type: "number",
            default: 10
        }
    ],
    initialAspectRatio: { width: 4, height: 3 },
    initialState: { prediction: null },
    supportsLivePreview: true,
    livePreviewState: generateSamplePrediction,
    componentExtension: loadComponentExtension("twitch-prediction")
};
