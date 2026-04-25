import type { EffectType, SettingsService } from "../../../types";
import { CustomVariableManager } from "../../common/custom-variable-manager";

const effect: EffectType<{
    name: string;
    variableData: string;
    ttl: number;
    propertyPath: string;
    persistToFile?: boolean;
}> = {
    definition: {
        id: "firebot:customvariable",
        name: "カスタム変数",
        description: "データをカスタム変数に保存し、他の場所で利用できます。",
        icon: "fad fa-value-absolute",
        categories: ["scripting"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="変数名">
            <p class="muted">この名前を $customVariable[name] のように参照して、他の場所で利用できます。</p>
            <input ng-model="effect.name" type="text" class="form-control" id="chat-text-setting" placeholder="名前を入力" replace-variables menu-position="below">
        </eos-container>

        <eos-container header="変数データ" pad-top="true">
            <p class="muted">変数に保存するデータです。文字列または別の置換フレーズを指定できます。</p>
            <selectable-input-editors
                editors="editors"
                initial-editor-label="initialEditorLabel"
                model="effect.variableData"
            />
            <p class="muted" style="font-size: 11px;"><b>注意:</b> 変数データが有効な JSON 文字列の場合、オブジェクトまたは配列にパースされます。</p>
        </eos-container>

        <eos-container header="プロパティパス（任意）" pad-top="true">
            <p class="muted">変数に既にオブジェクトや配列が保存されている場合、ドット表記でプロパティやインデックスを指定して、その箇所だけを上のデータで更新できます。</p>
            <p class="muted">プロパティパスを指定したのに既存データがない場合は何も起こりません。</p>
            <p class="muted">プロパティパスを指定せず、既存変数が配列でない場合は変数全体が置き換えられます。既存変数が配列で、新しい値が配列でない場合、新しい値は配列の末尾に追加されます。</p>
            <eos-collapsable-panel show-label="例を表示" hide-label="例を非表示" hide-info-box="true">
                <span>例:</span>
                <ul>
                    <li>some.property</li>
                    <li>1</li>
                    <li>1.value</li>
                </ul>
            </eos-collapsable-panel>
            <input ng-model="effect.propertyPath" type="text" class="form-control" id="propertyPath" placeholder="パスを入力">
        </eos-container>

        <eos-container header="保持時間（任意）" pad-top="true">
            <p class="muted">この変数をキャッシュに保持する秒数です。0 にすると（永続化していない場合は Firebot 再起動まで）無期限に保持されます。</p>
            <input ng-model="effect.ttl" type="number" class="form-control" id="chat-text-setting" placeholder="秒数を入力">

            <div class="form-group flex justify-between pt-10" ng-if="!persistAllVarsEnabled">
                <div>
                    <label class="control-label" style="margin:0;">永続化</label>
                    <p class="help-block">有効にすると、この変数はファイルに保存され、Firebot 再起動時に再読み込みされます。</p>
                </div>
                <div class="ml-5">
                    <toggle-button toggle-model="effect.persistToFile" auto-update-value="true" font-size="32"></toggle-button>
                </div>
            </div>
        </eos-container>

        <eos-container pad-top="true">
            <div class="effect-info well">
                変数の値をリアルタイムで確認したい場合は、<a ng-click="openVariableInspector()" style="color:#53afff;cursor:pointer;">カスタム変数インスペクター</a>を開いてください。
            </div>
        </eos-container>
    `,
    optionsController: ($scope, backendCommunicator, settingsService: SettingsService) => {
        if ($scope.effect.ttl === undefined) {
            $scope.effect.ttl = 0;
        }

        $scope.openVariableInspector = function () {
            backendCommunicator.fireEvent("show-variable-inspector");
        };

        $scope.editors = [
            {
                label: "テキスト",
                inputType: "text",
                useTextArea: true,
                placeholderText: "変数データを入力",
                menuPosition: "under"
            },
            {
                label: "JSON",
                inputType: "codemirror",
                menuPosition: "under",
                codeMirrorOptions: {
                    mode: { name: "javascript", json: true },
                    theme: 'blackboard',
                    lineNumbers: true,
                    autoRefresh: true,
                    showGutter: true
                }
            }
        ];

        $scope.persistAllVarsEnabled = settingsService.getSetting("PersistCustomVariables");

        $scope.initialEditorLabel = $scope.effect?.variableData?.startsWith("{") || $scope.effect?.variableData?.startsWith("[") ? "JSON" : "テキスト";
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.name == null || effect.name === "") {
            errors.push("変数名を入力してください。");
        }
        return errors;
    },
    getDefaultLabel: (effect) => {
        return effect.name;
    },
    onTriggerEvent: ({ effect }) => {
        CustomVariableManager.addCustomVariable(effect.name, effect.variableData, effect.ttl, effect.propertyPath, effect.persistToFile);
        return true;
    }
};

export = effect;