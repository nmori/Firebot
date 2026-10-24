import { createVoicevoxCompatibleEffect } from "./shared/voicevox-compatible";

const model = createVoicevoxCompatibleEffect({
    id: "firebot:play-coeiroink-v1",
    engineName: "COEIROINK v1",
    defaultPort: 50031
});

export = model;
