import logger from "../../../logwrapper";
import type { ReplaceVariable, Trigger } from "../../../../types/variables";

import overlayWidgetConfigManager from "../../../overlay-widgets/overlay-widget-config-manager";

const model: ReplaceVariable = {
    definition: {
        handle: "overlayWidgetState",
        usage: "overlayWidgetState[nameOrId]",
        description: '指定したオーバーレイウィジェットの状態を取得します。',
        examples: [
            {
                usage: 'overlayWidgetState[myWidget]',
                description: "ID が 'myWidget' のオーバーレイウィジェットの状態を取得します。"
            },
            {
                usage: 'overlayWidgetState[myWidget, object.path.here]',
                description: "状態の JSON オブジェクトをパスで辿ります。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["ALL"]
    },
    evaluator: (
        trigger: Trigger,
        nameOrId: string,
        responseJsonPath: string
    ) => {
        try {
            const widgetConfig = overlayWidgetConfigManager.getItemByName(nameOrId) ?? overlayWidgetConfigManager.getItem(nameOrId);

            if (!widgetConfig) {
                return "[WIDGET NOT FOUND]";
            }

            const widgetState = widgetConfig.state;

            if (responseJsonPath != null) {
                if (widgetState != null) {
                    const jsonPathNodes = responseJsonPath.split(".");
                    try {
                        let currentObject: unknown = null;
                        for (const node of jsonPathNodes) {
                            const objToTraverse = currentObject === null ? widgetState : currentObject;
                            if (objToTraverse[node] != null) {
                                currentObject = objToTraverse[node];
                            } else {
                                currentObject = "[JSON PARSE ERROR]";
                                break;
                            }
                        }
                        return currentObject;
                    } catch (err) {
                        logger.warn("error when parsing api json", err);
                        return "[JSON PARSE ERROR]";
                    }
                }
            }

            return widgetState;
        } catch {
            return "[API ERROR]";
        }
    }
};

export default model;