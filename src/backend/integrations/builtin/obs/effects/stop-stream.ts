import { EffectType } from "../../../../../types/effects";
import { stopStreaming } from "../obs-remote";

export const StopStreamEffectType: EffectType<{}> = {
  definition: {
    id: "ebiggz:obs-stop-stream",
    name: "配信を停止",
    description: "OBSに配信を終了するよう指示します",
    icon: "fad fa-stop-circle",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>警告!</b> この演出が有効になると、FirebotはOBSに配信を停止するよう指示します
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
  },
};
