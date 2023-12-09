import { EffectType } from "../../../../../types/effects";
import {OBSSource, OBSSourceScreenshotSettings, takeSourceScreenshot} from "../obs-remote";
import * as fs from "fs";
import logger from "../../../../logwrapper";

export const TakeOBSSourceScreenshotEffectType: EffectType<{
    source: string;
    format: string;
    file: string;
    height: number;
    width: number;
    quality: number;
}> = {
    definition: {
        id: "firebot:obs-source-screenshot",
        name: "OBSソースのスクリーンショットを撮る",
        description: "OBSソースのスクリーンショットを撮って保存します",
        icon: "fad fa-camera-retro",
        categories: ["common"],
    },
    optionsTemplate: `
        <eos-container header="OBS ソース">
            <ui-select ng-model="effect.source" theme="bootstrap">
                <ui-select-match>{{$select.selected.name}} ({{$select.selected.type}})</ui-select-match>
                <ui-select-choices repeat="item.name as item in sources | filter: $select.search">
                    <div ng-bind-html="item.name | highlight: $select.search"></div>
                    <small ng-bind-html="item.type | highlight: $select.search"></small>
                </ui-select-choices>
            </ui-select>
        </eos-container>
        
        <div class="effect-setting-container setting-padtop">
    <div class="effect-specific-title"><h4>イメージの設定</h4></div>
    <div class="effect-setting-content">
    <div class="input-group">
            <span class="input-group-addon">フォーマット</span>
            <div class="btn-group" uib-dropdown>
        <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
            {{effect.imageFormat}} <span class="caret"></span>
        </button>
        <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
            <li ng-repeat="format in formats" role="menuitem"  ng-click="effect.format = format">
                <a href>{{format}}</a>
            </li>
        </ul>
    </div>
    <span class="input-group-addon">ファイル</span>
            <file-chooser model="effect.file" options="{ filters: [ {name: 'Images', extensions: ['bmp','jpeg','jpg','pbm','pgm','png','ppm','xbm','xpm']} ]}"></file-chooser>
        </div>
    </div>
        
    <div class="effect-setting-container setting-padtop">
    <div class="effect-specific-title"><h4>追加設定</h4></div>
    <div class="effect-setting-content">
            <div class="input-group">
            <span class="input-group-addon">画像の圧縮度</span>
            <input
                type="number"
                class="form-control"
                aria-describeby="image-compression-setting-type"
                ng-model="effect.quality"
                uib-tooltip="100は非圧縮、0は最圧縮。"
                tooltip-append-to-body="true"
                aria-label="圧縮設定"
                placeholder="100"
                min="-1"
                max="100"
                style="width: 100px;">
            <span class="input-group-addon">幅</span>
            <input
                type="number"
                class="form-control"
                aria-describeby="image-width-setting-type"
                ng-model="effect.width"
                uib-tooltip="幅を指定(pixel)。空の場合、ソースの幅を使用します。"
                tooltip-append-to-body="true"
                placeholder="px">
            <span class="input-group-addon">Height</span>
            <input
                type="number"
                class="form-control"
                aria-describeby="image-height-setting-type"
                ng-model="effect.height"
                uib-tooltip="高さを指定(pixel)。空の場合、ソースの高さを使用します。"
                tooltip-append-to-body="true"
                placeholder="px">
            </div>
            </div>
    </div>
        <div ng-if="sources == null" class="muted">
            ソースが見つかりません。OBSは動いていますか？
        </div>
        <p>
            <button class="btn btn-link" ng-click="getSources()">ソースを更新</button>
        </p>
    <eos-container ng-if="sources != null && effect.sourceName != null" header="Text" style="margin-top: 10px;">

    </eos-container>
  `,
    optionsController: ($scope: any, backendCommunicator: any, $q: any) => {
        if ($scope.effect.format == null) {
            $scope.effect.format = "png";
        }

        $scope.getSources = () => {
            $q.when(
                backendCommunicator.fireEventAsync("obs-get-all-sources")
            ).then(
                (sources: OBSSource[]) => $scope.sources = sources ?? []
            );
            $q.when(
                backendCommunicator.fireEventAsync("obs-get-supported-image-formats")
            ).then(
                (formats: string[]) => $scope.formats = formats ?? []
            );
        };
        $scope.getSources();
    },
    optionsValidator: (effect) => {
        let errors: string[] = [];
        if (effect.source == null) {
            errors.push("ソースを指定してください");
        }
        if (effect.format == null) {
            errors.push("フォーマットを指定してください");
        }
        if (effect.file == null) {
            errors.push("ファイルを指定してください");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        let screenshotSettings: OBSSourceScreenshotSettings = {
            sourceName: effect.source,
            imageFormat: effect.format,
            imageHeight: effect.height,
            imageWidth: effect.width,
            imageCompressionQuality: effect.quality
        }

        let screenshot = await takeSourceScreenshot(screenshotSettings);

        if (screenshot == null) {
            logger.error("Source screenshot is null, ignoring.");
            return true;
        }

        fs.writeFileSync(effect.file, screenshot.split("base64,")[1], "base64");
        return true;
    },
};
