import type { EffectType } from "../../../types/effects";
import viewerMetadataManager from "../../viewers/viewer-metadata-manager";

const effect: EffectType<{
    username: string;
    key: string;
    propertyPath: string;
    data: string;
}> = {
    definition: {
        id: "firebot:set-user-metadata",
        name: "ユーザーメタデータ設定",
        description: "指定したユーザーに紐づくメタデータを保存します",
        icon: "fad fa-user-cog",
        categories: ["advanced", "scripting", "firebot control"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="ユーザー名">
            <input type="text" class="form-control" aria-describedby="basic-addon3" ng-model="effect.username" placeholder="ユーザー名を入力" replace-variables menu-position="below" />
        </eos-container>

        <eos-container header="メタデータキー" pad-top="true">
            <p class="muted">このキーを $userMetadata 置換フレーズなどから参照して利用します。</p>
            <input ng-model="effect.key" type="text" class="form-control" id="chat-text-setting" placeholder="キー名を入力" replace-variables>
        </eos-container>

        <eos-container header="データ" pad-top="true">
            <p class="muted">上のキーに紐づけて保存するデータです。文字列または別の置換フレーズを指定できます。</p>
            <selectable-input-editors
                editors="editors"
                initial-editor-label="initialEditorLabel"
                model="effect.data"
            />
            <p class="muted" style="font-size: 11px;"><b>注意:</b> データが有効な JSON 文字列の場合、オブジェクトまたは配列にパースされます。</p>

            <div style="margin-top: 10px;">
                <eos-collapsable-panel show-label="詳細設定" hide-label="詳細設定" hide-info-box="true">
                    <h4>プロパティパス（任意）</h4>
                    <p class="muted">メタデータキーにすでにオブジェクトや配列が保存されている場合、ドット表記でプロパティやインデックスを指定して、その箇所だけを上のデータで更新できます。指定しない場合は、メタデータエントリ全体が置き換えられます。既存データがなくプロパティパスを指定した場合は、何も起こりません。</p>
                    <eos-collapsable-panel show-label="例を表示" hide-label="例を非表示" hide-info-box="true">
                        <span>例:</span>
                        <ul>
                            <li>some.property</li>
                            <li>1</li>
                            <li>1.value</li>
                        </ul>
                    </eos-collapsable-panel>
                    <input ng-model="effect.propertyPath" type="text" class="form-control" id="propertyPath" placeholder="パスを入力" replace-variables>
                </eos-collapsable-panel>
            </div>
        </eos-container>
    `,
    optionsController: ($scope) => {
        $scope.editors = [
            {
                label: "テキスト",
                inputType: "text",
                useTextArea: true,
                placeholderText: "テキスト/データを入力"
            },
            {
                label: "JSON",
                inputType: "codemirror",
                placeholderText: "テキスト/データを入力",
                codeMirrorOptions: {
                    mode: { name: "javascript", json: true },
                    theme: 'blackboard',
                    lineNumbers: true,
                    autoRefresh: true,
                    showGutter: true
                }
            }
        ];

        $scope.initialEditorLabel = $scope.effect?.data?.startsWith("{") || $scope.effect?.data?.startsWith("[") ? "JSON" : "テキスト";
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.username == null || effect.username === "") {
            errors.push("ユーザー名を入力してください。");
        }
        if (effect.key == null || effect.key === "") {
            errors.push("キー名を入力してください。");
        }
        return errors;
    },
    getDefaultLabel: (effect) => {
        return `${effect.username} - ${effect.key}`;
    },
    onTriggerEvent: async ({ effect }) => {
        const { username, key, data, propertyPath } = effect;

        await viewerMetadataManager.updateViewerMetadata(username, key, data, propertyPath);

        return true;
    }
};

export = effect;