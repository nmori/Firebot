/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import type { RestrictionType } from "../../../types/restrictions";
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
    predicate: async () => {
        return new Promise((resolve, reject) => {
            if (!twitchStreamInfoManager.streamInfo.isLive) {
                return reject("現在配信中ではありません。");
            }

            return resolve(true);
        });
    }
};

export = restriction;