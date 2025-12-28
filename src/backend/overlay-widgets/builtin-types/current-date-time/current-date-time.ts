import { OverlayWidgetType, IOverlayWidgetEventUtils, WidgetOverlayEvent } from "../../../../types/overlay-widgets";
import { FontOptions } from "../../../../types/parameters";

type Settings = {
    format?: string;
    fontOptions?: FontOptions;
    horizontalAlignment: "left" | "center" | "right";
    verticalAlignment: "top" | "center" | "bottom";
};

type State = {};

export const currentDateTime: OverlayWidgetType<Settings, State> = {
    id: "firebot:current-date-time",
    name: "現在の日時",
    description: "現在の日付・時刻を表示するウィジェット",
    icon: "fa-clock",
    settingsSchema: [
        {
            name: "format",
            title: "フォーマット",
            description: '[luxon.js](https://moment.github.io/luxon/#/formatting?id=table-of-tokens)のフォーマットルールを使用します。',
            type: "string",
            default: "DD h:mm:ss a",
            useTextArea: true,
            validation: {
                required: true
            }
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
            default: "center",
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
                    ...utils.getFontOptionsStyles(config.settings?.fontOptions),
                };

                const DateTime = (window as any).luxon.DateTime;

                const now = DateTime.now();
                const formatted = config.settings?.format ? now.toFormat(config.settings.format) : now.toLocaleString(DateTime.DATETIME_MED);

                return `
                <div id="text-container" style="${utils.stylesToString(containerStyles)}">
                    ${formatted?.replace(/\n/g, '<br>') ?? ''}
                </div>
                `;
            };

            utils.handleOverlayEvent(generateWidgetHtml);


            if(event.name === "show") {
                utils.getWidgetContainerElement()?.addEventListener("firebot:clock-tick", (e) => {
                    if(e.target?.["widgetConfig"]) {
                        utils.updateWidgetContent(generateWidgetHtml(e.target["widgetConfig"]));
                    }
                });
            }
        },
        onInitialLoad: (utils) => {
            const timeUntilNextSecond = 1000 - (Date.now() % 1000);
            setTimeout(() => {
                setInterval(() => {
                    utils.getWidgetContainerElements().forEach(widgetEl => {
                        widgetEl.dispatchEvent(new CustomEvent("firebot:clock-tick"));
                    });
                }, 1000);
            }, timeUntilNextSecond);
        }
    }
};
