import { EffectType } from "../../../../../types/effects";
import { startVirtualCam } from "../obs-remote";

export const StartVirtualCamEffectType: EffectType = {
    definition: {
        id: "ebiggz:obs-start-virtual-cam",
        name: "OBS仮想カメラ開始",
        description: "OBS に仮想カメラ開始を実行させます",
        icon: "fad fa-camera-home",
        categories: ["common", "integrations"]
    },
    optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>Warning!</b> When this effect is activated, Firebot will tell OBS to start the virtual camera.
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
