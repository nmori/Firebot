"use strict";

const model = {
    definition: {
        id: "firebot:channelcurrency",
        name: "繝√Ε繝阪Ν騾夊ｲｨ",
        description: "繝√Ε繝阪Ν騾夊ｲｨ縺ｮ驥鷹｡阪↓蝓ｺ縺･縺・※蛻ｶ髯舌☆繧九・,
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div ng-show="hasCurrencies">
                <div id="channelCurrency" class="modal-subheader" style="padding: 0 0 4px 0">
                    繝√Ε繝阪Ν騾夊ｲｨ
                </div>
                <div class="">
                    <select class="fb-select" ng-model="restriction.selectedCurrency" ng-options="currency.id as currency.name for currency in currencies"></select>
                </div>

                <div id="channelCurrencyOption" class="modal-subheader" style="padding: 0 0 4px 0">
                    豈碑ｼ・                </div>
                <div>
                    <select class="fb-select" ng-model="restriction.comparison">
                    <option label="Greater than (or equal to)" value="greater">莉･荳・/option>
                    <option label="Less than" value="less">譛ｪ貅</option>
                    <option label="Equal to" value="equal">蜷檎ｭ・/option>
                    </select>
                </div>

                <div id="channelCurrencyAmount" class="modal-subheader" style="padding: 0 0 4px 0">
                    Amount
                </div>
                <div class="form-group">
                    <input type="number" class="form-control" ng-model="restriction.amount" placeholder="騾夊ｲｨ縺ｮ驥鷹｡阪ｒ蜈･蜉・>
                </div>

                <div ng-if="showAutoDeduct()" style="margin-top:20px">
                    <label class="control-fb control--checkbox"> 蛻ｶ髯舌ｒ騾夐℃縺励◆蝣ｴ蜷医√Θ繝ｼ繧ｶ繝ｼ縺九ｉ閾ｪ蜍慕噪縺ｫ騾夊ｲｨ繧貞ｷｮ縺怜ｼ輔￥</tooltip>
                        <input type="checkbox" ng-model="restriction.autoDeductCurrency">
                        <div class="control__indicator"></div>
                    </label>
                </div>
            </div>
            <div ng-show="!hasCurrencies">
                <p>縺ゅ↑縺溘・縺薙・蛻ｶ髯舌〒菴ｿ逕ｨ縺吶ｋ騾夊ｲｨ繧剃ｽ懈・縺励※縺・↑縺・ｼ・/p>
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

        const currencyName = currency ? currency.name : "[譛ｪ驕ｸ謚枉";

        return `${currencyName} is ${comparisonDisplay} ${amount}`;
    },
    predicate: async ({ metadata }, { selectedCurrency, comparison, amount: currencyAmount }) => {
        // we require this here to workaround circle dep issues :(
        const currencyDatabase = require("../../database/currencyDatabase");

        const username = metadata.username;
        const userCurrency = await currencyDatabase.getUserCurrencyAmount(username, selectedCurrency);

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
            const currencyName = currency ? currency.name.toLowerCase() : "荳肴・縺ｪ騾夊ｲｨ";
            const amountText = comparison !== "equal" ? `${comparison} than ${currencyAmount}` : `${currencyAmount}`;
            throw new Error(`莉･荳九′蠢・ｦ√〒縺呻ｼ・{amountText} ${currencyName}`);
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
        const currencyDatabase = require("../../database/currencyDatabase");

        const username = metadata.username;

        await currencyDatabase.adjustCurrencyForUser(
            username,
            currencyId,
            -Math.abs(currencyAmount) // force value negative to make it deduct the amount from user
        );
    }
};

module.exports = model;
