import type { RestrictionType } from "../../../types/restrictions";
import type { Currency } from "../../../types/currency";
import currencyAccess from "../../currency/currency-access";
import currencyManager from "../../currency/currency-manager";

type ComparisonType = "less" | "greater" | "equal";

const model: RestrictionType<{
    selectedCurrency: string;
    comparison: ComparisonType;
    amount: number;
    autoDeductCurrency: boolean;
}> = {
    definition: {
        id: "firebot:channelcurrency",
        name: "チャンネル通貨",
        description: "チャンネル通貨量に応じて制限します。",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div ng-show="hasCurrencies">
                <div id="channelCurrency" class="modal-subheader" style="padding: 0 0 4px 0">
                    チャンネル通貨
                </div>
                <div class="">
                    <select class="fb-select" ng-model="restriction.selectedCurrency" ng-options="currency.id as currency.name for currency in currencies"></select>
                </div>

                <div id="channelCurrencyOption" class="modal-subheader" style="padding: 0 0 4px 0">
                    比較条件
                </div>
                <div>
                    <select class="fb-select" ng-model="restriction.comparison">
                    <option label="以上" value="greater">以上</option>
                    <option label="未満" value="less">未満</option>
                    <option label="等しい" value="equal">等しい</option>
                    </select>
                </div>

                <div id="channelCurrencyAmount" class="modal-subheader" style="padding: 0 0 4px 0">
                    金額
                </div>
                <div class="form-group">
                    <input type="number" class="form-control" ng-model="restriction.amount" placeholder="通貨量を入力">
                </div>

                <div ng-if="showAutoDeduct()" style="margin-top:20px">
                    <label class="control-fb control--checkbox"> 制限を満たした場合にユーザーから通貨を自動で減算</tooltip>
                        <input type="checkbox" ng-model="restriction.autoDeductCurrency">
                        <div class="control__indicator"></div>
                    </label>
                </div>
            </div>
            <div ng-show="!hasCurrencies">
                <p>この制限に使用できる通貨がまだ作成されていません！</p>
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
            comparisonDisplay = "未満";
        } else if (comparison === "greater") {
            comparisonDisplay = "以上";
        } else if (comparison === "equal") {
            comparisonDisplay = "等しい";
        }

        const currency = currencyService.getCurrency(currencyId) as Currency;

        const currencyName = currency ? currency.name : "[None Selected]";

        return `${currencyName} が ${amount} ${comparisonDisplay}`;
    },
    predicate: async ({ metadata }, { selectedCurrency, comparison, amount: currencyAmount }) => {
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
            const currencyName = currency ? currency.name : "不明な通貨";
            const amountText = comparison === "less"
                ? `${currencyAmount} 未満`
                : comparison === "greater"
                    ? `${currencyAmount} 以上`
                    : `${currencyAmount} と等しい`;
            throw new Error(`${currencyName} が ${amountText} である必要があります`);
        }

        return passed;
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

        const username = metadata.username;

        await currencyManager.adjustCurrencyForViewer(
            username,
            currencyId,
            0 - Math.abs(currencyAmount) // force value negative to make it deduct the amount from user
        );
    }
};

export = model;