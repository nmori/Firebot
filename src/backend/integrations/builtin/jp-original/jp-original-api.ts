import { TypedEmitter } from "tiny-typed-emitter";
import type {
    Integration,
    IntegrationController,
    IntegrationData,
    IntegrationEvents,
    Awaitable
} from "../../../../types";

type JpOriginalSettings = {
    deepl: {
        apiKey: string;
        isPro: boolean;
    };
    microsoftTranslator: {
        subscriptionKey: string;
        region: string;
    };
    openWeatherMap: {
        apiKey: string;
    };
};

class IntegrationEventEmitter extends TypedEmitter<IntegrationEvents> {}

class JpOriginalApiIntegration
    extends IntegrationEventEmitter
    implements IntegrationController<JpOriginalSettings> {
    connected = false;

    init(
        _linked: boolean,
        _integrationData: IntegrationData<JpOriginalSettings>
    ): Awaitable<void> {
        // APIキーの保管のみ。常時接続は不要。
    }
}

const integrationConfig: Integration<JpOriginalSettings> = {
    definition: {
        id: "jp-original-api",
        name: "JP Original 外部API設定",
        description: "DeepL翻訳・Microsoft翻訳・OpenWeatherMap など JP Original エフェクトで使う外部APIキーを管理します",
        linkType: "none",
        configurable: true,
        connectionToggle: false,
        settingCategories: {
            deepl: {
                title: "DeepL 翻訳",
                sortRank: 1,
                settings: {
                    apiKey: {
                        title: "DeepL APIキー",
                        description: "DeepL 公式サイト (https://www.deepl.com) でアカウント登録後に取得できます。",
                        type: "string",
                        default: ""
                    },
                    isPro: {
                        title: "Pro プランを使用",
                        description: "DeepL Pro プランの場合は ON にしてください（エンドポイントが変わります）。",
                        type: "boolean",
                        default: false
                    }
                }
            },
            microsoftTranslator: {
                title: "Microsoft 翻訳",
                sortRank: 2,
                settings: {
                    subscriptionKey: {
                        title: "サブスクリプションキー",
                        description: "Azure Portal の Translator リソースで取得できるキーです。",
                        type: "string",
                        default: ""
                    },
                    region: {
                        title: "リージョン",
                        description: "Azure のリージョン（例: japaneast, eastus, global）",
                        type: "string",
                        default: "global"
                    }
                }
            },
            openWeatherMap: {
                title: "OpenWeatherMap",
                sortRank: 3,
                settings: {
                    apiKey: {
                        title: "APIキー",
                        description: "https://openweathermap.org でアカウント登録後に取得できます。",
                        type: "string",
                        default: ""
                    }
                }
            }
        }
    },
    integration: new JpOriginalApiIntegration()
};

export const definition = integrationConfig.definition;
export const integration = integrationConfig.integration;
