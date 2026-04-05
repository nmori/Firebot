import { EffectType } from "../../../../../types/effects";
import { stopVirtualCam } from "../obs-remote";

export const StopVirtualCamEffectType: EffectType = {
    definition: {
        id: "ebiggz:obs-stop-virtual-cam",
        name: "OBS仮想カメラ停止",
        description: "OBS に仮想カメラ停止を実行させます",
        icon: "fad fa-camera-home",
        categories: ["common", "integrations"]
    },
    optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>警告！</b> このエフェクトを実行すると、Firebot は OBS に仮想カメラ停止を要求します。
      </div>
    </eos-container>
  `,
    optionsController: () => {},
    optionsValidator: () => {
        return [];
    },
    onTriggerEvent: async () => {
        await stopVirtualCam();
        return true;
    }
};