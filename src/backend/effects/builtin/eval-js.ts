import { EffectType } from "../../../types/effects";
import { evalSandboxedJs } from "../../common/handlers/js-sandbox/sandbox-eval";
import logger from "../../logwrapper";

const effect: EffectType<{
    code: string;
    parameters: string[];
}> = {
    definition: {
        id: "firebot:eval-js",
        name: "JavaScriptの実行",
        description: "JavaScriptの式を実行します",
        icon: "fab fa-js",
        categories: ["advanced"],
        dependencies: [],
        outputs: [
            {
                label: "実行結果",
                defaultName: "jsResult",
                description: "JavaScriptの実行結果です。returnで値を返さないと取得できません"
            }
        ]
    },
    optionsTemplate: `
    <eos-container header="実行式">
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
            Things to note:
            <ul>
                <li>JavaScript は、サンドボックス化されたブラウザ環境で実行されます。</li>
				 <li>結果を出力としてキャプチャさせるには、<code>return</code> を使用する必要があります</li>
				 <li>パラメータは、<code>parameters[n]</code></li>
				 <li>トリガーのメタデータは、<code>metadata.*</code></li> を介してアクセスできます。
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
            errors.push("Please enter some JavaScript code.");
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
