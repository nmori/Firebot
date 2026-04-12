import { EffectType } from "../../../../../types/effects";
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
        <b>Warning!</b> When this effect is activated, Firebot will tell OBS to stop streaming.
      </div>
    </eos-container>
  `,
    optionsController: () => {},
    optionsValidator: () => {
        return [];
    },
    onTriggerEvent: async () => {
        stopStreaming();
        return true;
    }
};
