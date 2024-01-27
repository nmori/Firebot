import { ReplaceVariable } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";
import { EffectTrigger } from '../../../../../shared/effect-constants';

const { viewerHasRoleByName } = require('../../../../roles/role-helpers');

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.EVENT] = true;
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.CUSTOM_SCRIPT] = true;
triggers[EffectTrigger.PRESET_LIST] = true;
triggers[EffectTrigger.CHANNEL_REWARD] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "hasRole",
        usage: "hasRole[user, role]",
        description: "Returns true if the user has the specified role. Only valid within $if",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.USER],
        possibleDataOutput: [OutputDataType.ALL]
    },
    evaluator: async (trigger, username, role) => {
        if (username == null || username === '') {
            return false;
        }

        if (role == null || role === '') {
            return false;
        }

        return viewerHasRoleByName(username, role);
    }
};
export default model;