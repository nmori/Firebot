import { TypedEmitter } from "tiny-typed-emitter";

/**
 * No-op stub: CrowbarRelay is disabled in this fork.
 * The original implementation connected to wss://api.crowbar.tools/v1/relay
 * and forwarded the streamer's Twitch access_token to a third-party service.
 */
class CrowbarRelayWebSocket extends TypedEmitter<{
    "ready": () => void;
    "message": (msg: {
        event: string;
        data: unknown;
    }) => void;
}> {
    constructor() {
        super();
    }

    public send(_event: string, _data: unknown = {}) {
        // no-op
    }
}

export const crowbarRelayWebSocket = new CrowbarRelayWebSocket();
