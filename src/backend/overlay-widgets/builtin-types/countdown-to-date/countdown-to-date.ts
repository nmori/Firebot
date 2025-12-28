import { DateTime, Duration, DurationLikeObject } from "luxon";
import { OverlayWidgetType, IOverlayWidgetEventUtils, WidgetOverlayEvent } from "../../../../types/overlay-widgets";
import { FontOptions } from "../../../../types/parameters";

type Settings = {
    targetDateTime: string;
    format: "simple" | "human";
    fontOptions?: FontOptions;
    horizontalAlignment: "left" | "center" | "right";
    verticalAlignment: "top" | "center" | "bottom";
};

type State = Record<never, never>;

export const countdownToDate: OverlayWidgetType<Settings, State> = {
    id: "firebot:countdown-to-date",
    name: "日時までのカウントダウン",
    description: "特定の日時までのカウントダウン",
    icon: "fa-alarm-clock",
    settingsSchema: [
        {
            name: "targetDateTime",
            title: "目標日時",
            description: "このカウントダウンが0に到達する日時",
            type: "date-time",
            default: new Date().toISOString(),
            validation: {
                futureOnly: true
            }
        },
        {
            name: "format",
            title: "フォーマット",
            description: 'カウントダウンをシンプル形式（「8:35:42」）または人間が読みやすい形式（「8時間35分42秒」）のどちらで表示するか',
            type: "radio-cards",
            default: "simple",
            options: [
                { value: "simple", label: "シンプル", iconClass: "fa-watch-calculator" },
                { value: "human", label: "人間が読みやすい", iconClass: "fa-comment-lines" }
            ]
        },
        {
            name: "fontOptions",
            title: "フォントオプション",
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
            title: "水平方向の配置",
            description: "ウィジェットエリア内のテキストの水平方向の配置",
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
            title: "垂直方向の配置",
            description: "ウィジェットエリア内のテキストの垂直方向の配置",
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
        }
    ],
    initialAspectRatio: { width: 3, height: 2 },
    initialState: {},
    supportsLivePreview: true,
    livePreviewState: {},
    stateDisplay: (config) => {
        const endDate = DateTime.fromJSDate(new Date(config.settings.targetDateTime));
        return endDate.toLocaleString(DateTime.DATETIME_SHORT);
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

                if (remainingTime.valueOf() < 0) {
                    // eslint-disable-next-line
                    remainingTime = Duration.fromMillis(0).shiftTo(...units);
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

                    formatted = remainingTime.shiftTo(...includedUnits)
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
