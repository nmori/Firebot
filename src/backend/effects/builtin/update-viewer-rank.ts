import { EffectType } from "../../../types/effects";
import viewerDatabase from "../../viewers/viewer-database";
import viewerRanksService from "../../ranks/rank-manager";

const effect: EffectType<{
    rankLadderId: string;
    action: "promote" | "demote" | "set-specific-rank" | "set-variable-rank";
    rankId?: string;
    variableRankName?: string;
}> = {
    definition: {
        id: "firebot:update-viewer-rank",
        name: "視聴者ランク更新",
        description: "指定したランクラダー内で視聴者ランクを更新します",
        icon: "fad fa-award",
        categories: ["common", "fun", "firebot control"],
        dependencies: []
    },
    optionsTemplate: `
    <eos-container header="ランクラダー">
        <firebot-searchable-select
            items="manualRankLadders"
            ng-model="effect.rankLadderId"
            placeholder="ランクラダーを選択"
        >
        </firebot-searchable-select>

        <div class="effect-info alert alert-info">
            注意: このエフェクトでは「手動」モードに設定されたランクラダーのみが利用できます。
        </div>
    </eos-container>

    <eos-container header="操作" ng-show="effect.rankLadderId != null">
        <firebot-radios
            options="actions"
            model="effect.action"
        >
        </firebot-radios>
    </eos-container>

    <eos-container header="新しいランク" ng-show="effect.action === 'set-specific-rank' || effect.action === 'set-variable-rank'">
        <firebot-input
            ng-if="effect.action === 'set-variable-rank'"
            model="effect.variableRankName"
            placeholder="ランク名を入力"
        ></firebot-input>
        <firebot-searchable-select
            ng-if="effect.action === 'set-specific-rank'"
            items="getRanksForSelectedLadder()"
            ng-model="effect.rankId"
            placeholder="ランクを選択"
        >
        </firebot-searchable-select>
    </eos-container>
    `,
    optionsController: ($scope, viewerRanksService) => {
        $scope.manualRankLadders = viewerRanksService.rankLadders
            .filter(ladder => ladder.mode === "manual");

        $scope.actions = {
            promote: "次のランクに昇格",
            demote: "前のランクに降格",
            "set-specific-rank": "特定のランクに設定",
            "set-variable-rank": "変数で指定したランクに設定"
        };

        $scope.getRanksForSelectedLadder = () => {
            if (!$scope.effect.rankLadderId) {
                return [];
            }
            const ladder = $scope.manualRankLadders.find(ladder =>
                ladder.id === $scope.effect.rankLadderId
            );
            return ladder ? ladder.ranks : [];
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.rankLadderId) {
            errors.push("ランクラダーを選択してください。");
        }
        if (!effect.action) {
            errors.push("操作を選択してください。");
        } else if (effect.action === "set-specific-rank" && !effect.rankId) {
            errors.push("ランクを選択してください。");
        } else if (effect.action === "set-variable-rank" && !effect.variableRankName) {
            errors.push("ランク名を入力してください。");
        }
        return errors;
    },
    getDefaultLabel: (effect, viewerRanksService) => {
        const ladder = viewerRanksService.getRankLadder(effect.rankLadderId);
        if (!ladder) {
            return "";
        }
        switch (effect.action) {
            case "promote":
                return `${ladder.name} で視聴者を昇格`;
            case "demote":
                return `${ladder.name} で視聴者を降格`;
            case "set-specific-rank": {
                const rank = ladder.ranks.find(r => r.id === effect.rankId);
                return `${ladder.name} - ${rank?.name ?? "不明なランク"}`;
            }
            case "set-variable-rank":
                return `${ladder.name} - ${effect.variableRankName}`;
        }
    },
    onTriggerEvent: async ({ effect, trigger }) => {
        const ladder = viewerRanksService.getRankLadderHelpers().find(ladder =>
            ladder.id === effect.rankLadderId
        );

        if (!ladder) {
            return false;
        }

        const viewer = await viewerDatabase.getViewerByUsername(trigger.metadata.username);

        if (!viewer) {
            return false;
        }

        const currentRankId = viewer.ranks?.[ladder.id] ?? null;

        let newRankId: string = null;
        switch (effect.action) {
            case "promote":
                newRankId = ladder.getNextRankId(currentRankId);
                if (!newRankId) {
                    // viewer is already at the highest rank
                    return true;
                }
                break;
            case "demote":
                newRankId = ladder.getPreviousRankId(currentRankId);
                break;
            case "set-specific-rank":
                if (!ladder.hasRank(effect.rankId)) {
                    return false;
                }
                newRankId = effect.rankId;
                break;
            case "set-variable-rank": {
                const rank = ladder.getRankByName(effect.variableRankName);
                if (!rank) {
                    return false;
                }
                newRankId = rank.id;
                break;
            }
        }

        if (newRankId === currentRankId) {
            return true;
        }

        await viewerDatabase.setViewerRank(viewer, ladder.id, newRankId);
    }
};

export = effect;
