import { EffectType } from "../../../../../types/effects";
import { saveReplayBuffer } from "../obs-remote";

export const SaveReplayBufferEffectType: EffectType<{}> = {
  definition: {
    id: "firebot:obs-save-replay-buffer",
    name: "OBS���v���C�o�b�t�@��ۑ�",
    description: "OBS �Ƀ��v���C�o�b�t�@��ۑ�����悤�w�����܂�",
    icon: "fad fa-redo-alt",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>�x��!</b> OBS�Ń��v���C�o�b�t�@���L���ɂȂ��Ă���A���������ł���ꍇ�ɂ̂ݓ��삵�܂�
      </div>
    </eos-container>
  `,
    optionsController: () => {},
    optionsValidator: () => {
        return [];
    },
    onTriggerEvent: async () => {
        saveReplayBuffer();
        return true;
    }
};
