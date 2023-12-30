import { EffectType } from "../../../../../types/effects";
import { OBSSource, setBrowserSourceSettings } from "../obs-remote";

export const SetOBSBrowserSourceUrlEffectType: EffectType<{
    browserSourceName: string;
    url: string;
}> = {
  definition: {
    id: "firebot:obs-set-browser-source-url",
    name: "OBS�u���E�U�\�[�X��URL��ύX",
    description: "OBS�u���E�U�\�[�X��URL��ύX���܂�",
    icon: "fad fa-browser",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container header="OBS �u���E�U�\�[�X">
        <div>
            <button class="btn btn-link" ng-click="getBrowserSources()">�ēǂݍ���/button>
        </div>

        <ui-select ng-if="browserSources != null" ng-model="selected" on-select="selectBrowserSource($select.selected.name)">
            <ui-select-match placeholder="Select a Browser Source...">{{$select.selected.name}}</ui-select-match>
            <ui-select-choices repeat="source in browserSources | filter: {name: $select.search}">
                <div ng-bind-html="source.name | highlight: $select.search"></div>
            </ui-select-choices>
            <ui-select-no-choice>
                <b>�u���E�U�\�[�X�͂���܂���.</b>
            </ui-select-no-choice>
        </ui-select>

        <div ng-if="browserSources == null" class="muted">
            �\�[�X��������܂���B {{ isObsConfigured ? "OBS�͓����Ă��܂����H" : "Have you configured the OBS integration?" }}
        </div>
    </eos-container>
    <eos-container ng-if="browserSources != null && effect.browserSourceName != null" header="URL" style="margin-top: 10px;">
        <firebot-input model="effect.url"></firebot-input>
    </eos-container>
  `,
    optionsController: ($scope: any, backendCommunicator: any, $q: any) => {
        $scope.isObsConfigured = false;

        $scope.browserSources = [];

        $scope.selectBrowserSource = (browserSourceName: string) => {
            $scope.effect.browserSourceName = browserSourceName;
        };

        $scope.getBrowserSources = () => {
            $scope.isObsConfigured = backendCommunicator.fireEventSync("obs-is-configured");

            $q.when(
                backendCommunicator.fireEventAsync("obs-get-browser-sources")
            ).then((browserSources: OBSSource[]) => {
                $scope.browserSources = browserSources;
                $scope.selected = $scope.browserSources?.find(source => source.name === $scope.effect.browserSourceName);
            });
        };
        $scope.getBrowserSources();
    },
    optionsValidator: (effect) => {
        if (effect.browserSourceName == null) {
            return ["Please select a browser source."];
        }
        return [];
    },
    onTriggerEvent: async ({ effect }) => {
        await setBrowserSourceSettings(effect.browserSourceName, {
            url: effect.url
        });
        return true;
    }
};
