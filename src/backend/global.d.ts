declare module "he" {
    export function encode(subject: string) : string;
    export function decode(subject: string) : string;
}

// Overlay browser-context globals (defined in resources/overlay/js/util.js and main.js)
declare function uuid(): string;
declare function showElement(effectHTML: string, positionData: Record<string, unknown>, animationData: Record<string, unknown>): void;
declare function sendWebsocketEvent(name: string, data: unknown): void;