import { EffectType } from "../../../../../types/effects";
import { startStreaming } from "../obs-remote";

export const StartStreamEffectType: EffectType<{}> = {
  definition: {
    id: "ebiggz:obs-start-stream",
    name: "配信を開始",
    description: "OBSに配信開始を指示します",
    icon: "fad fa-play-circle",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>警告!</b> この演出が有効になると、FirebotはOBSにストリーミングを開始するよう指示します。誤配信に注意してください。
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
