import type { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import logger from "../../logwrapper";

type ActionItem = {
    id: string;
    name: string;
};

const model: EffectType<{
    actionItem: ActionItem;
    actionList: ActionItem[];
    name: string;
    message: string;
    port: number;
}> = {
    definition: {
        id: "firebot:call-layna",
        name: "まるっとれいなにトリガーを出す",
        description: "まるっとれいなのカスタムアクションを呼び出します",
        icon: "fad fa-person-running",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="カスタムアクション">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="customAction-name">{{effect.actionItem ? effect.actionItem.name : '選択...'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu customAction-name-dropdown">
                    <li ng-repeat="actionItem in effect.actionList"
                        ng-click="effect.actionItem = actionItem">
                        <a href>{{actionItem.name}}</a>
                    </li>
                </ul>
            </div>
        </eos-container>

        <eos-container header="名前" pad-top="true">
            <textarea ng-model="effect.name" class="form-control" name="text" placeholder="入力" rows="4" cols="40" replace-variables></textarea>
        </eos-container>

        <eos-container header="チャット文" pad-top="true">
            <textarea ng-model="effect.message" class="form-control" name="text" placeholder="入力" rows="4" cols="40" replace-variables></textarea>
        </eos-container>

        <eos-container header="通信設定" pad-top="true">
            <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('cost')}">
                <label for="port" class="control-label">連携サーバのHTTPポート</label>
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
                <p class="help-block">まるっとれいな v1.0.28～が必要です。</p>
            </div>
        </eos-container>
    `,
    optionsController: async ($scope) => {
        if ($scope.effect.port == null) {
            $scope.effect.port = 21000;
        }

        $scope.effect.actionList = [];

        try {
            const response = await fetch(`http://127.0.0.1:${$scope.effect.port}/get-actions`, {
                method: "GET"
            });
            const responseData: Array<{ id: string; Title: string }> = JSON.parse(await response.text());
            for (const actionItem of responseData) {
                $scope.effect.actionList.push({ id: actionItem.id, name: actionItem.Title });
            }
        } catch (error) {
            logger.error("Error running http request", (error as Error).message);
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.port == null) {
            errors.push("ポート番号を指定してください");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;

        try {
            await fetch(
                `http://127.0.0.1:${effect.port}/trigger?title=${encodeURIComponent(effect.actionItem.name)}&name=${encodeURIComponent(effect.name)}&comment=${encodeURIComponent(effect.message)}`,
                { method: "GET" }
            );
        } catch (error) {
            logger.error("Error running http request", (error as Error).message);
        }

        return true;
    }
};

export = model;
