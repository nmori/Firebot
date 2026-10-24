import { createVoicevoxCompatibleEffect } from "./shared/voicevox-compatible";

const model = createVoicevoxCompatibleEffect({
    id: "firebot:play-sharevox",
    engineName: "SHAREVOX",
    defaultPort: 50025
});

export = model;
