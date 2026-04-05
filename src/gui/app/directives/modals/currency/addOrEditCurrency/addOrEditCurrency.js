"use strict";

// Modal for adding or editing a currency

(function() {
    angular.module("firebotApp").component("addOrEditCurrencyModal", {
        templateUrl:
      "./directives/modals/currency/addOrEditCurrency/addOrEditCurrency.html",
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function(utilityService, currencyService, viewerRolesService, logger) {
            const { randomUUID } = require("crypto");
            const $ctrl = this;

            $ctrl.currency = {
                id: randomUUID(),
                name: "Points",
                active: true,
                payout: 5,
                interval: 5,
                limit: 0,
                transfer: "Allow",
                bonus: {}
            };

            $ctrl.$onInit = function() {
                if ($ctrl.resolve.currency == null) {
                    $ctrl.isNewCurrency = true;
                } else {
                    $ctrl.currency = JSON.parse(JSON.stringify($ctrl.resolve.currency));
                }

                // Set our transfer status.
                $ctrl.setTransferEnabled = function(state) {
                    $ctrl.currency.transfer = state;
                };

                $ctrl.getTransferLabel = function(state) {
                    if (state === "Allow") {
                        return "許可";
                    }
                    if (state === "Disallow") {
                        return "不許可";
                    }
                    return state;
                };

                // Get the groups we want people to be able to give bonus currency to...
                $ctrl.viewerRoles = viewerRolesService.getAllRoles().filter(r => r.id !== "Owner");
            };

            $ctrl.delete = function() {
                if ($ctrl.isNewCurrency) {
                    return;
                }

                $ctrl.close({ $value: { currency: $ctrl.currency, action: "delete" } });
            };

            $ctrl.save = function() {
                if ($ctrl.currency.name == null || $ctrl.currency.name === "") {
                    return;
                }

                if ($ctrl.isNewCurrency && currencyService.currencies.some(c => c.name === $ctrl.currency.name)) {
                    utilityService.showErrorModal(
                        "他の通貨と同じ名前の通貨は作成できません。"
                    );
                    logger.error(`User tried to create currency with the same name as another currency: ${$ctrl.currency.name}.`);
                    return;
                }

                if (!$ctrl.currency.offline) {
                    $ctrl.currency.offline = undefined;
                }

                logger.debug($ctrl.currency);

                const action = $ctrl.isNewCurrency ? "add" : "update";
                $ctrl.close({
                    $value: {
                        currency: $ctrl.currency,
                        action: action
                    }
                });
            };

            /**
             * Delete Currency confirmation Modal
             */
            $ctrl.showCurrencyDeleteModal = function(currency) {
                utilityService
                    .showConfirmationModal({
                        title: "通貨を削除",
                        question: "この通貨を削除してもよろしいですか？",
                        confirmLabel: "削除"
                    })
                    .then((confirmed) => {
                        if (confirmed) {
                            currencyService.deleteCurrency(currency.id);
                            $ctrl.close({
                                $value: {
                                    action: "close"
                                }
                            });
                        }
                    });
            };

            /**
             * Purge Currency confirmation Modal
             */
            $ctrl.showCurrencyPurgeModal = function(currency) {
                utilityService
                    .showConfirmationModal({
                        title: "通貨をパージ",
                        question:
              "この通貨をパージしてもよろしいですか？この通貨はすべてのユーザーで 0 に設定されます。",
                        confirmLabel: "パージ"
                    })
                    .then((confirmed) => {
                        if (confirmed) {
                            currencyService.purgeCurrency(currency.id);
                            $ctrl.close({
                                $value: {
                                    action: "close"
                                }
                            });
                        }
                    });
            };
        }
    });
}());