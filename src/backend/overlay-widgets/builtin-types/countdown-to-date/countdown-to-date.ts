import { DateTime, Duration, DurationLikeObject } from "luxon";
import { FontOptions, EffectList, OverlayWidgetType, IOverlayWidgetEventUtils, WidgetOverlayEvent, Trigger } from "../../../../types";
import NodeCache from "node-cache";
import effectRunner from "../../../common/effect-runner";
import logger from "../../../logwrapper";

type Settings = {
    targetDateTime: string;
    format: "simple" | "human";
    fontOptions?: FontOptions;
    horizontalAlignment: "left" | "center" | "right";
    verticalAlignment: "top" | "center" | "bottom";
    onCompleteEffects?: EffectList;
};

type State = Record<never, never>;

const completeCache = new NodeCache({ stdTTL: 30, checkperiod: 1 });

export const countdownToDate: OverlayWidgetType<Settings, State> = {
    id: "firebot:countdown-to-date",
    name: "日時までカウントダウン",
    description: "指定した日時までのカウントダウンです。",
    icon: "fa-alarm-clock",
    settingsSchema: [
        {
            name: "targetDateTime",
            title: "目標日時",
            description: "このカウントダウンが 0 になる日時を指定します。",
            type: "date-time",
            default: new Date().toISOString(),
            validation: {
                futureOnly: true
            }
        },
        {
            name: "format",
            title: "表示形式",
            description: 'シンプル形式（「8:35:42」）または読み解きやすい形式（「8時間35刀42秒」）で表示するかを選択します。',
            type: "radio-cards",
            default: "simple",
            options: [
                { value: "simple", label: "シンプル", iconClass: "fa-watch-calculator" },
                { value: "human", label: "読み解きやすい形式", iconClass: "fa-comment-lines" }
            ]
        },
        {
            name: "fontOptions",
            title: "フォント設定",
            type: "font-options",
            default: {
                family: "Inter",
                weight: 600,
                size: 24,
                italic: false,
                color: "#FFFFFF"
            },
            allowAlpha: true,
            showBottomHr: true
        },
        {
            name: "horizontalAlignment",
            title: "水平揃え",
            description: "ウィジェット内のテキストの水平方向の揃えを指定します。",
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
            default: "center"
        },
        {
            name: "verticalAlignment",
            title: "垂直揃え",
            description: "ウィジェット内のテキストの垂直方向の揃えを指定します。",
            type: "radio-cards",
            options: [{
                value: "top", label: "上", iconClass: "fa-arrow-to-top"
            }, {
                value: "center", label: "中央", iconClass: "fa-border-center-h"
            }, {
                value: "bottom", label: "下", iconClass: "fa-arrow-to-bottom"
            }],
            settings: {
                gridColumns: 3
            },
            default: "center",
            showBottomHr: true
        },
        {
            name: "onCompleteEffects",
            title: "完了時エフェクト",
            description: "カウントダウンがゼロに達したときに実行するエフェクトです。",
            type: "effectlist"
        }
    ],
    initialAspectRatio: { width: 3, height: 2 },
    initialState: {},
    supportsLivePreview: true,
    livePreviewState: {},
    stateDisplay: (config) => {
        const endDate = DateTime.fromJSDate(new Date(config.settings.targetDateTime)).setLocale("ja");
        return endDate.toLocaleString(DateTime.DATETIME_SHORT);
    },
    onOverlayMessage(config, messageName) {
        if (messageName === "countdown-to-date-complete") {
            if (config.settings.onCompleteEffects?.list != null) {
                const recentlyCompleted = completeCache.get(config.id);
                if (!recentlyCompleted) {
                    completeCache.set(config.id, true, 30);

                    const processEffectsRequest = {
                        trigger: {
                            type: "overlay_widget",
                            metadata: {
                                username: "Firebot",
                                countdownToDateWidgetId: config.id,
                                countdownToDateWidgetName: config.name
                            }
                        } as Trigger,
                        effects: config.settings.onCompleteEffects
                    };

                    effectRunner.processEffects(processEffectsRequest).catch((reason) => {
                        logger.error(`Error when running effects: ${reason}`);
                    });
                }
            }
        }
    },
    overlayExtension: {
        dependencies: {
            js: [
                "https://cdn.jsdelivr.net/npm/luxon@3.7.2/build/global/luxon.min.js"
            ]
        },
        eventHandler: (event: WidgetOverlayEvent<Settings, State>, utils: IOverlayWidgetEventUtils) => {
            const generateWidgetHtml = (config: typeof event["data"]["widgetConfig"]) => {
                const containerStyles = {
                    "width": "100%",
                    "height": "100%",
                    "display": "flex",
                    "flex-direction": "column",
                    "justify-content": config.settings?.verticalAlignment === 'top' ? 'flex-start' : config.settings?.verticalAlignment === 'bottom' ? 'flex-end' : 'center',
                    "align-items": config.settings?.horizontalAlignment === 'left' ? 'flex-start' : config.settings?.horizontalAlignment === 'right' ? 'flex-end' : 'center',
                    "text-align": config.settings?.horizontalAlignment as string,
                    ...utils.getFontOptionsStyles(config.settings?.fontOptions)
                };

                // eslint-disable-next-line
                const DateTime = (window as any).luxon.DateTime;

                // eslint-disable-next-line
                const Duration = (window as any).luxon.Duration;

                const units: (keyof DurationLikeObject)[] = ["years", "months", "days", "hours", "minutes", "seconds"];

                // eslint-disable-next-line
                let remainingTime: Duration = (<DateTime>DateTime.fromISO(config.settings?.targetDateTime))
                    .diffNow(units);

                const remainingMillis = remainingTime.valueOf();

                if (remainingMillis < 0) {
                    // eslint-disable-next-line
                    remainingTime = Duration.fromMillis(0).shiftTo(...units);
                } else if (remainingMillis < 750 && remainingMillis > -750) {
                    utils.sendMessageToFirebot("countdown-to-date-complete");
                }

                let formatted = "";
                if (config.settings?.format === "human") {
                    const shiftedDuration = remainingTime.shiftToAll();
                    const includedUnits: (keyof DurationLikeObject)[] = [];

                    for (const unit of units) {
                        if (shiftedDuration.get(unit) > 0) {
                            includedUnits.push(unit);
                        }
                    }

                    formatted = remainingTime
                        .shiftTo(...includedUnits)
                        .reconfigure({
                            locale: "ja"
                        })
                        .toHuman({
                            maximumFractionDigits: 0,
                            roundingMode: "floor"
                        });
                } else {
                    let format = "hh:mm:ss";
                    if (remainingTime.days >= 1) {
                        format = `dd:${format}`;
                    }
                    if (remainingTime.months >= 1) {
                        format = `MM:${format}`;
                    }
                    if (remainingTime.years >= 1) {
                        format = `y:${format}`;
                    }

                    formatted = remainingTime.toFormat(format);
                }

                return `
                <div id="text-container" style="${utils.stylesToString(containerStyles)}">
                    ${formatted?.replace(/\n/g, '<br>') ?? ''}
                </div>
                `;
            };

            utils.handleOverlayEvent(generateWidgetHtml);


            if (event.name === "show") {
                utils.getWidgetContainerElement()?.addEventListener("firebot:clock-tick", (e) => {
                    if (e.target?.["widgetConfig"]) {
                        utils.updateWidgetContent(generateWidgetHtml(e.target["widgetConfig"] as typeof event["data"]["widgetConfig"]));
                    }
                });
            }
        },
        onInitialLoad: (utils) => {
            const timeUntilNextSecond = 1000 - (Date.now() % 1000);
            setTimeout(() => {
                setInterval(() => {
                    utils.getWidgetContainerElements().forEach((widgetEl) => {
                        widgetEl.dispatchEvent(new CustomEvent("firebot:clock-tick"));
                    });
                }, 1000);
            }, timeUntilNextSecond);
        }
    }
};
