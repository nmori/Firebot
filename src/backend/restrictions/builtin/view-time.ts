/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import type { RestrictionType } from "../../../types/restrictions";
import viewerDatabase from '../../viewers/viewer-database';

const model: RestrictionType<{
    time: number;
}> = {
    definition: {
        id: "firebot:viewTime",
        name: "視聴時間",
        description: "配信に X 分以上滞在しているユーザーのみに制限します。",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div id="viewTimeRestriction" class="modal-subheader" style="padding: 0 0 4px 0">
                最低視聴時間
            </div>
            <input type="number" class="form-control" placeholder="分数を入力" ng-model="restriction.time">
        </div>
    `,
    optionsValueDisplay: (restriction) => {
        const time = restriction.time || 0;

        return `${time}分以上`;
    },
    /*
      function that resolves/rejects a promise based on if the restriction criteria is met
    */
    predicate: (triggerData, restrictionData) => {
        return new Promise(async (resolve, reject) => {
            let passed = false;
            const viewer = await viewerDatabase.getViewerByUsername(triggerData.metadata.username);
            const viewtime = viewer.minutesInChannel;

            if (viewtime >= restrictionData.time) {
                passed = true;
            }

            if (passed) {
                resolve(true);
            } else {
                reject("この機能を使うには、チャンネルでの視聴時間が足りません");
            }
        });
    }
};

export = model;