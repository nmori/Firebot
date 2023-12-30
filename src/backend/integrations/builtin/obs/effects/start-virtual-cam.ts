import { EffectType } from "../../../../../types/effects";
import { startVirtualCam } from "../obs-remote";

export const StartVirtualCamEffectType: EffectType<{}> = {
  definition: {
    id: "ebiggz:obs-start-virtual-cam",
    name: "OBS ���z�J�������N��",
    description: "OBS�ɉ��z�J�������N������悤�w�����܂�",
    icon: "fad fa-camera-home",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>�x��!</b>���̉��o���L���ɂȂ�ƁAFirebot��OBS�Ƀo�[�`�����J�����̋N�����w�����܂��B
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
