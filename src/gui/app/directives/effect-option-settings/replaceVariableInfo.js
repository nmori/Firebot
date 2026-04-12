"use strict";

(function() {
    angular.module("firebotApp").component("replaceVariableInfo", {
        bindings: {
            trigger: "<"
        },
        template: `
            <eos-collapsable-panel show-label="テキスト変数を表示" hide-label="テキスト変数を非表示">
                <div>

                </div>
            </eos-collapsable-panel>
        `
    });
}());
