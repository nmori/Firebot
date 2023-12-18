import { EffectType } from "../../../../../types/effects";
import { OBSSource, setColorSourceSettings } from "../obs-remote";

export const SetOBSColorSourceColorEffectType: EffectType<{
  colorSourceName: string;
  color: string;
}> = {
  definition: {
    id: "firebot:obs-set-color-source-color",
    name: "OBSカラーソースの色を変更",
    description: "OBSカラーソースの色を変更します",
    icon: "fad fa-palette",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container header="OBS カラーソース">
        <ui-select ng-model="selected" on-select="selectColorSource($select.selected.name)">
          <ui-select-match placeholder="OBS カラーソース...">{{$select.selected.name}}</ui-select-match>
          <ui-select-choices repeat="source in colorSources | filter: $select.search">
            <li ng-show="scene.custom === true" role="separator" class="divider"></li>
            <div ng-bind-html="source.name | highlight: $select.search"></div>
            <ui-select-no-choice>
          <b>OBSカラーソースが見つかりません.</b>
          </ui-select-no-choice>
          </ui-select-choices>
        </ui-select>
        
        <div ng-if="colorSources == null" class="muted">
        ソースが見つかりません。OBSは動いていますか？ソースが見つかりません。OBSは動いていますか？
        </div>
        <p>
            <button class="btn btn-link" ng-click="getColorSources()">ソースを更新</button>
        </p>
    </eos-container>

    <eos-container ng-if="colorSources != null && effect.colorSourceName != null" header="Color" style="margin-top: 10px;">
        <firebot-input model="effect.color" placeholder-text="例: #0066FF や #FF336699"></firebot-input>
    </eos-container>
  `,
  optionsController: ($scope: any, backendCommunicator: any, $q: any) => {
    $scope.colorSources = [];

    $scope.selectColorSource = (colorSourceName: string) => {
      $scope.effect.colorSourceName = colorSourceName;
    };

    $scope.getColorSources = () => {
      $q.when(
        backendCommunicator.fireEventAsync("obs-get-color-sources")
      ).then((colorSources: OBSSource[]) => {
        $scope.colorSources = colorSources ?? [];
        $scope.selected = $scope.colorSources.find(source => source.name === $scope.effect.colorSourceName);
      });
    };
    $scope.getColorSources();
  },
  optionsValidator: (effect) => {
    const errors: string[] = [];
    const rgbRegexp = /^#?[0-9a-f]{6}$/ig;
    const argbRegexp = /^#?[0-9a-f]{8}$/ig;

    if (effect.colorSourceName == null) {
      errors.push("Please select a color source");
    } else if (!rgbRegexp.test(effect.color) && !argbRegexp.test(effect.color)) {
      errors.push("Color must be in RGB format (#0066FF) or ARGB format (#FF336699)");
    }

    return errors;
  },
  onTriggerEvent: async ({ effect }) => {
    const hexColor = effect.color.replace("#", "");
    let obsFormattedHexColor = "";

    // OBS likes the color values in the OTHER direction
    if (hexColor.length === 8) {
      obsFormattedHexColor = `${hexColor.substring(0,2)}${hexColor.substring(6,8)}${hexColor.substring(4,6)}${hexColor.substring(2,4)}`;
    } else {
      obsFormattedHexColor = `${hexColor.substring(4,6)}${hexColor.substring(2,4)}${hexColor.substring(0,2)}`;
    }

    const intColorValue = parseInt(obsFormattedHexColor, 16);

    await setColorSourceSettings(effect.colorSourceName, {
      color: intColorValue
    });
    return true;
  },
};
