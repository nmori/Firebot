import { createVoicevoxCompatibleEffect } from "./shared/voicevox-compatible";

const model = createVoicevoxCompatibleEffect({
    id: "firebot:play-itvoice",
    engineName: "ITVoice",
    defaultPort: 49540
});

export = model;
