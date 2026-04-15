import type { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import logger from "../../logwrapper";

const model: EffectType<{
    tag: string;
    port: number;
}> = {
    definition: {
        id: "firebot:call-vtubestudio",
        name: "VTubeStudioキーバインドを起動",
        description: "ゆかコネNEO経由でVTubeStudioのキーバインドを起動します",
        icon: "fad fa-waveform",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="起動するキーバインド設定名" pad-top="true">
            <textarea ng-model="effect.tag" class="form-control" name="text" placeholder="キーバインド名" rows="1" cols="40" replace-variables></textarea>
        </eos-container>

        <eos-container header="通信設定" pad-top="true">
            <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('cost')}">
                <label for="port" class="control-label">ゆかコネAPIのHTTPポート</label>
                <input
                    type="number"
                    class="form-control input-lg"
                    id="port"
                    name="port"
                    placeholder="ポート"
                    ng-model="effect.port"
                    required
                    min="0"
                    style="width: 50%;"
                />
                <p class="help-block">ゆかりネットコネクターNEO v2.1～のVTubeStudioプラグインが必要です。</p>
            </div>
        </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.port == null) {
            $scope.effect.port = 15520;
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.port == null) {
            errors.push("ポート番号を指定してください");
        }
        if (effect.tag == null || effect.tag === "") {
            errors.push("タグを指定してください");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;

        try {
            await fetch(
                `http://127.0.0.1:${effect.port}/api/command?target=Plugin_VtubeStudio&command=call&tag=${encodeURIComponent(effect.tag)}`,
                { method: "GET" }
            );
        } catch (error) {
            logger.error("Error running http request", (error as Error).message);
        }

        return true;
    }
};

export = model;
