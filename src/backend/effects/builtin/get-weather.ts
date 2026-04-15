import type { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import { CustomVariableManager } from "../../common/custom-variable-manager";
import logger from "../../logwrapper";

type WeatherData = {
    name: string;
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
        temp_min: number;
        temp_max: number;
    };
    weather: Array<{ description: string, icon: string }>;
    wind: { speed: number, deg: number };
    sys: { country: string };
};

const model: EffectType<{
    city: string;
    units: "metric" | "imperial" | "standard";
    lang: string;
    customVarName: string;
    customVarTtl: number;
}> = {
    definition: {
        id: "firebot:get-weather",
        name: "天気情報を取得する",
        description: "OpenWeatherMap から現在の天気情報を取得します（設定 → 連携 → JP Original 外部API設定 で API キーを設定してください）",
        icon: "fad fa-cloud-sun",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: [],
        outputs: [
            {
                label: "気温",
                defaultName: "weatherTemp",
                description: "現在の気温（数値）"
            },
            {
                label: "天気の説明",
                defaultName: "weatherDescription",
                description: "天気の説明テキスト（例: 晴れ）"
            },
            {
                label: "湿度",
                defaultName: "weatherHumidity",
                description: "湿度（%）"
            },
            {
                label: "風速",
                defaultName: "weatherWindSpeed",
                description: "風速（m/s または mph）"
            },
            {
                label: "都市名",
                defaultName: "weatherCityName",
                description: "取得した都市名"
            },
            {
                label: "天気サマリー",
                defaultName: "weatherSummary",
                description: "天気情報を 1 行にまとめたテキスト"
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="検索する都市" pad-top="true">
            <input type="text" class="form-control" ng-model="effect.city"
                placeholder="Tokyo（英語推奨）または 東京" replace-variables />
            <p class="help-block muted">
                英語の都市名（例: Tokyo, Osaka, Sapporo）が確実です。<br>
                "都市名,国コード" の形式（例: Tokyo,JP）も利用できます。
            </p>
        </eos-container>

        <eos-container header="単位系" pad-top="true">
            <dropdown-select
                options="unitsOptions"
                selected="effect.units">
            </dropdown-select>
        </eos-container>

        <eos-container header="表示言語" pad-top="true">
            <input type="text" class="form-control" ng-model="effect.lang"
                placeholder="ja" style="width:100px;" />
            <p class="help-block muted">言語コード（ja: 日本語, en: 英語など）</p>
        </eos-container>

        <eos-container header="カスタム変数に保存 （任意）" pad-top="true">
            <p class="muted" style="font-size:11px;">天気サマリーを <code>$customVariable[名前]</code> で参照できるカスタム変数に保存します。</p>
            <div class="form-group" style="display:flex; gap:16px; align-items:flex-end;">
                <div style="flex:1;">
                    <label class="control-label">変数名 <span class="muted">（空欄でスキップ）</span></label>
                    <input type="text" class="form-control" ng-model="effect.customVarName"
                        placeholder="weatherSummary" replace-variables />
                </div>
                <div style="width:140px;">
                    <label class="control-label">有効期限（秒）</label>
                    <input type="number" class="form-control" ng-model="effect.customVarTtl"
                        placeholder="0" min="0" />
                    <p class="help-block muted" style="font-size:10px;">0 = 無期限</p>
                </div>
            </div>
        </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.units == null) {
            $scope.effect.units = "metric";
        }
        if ($scope.effect.lang == null) {
            $scope.effect.lang = "ja";
        }
        if ($scope.effect.customVarTtl == null) {
            $scope.effect.customVarTtl = 0;
        }

        $scope.unitsOptions = {
            metric: "摂氏 (°C)",
            imperial: "華氏 (°F)",
            standard: "ケルビン (K)"
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.city) {
            errors.push("都市名を入力してください");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        const integrationManager = require("../../integrations/integration-manager");

        const intDef = integrationManager.getIntegrationDefinitionById("jp-original-api");
        const apiKey: string | undefined = intDef?.userSettings?.openWeatherMap?.apiKey;

        if (!apiKey) {
            logger.warn("OpenWeatherMap API キーが設定されていません。設定 → 連携 → JP Original 外部API設定 で設定してください。");
            return false;
        }

        try {
            const units = effect.units || "metric";
            const lang = effect.lang || "ja";
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(effect.city)}&appid=${encodeURIComponent(apiKey)}&units=${units}&lang=${lang}`;

            const response = await fetch(url);
            if (!response.ok) {
                logger.error(`OpenWeatherMap リクエスト失敗: ${response.status} ${response.statusText}`);
                return false;
            }

            const data: WeatherData = await response.json();

            const temp = data.main.temp;
            const description = data.weather[0]?.description ?? "";
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;
            const cityName = `${data.name}${data.sys.country ? `, ${data.sys.country}` : ""}`;
            const unitLabel = units === "metric" ? "°C" : units === "imperial" ? "°F" : "K";
            const summary = `${cityName}: ${description}、気温 ${temp}${unitLabel}、湿度 ${humidity}%、風速 ${windSpeed} m/s`;

            if (effect.customVarName) {
                CustomVariableManager.addCustomVariable(effect.customVarName, summary, effect.customVarTtl ?? 0);
            }

            return {
                success: true,
                outputs: {
                    weatherTemp: temp,
                    weatherDescription: description,
                    weatherHumidity: humidity,
                    weatherWindSpeed: windSpeed,
                    weatherCityName: cityName,
                    weatherSummary: summary
                }
            };
        } catch (error) {
            logger.error("OpenWeatherMap エラー", (error as Error).message);
            return false;
        }
    }
};

export = model;
