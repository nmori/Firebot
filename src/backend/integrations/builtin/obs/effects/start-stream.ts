import { EffectType } from "../../../../../types/effects";
import { startStreaming } from "../obs-remote";

export const StartStreamEffectType: EffectType<{}> = {
  definition: {
    id: "ebiggz:obs-start-stream",
    name: "�z�M���J�n",
    description: "OBS�ɔz�M�J�n���w�����܂�",
    icon: "fad fa-play-circle",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>�x��!</b> ���̉��o���L���ɂȂ�ƁAFirebot��OBS�ɃX�g���[�~���O���J�n����悤�w�����܂��B��z�M�ɒ��ӂ��Ă��������B
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
