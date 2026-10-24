import { createVoicevoxCompatibleEffect } from "./shared/voicevox-compatible";

const model = createVoicevoxCompatibleEffect({
    id: "firebot:playvoicevox-nemo",
    engineName: "VOICEVOX Nemo",
    defaultPort: 50121
});

export = model;
