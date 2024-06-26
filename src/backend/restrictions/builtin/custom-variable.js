"use strict";

const model = {
    definition: {
        id: "firebot:customvariable",
        name: "カスタム変数",
        description: "カスタム変数の演出で設定されたカスタム変数に基づいて制限する.",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div id="customVariableName" class="modal-subheader" style="padding: 0 0 4px 0">
                カスタム変数名
            </div>
            <input type="text" class="form-control" placeholder="名前を入れる" ng-model="restriction.name">

            <div id="customVariableName" class="modal-subheader" style="padding: 0 0 4px 0">
                値
            </div>
            <input type="text" class="form-control" placeholder="Enter value" ng-model="restriction.value">
        </div>
    `,
    optionsValueDisplay: (restriction) => {
        const name = restriction.name;
        const value = restriction.value;

        if (name == null || value == null) {
            return "";
        }

        return `${name} is ${value}`;
    },
    /*
      function that resolves/rejects a promise based on if the restriction criteria is met
    */
    predicate: (_, restrictionData) => {
        return new Promise(async (resolve, reject) => {
            const customVariableManager = require("../../common/custom-variable-manager");

            let passed = false;
            const cachedVariable = customVariableManager.getCustomVariable(restrictionData.name);

            let value = restrictionData.value;
            try {
                value = JSON.parse(value);
            } catch (error) {
                //fail silently
            }

            // eslint-disable-next-line eqeqeq
            if (cachedVariable == value) {
                passed = true;
            }

            if (passed) {
                resolve();
            } else {
                reject("フラグが正しい値に設定されていない");
            }
        });
    }
};

module.exports = model;