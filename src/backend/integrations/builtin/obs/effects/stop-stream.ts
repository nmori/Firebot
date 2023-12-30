import { EffectType } from "../../../../../types/effects";
import { stopStreaming } from "../obs-remote";

export const StopStreamEffectType: EffectType<{}> = {
  definition: {
    id: "ebiggz:obs-stop-stream",
    name: "�z�M���~",
    description: "OBS�ɔz�M���I������悤�w�����܂�",
    icon: "fad fa-stop-circle",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>�x��!</b> ���̉��o���L���ɂȂ�ƁAFirebot��OBS�ɔz�M���~����悤�w�����܂�
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
    }
};
