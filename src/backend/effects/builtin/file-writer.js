"use strict";
const fileWriterProcessor = require("../../common/handlers/fileWriterProcessor");
const { EffectCategory } = require('../../../shared/effect-constants');

/**
 * The File Writer effect
 */
const fileWriter = {
    /**
   * The definition of the Effect
   */
    definition: {
        id: "firebot:filewriter",
        name: "ファイルに書き出す",
        description: "ファイルにテキストを書き込んだり削除したりします.",
        icon: "fad fa-file-edit",
        categories: [EffectCategory.ADVANCED],
        dependencies: []
    },
    /**
   * Global settings that will be available in the Settings tab
   */
    globalSettings: {},
    /**
   * The HTML template for the Options view (ie options when effect is added to something such as a button.
   * You can alternatively supply a url to a html file via optionTemplateUrl
   */
    optionsTemplate: `
        <eos-container header="File">
            <file-chooser model="effect.filepath" options="{ filters: [ {name:'Text',extensions:['txt']} ]}"></file-chooser>
        </eos-container>

        <eos-container header="Write Mode" pad-top="true">
            <div class="controls-fb" style="padding-bottom: 5px;">
                <label class="control-fb control--radio">置換   <tooltip text="'ファイル内の既存のテキストを新しいテキストに置き換える'"></tooltip>
                    <input type="radio" ng-model="effect.writeMode" value="replace"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">先頭に追加 <tooltip text="'指定されたテキストをファイルに追加する'"></tooltip>
                    <input type="radio" ng-model="effect.writeMode" value="suffix"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">後ろに追加 <tooltip text="'指定されたテキストを含む改行をファイルに追加する'"></tooltip>
                    <input type="radio" ng-model="effect.writeMode" value="append"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">行を削除 <tooltip text="'ファイル中の特定の行を削除する'"></tooltip>
                    <input type="radio" ng-model="effect.writeMode" value="delete"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">行の置き換え<tooltip text="'ファイルの特定の行を置き換える'"></tooltip>
                    <input type="radio" ng-model="effect.writeMode" value="replace-line"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">ファイルをクリア<tooltip text="'ファイルからすべてのテキストを消去する'"></tooltip>
                    <input type="radio" ng-model="effect.writeMode" value="delete-all"/>
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="Append Options" pad-top="true" ng-if="effect.writeMode === 'append'">
            <label class="control-fb control--checkbox"> 繰り返さない <tooltip text="'指定されたテキストがすでにファイル内に存在する場合は、新しい行を追加しない。'"></tooltip>
                <input type="checkbox" ng-model="effect.dontRepeat">
                <div class="control__indicator"></div>
            </label>
        </eos-container>

        <eos-container header="Delete Line(s) Options" pad-top="true" ng-if="effect.writeMode === 'delete'">
            <div class="controls-fb" style="padding-bottom: 5px;">
                <label class="control-fb control--radio">行番号で削除 <tooltip text="'Deletes line(s) at the specificed number(s)'"></tooltip>
                    <input type="radio" ng-model="effect.deleteLineMode" value="lines"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">テキストを削除 <tooltip text="'指定されたテキストとおなじ行を削除する'"></tooltip>
                    <input type="radio" ng-model="effect.deleteLineMode" value="text"/>
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="Replace Line(s) Options" pad-top="true" ng-if="effect.writeMode === 'replace-line'">
            <div class="controls-fb" style="padding-bottom: 5px;">
                <label class="control-fb control--radio">行番号で置き換え <tooltip text="'特定の番号の行を入れ替える'"></tooltip>
                    <input type="radio" ng-model="effect.replaceLineMode" value="lineNumbers"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">テキストで置き換え <tooltip text="'指定されたテキストと等しい行を置換する'"></tooltip>
                    <input type="radio" ng-model="effect.replaceLineMode" value="text"/>
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="テキスト" pad-top="true" ng-if="effect.writeMode === 'replace' || effect.writeMode === 'suffix' || effect.writeMode === 'append' || (effect.writeMode === 'delete' && effect.deleteLineMode === 'text') || (effect.writeMode === 'replace-line' && effect.replaceLineMode === 'text')">
            <firebot-input model="effect.text" type="text" placeholder-text="テキストを入力" use-text-area="true"></firebot-input>
        </eos-container>

        <eos-container header="行番号" pad-top="true" ng-if="(effect.writeMode === 'delete' && effect.deleteLineMode === 'lines') || (effect.writeMode === 'replace-line' && effect.replaceLineMode === 'lineNumbers')">
            <p class="muted">Enter a line number or list of line numbers (separated by commas) to {{effect.writeMode === 'delete' ? 'delete' : 'replace'}}.</p>
            <input ng-model="effect.lineNumbers" type="text" class="form-control" id="chat-line-numbers-setting" placeholder="Enter line number(s)" replace-variables="number">
        </eos-container>

        <eos-container header="置換するテキスト" pad-top="true" ng-if="effect.writeMode === 'replace-line'">
            <firebot-input model="effect.replacementText" type="text" placeholder-text="テキストを入力" use-text-area="true"></firebot-input>
        </eos-container>
    `,
    /**
   * The controller for the front end Options
   * Port over from effectHelperService.js
   */
    optionsController: ($scope) => {
        if ($scope.effect.writeMode == null) {
            $scope.effect.writeMode = "replace";
        }

        if ($scope.effect.deleteLineMode == null) {
            $scope.effect.deleteLineMode = "lines";
        }

        if ($scope.effect.replaceLineMode == null) {
            $scope.effect.replaceLineMode = "lineNumbers";
        }
    },
    /**
   * When the effect is triggered by something
   * Used to validate fields in the option template.
   */
    optionsValidator: effect => {
        const errors = [];
        if (effect.filepath == null || effect.filepath === "") {
            errors.push("書き込むテキストファイルを選択してください。");
        }
        if (effect.writeMode === 'delete' && (effect.deleteLineMode === 'lines' && (effect.lineNumbers == null || effect.lineNumbers === ""))) {
            errors.push("削除する行番号を設定してください。");
        }
        if (effect.writeMode === 'delete' && (effect.deleteLineMode === 'text' && (effect.text == null || effect.text === ""))) {
            errors.push("削除する行テキストを設定してください。");
        }
        if (effect.writeMode === 'replace-line' && (effect.replaceLineMode === 'lines' && (effect.lineNumbers == null || effect.lineNumbers === ""))) {
            errors.push("置換する行番号を設定してください。");
        }
        if (effect.writeMode === 'replace-line' && (effect.replaceLineMode === 'text' && (effect.text == null || effect.text === ""))) {
            errors.push("置換する行テキストを設定してください。");
        }
        return errors;
    },
    /**
   * When the effect is triggered by something
   */
    onTriggerEvent: async event => {
        await fileWriterProcessor.run(event.effect, event.trigger);
        return true;
    }
};

module.exports = fileWriter;
