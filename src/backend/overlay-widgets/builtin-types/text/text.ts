import { OverlayWidgetType, IOverlayWidgetEventUtils, WidgetOverlayEvent } from "../../../../types/overlay-widgets";
import { FontOptions } from "../../../../types/parameters";

type Settings = {
    text: string;
    fontOptions?: FontOptions;
    horizontalAlignment: "left" | "center" | "right";
    verticalAlignment: "top" | "center" | "bottom";
};

type State = {};

export const text: OverlayWidgetType<Settings, State> = {
    id: "firebot:text",
    name: "テキスト",
    description: "オーバーレイウィジェット設定の更新エフェクトで動的に更新できるシンプルなテキストウィジェット",
    icon: "fa-font",
    settingsSchema: [
        {
            name: "text",
            title: "テキスト",
            type: "string",
            default: "サンプルテキスト",
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
        eventHandler: (event: WidgetOverlayEvent<Settings, State>, utils: IOverlayWidgetEventUtils) => {
            const generateWidgetHtml = (config: typeof event["data"]["widgetConfig"]) => {
                const containerStyles = {
                    "width": "100%",
                    "height": "100%",
                    "display": "flex",
                    "flex-direction": "column",
                    "justify-content": config.settings?.verticalAlignment === 'top' ? 'flex-start' : config.settings?.verticalAlignment === 'bottom' ? 'flex-end' : 'center',
                    "align-items": config.settings?.horizontalAlignment === 'left' ? 'flex-start' : config.settings?.horizontalAlignment === 'right' ? 'flex-end' : 'center',
                    ...utils.getFontOptionsStyles(config.settings?.fontOptions),
                };

                return `
                <div id="text-container" style="${utils.stylesToString(containerStyles)}">
                    ${config.settings?.text ? config.settings.text.replace(/\n/g, '<br>') : ''}
                </div>
                `;
            };

            utils.handleOverlayEvent(generateWidgetHtml);
        }
    }
};
