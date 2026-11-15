import type { EffectType } from "../../../../../types";
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
        <b>警告:</b> この演出が実行されると、Firebot は OBS に仮想カメラの開始を指示します。
      </div>
    </eos-container>
  `,
    optionsController: () => {},
    optionsValidator: () => {
        return [];
    },
    onTriggerEvent: async () => {
        await startVirtualCam();
        return true;
    }
};
