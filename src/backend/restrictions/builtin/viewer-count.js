"use strict";

const twitchApi = require("../../twitch-api/api");

const accountAccess = require("../../common/account-access");
const logger = require("../../logwrapper");

const model = {
    definition: {
        id: "firebot:channelViewers",
        name: "チャンネル視聴者数",
        description: "チャンネルに一定の視聴者がいる場合に制限する。",
        triggers: []
    },
    optionsTemplate: `
    <div>
        <div id="numViewersOption" class="modal-subheader" style="padding: 0 0 4px 0">
            Comparison
        </div>
        <div>
            <select class="fb-select" ng-model="restriction.comparison">
                <option label="Less than (or equal to)" value="less">以下</option>
                <option label="Greater than (or equal to)" value="greater">以上</option>
                <option label="Equal to" value="equal">同等</option>
            </select>
        </div>

        <div id="numberOfViewers" class="modal-subheader" style="padding: 0 0 4px 0">
            設定値
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
            comparison = comparison.toLowerCase();
        } else {
            return "";
        }

        if (comparison === "less") {
            comparison = "less than";
        } else if (comparison === "greater") {
            comparison = "greater than";
        } else if (comparison === "equal") {
            comparison = "equal to";
        }

        return `Viewers ${comparison} ${amount}`;
    },
    /*
      function that resolves/rejects a promise based on if the restriction criteria is met
    */
    predicate: (triggerData, restrictionData) => {
        return new Promise(async (resolve, reject) => {
            const client = twitchApi.streamerClient;
            const streamer = accountAccess.getAccounts().streamer;

            let currentViewers = null;
            try {
                const stream = await client.streams.getStreamByUserId(streamer.userId);
                currentViewers = stream.viewers;
            } catch (error) {
                logger.warn("unable to get stream viewer count", error);
            }

            if (currentViewers) {
                return reject(`現在の視聴者数を把握できません`);
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
                comparisonText = `${comparison} than`;
            } else {
                comparisonText = `${comparison} to`;
            }

            if (passed) {
                resolve();
            } else {
                reject(`視聴者数は${comparisonText} ${numViewers}.`);
            }
        });
    }
};

module.exports = model;