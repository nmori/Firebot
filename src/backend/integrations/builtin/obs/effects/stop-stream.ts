import type { EffectType } from "../../../../../types";
import { stopStreaming } from "../obs-remote";

export const StopStreamEffectType: EffectType = {
    definition: {
        id: "ebiggz:obs-stop-stream",
        name: "OBS配信停止",
        description: "OBS に配信停止を実行させます",
        icon: "fad fa-stop-circle",
        categories: ["common", "integrations"]
    },
    optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>警告:</b> この演出が実行されると、Firebot は OBS に配信の停止を指示します。
      </div>
    </eos-container>
  `,
    optionsController: () => {},
    optionsValidator: () => {
        return [];
    },
    onTriggerEvent: async () => {
        await stopStreaming();
        return true;
    }
};
