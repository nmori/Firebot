import { OverlayWidgetType } from "../../../../types/overlay-widgets";
import { FontOptions } from "../../../../types/parameters";
import overlayWidgetConfigManager from "../../overlay-widget-config-manager";
import { ChannelPoll } from "../../../../types";
import { InternalBus } from "../../../internal-bus";
import { loadComponentExtension } from "../../builtin-widget-helpers";

export const TWITCH_POLL_TYPE_ID = "firebot:twitch-poll";

export type PollSettings = {
    fontOptions?: FontOptions;
    accentColor: string;
    backgroundColor: string;
    timeBarColor: string;
    showPercentages: boolean;
    /** How long (seconds) to keep the final results visible after the poll ends. */
    lingerSeconds: number;
};

export type PollState = {
    poll: ChannelPoll | null;
};

// Per-widget timers used to clear the results after a poll ends.
const lingerTimers = new Map<string, NodeJS.Timeout>();

function clearLingerTimer(widgetId: string) {
    const timer = lingerTimers.get(widgetId);
    if (timer) {
        clearTimeout(timer);
        lingerTimers.delete(widgetId);
    }
}


function updateAllPollWidgets(poll: ChannelPoll) {
    const configs = overlayWidgetConfigManager.getConfigsOfType(TWITCH_POLL_TYPE_ID);
    for (const config of configs) {
        if (config.active === false) {
            continue;
        }
        clearLingerTimer(config.id);
        overlayWidgetConfigManager.setWidgetStateById(config.id, { poll }, false);
    }
}

function handlePollEnd(poll: ChannelPoll) {
    const state: PollState = {
        poll: {
            ...poll,
            status: "completed"
        }
    };
    const configs = overlayWidgetConfigManager.getConfigsOfType(TWITCH_POLL_TYPE_ID);
    for (const config of configs) {
        if (config.active === false) {
            continue;
        }
        clearLingerTimer(config.id);
        overlayWidgetConfigManager.setWidgetStateById(config.id, state, false);

        const settings = (config.settings ?? {}) as Partial<PollSettings>;
        const lingerMs = Math.max(0, (settings.lingerSeconds ?? 8)) * 1000;
        const timer = setTimeout(() => {
            lingerTimers.delete(config.id);
            overlayWidgetConfigManager.setWidgetStateById(config.id, { poll: null } as PollState, false);
        }, lingerMs);
        lingerTimers.set(config.id, timer);
    }
}

function handlePollEvent(event: "begin" | "progress" | "end", poll: ChannelPoll) {
    // Only do work if there's at least one poll widget configured.
    if (overlayWidgetConfigManager.getConfigsOfType(TWITCH_POLL_TYPE_ID).length === 0) {
        return;
    }

    try {
        switch (event) {
            case "begin":
            case "progress":
                updateAllPollWidgets(poll);
                break;
            case "end":
                handlePollEnd(poll);
                break;
            default:
                break;
        }
    } catch {}
}

InternalBus.on("channel-poll-begin", (poll) => {
    handlePollEvent("begin", poll);
});

InternalBus.on("channel-poll-progress", (poll) => {
    handlePollEvent("progress", poll);
});

InternalBus.on("channel-poll-end", (poll) => {
    handlePollEvent("end", poll);
});

function generateSamplePollState(): PollState {
    return {
        poll: {
            title: "次はどのゲームをプレイする？",
            choices: [
                { id: "1", title: "Elden Ring", totalVotes: 142, channelPointsVotes: 0 },
                { id: "2", title: "Hollow Knight", totalVotes: 98, channelPointsVotes: 0 },
                { id: "3", title: "Celeste", totalVotes: 61, channelPointsVotes: 0 }
            ],
            winningChoiceIds: ["1"],
            isChannelPointsVotingEnabled: false,
            channelPointsPerVote: 0,
            startDate: new Date(),
            endDate: new Date(Date.now() + 5 * 60 * 1000),
            status: "active"
        }
    };
}

export const twitchPoll: OverlayWidgetType<PollSettings, PollState> = {
    id: TWITCH_POLL_TYPE_ID,
    name: "Twitch 投票",
    description: "実行中の Twitch 投票を、リアルタイムの得票数とともに表示します。投票が行われていないときは何も表示しません。",
    icon: "fa-poll-h",
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
            name: "accentColor",
            title: "アクセントカラー",
            description: "得票バーと、勝利した選択肢のハイライトの色です。",
            type: "hexcolor",
            default: "#9147FF"
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
            description: "投票の受付中に下部に表示されるカウントダウンバーの色です。",
            type: "hexcolor",
            default: "#9147FF",
            showBottomHr: true
        },
        {
            name: "showPercentages",
            title: "割合を表示",
            description: "各選択肢の得票率を表示します。",
            type: "boolean",
            default: true
        },
        {
            name: "lingerSeconds",
            title: "結果の表示時間（秒）",
            description: "投票終了後に最終結果を画面に表示し続ける時間です。",
            type: "number",
            default: 8
        }
    ],
    initialAspectRatio: { width: 4, height: 3 },
    initialState: { poll: null },
    supportsLivePreview: true,
    livePreviewState: generateSamplePollState,
    componentExtension: loadComponentExtension("twitch-poll")
};
