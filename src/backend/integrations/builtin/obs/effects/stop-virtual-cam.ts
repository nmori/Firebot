import { EffectType } from "../../../../../types/effects";
import { stopVirtualCam } from "../obs-remote";

export const StopVirtualCamEffectType: EffectType<{}> = {
  definition: {
    id: "ebiggz:obs-stop-virtual-cam",
    name: "OBS ���z�J�������~",
    description: "OBS�ɉ��z�J�������I������悤�w�����܂�",
    icon: "fad fa-camera-home",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>�x��!</b> ���̉��o���L���ɂȂ�ƁAFirebot��OBS�ɉ��z�J�������~����悤�w�����܂�
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
