import type { EffectType } from "../../../../../types";
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
        <b>警告:</b> この演出が実行されると、Firebot は OBS に配信の開始を指示します。
      </div>
    </eos-container>
  `,
    optionsController: () => {},
    optionsValidator: () => {
        return [];
    },
    onTriggerEvent: async () => {
        await startStreaming();
        return true;
    }
};
