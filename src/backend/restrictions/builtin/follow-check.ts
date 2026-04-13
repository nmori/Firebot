/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import type { RestrictionType } from "../../../types/restrictions";
import { AccountAccess } from "../../common/account-access";
import userAccess from "../../common/user-access";

const model: RestrictionType<{
    checkMode: "streamer" | "custom";
    value: string;
    useFollowAge: boolean;
    followAgeSeconds: number;
}> = {
    definition: {
        id: "firebot:followcheck",
        name: "フォローチェック",
        description: "カンマ区切りリスト内の全チャンネルをフォローしているかで制限します。",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <firebot-radio-container>
                <firebot-radio label="自分のチャンネルをフォロー" model="restriction.checkMode" value="'streamer'"/>
                <firebot-radio label="指定チャンネルをフォロー" model="restriction.checkMode" value="'custom'" />
                <div ng-show="restriction.checkMode === 'custom'" style="padding-top: 4px;">
                    <div id="userFollowList" class="modal-subheader" style="padding: 0 0 4px 0">
                        フォロー対象
                    </div>
                    <input type="text" class="form-control" placeholder="値を入力" ng-model="restriction.value">

                    <div style="margin-top: 10px;" class="alert alert-warning">
                        チャンネルのフォロー状況を確認するには、配信者またはモデレーターである必要があります。
                    </div>
                </div>
            </firebot-radio-container>

            <div style="margin-bottom: 30px;">
                <div class="form-group flex-row jspacebetween" style="margin-bottom: 0;">
                    <div>
                        <label class="control-label" style="margin:0;">フォロー期間</label>
                        <p class="help-block">ユーザーが対象チャンネルをフォローしている必要がある期間。</p>
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
            </div>
        </div>
    `,
    optionsController: ($scope) => {
        if ($scope.restriction.checkMode == null) {
            $scope.restriction.checkMode = "custom";
        }
    },
    optionsValueDisplay: (restriction) => {
        const value = restriction.checkMode === "custom" ? restriction.value : "自分のチャンネルをフォロー";

        if (value == null) {
            return "";
        }

        return value;
    },
    predicate: async (trigger, restrictionData) => {
        return new Promise(async (resolve, reject) => {
            const triggerUsername = trigger.metadata.username || "";
            const followListString = restrictionData.checkMode === "custom"
                ? restrictionData.value || ""
                : AccountAccess.getAccounts().streamer.username;

            if (triggerUsername === "" || followListString === "") {
                return resolve(true);
            }

            const followCheckList = followListString.split(',')
                .filter(f => f != null)
                .map(f => f.toLowerCase().trim());

            const seconds = restrictionData.useFollowAge ? restrictionData.followAgeSeconds : 0;

            const followCheck = await userAccess.userFollowsChannels(triggerUsername, followCheckList, seconds);

            if (followCheck) {
                resolve(true);
            } else {
                reject(`次のチャンネルをフォローしている必要があります: ${followListString}`);
            }
        });
    }
};

export = model;