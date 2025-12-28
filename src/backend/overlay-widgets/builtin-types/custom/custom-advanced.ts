import { OverlayWidgetType, IOverlayWidgetEventUtils, WidgetOverlayEvent } from "../../../../types/overlay-widgets";

type Settings = {
    onEventJs: string;
};

type State = {};

export const customAdvanced: OverlayWidgetType<Settings, State> = {
    id: "firebot:custom-advanced",
    name: "カスタムウィジェット（高度）",
    description: "すべてを任意で設定できる高度なカスタムウィジェット。JavaScriptでオーバーレイのイベントを処理し、DOMを自由に変更可能",
    icon: "fa-cogs",
    settingsSchema: [
        {
            name: "onEventJs",
            type: "codemirror",
            title: "onEvent JS",
            description: "ウィジェットが任意のイベントを受信する時に実行されるコードです。非同期関数内で実行されます（awaitをサポート）。",
            default:
`// 例: 赤いボックスを表示・非表示
if (eventName === "show") {
  const styles = {
    width: "100px",
    height: "100px",
    position: "absolute",
    top: "100px",
    left: "100px",
    background: "red",
  };
  overlayWrapperElement
    .insertAdjacentHTML(
  		"beforeend",
  		\`<div id="\${widgetId}" style="\${utils.stylesToString(styles)}"></div>\`);
} else if (eventName === "remove") {
  document
    .getElementById(widgetId)?.remove();
}`,
            tip: "利用可能な変数:\n- `eventName` (受信したイベントの名前: `show`, `settings-update`, `state-update`, `message`, `remove`)\n- `widgetId` (このウィジェットの固有ID)\n- `widgetState` (ウィジェットの現在の状態、存在する場合)\n- `messageName` (受信したメッセージの名前、イベントが'message'の場合)\n- `messageData` (メッセージと共に送信されたデータ、存在しイベントが'message'の場合)\n- `overlayWrapperElement` (オーバーレイの公式ルート要素、DOM操作にはこれを使用することを推奨)\n- `utils.stylesToString(styles)` (スタイルオブジェクトをインラインCSS文字列に変換するユーティリティ関数)",
            settings: {
                mode: { name: "javascript" },
                lineNumbers: true,
                showGutter: true,
                autoRefresh: true,
                theme: "blackboard"
            },
            validation: {
                required: true
            }
        }
    ],
    initialState: {},
    userCanConfigure: {
        position: false,
        entryAnimation: false,
        exitAnimation: false
    },
    supportsLivePreview: false,
    livePreviewState: {},
    overlayExtension: {
        eventHandler: async (event: WidgetOverlayEvent<Settings, State>, utils: IOverlayWidgetEventUtils) => {
            if (!event.data.widgetConfig.settings.onEventJs) {
                return;
            }

            const runRawJs = async (jsCode: string, args: Record<string, unknown>) => {
                try {
                    const argsEntries = Object.entries(args);
                    const argsNames = argsEntries.map(([key]) => key);
                    const argsValues = argsEntries.map(([, value]) => value);

                    const AsyncFunction = (async function () {}).constructor;

                    // @ts-ignore
                    const evaluate = new AsyncFunction(
                        ...argsNames,
                        jsCode
                    );

                    // Attempt to call the evaluator function
                    await evaluate(
                        ...argsValues
                    );

                } catch (e) {
                    console.error(`Error in custom widget "${(event.data.widgetConfig as any).name ?? event.data.widgetConfig.id}":`);
                    console.error(e);
                }
            };

            await runRawJs(event.data.widgetConfig.settings.onEventJs, {
                eventName: event.name,
                widgetId: event.data.widgetConfig.id,
                widgetState: event.data.widgetConfig.state,
                messageName: event.data.messageName,
                messageData: event.data.messageData,
                overlayWrapperElement: document.body.querySelector(".wrapper"),
                utils: {
                    stylesToString: utils.stylesToString
                }
            });
        }
    }
};
