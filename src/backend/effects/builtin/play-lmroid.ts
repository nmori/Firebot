import { createVoicevoxCompatibleEffect } from "./shared/voicevox-compatible";

const model = createVoicevoxCompatibleEffect({
    id: "firebot:play-lmroid",
    engineName: "LMROID",
    defaultPort: 49973
});

export = model;
