import { EffectType } from "../../../../../types/effects";
import { startVirtualCam } from "../obs-remote";

export const StartVirtualCamEffectType: EffectType<{}> = {
  definition: {
    id: "ebiggz:obs-start-virtual-cam",
    name: "OBS 仮想カメラを起動",
    description: "OBSに仮想カメラを起動するよう指示します",
    icon: "fad fa-camera-home",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>警告!</b>この演出が有効になると、FirebotはOBSにバーチャルカメラの起動を指示します。
      </div>
    </eos-container>
  `,
    optionsController: () => {},
    optionsValidator: () => {
        return [];
    },
    onTriggerEvent: async () => {
        startVirtualCam();
        return true;
    }
};
