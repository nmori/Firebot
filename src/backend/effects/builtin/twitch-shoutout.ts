import { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import twitchApi from "../../twitch-api/api";
import logger from "../../logwrapper";

const model: EffectType<{
  username: string;
}> = {
  definition: {
    id: "firebot:twitch-shoutout",
    name: "Twitch シャウト",
    description: "他のチャンネルにTwitchのシャウトを送る",
    icon: "fad fa-bullhorn",
    categories: [EffectCategory.COMMON, EffectCategory.TWITCH],
    dependencies: [],
  },
  optionsTemplate: `
        <eos-container header="対象">
            <firebot-input model="effect.username" placeholder-text="ユーザ名を入れてください" menu-position="below" />
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
            注意：この演出を使用するには、配信中である必要があります。Twitchの制限により、シャウトを送信できるのは2分に1回、同じユーザーには1時間に1回までとなります。
            </div>
        </eos-container>
    `,
  optionsValidator: (effect) => {
    const errors: string[] = [];
    const username = effect.username?.trim();

    if (!username?.length) {
      errors.push("シャウトアウトするチャンネルを指定する必要があります。");
    }

    return errors;
  },
  optionsController: () => {},
  onTriggerEvent: async ({ effect }) => {
    const targetUserId = (await twitchApi.users.getUserByName(effect.username))
      ?.id;

    if (targetUserId == null) {
      logger.error(
        `Unable to shoutout channel. Twitch user ${effect.username} does not exist.`
      );
      return false;
    }

    return await twitchApi.chat.sendShoutout(targetUserId);
  },
};

module.exports = model;