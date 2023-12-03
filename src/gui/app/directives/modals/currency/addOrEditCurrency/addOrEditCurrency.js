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
        controller: function($scope, utilityService, currencyService, viewerRolesService, logger) {
            const uuidv1 = require("uuid/v1");
            const $ctrl = this;

            $ctrl.currency = {
                id: uuidv1(),
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

                const modalId = $ctrl.resolve.modalId;
                utilityService.addSlidingModal(
                    $ctrl.modalInstance.rendered.then(() => {
                        const modalElement = $("." + modalId).children();
                        return {
                            element: modalElement,
                            name: "通貨の編集",
                            id: modalId,
                            instance: $ctrl.modalInstance
                        };
                    })
                );

                // Set our transfer status.
                $ctrl.setTransferEnabled = function(state) {
                    $ctrl.currency.transfer = state;
                };

                // Get the groups we want people to be able to give bonus currency to...
                $ctrl.viewerRoles = viewerRolesService.getAllRoles().filter(r => r.id !== "Owner");

                $scope.$on("modal.closing", function() {
                    utilityService.removeSlidingModal();
                });
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
                        title: "通貨の削除",
                        question: "この通貨を削除してもよろしいですか？",
                        confirmLabel: "削除する"
                    })
                    .then(confirmed => {
                        if (confirmed) {
                            currencyService.deleteCurrency(currency);
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
                        title: "通貨のリセット",
                        question:
              "本当にこの通貨をリセットしますか？この通貨はすべてのユーザーに対して0に設定されます。.",
                        confirmLabel: "リセット"
                    })
                    .then(confirmed => {
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
