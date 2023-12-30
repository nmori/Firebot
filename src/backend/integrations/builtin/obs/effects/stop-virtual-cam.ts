import { EffectType } from "../../../../../types/effects";
import { stopVirtualCam } from "../obs-remote";

export const StopVirtualCamEffectType: EffectType<{}> = {
  definition: {
    id: "ebiggz:obs-stop-virtual-cam",
    name: "OBS 仮想カメラを停止",
    description: "OBSに仮想カメラを終了するよう指示します",
    icon: "fad fa-camera-home",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>警告!</b> この演出が有効になると、FirebotはOBSに仮想カメラを停止するよう指示します
      </div>
    </eos-container>
  `,
    optionsController: () => {},
    optionsValidator: () => {
        return [];
    },
    onTriggerEvent: async () => {
        stopVirtualCam();
        return true;
    }
};
