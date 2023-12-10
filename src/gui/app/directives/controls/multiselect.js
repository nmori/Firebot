"use strict";

(function() {

    const deepmerge = require("deepmerge");

    angular
        .module('firebotApp')
        .component("multiselectList", {
            bindings: {
                model: "=",
                settings: "<",
                onUpdate: '&'
            },
            template: `
                <div>
                    <ui-select multiple ng-model="$ctrl.model" theme="bootstrap" close-on-select="false" class="control-type-list" title="オプションを選んでください">
                        <ui-select-match placeholder="選択...">{{$item.name}}</ui-select-match>
                        <ui-select-choices repeat="item.id as item in $ctrl.settings.options | filter: {name: $select.search}">
                            <div style="padding: 10px;" ng-bind-html="item.name | highlight: $select.search"></div>
                        </ui-select-choices>
                    </ui-select>         
                </div>
            `,
            controller: function() {

                const $ctrl = this;

                const defaultSettings = {
                    options: []
                };

                $ctrl.$onInit = () => {
                    if ($ctrl.settings == null) {
                        $ctrl.settings = defaultSettings;
                    } else {
                        $ctrl.settings = deepmerge(defaultSettings, $ctrl.settings);
                    }

                    console.log($ctrl.settings);

                    if ($ctrl.model == null) {
                        $ctrl.model = [];
                    }
                };

            }
        });
}());
