import { EffectType } from "../../../../types/effects";
import { EffectCategory } from "../../../../shared/effect-constants";
import logger from "../../../logwrapper";
import twitchApi from "../../../twitch-api/api";
import eventsManager from "../../../events/EventManager";

const model: EffectType<{
    mode: "specific" | "custom";
    gameId: string;
    gameName: string;
}> = {
    definition: {
        id: "firebot:streamgame",
        name: "配信カテゴリーの設定",
        description: "配信ストリームのカテゴリ/ゲームを設定します。",
        icon: "fad fa-gamepad",
        categories: [EffectCategory.COMMON, EffectCategory.MODERATION, EffectCategory.TWITCH],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="Mode">
            <div class="controls-fb" style="padding-bottom: 5px;">
                <label class="control-fb control--radio">特定のカテゴリーを設定する <tooltip text="'設定する特定のカテゴリーを検索する'"></tooltip>
                    <input type="radio" ng-model="effect.mode" value="specific"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">カテゴリ <tooltip text="'任意の名前を入力すると、Firebotは演出実行時に最も近いカテゴリを設定します。.'"></tooltip>
                    <input type="radio" ng-model="effect.mode" value="custom"/>
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="Specific Category" pad-top="true" ng-if="effect.mode === 'specific'" >

            <ui-select ng-model="selectedGame" theme="bootstrap" spinner-enabled="true" on-select="gameSelected($item)" style="margin-bottom:10px;">
                <ui-select-match placeholder="カテゴリ/ゲームを検索">
                    <div style="height: 21px; display:flex; flex-direction: row; align-items: center;">
                        <img style="height: 21px; width: 21px; border-radius: 5px; margin-right:5px;" ng-src="{{$select.selected.boxArtUrl}}">
                        <div style="font-weight: 100;font-size: 17px;">{{$select.selected.name}}</div>
                    </div>
                </ui-select-match>
                <ui-select-choices minimum-input-length="1" repeat="game in games | filter: $select.search" refresh="searchGames($select.search)" refresh-delay="400" style="position:relative;">
                    <div style="height: 35px; display:flex; flex-direction: row; align-items: center;">
                        <img style="height: 30px; width: 30px; border-radius: 5px; margin-right:10px;" ng-src="{{game.boxArtUrl}}">
                        <div style="font-weight: 100;font-size: 17px;">{{game.name}}</div>
                    </div>
                </ui-select-choices>
            </ui-select>

        </eos-container>

        <eos-container header="カスタムカテゴリ" pad-top="true" ng-if="effect.mode === 'custom'">
            <input ng-model="effect.gameName" class="form-control" type="text" placeholder="カテゴリー/ゲーム名を入力" replace-variables>
        </eos-container>
    `,
    optionsController: ($scope, $q, backendCommunicator) => {
        if ($scope.effect.mode == null) {
            $scope.effect.mode = "specific";
        }
        $scope.games = [];
        $scope.searchGames = function (gameQuery) {
            $q.when(backendCommunicator.fireEventAsync("search-twitch-games", gameQuery)).then((games) => {
                if (games != null) {
                    $scope.games = games;
                }
            });
        };

        if ($scope.effect.mode === "specific" && $scope.effect.gameId != null) {
            $q.when(backendCommunicator.fireEventAsync("get-twitch-game", $scope.effect.gameId)).then((game) => {
                if (game != null) {
                    $scope.selectedGame = game;
                }
            });
        }

        $scope.gameSelected = function (game) {
            if (game != null) {
                $scope.effect.gameId = game.id;
            }
        };
    },
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.mode === "specific" && (effect.gameId == null || effect.gameId === "")) {
            errors.push("カテゴリー/ゲームを検索して選択してください。");
        } else if (effect.mode === "custom" && effect.gameName == null) {
            errors.push("カテゴリー/ゲームのタイトルを入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        if (event.effect.mode === "specific") {
            await twitchApi.channels.updateChannelInformation({
                gameId: event.effect.gameId
            });
        } else {
            const categories = await twitchApi.categories.searchCategories(event.effect.gameName.trim());
            if (categories?.length) {
                const category =
                    categories.find((c) => c.name.toLowerCase() === event.effect.gameName.toLowerCase()) ??
                    categories[0];

                if (!category) {
                    logger.error("Couldn't find a category/game with this name");
                    return;
                }

                await twitchApi.channels.updateChannelInformation({
                    gameId: category.id
                });
            }
        }

        const category = (await twitchApi.channels.getChannelInformation()).gameName;
        eventsManager.triggerEvent("firebot", "category-changed", {
            category: category
        });
        return true;
    }
};

module.exports = model;
