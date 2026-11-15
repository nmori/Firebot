import type { EffectType } from "../../../types";

const effect: EffectType<{
    effectComment: string;
}> = {
    definition: {
        id: "firebot:comment",
        name: "コメント",
        description: "演出リストにコメントを追加します（実行時の動作はありません）",
        icon: "fad fa-comment-alt-lines",
        categories: ["common"],
        dependencies: [],
        isNoOp: true
    },
    optionsTemplate: `
        <eos-container>
            <p>この演出は実行されても何もしません。演出リストにコメントを追加するために使います。</p>
        </eos-container>

        <eos-container pad-top="true">
            <div class="form-group">
                <label class="control-label">コメント</label>
                <textarea
                    class="form-control"
                    rows="4"
                    ng-model="effect.effectComment"
                    placeholder="ここにコメントを入力..."
                    style="resize: vertical;"
                ></textarea>
            </div>
        </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.effectComment == null) {
            $scope.effect.effectComment = "";
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (effect.effectComment == null || effect.effectComment.trim() === "") {
            errors.push("コメントを入力してください。");
        }

        return errors;
    },
    onTriggerEvent: () => {
        // No-op: This effect does nothing when triggered
        return Promise.resolve(true);
    }
};

export = effect;
