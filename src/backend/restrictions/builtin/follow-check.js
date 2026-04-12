"use strict";

const model = {
    definition: {
        id: "firebot:followcheck",
        name: "フォローチェック",
        description: "カンマ区切りのリストで、ユーザが全員をフォローしているかどうかに基づいて制限する.",
        triggers: []
    },
    optionsTemplate: `
        <div>
<<<<<<< HEAD
            <div id="userFollowList" class="modal-subheader" style="padding: 0 0 4px 0">
                フォロー
=======
            <firebot-radio-container>
                <firebot-radio label="私のチャンネルをフォロー" model="restriction.checkMode" value="'streamer'"/>
                <firebot-radio label="指定したチャンネルをフォロー" model="restriction.checkMode" value="'custom'" />
                <div ng-show="restriction.checkMode === 'custom'" style="padding-top: 4px;">
                    <div id="userFollowList" class="modal-subheader" style="padding: 0 0 4px 0">
                        フォローユーザー
                    </div>
                    <input type="text" class="form-control" placeholder="値をいれる" ng-model="restriction.value">

                    <div style="margin-top: 10px;" class="alert alert-warning">
                        チャンネルのフォローをチェックするには、ストリーマーかモデレーターである必要があります。
                    </div>
                </div>
            </firebot-radio-container>

            <div style="margin-bottom: 30px;">
                <div class="form-group flex-row jspacebetween" style="margin-bottom: 0;">
                    <div>
                        <label class="control-label" style="margin:0;">Follow Age</label>
                        <p class="help-block">ユーザーがチャンネルをフォローしなければならない時間</p>
                    </div>
                    <div>
                        <toggle-button toggle-model="restriction.useFollowAge" auto-update-value="true" font-size="32"></toggle-button>
                    </div>
                </div>
                <div>
                    <time-input
                        ng-model="restriction.followAgeSeconds"
                        name="cooldownSeconds"
                        ui-validate="'!restriction.useFollowAge || ($value != null && $value > 0)'"
                        ui-validate-watch="'restriction.useFollowAge'"
                        large="true"
                        disabled="!restriction.useFollowAge"
                    />
                </div>
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
            </div>
            <input type="text" class="form-control" placeholder="値を入れる" ng-model="restriction.value">
        </div>
    `,
    optionsValueDisplay: (restriction) => {
        const value = restriction.value;

        if (value == null) {
            return "";
        }

        return value;
    },
    /*
      function that resolves/rejects a promise based on if the restriction criteria is met
    */
    predicate: async (trigger, restrictionData) => {
        return new Promise(async (resolve, reject) => {
            const userAccess = require("../../common/user-access");

            const triggerUsername = trigger.metadata.username || "";
            const followListString = restrictionData.value || "";

            if (triggerUsername === "", followListString === "") {
                return resolve();
            }

            const followCheckList = followListString.split(',')
                .filter(f => f != null)
                .map(f => f.toLowerCase().trim());

            const followCheck = await userAccess.userFollowsChannels(triggerUsername, followCheckList);

            if (followCheck) {
                return resolve();
            }

            return reject("次の操作が必要です: " + restrictionData.value);
        });
    }
};

module.exports = model;