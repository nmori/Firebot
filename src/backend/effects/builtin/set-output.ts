import type { EffectType } from "../../../types";
import logger from "../../logwrapper";

const resolveDataForOutput = (newData: unknown, currentData?: unknown, propertyPath?: string): unknown => {
    try {
        newData = JSON.parse(newData as string);
    } catch { }

    const rawData = newData != null
        ? newData.toString().toLowerCase()
        : "null";

    const dataIsNull = rawData === "null" || rawData === "undefined";

    if (propertyPath == null || propertyPath.length < 1) {
        let dataToSet = dataIsNull ? undefined : newData;
        if (currentData && Array.isArray(currentData) && !Array.isArray(newData) && !dataIsNull) {
            currentData.push(newData);
            dataToSet = currentData;
        }
        return dataToSet;
    }

    if (!currentData) {
        throw new Error("No existing data to apply property path to.");
    }

    try {
        let cursor = currentData;
        const pathNodes = propertyPath.split(".");
        for (let i = 0; i < pathNodes.length; i++) {
            let node: string | number = pathNodes[i];

            // parse to int for array access
            if (!isNaN(Number(node))) {
                node = parseInt(node);
            }

            const isLastItem = i === pathNodes.length - 1;
            if (isLastItem) {

                // if data recognized as null and cursor is an array, remove index instead of setting value
                if (dataIsNull && Array.isArray(cursor) && typeof node === "number" && !isNaN(node)) {
                    cursor.splice(node, 1);
                } else {
                    //if next node is an array and we detect we are not setting a new array or removing array, then push data to array
                    if (Array.isArray(cursor[node]) && !Array.isArray(newData) && !dataIsNull) {
                        cursor[node].push(newData);
                    } else {
                        cursor[node] = dataIsNull ? undefined : newData;
                    }
                }
            } else {
                cursor = cursor[node];
            }
        }
        return currentData;
    } catch (error) {
        logger.debug(`Error resolving data using property path ${propertyPath}`, error);
    }
};

const effect: EffectType<{
    data: string;
    propertyPath?: string;
    outputNames: {
        customOutput: string;
    };
}> = {
    definition: {
        id: "firebot:set-output",
        name: "出力設定",
        description: "データをエフェクト出力変数に保存し、このエフェクトリスト内の他の場所で利用できます。",
        icon: "fad fa-sign-out",
        categories: ["scripting"],
        dependencies: [],
        outputs: [{ defaultName: "customOutput", description: "カスタム出力", label: "出力名" }]
    },
    optionsTemplate: `
        <eos-container header="出力名">
            <p class="muted">この名前を使って、このエフェクトリスト内の他の場所から <b>$effectOutput[{{effect.outputNames.customOutput || 'name'}}]</b> として参照できます。</p>
            <input ng-model="effect.outputNames.customOutput" type="text" class="form-control" id="chat-text-setting" placeholder="名前を入力" replace-variables menu-position="below">
        </eos-container>

        <eos-container header="出力データ" pad-top="true">
            <p class="muted">出力に保存するデータです。文字列または別の置換フレーズを指定できます。</p>
            <selectable-input-editors
                editors="editors"
                initial-editor-label="initialEditorLabel"
                model="effect.data"
            />
            <p class="muted" style="font-size: 11px;"><b>注意:</b> 出力データが有効な JSON 文字列の場合、オブジェクトまたは配列にパースされます。</p>
        </eos-container>

        <eos-container header="プロパティパス（任意）" pad-top="true">
            <eos-collapsable-panel show-label="詳細を表示" hide-label="詳細を非表示" hide-info-box="true">
                <p class="muted">出力に既にオブジェクトや配列が保存されている場合、ドット表記でプロパティやインデックスを指定して、その箇所だけを上のデータで更新できます。</p>
                <p class="muted">プロパティパスを指定したのに既存データがない場合は何も起こりません。</p>
                <p class="muted">プロパティパスを指定せず、既存出力が配列でない場合は出力全体が置き換えられます。既存出力が配列で、新しい値が配列でない場合は、新しい値が配列の末尾に追加されます。</p>
                <span>例:</span>
                <ul>
                    <li>some.property</li>
                    <li>1</li>
                    <li>1.value</li>
                </ul>
            </eos-collapsable-panel>
            <input ng-model="effect.propertyPath" type="text" class="form-control" id="propertyPath" placeholder="パスを入力">
        </eos-container>

        <eos-container pad-top="true">
            <div class="effect-info alert alert-info">
                エフェクト出力は現在のエフェクトリスト内のみで有効で、実行が完了するとクリアされます。カスタム変数と異なり、グローバルには共有されません。
                <br><br>
                「エフェクトリスト実行」エフェクトを使う場合、「親リストにエフェクト出力を適用」を有効にすると、グローバル変数を介さずにプリセットエフェクトリストから親リストへデータを返せます。
            </div>
        </eos-container>
    `,
    optionsController: ($scope) => {

        if ($scope.effect.outputNames == null) {
            $scope.effect.outputNames = {
                customOutput: ""
            };
        }

        $scope.editors = [
            {
                label: "テキスト",
                inputType: "text",
                useTextArea: true,
                placeholderText: "出力データを入力",
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

        $scope.initialEditorLabel = $scope.effect?.data?.startsWith("{") || $scope.effect?.data?.startsWith("[") ? "JSON" : "テキスト";
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.outputNames?.customOutput?.length) {
            errors.push("出力名を入力してください。");
        }
        return errors;
    },
    getDefaultLabel: (effect) => {
        return effect.outputNames?.customOutput ?? "";
    },
    onTriggerEvent: ({ effect, outputs }) => {
        console.log("Setting effect output", effect, outputs);
        try {
            const outputData = resolveDataForOutput(effect.data, outputs?.[effect.outputNames?.customOutput], effect.propertyPath);
            return {
                success: true,
                outputs: {
                    customOutput: outputData
                }
            };
        } catch (error) {
            logger.warn("Error setting effect output data", error);
            return {
                success: false
            };
        }
    }
};

export = effect;