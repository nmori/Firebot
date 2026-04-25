import { EffectType, EffectList } from "../../../types/effects";
import { KeyValuePair } from "../../../types/util-types";

import { AccountAccess } from "../../common/account-access";
import { CustomVariableManager } from "../../common/custom-variable-manager";
import { TwitchAuthProviders } from "../../streaming-platforms/twitch/auth/twitch-auth";
import effectRunner from "../../common/effect-runner";
import logger from "../../logwrapper";

type ErrorWithResponseData = Error & {
    responseData: string;
};

const effect: EffectType<{
    url: string;
    method: string;
    body: string;
    headers: Array<KeyValuePair>;
    options: {
        timeout?: number;
        useTwitchAuth?: boolean;
        runEffectsOnError?: boolean;
        storeOutputAsBinary?: boolean;
        /** @deprecated */
        putResponseInVariable?: boolean;
        /** @deprecated */
        variableName?: string;
        /** @deprecated */
        variableTtl?: number;
        /** @deprecated */
        variablePropertyPath?: string;
    };
    errorEffects: EffectList;
}> = {
    definition: {
        id: "firebot:http-request",
        name: "HTTPリクエスト",
        description: "指定した URL に HTTP リクエストを送信します",
        icon: "fad fa-terminal",
        categories: ["advanced", "scripting"],
        dependencies: [],
        outputs: [
            {
                label: "レスポンスボディ",
                description: "リクエストの生レスポンス",
                defaultName: "httpResponse"
            }
        ]
    },
    optionsTemplate: `
    <eos-container header="URL">
        <firebot-input model="effect.url" placeholder-text="URL を入力" menu-position="below"></firebot-input>
    </eos-container>

    <eos-container header="メソッド" pad-top="true">
        <dropdown-select options="['GET', 'POST', 'PUT', 'PATCH', 'DELETE']" selected="effect.method"></dropdown-select>
    </eos-container>

    <eos-container header="ボディ（JSON）" pad-top="true" ng-show="['POST', 'PUT', 'PATCH'].includes(effect.method)">
        <div
            ui-codemirror="{onLoad : codemirrorLoaded}"
            ui-codemirror-opts="editorSettings"
            ng-model="effect.body"
            replace-variables
            menu-position="under">
        </div>
    </eos-container>

    <eos-container header="ヘッダー" pad-top="true">
        <div ui-sortable="sortableOptions" ng-model="effect.headers">
            <div ng-repeat="header in effect.headers track by $index" class="list-item selectable" ng-click="showAddOrEditHeaderModal(header)">
                <span class="dragHandle" style="height: 38px; width: 15px; align-items: center; justify-content: center; display: flex">
                    <i class="fal fa-bars" aria-hidden="true"></i>
                </span>
                <div uib-tooltip="クリックして編集"  style="font-weight: 400;width: 100%;margin-left: 20px;" aria-label="{{header.key + ' (クリックして編集)'}}"><b>{{header.key}}</b>: {{header.value}}</div>
                <span class="clickable" style="color: #fb7373;" ng-click="removeHeaderAtIndex($index);$event.stopPropagation();" aria-label="ヘッダーを削除">
                    <i class="fad fa-trash-alt" aria-hidden="true"></i>
                </span>
            </div>
            <p class="muted" ng-show="effect.headers.length < 1">ヘッダーが追加されていません。</p>
        </div>
        <div style="margin: 5px 0 10px 0px;">
            <button class="filter-bar" ng-click="showAddOrEditHeaderModal()" uib-tooltip="ヘッダーを追加" tooltip-append-to-body="true" aria-label="ヘッダーを追加">
                <i class="far fa-plus"></i>
            </button>
        </div>
    </eos-container>

    <eos-container header="オプション" pad-top="true">
        <firebot-checkbox
            label="Twitch 認証ヘッダーを含める"
            tooltip="ストリーマーの Twitch アクセストークンを Authorization ヘッダーとして自動付与します。Twitch API を呼び出す場合のみ使用してください！"
            model="effect.options.useTwitchAuth"
        />
        <label ng-show="effect.options.putResponseInVariable" class="control-fb control--checkbox"> レスポンスボディを変数に保存 <tooltip text="'レスポンスボディを後で利用できるように変数に保存します'"></tooltip>
            <input type="checkbox" ng-model="effect.options.putResponseInVariable">
            <div class="control__indicator"></div>
        </label>
        <div ng-if="effect.options.putResponseInVariable" style="padding-left: 15px;">
            <firebot-input input-title="変数名" model="effect.options.variableName" placeholder-text="名前を入力" />
            <firebot-input style="margin-top: 10px;" input-title="変数の有効期限（秒）" model="effect.options.variableTtl" input-type="number" disable-variables="true" placeholder-text="秒を入力（省略可）" />
            <firebot-input style="margin-top: 10px;" input-title="変数プロパティパス" model="effect.options.variablePropertyPath" input-type="text" disable-variables="true" placeholder-text="省略可" />
        </div>
        <firebot-checkbox
            ng-init="timeoutRequest = effect.options.timeout != null"
            label="タイムアウトを設定"
            tooltip="リクエストのタイムアウトを設定します。"
            model="timeoutRequest"
        />
        <div ng-show="timeoutRequest" style="padding-left: 15px;" class="mb-6">
            <firebot-input input-title="タイムアウト（ミリ秒）" model="effect.options.timeout" input-type="number" disable-variables="true" placeholder-text="ミリ秒を入力" />
        </div>
        <firebot-checkbox
            label="出力をバイナリとして保存（上級者向け）"
            tooltip="レスポンスボディをテキスト文字列ではなくバイナリ配列として保存します。"
            model="effect.options.storeOutputAsBinary"
        />
        <firebot-checkbox
            label="エラー時にエフェクトを実行"
            tooltip="リクエストが失敗した場合にエフェクトリストを実行します。クリーンアップやエフェクト実行の停止に便利です。"
            model="effect.options.runEffectsOnError"
        />
    </eos-container>

    <eos-container header="エラーエフェクト" pad-top="true" ng-if="effect.options.runEffectsOnError">
        <effect-list effects="effect.errorEffects"
            trigger="{{trigger}}"
            trigger-meta="triggerMeta"
            update="errorEffectsUpdated(effects)"
            modalId="{{modalId}}"></effect-list>
    </eos-container>

    <eos-container pad-top="true">
        <div class="effect-info alert alert-warning">
            注意: リクエストエラーはコンソールに記録されます。Window &gt; 開発者ツールの切り替え からアクセスできます。
        </div>
    </eos-container>


    `,
    optionsController: ($scope, utilityService) => {
        $scope.errorEffectsUpdated = (effects: EffectList) => {
            $scope.effect.errorEffects = effects;
        };

        $scope.editorSettings = {
            mode: { name: "javascript", json: true },
            theme: "blackboard",
            lineNumbers: true,
            autoRefresh: true,
            showGutter: true
        };

        $scope.codemirrorLoaded = (_editor) => {
            // Editor part
            _editor.refresh();
            const cmResize = require("cm-resize");
            cmResize(_editor, {
                minHeight: 200,
                resizableWidth: false,
                resizableHeight: true
            });
        };

        $scope.sortableOptions = {
            handle: ".dragHandle",
            stop: () => {}
        };

        $scope.showAddOrEditHeaderModal = (header: KeyValuePair) => {
            utilityService.showModal({
                component: "addOrEditHeaderModal",
                size: "sm",
                resolveObj: {
                    header: () => header
                },
                closeCallback: (newHeader: KeyValuePair) => {
                    $scope.effect.headers = $scope.effect.headers.filter(h => h.key !== newHeader.key);
                    $scope.effect.headers.push(newHeader);
                }
            });
        };

        if ($scope.effect.headers == null) {
            $scope.effect.headers = [];
        }

        if ($scope.effect.options == null) {
            $scope.effect.options = {};
        }

        $scope.removeHeaderAtIndex = (index: number) => {
            $scope.effect.headers.splice(index, 1);
        };

        $scope.headers = [
            {
                name: "KEY",
                icon: "fa-key",
                cellTemplate: `{{data.key}}`,
                cellController: () => {}
            },
            {
                name: "VALUE",
                icon: "fa-tag",
                cellTemplate: `{{data.value}}`,
                cellController: () => {}
            }
        ];

        $scope.headerOptions = (item: KeyValuePair) => {
            const options = [
                {
                    html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 編集</a>`,
                    click: () => {
                        $scope.showAddOrEditHeaderModal(item);
                    }
                },
                {
                    html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                    click: () => {
                        $scope.effect.headers = $scope.effect.headers.filter(h => h.key !== item.key);
                    }
                }
            ];
            return options;
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.method === "" || effect.method == null) {
            errors.push("HTTP メソッドを選択してください。");
        }
        if (effect.url === "" || effect.url == null) {
            errors.push("URL を入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect, trigger, outputs, abortSignal }) => {
        let headers: Record<string, string> = {
            "User-Agent": "Firebot v5 - HTTP Request Effect",
            ...effect.headers.reduce((acc, next) => {
                acc[next.key] = next.value;
                return acc;
            }, {})
        };

        if (effect.options.useTwitchAuth && effect.url.startsWith("https://api.twitch.tv")) {
            const accessToken = AccountAccess.getAccounts().streamer.auth.access_token;
            headers = {
                ...headers,
                "Authorization": `Bearer ${accessToken}`,
                "Client-ID": TwitchAuthProviders.twitchClientId
            };
        }

        const sendBodyData = effect.method.toLowerCase() === "post" ||
            effect.method.toLowerCase() === "put" ||
            effect.method.toLowerCase() === "patch";

        if (sendBodyData) {
            try {
                // Add the JSON header if the body is valid JSON
                JSON.parse(effect.body);
                headers = {
                    ...headers,
                    "Content-Type": "application/json"
                };
            } catch { }
        }

        let responseData: string | Uint8Array<ArrayBuffer> | Record<string, unknown>;

        try {
            const response = await fetch(effect.url, {
                method: effect.method.toUpperCase(),
                headers,
                signal: effect.options.timeout && effect.options.timeout > 0
                    ? AbortSignal.timeout(effect.options.timeout)
                    : undefined,
                body: sendBodyData === true ? effect.body : null
            });

            if (effect.options.storeOutputAsBinary === true) {
                responseData = await response.bytes();
            } else {
                responseData = await response.text();
            }

            if (!response.ok) {
                const error = new Error(`Request failed with status ${response.status}`) as ErrorWithResponseData;

                // Convert response back to text if necessary
                if (effect.options.storeOutputAsBinary === true) {
                    responseData = new TextDecoder("utf-8").decode(responseData as Uint8Array<ArrayBuffer>);
                }

                error.responseData = responseData as string;
                throw error;
            }

            if (effect.options.storeOutputAsBinary !== true) {
                try {
                    responseData = JSON.parse(responseData as string) as Record<string, unknown>;
                } catch { } //ignore error
            }

            /**
             * Deprecated
             */
            if (effect.options.putResponseInVariable) {
                CustomVariableManager.addCustomVariable(
                    effect.options.variableName,
                    responseData,
                    effect.options.variableTtl || 0,
                    effect.options.variablePropertyPath || null
                );
            }
        } catch (err) {
            const error = err as ErrorWithResponseData;
            const message = {
                errorMessage: error.message,
                responseData: error.responseData
            };

            logger.error("Error running http request", message);

            if (effect.options.runEffectsOnError && !abortSignal?.aborted) {
                const processEffectsRequest = {
                    trigger,
                    effects: effect.errorEffects,
                    outputs: outputs
                };

                const effectResult = await effectRunner.processEffects(processEffectsRequest);
                if (effectResult != null && effectResult.success === true) {
                    if (effectResult.stopEffectExecution) {
                        return {
                            success: true,
                            execution: {
                                stop: true,
                                bubbleStop: true
                            }
                        };
                    }
                }
            }
        }

        return {
            success: true,
            outputs: {
                httpResponse: responseData
            }
        };
    }
};

export = effect;