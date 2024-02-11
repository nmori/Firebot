"use strict";

const model = {
    definition: {
        id: "firebot:channelcurrency",
        name: "チャネル通貨",
        description: "チャネル通貨の金額に基づいて制限する。",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div ng-show="hasCurrencies">
                <div id="channelCurrency" class="modal-subheader" style="padding: 0 0 4px 0">
                    チャネル通貨
                </div>
                <div class="">
                    <select class="fb-select" ng-model="restriction.selectedCurrency" ng-options="currency.id as currency.name for currency in currencies"></select>
                </div>

                <div id="channelCurrencyOption" class="modal-subheader" style="padding: 0 0 4px 0">
                    比較
                </div>
                <div>
                    <select class="fb-select" ng-model="restriction.comparison">
                    <option label="Greater than (or equal to)" value="greater">以上</option>
                    <option label="Less than" value="less">未満</option>
                    <option label="Equal to" value="equal">同等</option>
                    </select>
                </div>

                <div id="channelCurrencyAmount" class="modal-subheader" style="padding: 0 0 4px 0">
                    Amount
                </div>
                <div class="form-group">
                    <input type="number" class="form-control" ng-model="restriction.amount" placeholder="通貨の金額を入力">
                </div>

                <div ng-if="showAutoDeduct()" style="margin-top:20px">
                    <label class="control-fb control--checkbox"> 制限を通過した場合、ユーザーから自動的に通貨を差し引く</tooltip>
                        <input type="checkbox" ng-model="restriction.autoDeductCurrency">
                        <div class="control__indicator"></div>
                    </label>
                </div>
            </div>
            <div ng-show="!hasCurrencies">
                <p>あなたはこの制限で使用する通貨を作成していない！</p>
            </div>
        </div>
    `,
    optionsController: ($scope, currencyService) => {

        $scope.showAutoDeduct = () => {
            return ['greater', 'equal'].includes($scope.restriction.comparison) &&
                ['any', 'all'].includes($scope.restrictionMode);
        };

        $scope.currencies = currencyService.getCurrencies();

        $scope.hasCurrencies = $scope.currencies.length > 0;

        // set default values
        if ($scope.currencies.length > 0 && $scope.restriction.selectedCurrency == null) {
            $scope.restriction.selectedCurrency = $scope.currencies[0].id;
        }

        if ($scope.restriction.comparison == null) {
            $scope.restriction.comparison = "greater";
        }
    },
    optionsValueDisplay: (restriction, currencyService) => {
        const comparison = restriction.comparison?.toLowerCase();
        const currencyId = restriction.selectedCurrency;
        const amount = restriction.amount;

        if (comparison == null) {
            return "";
        }

        let comparisonDisplay;
        if (comparison === "less") {
            comparisonDisplay = "less than";
        } else if (comparison === "greater") {
            comparisonDisplay = "greater than";
        } else if (comparison === "equal") {
            comparisonDisplay = "equal to";
        }

        const currency = currencyService.getCurrency(currencyId);

        const currencyName = currency ? currency.name : "[未選択]";

        return `${currencyName} is ${comparisonDisplay} ${amount}`;
    },
    predicate: async ({ metadata }, { selectedCurrency, comparison, amount: currencyAmount }) => {
        // we require this here to workaround circle dep issues :(
        const currencyAccess = require("../../currency/currency-access").default;
        const currencyManager = require("../../currency/currency-manager");

        const username = metadata.username;
        const userCurrency = await currencyManager.getViewerCurrencyAmount(username, selectedCurrency);

        let passed = false;
        if (comparison === "less" && userCurrency < currencyAmount) {
            passed = true;
        }

        if (comparison === "greater" && userCurrency >= currencyAmount) {
            passed = true;
        }

        if (comparison === "equal" && userCurrency === currencyAmount) {
            passed = true;
        }

        if (!passed) {
            const currency = currencyAccess.getCurrencyById(selectedCurrency);
            const currencyName = currency ? currency.name.toLowerCase() : "不明な通貨";
            const amountText = comparison !== "equal" ? `${comparison} than ${currencyAmount}` : `${currencyAmount}`;
            throw new Error(`以下が必要です：${amountText} ${currencyName}`);
        }
    },
    onSuccessful: async ({ metadata }, {
        selectedCurrency: currencyId,
        comparison,
        amount: currencyAmount,
        autoDeductCurrency
    }) => {

        if (!['greater', 'equal'].includes(comparison) || !autoDeductCurrency) {
            return;
        }

        // we require this here to workaround circle dep issues :(
        const currencyManager = require("../../currency/currency-manager");

        const username = metadata.username;

        await currencyManager.adjustCurrencyForViewer(
            username,
            currencyId,
            -Math.abs(currencyAmount) // force value negative to make it deduct the amount from user
        );
    }
};

module.exports = model;