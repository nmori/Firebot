import { createVoicevoxCompatibleEffect } from "./shared/voicevox-compatible";

const model = createVoicevoxCompatibleEffect({
    id: "firebot:playvoicevox",
    engineName: "VOICEVOX",
    defaultPort: 50021
});

export = model;
