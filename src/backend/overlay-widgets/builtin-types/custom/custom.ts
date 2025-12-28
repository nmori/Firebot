import { OverlayWidgetType, IOverlayWidgetEventUtils, WidgetOverlayEvent } from "../../../../types/overlay-widgets";

type Settings = {
    html: string;
    onShowJs?: string;
    onStateUpdateJs?: string;
    onMessageJs?: string;
};

type State = {};

export const custom: OverlayWidgetType<Settings, State> = {
    id: "firebot:custom",
    name: "カスタムウィジェット",
    description: "独自のHTMLとJavaScriptでカスタムウィジェットを作成",
    icon: "fa-cog",
    settingsSchema: [
        {
            name: "html",
            type: "codemirror",
            title: "HTML",
            description: "表示する初期HTMLです。",
            default: `<div id="my-widget">Hello, world!</div>`,
            settings: {
                mode: "htmlmixed",
                lineNumbers: true,
                showGutter: true,
                autoRefresh: true,
                theme: "blackboard"
            }
        },
        {
            name: "onShowJs",
            type: "codemirror",
            title: "onShow JS",
            description: "ウィジェットが表示される時に実行されるオプションのコードです。非同期関数内で実行されます（awaitをサポート）。",
            default: `// 例: ウィジェットのコンテンツのテキスト色を赤に変更\ncontainerElement\n.   .querySelector('#my-widget')\n.   .style.color = 'red';`,
            tip: "利用可能な変数:\n- `containerElement` (ウィジェットのルートHTML要素)\n- `widgetId` (このウィジェットの固有ID)\n- `widgetState` (ウィジェットの現在の状態、存在する場合)",
            settings: {
                mode: { name: "javascript" },
                lineNumbers: true,
                showGutter: true,
                autoRefresh: true,
                theme: "blackboard"
            }
        },
        {
            name: "onStateUpdateJs",
            type: "codemirror",
            title: "onStateUpdate JS",
            description: "カスタムウィジェット状態の更新エフェクトでウィジェットの状態が更新される時に実行されるオプションのコードです。非同期関数内で実行されます（awaitをサポート）。",
            default: ``,
            tip: "利用可能な変数:\n- `containerElement` (ウィジェットのルートHTML要素)\n- `widgetId` (このウィジェットの固有ID)\n- `widgetState` (ウィジェットの現在の状態、存在する場合)",
            settings: {
                mode: { name: "javascript" },
                lineNumbers: true,
                showGutter: true,
                autoRefresh: true,
                theme: "blackboard"
            }
        },
        {
            name: "onMessageJs",
            type: "codemirror",
            title: "onMessage JS",
            description: "カスタムウィジェットにメッセージを送信エフェクトからメッセージを受信する時に実行されるオプションのコードです。非同期関数内で実行されます（awaitをサポート）。",
            default: ``,
            tip: "利用可能な変数:\n- `containerElement` (ウィジェットのルートHTML要素)\n- `widgetId` (このウィジェットの固有ID)\n- `widgetState` (ウィジェットの現在の状態、存在する場合)\n- `messageName` (受信したメッセージの名前)\n- `messageData` (メッセージと共に送信されたデータ、存在する場合)",
            settings: {
                mode: { name: "javascript" },
                lineNumbers: true,
                showGutter: true,
                autoRefresh: true,
                theme: "blackboard"
            }
        }
    ],
    initialState: {},
    supportsLivePreview: true,
    livePreviewState: {},
    overlayExtension: {
        eventHandler: async (event: WidgetOverlayEvent<Settings, State>, utils: IOverlayWidgetEventUtils) => {
            utils.handleOverlayEvent((config) => {
                return config.settings.html as string ?? "<div></div>";
            });

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
                    console.error(`Error in custom widget ${(event.data.widgetConfig as any).name ?? event.data.widgetConfig.id}:`, e);
                }
            };

            if ((event.name === "show" || event.name === "settings-update") && event.data.widgetConfig.settings.onShowJs) {
                await runRawJs(event.data.widgetConfig.settings.onShowJs, {
                    containerElement: utils.getWidgetContainerElement(),
                    widgetId: event.data.widgetConfig.id,
                    widgetState: event.data.widgetConfig.state
                });
            }

            if (event.name === "state-update" && event.data.widgetConfig.settings.onStateUpdateJs) {
                await runRawJs(event.data.widgetConfig.settings.onStateUpdateJs, {
                    containerElement: utils.getWidgetContainerElement(),
                    widgetId: event.data.widgetConfig.id,
                    widgetState: event.data.widgetConfig.state
                });
            }

            if (event.name === "message" && event.data.widgetConfig.settings.onMessageJs) {
                await runRawJs(event.data.widgetConfig.settings.onMessageJs, {
                    containerElement: utils.getWidgetContainerElement(),
                    widgetId: event.data.widgetConfig.id,
                    widgetState: event.data.widgetConfig.state,
                    messageName: event.data.messageName,
                    messageData: event.data.messageData
                });
            }
        }
    }
};
