/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import type { RestrictionType } from "../../../types/restrictions";

import { AccountAccess } from "../../common/account-access";
import { TwitchApi } from "../../streaming-platforms/twitch/api";

const model: RestrictionType<{
    gameId: string;
    name: string;
}> = {
    definition: {
        id: "firebot:channelGame",
        name: "チャンネルカテゴリ/ゲーム",
        description: "カテゴリ/ゲームが指定したカテゴリ/ゲームのときのみに制限します。",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <ui-select ng-model="selectedGame" theme="bootstrap" spinner-enabled="true" on-select="gameSelected($item)" style="margin-bottom:10px;">
                <ui-select-match placeholder="カテゴリ/ゲームを検索">
                    <div style="height: 21px; display:flex; flex-direction: row; align-items: center;">
                        <img style="height: 28px; width: 21px; border-radius: 5px; margin-right:5px;" ng-src="{{$select.selected.boxArtUrl}}">
                        <div style="font-weight: 100;font-size: 17px;">{{$select.selected.name}}</div>
                    </div>
                </ui-select-match>
                <ui-select-choices minimum-input-length="1" repeat="game in games | filter: $select.search" refresh="searchGames($select.search)" refresh-delay="400" style="position:relative;">
                    <div style="height: 35px; display:flex; flex-direction: row; align-items: center;">
                        <img style="height: 40px; width: 30px; border-radius: 5px; margin-right:10px;" ng-src="{{game.boxArtUrl}}">
                        <div style="font-weight: 100;font-size: 17px;">{{game.name}}</div>
                    </div>
                </ui-select-choices>
            </ui-select>
        </div>
    `,
    optionsController: ($scope, $q, backendCommunicator) => {
        const restriction = $scope.restriction;

        $scope.games = [];
        $scope.searchGames = function (gameQuery) {
            // eslint-disable-next-line
            $q.when(backendCommunicator.fireEventAsync("search-twitch-games", gameQuery))
                // eslint-disable-next-line
                .then((games) => {
                    if (games != null) {
                        $scope.games = games;
                    }
                });
        };

        // eslint-disable-next-line
        $q.when(backendCommunicator.fireEventAsync("get-twitch-game", restriction.gameId))
            // eslint-disable-next-line
            .then((game) => {
                if (game != null) {
                    $scope.selectedGame = game;
                }
            });

        $scope.gameSelected = function (game: { id: string, name: string }) {
            if (game != null) {
                restriction.gameId = game.id;
                restriction.name = game.name;
            }
        };
    },
    optionsValueDisplay: (restriction) => {
        if (restriction.name != null) {
            return restriction.name;
        }
        return "[カテゴリ/ゲーム未設定]";
    },
    predicate: (_, restrictionData) => {
        return new Promise(async (resolve, reject) => {
            const expectedGameId = restrictionData.gameId;
            if (expectedGameId == null) {
                return resolve(true);
            }

            const streamerId = AccountAccess.getAccounts().streamer.userId;
            const channel = await TwitchApi.channels.getChannelInformation(streamerId);

            if (channel == null) {
                return reject(`チャンネル情報を取得できません。`);
            }

            const currentGameId = channel.gameId;
            if (currentGameId == null) {
                return reject(`現在のカテゴリ/ゲームを判定できません。`);
            }

            let passed = false;
            if (expectedGameId === currentGameId) {
                passed = true;
            }

            if (passed) {
                resolve(true);
            } else {
                const expectedGame = await TwitchApi.categories.getCategoryById(expectedGameId);
                reject(
                    `Channel category/game isn't set to ${expectedGame?.name ?? "the correct category/game"}.`
                    .replace("Channel category/game isn't set to ", "チャンネルカテゴリ/ゲームは ")
                    .replace("the correct category/game", "正しいカテゴリ/ゲーム")
                    .concat(" に設定されている必要があります。")
                );
            }
        });
    }
};

export = model;