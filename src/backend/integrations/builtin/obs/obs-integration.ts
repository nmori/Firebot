import { initRemote } from "./obs-remote";
import { TypedEmitter } from "tiny-typed-emitter";
import eventManager from "../../../events/EventManager";
import {
    Integration,
    IntegrationController,
    IntegrationData,
    IntegrationEvents
} from "@crowbartools/firebot-custom-scripts-types";
import { EventManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";
import logger from "../../../logwrapper";
import { ChangeSceneEffectType } from "./effects/change-scene-effect-type";
import { ChangeSceneCollectionEffectType } from "./effects/change-scene-collection";
import { ToggleSourceVisibilityEffectType } from "./effects/toggle-obs-source-visibility";
import { ToggleSourceFilterEffectType } from "./effects/toggle-obs-source-filter";
import { ToggleSourceMutedEffectType } from "./effects/toggle-obs-source-muted";
import { StartStreamEffectType } from "./effects/start-stream";
import { StopStreamEffectType } from "./effects/stop-stream";
import { StartVirtualCamEffectType } from "./effects/start-virtual-cam";
import { StopVirtualCamEffectType } from "./effects/stop-virtual-cam";
import { SaveReplayBufferEffectType } from "./effects/save-replay-buffer";
import { SetOBSSourceTextEffectType } from "./effects/set-obs-source-text";
import { SetOBSBrowserSourceUrlEffectType } from "./effects/set-obs-browser-source-url";
import { SetOBSImageSourceFileEffectType } from "./effects/set-obs-image-source-file";
import { SetOBSMediaSourceFileEffectType } from "./effects/set-obs-media-source-file";
import { SetOBSColorSourceColorEffectType } from "./effects/set-obs-color-source-color";
import { SendRawOBSWebSocketRequestEffectType } from "./effects/send-raw-obs-websocket-request";
import { TakeOBSSourceScreenshotEffectType } from "./effects/take-obs-source-screenshot";
import { OBSEventSource } from "./events/obs-event-source";
import { SceneNameEventFilter } from "./filters/scene-name-filter";
import { SceneNameVariable } from "./variables/scene-name-variable";
import { SceneCollectionNameVariable } from "./variables/scene-collection-name-variable";
import { IsStreamingVariable } from "./variables/is-streaming";
import { IsRecordingVariable } from "./variables/is-recording";
import { ColorValueVariable } from "./variables/obs-color-value";
import { SceneItemIdVariable } from "./variables/scene-item-id";
import { SceneItemNameVariable } from "./variables/scene-item-name";
import { SceneItemEnabledVariable } from "./variables/scene-item-enabled";
import { TransitionNameVariable } from "./variables/transition-name";
import { TransitionDurationVariable } from "./variables/transition-duration";
import { ReplayBufferPathVariable } from "./variables/replay-buffer-path";
import { ProfileNameVariable } from "./variables/profile-name";
import { VendorNameVariable } from "./variables/vendor-name";
import { VendorEventTypeVariable } from "./variables/vendor-event-type";
import { VendorEventDataVariable } from "./variables/vendor-event-data";
import { setupFrontendListeners } from "./communicator";
import effectManager from "../../../effects/effectManager";
import eventFilterManager from "../../../events/filters/filter-manager";
import replaceVariableManager from "../../../variables/replace-variable-manager";
import * as frontendCommunicator from "../../../common/frontend-communicator";

type ObsSettings = {
    websocketSettings: {
        ipAddress: string;
        port: number;
        password: string;
    };
    misc: {
        logging: boolean;
    };
};

class IntegrationEventEmitter extends TypedEmitter<IntegrationEvents> {}

class ObsIntegration
    extends IntegrationEventEmitter
    implements IntegrationController<ObsSettings> {
    connected = false;
    private _isConfigured = false;

    constructor(private readonly eventManager: EventManager) {
        super();

        frontendCommunicator.on(
            "obs-is-configured",
            () => this._isConfigured
        );
    }

    private setupConnection(settings?: ObsSettings) {
        if (!settings) {
            this._isConfigured = false;
            return;
        }
        const {
            websocketSettings: { ipAddress, password, port },
            misc: { logging }
        } = settings;

        this._isConfigured = (
            ipAddress != null && ipAddress !== ""
            && port != null
            && password != null && password !== ""
        );
        initRemote(
            {
                ip: ipAddress,
                port,
                password,
                logging,
                forceConnect: true
            },
            {
                eventManager: this.eventManager
            }
        );
    }

    init(
        linked: boolean,
        integrationData: IntegrationData<ObsSettings>
    ): void | PromiseLike<void> {
        logger.info("Starting OBS Control...");

        setupFrontendListeners(frontendCommunicator);

        effectManager.registerEffect(ChangeSceneEffectType);
        effectManager.registerEffect(ChangeSceneCollectionEffectType);
        effectManager.registerEffect(ToggleSourceVisibilityEffectType);
        effectManager.registerEffect(ToggleSourceFilterEffectType);
        effectManager.registerEffect(ToggleSourceMutedEffectType);
        effectManager.registerEffect(StartStreamEffectType);
        effectManager.registerEffect(StopStreamEffectType);
        effectManager.registerEffect(StartVirtualCamEffectType);
        effectManager.registerEffect(StopVirtualCamEffectType);
        effectManager.registerEffect(SaveReplayBufferEffectType);
        effectManager.registerEffect(SetOBSSourceTextEffectType);
        effectManager.registerEffect(SetOBSBrowserSourceUrlEffectType);
        effectManager.registerEffect(SetOBSImageSourceFileEffectType);
        effectManager.registerEffect(SetOBSMediaSourceFileEffectType);
        effectManager.registerEffect(SetOBSColorSourceColorEffectType);
        effectManager.registerEffect(SendRawOBSWebSocketRequestEffectType);
        effectManager.registerEffect(TakeOBSSourceScreenshotEffectType);

        eventManager.registerEventSource(OBSEventSource);

        eventFilterManager.registerFilter(SceneNameEventFilter);

        replaceVariableManager.registerReplaceVariable(SceneNameVariable);
        replaceVariableManager.registerReplaceVariable(SceneCollectionNameVariable);
        replaceVariableManager.registerReplaceVariable(IsStreamingVariable);
        replaceVariableManager.registerReplaceVariable(IsRecordingVariable);
        replaceVariableManager.registerReplaceVariable(ColorValueVariable);
        replaceVariableManager.registerReplaceVariable(SceneItemIdVariable);
        replaceVariableManager.registerReplaceVariable(SceneItemNameVariable);
        replaceVariableManager.registerReplaceVariable(SceneItemEnabledVariable);
        replaceVariableManager.registerReplaceVariable(TransitionNameVariable);
        replaceVariableManager.registerReplaceVariable(TransitionDurationVariable);
        replaceVariableManager.registerReplaceVariable(ReplayBufferPathVariable);
        replaceVariableManager.registerReplaceVariable(ProfileNameVariable);
        replaceVariableManager.registerReplaceVariable(VendorNameVariable);
        replaceVariableManager.registerReplaceVariable(VendorEventTypeVariable);
        replaceVariableManager.registerReplaceVariable(VendorEventDataVariable);

        this.setupConnection(integrationData.userSettings);
    }

    onUserSettingsUpdate?(
        integrationData: IntegrationData<ObsSettings>
    ): void | PromiseLike<void> {
        this.setupConnection(integrationData.userSettings);
    }
}

const integrationConfig: Integration<ObsSettings> = {
    definition: {
        id: "OBS",
        name: "OBS",
        description:
      "OBSに接続し、Firebotがシーンの変更、ソースやフィルターの切り替えなどを行えるようにします。OBS 28以降に対応しており、obs-websocket v5プラグインの設定が必要です。",
    linkType: "none",
    configurable: true,
    connectionToggle: false,
    settingCategories: {
      websocketSettings: {
        title: "Websocket 設定",
        sortRank: 1,
        settings: {
          ipAddress: {
            title: "IP アドレス",
            description:
              "OBSを実行しているコンピュータのIPアドレス。同じコンピュータの場合は'localhost'を使用してください。",
            type: "string",
            default: "localhost",
          },
          port: {
            title: "通信ポート",
            description:
              "OBS Websocket が動作しているポート。デフォルトは4455です。",
            type: "number",
            default: 4455,
          },
          password: {
            title: "パスワード",
            description: "OBS Websocketに設定されたパスワード.",
            type: "password",
            default: "",
          },
        },
      },
      misc: {
        title: "一般",
        sortRank: 2,
        settings: {
          logging: {
            title: "OBSエラーログの記録を有効にする",
            type: "boolean",
            default: false,
          },
        },
      },
        }
    },
    integration: new ObsIntegration(eventManager)
};

export const definition = integrationConfig.definition;
export const integration = integrationConfig.integration;
