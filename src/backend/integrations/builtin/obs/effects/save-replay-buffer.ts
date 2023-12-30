import { EffectType } from "../../../../../types/effects";
import { saveReplayBuffer } from "../obs-remote";

export const SaveReplayBufferEffectType: EffectType<{}> = {
  definition: {
    id: "firebot:obs-save-replay-buffer",
    name: "OBSリプレイバッファを保存",
    description: "OBS にリプレイバッファを保存するよう指示します",
    icon: "fad fa-redo-alt",
    categories: ["common"],
  },
  optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>警告!</b> OBSでリプレイバッファが有効になっており、準備完了である場合にのみ動作します
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
