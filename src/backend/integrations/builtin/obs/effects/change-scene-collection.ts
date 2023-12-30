import { EffectType } from "../../../../../types/effects";
import { setCurrentSceneCollection } from "../obs-remote";

export const ChangeSceneCollectionEffectType: EffectType<{
    sceneCollectionName: string;
}> = {
  definition: {
    id: "ebiggz:obs-change-scene-collection",
    name: "OBS�V�[���R���N�V�����ؑ�",
    description: "OBS�̃A�N�e�B�u�V�[���R���N�V������؂�ւ���",
    icon: "fad fa-th-list",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container header="�V�K�V�[���R���N�V����">
        <div ng-hide="effect.custom === true">
            <button class="btn btn-link" ng-click="getSceneCollections()">Refresh Scene Collections</button>
            <span class="muted">(Make sure {{ isObsConfigured ? "" : "the OBS integration is configured and " }}OBS is running)</span>
        </div>

        <ui-select ng-model="selected" on-select="selectSceneCollection($select.selected)">
          <ui-select-match placeholder="�V�[���R���N�V������I��">{{$select.selected.name}}</ui-select-match>
          <ui-select-choices repeat="collection in sceneCollections | filter: {name: $select.search}">
            <li ng-show="collection.custom === true" role="separator" class="divider"></li>
            <div ng-bind-html="collection.name | highlight: $select.search"></div>
          </ui-select-choices>
        </ui-select>

        <div ng-show="effect.custom === true" style="margin-top:10px;">
            <firebot-input input-title="�V�[���R���N�V����" model="effect.sceneCollectionName"></firebot-input>
        </div>
    </eos-container>
  `,
    optionsController: ($scope: any, backendCommunicator: any, $q: any) => {
        $scope.isObsConfigured = false;

        $scope.sceneCollections = [];

        $scope.customCollection = {name: "Set Custom", custom: true};

        $scope.selectSceneCollection = (sceneCollection: {name: string, custom: boolean}) => {
            $scope.effect.custom = sceneCollection.custom;
            if (!sceneCollection.custom) {
                $scope.effect.sceneCollectionName = sceneCollection.name;
            }
        };

        $scope.getSceneCollections = () => {
            $scope.isObsConfigured = backendCommunicator.fireEventSync("obs-is-configured");

            $q.when(
                backendCommunicator.fireEventAsync("obs-get-scene-collection-list")
            ).then((sceneCollections: string[]) => {
                $scope.sceneCollections = [];
                if (sceneCollections != null) {
                    sceneCollections.forEach(sceneCollection => {
                        $scope.sceneCollections.push({name: sceneCollection, custom: false});
                    });
                }
                $scope.sceneCollections.push($scope.customCollection);
                if ($scope.effect.custom) {
                    $scope.selected = $scope.customCollection;
                } else {
                    $scope.selected = $scope.sceneCollections.find(collection =>
                        collection.name === $scope.effect.sceneCollectionName);
                }
            });
        };
        $scope.getSceneCollections();
    },
    optionsValidator: (effect) => {
        if (effect.sceneCollectionName == null) {
            return ["Please select a scene collection."];
        }
        return [];
    },
    onTriggerEvent: async ({ effect }) => {
        await setCurrentSceneCollection(effect.sceneCollectionName);
        return true;
    }
};
