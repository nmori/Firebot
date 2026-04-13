/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import type { RestrictionType } from "../../../types/restrictions";
import { TwitchApi } from "../../streaming-platforms/twitch/api";
import { AccountAccess } from "../../common/account-access";
import logger from "../../logwrapper";

type ComparisonType = "less" | "greater" | "equal";

const model: RestrictionType<{
    comparison: ComparisonType;
    amount: number;
}> = {
    definition: {
        id: "firebot:channelViewers",
        name: "チャンネル視聴者数",
        description: "現在の視聴者数に応じて制限します。",
        triggers: []
    },
    optionsTemplate: `
    <div>
        <div id="numViewersOption" class="modal-subheader" style="padding: 0 0 4px 0">
            比較条件
        </div>
        <div>
            <select class="fb-select" ng-model="restriction.comparison">
                <option label="以下" value="less">以下</option>
                <option label="以上" value="greater">以上</option>
                <option label="等しい" value="equal">等しい</option>
            </select>
        </div>

        <div id="numberOfViewers" class="modal-subheader" style="padding: 0 0 4px 0">
            人数
        </div>
        <div class="form-group">
            <input type="number" class="form-control" ng-model="restriction.amount" placeholder="視聴者数を入力">
        </div>
    </div>
    `,
    optionsController: ($scope) => {
        if ($scope.restriction.amount == null) {
            $scope.restriction.amount = 0;
        }

        if ($scope.restriction.comparison == null) {
            $scope.restriction.comparison = "greater";
        }
    },
    optionsValueDisplay: (restriction) => {
        let comparison = restriction.comparison;
        const amount = restriction.amount;

        if (comparison != null) {
            comparison = comparison.toLowerCase() as ComparisonType;
        } else {
            return "";
        }

        let comparisionString: string;

        if (comparison === "less") {
            comparisionString = "以下";
        } else if (comparison === "greater") {
            comparisionString = "以上";
        } else if (comparison === "equal") {
            comparisionString = "等しい";
        }

        return `視聴者数が ${amount} ${comparisionString}`;
    },
    /*
      function that resolves/rejects a promise based on if the restriction criteria is met
    */
    predicate: (triggerData, restrictionData) => {
        return new Promise(async (resolve, reject) => {
            const client = TwitchApi.streamerClient;
            const streamer = AccountAccess.getAccounts().streamer;

            let currentViewers = null;
            try {
                const stream = await client.streams.getStreamByUserId(streamer.userId);
                currentViewers = stream.viewers;
            } catch (error) {
                logger.warn("unable to get stream viewer count", error);
            }

            if (currentViewers) {
                return reject(`現在の視聴者数を判定できません。`);
            }

            const comparison = restrictionData.comparison;
            const numViewers = restrictionData.amount;
            let comparisonText = "";

            let passed = false;
            if (comparison === "less" && currentViewers <= numViewers) {
                passed = true;
            }

            if (comparison === "greater" && currentViewers >= numViewers) {
                passed = true;
            }

            if (comparison === "equal" && currentViewers === numViewers) {
                passed = true;
            }

            if (comparison === "greater" || comparison === "less") {
                comparisonText = comparison === "greater" ? "以上" : "以下";
            } else {
                comparisonText = "等しい";
            }

            if (passed) {
                resolve(true);
            } else {
                reject(`視聴者数は ${numViewers} ${comparisonText} である必要があります。`);
            }
        });
    }
};

export = model;