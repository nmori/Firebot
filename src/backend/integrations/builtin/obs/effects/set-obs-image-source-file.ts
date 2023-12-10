import { EffectType } from "../../../../../types/effects";
import { OBSSource, setImageSourceSettings } from "../obs-remote";

export const SetOBSImageSourceFileEffectType: EffectType<{
  imageSourceName: string;
  file: string;
}> = {
  definition: {
    id: "firebot:obs-set-image-source-file",
    name: "OBS画像ソースにファイルを設定",
    description: "OBS画像ソースのファイルを設定します。",
    icon: "fad fa-photo-video",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container header="OBS画像ソース">
        <ui-select ng-model="selected" on-select="selectImageSource($select.selected.name)">
          <ui-select-match placeholder="画像ファイルを選ぶ...">{{$select.selected.name}}</ui-select-match>
          <ui-select-choices repeat="source in imageSources | filter: {name: $select.search}">
            <div ng-bind-html="source.name | highlight: $select.search"></div>
          </ui-select-choices>
          <ui-select-no-choice>
          <b>画像ソースが見つかりません</b>
          </ui-select-no-choice>
        </ui-select>
        
        <div ng-if="imageSources == null" class="muted">
            ソースが見つかりません。OBSは動いていますか？
        </div>
        <p>
            <button class="btn btn-link" ng-click="getImageSources()">ソースを更新</button>
        </p>
    </eos-container>

    <eos-container ng-if="imageSources != null && effect.imageSourceName != null" header="File" style="margin-top: 10px;">
      <file-chooser model="effect.file" options="{ filters: [ {name: 'OBS-Supported Image Files', extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tga', 'jxr', 'psd', 'webp']}, {name: 'All Files', extensions: ['*']} ]}"></file-chooser>
    </eos-container>
  `,
  optionsController: ($scope: any, backendCommunicator: any, $q: any) => {
    $scope.imageSources = [];

    $scope.selectImageSource = (imageSourceName: string) => {
      $scope.effect.imageSourceName = imageSourceName;
    };

    $scope.getImageSources = () => {
      $q.when(
        backendCommunicator.fireEventAsync("obs-get-image-sources")
      ).then((imageSources: OBSSource[]) => {
        $scope.imageSources = imageSources ?? [];
        $scope.selected = $scope.imageSources.find(source => source.name === $scope.effect.imageSourceName);
      });
    };
    $scope.getImageSources();
  },
  optionsValidator: (effect) => {
    const errors: string[] = [];

    if (effect.imageSourceName == null) {
      errors.push("画像ソースを設定してください");
    } else if (!(effect.file?.length > 0)) {
      errors.push("ファイル名を設定してください");
    }

    return errors;
  },
  onTriggerEvent: async ({ effect }) => {
    await setImageSourceSettings(effect.imageSourceName, {
      file: effect.file
    });
    return true;
  },
};
