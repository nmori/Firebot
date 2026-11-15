import type { ControlDeckControlType } from "../../../types";

import { CONTROL_DECK_FOLDER_TYPE_ID } from "../../../types/control-deck";

type FolderParams = {
    autoReturn: boolean;
};

export const folderControlType: ControlDeckControlType<FolderParams> = {
    id: CONTROL_DECK_FOLDER_TYPE_ID,
    name: "フォルダー",
    description: "他のコントロールを入れられるフォルダー",
    icon: "fa-folder",
    enableIcon: true,
    defaultIcon: { type: "glyph", name: "folder" },
    enableBackground: true,
    enableLabel: true,
    settingsSchema: [
        {
            name: "autoReturn",
            title: "自動で戻る",
            description: "有効にすると、フォルダー内のコントロールが押された後に自動で親の階層へ戻ります。",
            type: "boolean",
            useSwitch: true,
            default: false
        }
    ],
    onInteraction: () => {
        // Folder navigation is handled client-side on the hosted page
    }
};
