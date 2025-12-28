import { FontOptions } from "../../../../types/parameters";
import { OverlayWidgetType, OverlayWidgetConfig, IOverlayWidgetEventUtils } from "../../../../types/overlay-widgets";
import { WidgetOverlayEvent } from "../../../../types/overlay-widgets";
import { Duration } from "luxon";
import frontendCommunicator from "../../../common/frontend-communicator";

export type Settings = {
    fontOptions: FontOptions;
    alignment: "left" | "center" | "right";
    runWhenInactive?: boolean;
};

export type State = {
    remainingSeconds: number;
    mode: "running" | "paused";
};

export type DynamicCountdownWidgetConfig = OverlayWidgetConfig<Settings, State> & {
    type: "firebot:countdown-dynamic";
};

export const dynamicCountdown: OverlayWidgetType<Settings, State> = {
    id: "firebot:countdown-dynamic",
    name: "カウントダウンタイマー（動的）",
    description: "エフェクト経由で動的に制御・更新できるカウントダウンタイマー（サバソンなどに使用）",
    icon: "fa-hourglass-half",
    settingsSchema: [
        {
            name: "fontOptions",
            title: "フォントオプション",
            description: "カウントダウンの表示をカスタマイズします。",
            type: "font-options",
            default: {
                family: "Inter",
                weight: 400,
                size: 48,
                italic: false,
                color: "#FFFFFF"
            },
            allowAlpha: true
        },
        {
            name: "alignment",
            title: "テキストの配置",
            description: "ウィジェットエリア内のカウントダウンテキストの配置",
            type: "radio-cards",
            options: [{
                value: "left", label: "左", iconClass: "fa-align-left"
            }, {
                value: "center", label: "中央", iconClass: "fa-align-center"
            }, {
                value: "right", label: "右", iconClass: "fa-align-right"
            }],
            settings: {
                gridColumns: 3
            },
            default: "center",
            showBottomHr: true
        },
        {
            name: "runWhenInactive",
            title: "非アクティブ時も実行",
            description: "ウィジェットが非アクティブ（非表示）の時もカウントダウンを継続するかどうか",
            type: "boolean",
            default: false
        }
    ],
    initialState: {
        remainingSeconds: 0,
        mode: "paused"
    },
    supportsLivePreview: true,
    livePreviewState: {
        remainingSeconds: 248660, // 69 hours, 04 minutes, and 20 seconds (nice)
        mode: "paused"
    },
    stateDisplay: (config) => {
        const duration = Duration.fromDurationLike({ seconds: Math.round(config.state?.remainingSeconds ?? 0) }).rescale();
        const secondsDisplay = duration.shiftTo("hours", "minutes", "seconds").toFormat("hh:mm:ss");
        return `${secondsDisplay} (${config.state?.mode ?? 'paused'})`;
    },
    uiActions: [
        {
            id: "toggle",
            label: "開始/一時停止",
            icon: "fa-play-circle",
            click: async (config) => {
                if ((config.state?.remainingSeconds ?? 0) > 0) {
                    return {
                        newState: {
                            ...config.state,
                            mode: config.state.mode === "running" ? "paused" : "running"
                        },
                        persistState: true
                    };
                }
            }
        },
        {
            id: "add-time",
            label: "時間を追加",
            icon: "fa-plus-circle",
            click: async (config) => {
                const seconds = await frontendCommunicator.fireEventAsync("openGetInputModal", {
                    config: {
                        model: config.state?.remainingSeconds ?? 0,
                        inputType: "number",
                        label: "秒数を追加",
                        saveText: "保存",
                        descriptionText: "カウントダウンに追加する秒数を入力してください。負の値で時間を減らすことができます。",
                        inputPlaceholder: "数値を入力",
                        validationText: '有効な数値を入力してください。'
                    },
                    validation: {
                        required: true
                    }
                });

                if (seconds == null) {
                    return;
                }

                console.log("Adding seconds:", seconds, typeof seconds);

                const newRemaining = Math.max(0, (config.state?.remainingSeconds ?? 0) + Number(seconds));

                return {
                    newState: {
                        ...config.state,
                        remainingSeconds: newRemaining
                    }
                };
            }
        },
        {
            id: "set-time",
            label: "時間を設定",
            icon: "fa-clock",
            click: async (config) => {
                const seconds = await frontendCommunicator.fireEventAsync("openGetInputModal", {
                    config: {
                        model: 0,
                        inputType: "number",
                        label: "時間を設定",
                        saveText: "保存",
                        descriptionText: "カウントダウンの合計秒数を入力してください。カウントダウンはこの値に設定されます。",
                        inputPlaceholder: "数値を入力",
                        validationText: '有効な数値を入力してください。'
                    },
                    validation: {
                        required: true
                    }
                });

                if (seconds == null) {
                    return;
                }

                const newRemaining = Math.max(0, Number(seconds));

                return {
                    newState: {
                        ...config.state,
                        remainingSeconds: newRemaining,
                        mode: newRemaining === 0 ? "paused" : config.state?.mode ?? "paused"
                    }
                };
            }
        }
    ],
    overlayExtension: {
        eventHandler: (event: WidgetOverlayEvent<Settings, State>, utils: IOverlayWidgetEventUtils) => {
            const generateWidgetHtml = (config: typeof event["data"]["widgetConfig"]) => {
                const remainingSeconds = config.state?.remainingSeconds ?? 0;

                // show time as hh:mm:ss
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                const seconds = remainingSeconds % 60;
                const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                const containerStyles = {
                    "font-family": config.settings?.fontOptions?.family || 'Inter, sans-serif',
                    "font-size": (config.settings?.fontOptions?.size ? `${config.settings.fontOptions.size}px` : '48px'),
                    "font-weight": config.settings?.fontOptions?.weight?.toString() || '400',
                    "font-style": config.settings?.fontOptions?.italic ? 'italic' : 'normal',
                    "color": config.settings?.fontOptions?.color || '#FFFFFF',
                    "width": "100%",
                    "height": "100%",
                    "overflow": "hidden",
                    "display": "flex",
                    "align-items": "center",
                    "justify-content": config.settings?.alignment === 'left' ? 'flex-start' : config.settings?.alignment === 'right' ? 'flex-end' : 'center'
                };

                return `
                <div id="countdown-container" style="${utils.stylesToString(containerStyles)}">
                    <div id="time-remaining">
                        ${timeString}
                    </div>
                </div>`;
            };

            utils.handleOverlayEvent(generateWidgetHtml);
        }
    }
};
