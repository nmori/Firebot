import { EffectType } from "../../../../../types/effects";
import { OBSSource, setBrowserSourceSettings } from "../obs-remote";

export const SetOBSBrowserSourceUrlEffectType: EffectType<{
  browserSourceName: string;
  url: string;
}> = {
  definition: {
    id: "firebot:obs-set-browser-source-url",
    name: "OBSブラウザソースのURLを変更",
    description: "OBSブラウザソースのURLを変更します",
    icon: "fad fa-browser",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container header="OBS ブラウザソース">
        <ui-select ng-model="selected" on-select="selectBrowserSource($select.selected.name)">
          <ui-select-match placeholder="ブラウザソースを選ぶ...">{{$select.selected.name}}</ui-select-match>
          <ui-select-choices repeat="source in browserSources | filter: {name: $select.search}">
            <div ng-bind-html="source.name | highlight: $select.search"></div>
          </ui-select-choices>
          <ui-select-no-choice>
          <b>ブラウザソースはありません.</b>
          </ui-select-no-choice>
        </ui-select>
        <div ng-if="browserSources == null" class="muted">
          ソースが見つかりません。OBSは動いていますか？
        </div>
        <p>
            <button class="btn btn-link" ng-click="getBrowserSources()">ソースを更新</button>
        </p>
    </eos-container>
    <eos-container ng-if="browserSources != null && effect.browserSourceName != null" header="URL" style="margin-top: 10px;">
        <firebot-input model="effect.url"></firebot-input>
    </eos-container>
  `,
  optionsController: ($scope: any, backendCommunicator: any, $q: any) => {
    $scope.browserSources = [];

    $scope.selectBrowserSource = (browserSourceName: string) => {
      $scope.effect.browserSourceName = browserSourceName;
    };

    $scope.getBrowserSources = () => {
      $q.when(
        backendCommunicator.fireEventAsync("obs-get-browser-sources")
      ).then((browserSources: OBSSource[]) => {
        $scope.browserSources = browserSources ?? [];
        $scope.selected = $scope.browserSources.find(source => source.name === $scope.effect.browserSourceName);
      });
    };
    $scope.getBrowserSources();
  },
  optionsValidator: (effect) => {
    if (effect.browserSourceName == null) {
      return ["ブラウザのソースを選択してください"];
    }
    return [];
  },
  onTriggerEvent: async ({ effect }) => {
    await setBrowserSourceSettings(effect.browserSourceName, {
      url: effect.url
    });
    return true;
  },
};
