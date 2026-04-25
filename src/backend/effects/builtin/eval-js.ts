import { EffectType } from "../../../types/effects";
import { evalSandboxedJs } from "../../common/handlers/js-sandbox/sandbox-eval";
import logger from "../../logwrapper";

const effect: EffectType<{
    code: string;
    parameters: string[];
}> = {
    definition: {
        id: "firebot:eval-js",
        name: "JavaScript評価",
        description: "JavaScript 式を評価します",
        icon: "fab fa-js",
        categories: ["advanced", "scripting"],
        dependencies: [],
        outputs: [
            {
                label: "コードの結果",
                defaultName: "jsResult",
                description: "JavaScript コードの実行結果。結果を出力として取得するには <code>return</code> を使用してください。"
            }
        ]
    },
    optionsTemplate: `
    <eos-container header="コード">
        <div
            ui-codemirror="{onLoad : codemirrorLoaded}"
            ui-codemirror-opts="editorSettings"
            ng-model="effect.code"
            replace-variables
            menu-position="under">
        </div>
    </eos-container>

    <eos-container header="パラメータ" pad-top="true">
        <editable-list settings="parameterSettings" model="effect.parameters" />
    </eos-container>

    <eos-container>
        <div class="effect-info alert alert-info">
            注意点:
            <ul>
                <li>JavaScript はサンドボックス化されたブラウザ環境で評価されます</li>
                <li>結果を出力として取得するには <code>return</code> を使用してください</li>
                <li>パラメータは <code>parameters[n]</code> でアクセスできます</li>
                <li>トリガーのメタデータは <code>metadata.*</code> でアクセスできます</li>
            </ul>
        </div>
    </eos-container>
    `,
    optionsController: ($scope) => {
        $scope.editorSettings = {
            mode: 'javascript',
            theme: 'blackboard',
            lineNumbers: true,
            autoRefresh: true,
            showGutter: true
        };

        $scope.parameterSettings = {
            sortable: true,
            showIndex: true,
            indexZeroBased: true,
            indexTemplate: "parameters[{index}]"
        };

        $scope.codemirrorLoaded = function(_editor) {
            // Editor part
            _editor.refresh();
            const cmResize = require("cm-resize");
            cmResize(_editor, {
                minHeight: 200,
                resizableWidth: false,
                resizableHeight: true
            });
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.code == null) {
            errors.push("JavaScript コードを入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect, trigger }) => {
        try {
            const result = await evalSandboxedJs(effect.code, effect.parameters ?? [], trigger);
            return {
                success: true,
                outputs: {
                    jsResult: result
                }
            };
        } catch (err) {
            logger.error("Error evaluating JavaScript", err);
            return false;
        }
    }
};

export = effect;
