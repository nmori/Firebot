import type { RestrictionType } from "../../../types";
import twitchStreamInfoManager from "../../streaming-platforms/twitch/stream-info-manager";

const restriction: RestrictionType = {
    definition: {
        id: "firebot:only-when-live",
        name: "配信中のみ",
        description: "配信中のときだけ使用できるように制限します。"
    },
    optionsTemplate: `
        <div>
            <p>配信中のときだけ使用できます。</p>
        </div>
    `,
    predicate: () => {
        if (!twitchStreamInfoManager.streamInfo.isLive) {
            return {
                success: false,
                failureReason: "現在配信中ではありません。"
            };
        }

        return { success: true };
    }
};

export = restriction;