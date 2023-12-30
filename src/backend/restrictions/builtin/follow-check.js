"use strict";

const model = {
    definition: {
        id: "firebot:followcheck",
        name: "�t�H���[�`�F�b�N",
        description: "�J���}��؂�̃��X�g�ŁA���[�U���S�����t�H���[���Ă��邩�ǂ����Ɋ�Â��Đ�������.",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div id="userFollowList" class="modal-subheader" style="padding: 0 0 4px 0">
                �t�H���[
            </div>
            <input type="text" class="form-control" placeholder="�l������" ng-model="restriction.value">
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
      function that resolves/rejects a promise based on if the restriction critera is met
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

            return reject("���̑��삪�K�v�ł�: " + restrictionData.value);
        });
    }
};

module.exports = model;