"use strict";

const model = {
    definition: {
        id: "firebot:followcheck",
        name: "繝輔か繝ｭ繝ｼ繝√ぉ繝・け",
        description: "繧ｫ繝ｳ繝槫玄蛻・ｊ縺ｮ繝ｪ繧ｹ繝医〒縲√Θ繝ｼ繧ｶ縺悟・蜩｡繧偵ヵ繧ｩ繝ｭ繝ｼ縺励※縺・ｋ縺九←縺・°縺ｫ蝓ｺ縺･縺・※蛻ｶ髯舌☆繧・",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <firebot-radio-container>
                <firebot-radio label="遘√・繝√Ε繝ｳ繝阪Ν繧偵ヵ繧ｩ繝ｭ繝ｼ" model="restriction.checkMode" value="'streamer'"/>
                <firebot-radio label="謖・ｮ壹＠縺溘メ繝｣繝ｳ繝阪Ν繧偵ヵ繧ｩ繝ｭ繝ｼ" model="restriction.checkMode" value="'custom'" />
                <div ng-show="restriction.checkMode === 'custom'" style="padding-top: 4px;">
                    <div id="userFollowList" class="modal-subheader" style="padding: 0 0 4px 0">
                        繝輔か繝ｭ繝ｼ繝ｦ繝ｼ繧ｶ繝ｼ
                    </div>
                    <input type="text" class="form-control" placeholder="蛟､繧偵＞繧後ｋ" ng-model="restriction.value">

                    <div style="margin-top: 10px;" class="alert alert-warning">
                        繝√Ε繝ｳ繝阪Ν縺ｮ繝輔か繝ｭ繝ｼ繧偵メ繧ｧ繝・け縺吶ｋ縺ｫ縺ｯ縲√せ繝医Μ繝ｼ繝槭・縺九Δ繝・Ξ繝ｼ繧ｿ繝ｼ縺ｧ縺ゅｋ蠢・ｦ√′縺ゅｊ縺ｾ縺吶・                    </div>
                </div>
            </firebot-radio-container>

            <div style="margin-bottom: 30px;">
                <div class="form-group flex-row jspacebetween" style="margin-bottom: 0;">
                    <div>
                        <label class="control-label" style="margin:0;">Follow Age</label>
                        <p class="help-block">繝ｦ繝ｼ繧ｶ繝ｼ縺後メ繝｣繝ｳ繝阪Ν繧偵ヵ繧ｩ繝ｭ繝ｼ縺励↑縺代ｌ縺ｰ縺ｪ繧峨↑縺・凾髢・/p>
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
            <input type="text" class="form-control" placeholder="蛟､繧貞・繧後ｋ" ng-model="restriction.value">
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

            return reject("谺｡縺ｮ謫堺ｽ懊′蠢・ｦ√〒縺・ " + restrictionData.value);
        });
    }
};

module.exports = model;
