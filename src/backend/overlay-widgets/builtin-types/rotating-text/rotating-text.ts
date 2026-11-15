import type { OverlayWidgetType, OverlayWidgetConfig, FontOptions, Animation } from "../../../../types";
import { loadComponentExtension } from "../../builtin-widget-helpers";

export const ROTATING_TEXT_TYPE_ID = "firebot:rotating-text";

export type RotatingTextSettings = {
    texts: string[];
    intervalSeconds: number;
    randomizeOrder: boolean;
    fontOptions?: FontOptions;
    horizontalAlignment: "left" | "center" | "right";
    verticalAlignment: "top" | "center" | "bottom";
    backgroundColor: string;
    backgroundBorderRadius: number;
    addDropShadow: boolean;
    textEnterAnimation: Animation;
    textExitAnimation: Animation;
};

export type RotatingTextState = Record<string, never>;

export type RotatingTextWidgetConfig = OverlayWidgetConfig<RotatingTextSettings, RotatingTextState>;

export const rotatingText: OverlayWidgetType<RotatingTextSettings, RotatingTextState> = {
    id: ROTATING_TEXT_TYPE_ID,
    name: "ローテーションテキスト",
    description: "テキストの一覧を一定間隔で切り替えて表示するウィジェットです。切り替えのたびに登場・退場アニメーションを再生します。",
    icon: "fa-text",
    // The texts list is managed via the "Update Rotating Text" effect (add/remove/set)
    nonEditableSettings: ["texts"],
    settingsSchema: [
        {
            name: "texts",
            title: "テキスト",
            description: "切り替えて表示するテキストの一覧です。",
            type: "editable-list",
            default: ["1 つ目のメッセージ", "2 つ目のメッセージ", "3 つ目のメッセージ"],
            settings: {
                useTextArea: true,
                sortable: true,
                addLabel: "テキストを追加",
                editLabel: "テキストを編集",
                noneAddedText: "テキストはまだ追加されていません"
            },
            allowReplaceVariables: true
        },
        {
            name: "intervalSeconds",
            title: "切り替え間隔（秒）",
            description: "次のテキストに切り替えるまで各テキストを表示する時間です。",
            type: "number",
            default: 5,
            validation: {
                min: 1
            }
        },
        {
            name: "randomizeOrder",
            title: "ランダムな順番で表示",
            description: "順番どおりに切り替える代わりに、毎回ランダムなテキストを選びます。",
            type: "boolean",
            default: false,
            showBottomHr: true
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
            allowAlpha: true
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
            default: "center"
        },
        {
            name: "backgroundColor",
            title: "背景色",
            description: "テキストの背後に表示する背景パネルの色です（任意）。",
            type: "hexcolor",
            default: "#00000000",
            allowAlpha: true
        },
        {
            name: "backgroundBorderRadius",
            title: "背景の角丸",
            description: "背景パネルの角丸の半径（ピクセル）です（任意）。",
            type: "number",
            default: 0,
            validation: {
                min: 0
            }
        },
        {
            name: "addDropShadow",
            title: "ドロップシャドウを付ける",
            type: "boolean",
            default: false,
            showBottomHr: true
        },
        {
            name: "textEnterAnimation",
            title: "テキストの登場アニメーション",
            description: "テキストが切り替わって表示されるときのアニメーションです。",
            type: "animation-select",
            animationType: "enter",
            default: { class: "fadeIn" }
        },
        {
            name: "textExitAnimation",
            title: "テキストの退場アニメーション",
            description: "テキストが切り替わって消えるときのアニメーションです。",
            type: "animation-select",
            animationType: "exit",
            default: { class: "fadeOut" }
        }
    ],
    initialAspectRatio: { width: 3, height: 1 },
    initialState: {},
    supportsLivePreview: true,
    livePreviewState: {},
    componentExtension: loadComponentExtension("rotating-text")
};
