/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import type { RestrictionType } from "../../../types/restrictions";
import { CustomVariableManager } from "../../common/custom-variable-manager";

const model: RestrictionType<{
    name: string;
    value: string;
}> = {
    definition: {
        id: "firebot:customvariable",
        name: "カスタム変数",
        description: "カスタム変数エフェクトで設定したカスタム変数に基づいて制限します。",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div id="customVariableName" class="modal-subheader" style="padding: 0 0 4px 0">
                カスタム変数名
            </div>
            <input type="text" class="form-control" placeholder="名前を入力" ng-model="restriction.name">

            <div id="customVariableName" class="modal-subheader" style="padding: 0 0 4px 0">
                値
            </div>
            <input type="text" class="form-control" placeholder="値を入力" ng-model="restriction.value">
        </div>
    `,
    optionsValueDisplay: (restriction) => {
        const name = restriction.name;
        const value = restriction.value;

        if (name == null || value == null) {
            return "";
        }

        return `${name} = ${value}`;
    },
    predicate: (_, restrictionData) => {
        return new Promise((resolve, reject) => {
            let passed = false;
            const cachedVariable = CustomVariableManager.getCustomVariable(restrictionData.name);

            let value = restrictionData.value;
            try {
                value = JSON.parse(value);
            } catch {
                //fail silently
            }

            // eslint-disable-next-line eqeqeq
            if (cachedVariable == value) {
                passed = true;
            }

            if (passed) {
                resolve(true);
            } else {
                reject("フラグが正しい値に設定されていません");
            }
        });
    }
};

export = model;