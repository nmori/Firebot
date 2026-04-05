"use strict";

(function() {
    angular
        .module('firebotApp')
        .component("searchableCurrencySelect", {
            bindings: {
                modelValue: "=ngModel",
                name: "@?",
                id: "@?"
            },
            template: `
                <firebot-searchable-select
                    ng-model="$ctrl.modelValue"
                    items="$ctrl.currencies"
                    id="{{$ctrl.id || ''}}"
                    name="{{$ctrl.name || ''}}"
                    placeholder="通貨を選択"
                ></firebot-searchable-select>
            `,
            controller: function(currencyService) {
                const $ctrl = this;

                $ctrl.currencies = currencyService.getCurrencies();
            }
        });
}());
