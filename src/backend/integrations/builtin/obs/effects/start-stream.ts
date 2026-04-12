import { EffectType } from "../../../../../types/effects";
import { startStreaming } from "../obs-remote";

export const StartStreamEffectType: EffectType = {
    definition: {
        id: "ebiggz:obs-start-stream",
        name: "OBS配信開始",
        description: "OBS に配信開始を実行させます",
        icon: "fad fa-play-circle",
        categories: ["common", "integrations"]
    },
    optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>Warning!</b> When this effect is activated, Firebot will tell OBS to start streaming.
      </div>
    </eos-container>
  `,
    optionsController: () => {},
    optionsValidator: () => {
        return [];
    },
    onTriggerEvent: async () => {
        startStreaming();
        return true;
    }
};
