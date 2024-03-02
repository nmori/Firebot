import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType } from "../../../../shared/variable-constants";

import viewerMetadataManager from "../../../viewers/viewer-metadata-manager";

const model : ReplaceVariable = {
    definition: {
        handle: "rawTopMetadata",
        description: "指定したメタデータのキーが最も多いユーザの生の配列を返します。項目は 'username'、'place' および 'amount' プロパティを含む。",
        usage: "rawTopMetadata[metadataKey]",
        possibleDataOutput: [OutputDataType.TEXT]
    },

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    evaluator: async (_, metadataKey: string, count: number = 10) => {

        if (metadataKey == null) {
            return "[無効なメタデータ・キー]";
        }

        // limit to max of 50
        if (count > 50) {
            count = 50;
        } else if (count < 1) {
            // min of 1
            count = 1;
        } else if (typeof count !== 'number') {
            count = parseInt(count, 10);
        }

        const topMetadataUsers = await viewerMetadataManager.getTopMetadata(metadataKey, count);

        const topUsersDisplay = topMetadataUsers
            // filter out any results not containing key in metadata
            .filter(user => (user.metadata && user.metadata[metadataKey] != null))

            // map each entry to #position) name - amount
            .map((user, idx) => ({
                place: idx + 1,
                username: user.username,
                userId: user._id,
                userDisplayName: user.displayName,
                amount: user.metadata[metadataKey]
            }));


        // return list
        return topUsersDisplay;
    }
};

export default model;
