"use strict";
(function() {
    angular.module("firebotApp").component("eventListTextOptions", {
        bindings: {
            model: "=",
            isGlobal: "<"
        },
        template: `
                <div>
                    <eos-container header="テキスト設定" ng-hide="$ctrl.isGlobal">
                        <label class="control-fb control--radio">プリセットを使用 <span class="muted"><br />プリセットは「設定 > オーバーレイ」で編集するか、<a href ng-click="$event.stopPropagation();$ctrl.openPresetModal();">こちら</a>をクリックして編集できます。 </span>
                            <input type="radio" ng-model="$ctrl.model.override" ng-value="false"/> 
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--radio" >カスタマイズ <span class="muted"><br />プリセットを上書きします</span>
                            <input type="radio" ng-model="$ctrl.model.override" ng-value="true"/>
                            <div class="control__indicator"></div>
                        </label>
                    </eos-container>

                    <div ng-if="$ctrl.model.override || $ctrl.isGlobal">
                        <eos-container>
                            <div class="input-group">
                                <span class="input-group-addon">テキスト</span>
                                <input 
                                type="text" 
                                class="form-control" 
                                aria-describedby="showEvents-text-effect-type" 
                                ng-model="$ctrl.model.text">
                            </div>

                            <eos-collapsable-panel show-label="変数を表示" hide-label="変数を非表示">
                                <ul>
                                    <li><b>$(user)</b> - ボタンを実行した人、またはコマンドを使用した人の名前に置き換わります。</li>
                                    <li><b>$(text)</b> - インタラクティブボタンのテキスト、またはチャットコマンドIDに置き換わります。</li>
                                    <li><b>$(cost)</b> - コマンドまたはボタンのコストに置き換わります。</li>
                                    <li><b>$(cooldown)</b> - コマンドまたはボタンのクールダウンに置き換わります。</li>
                                </ul>
                            </eos-collapsable-panel>
                        </eos-container>
                        
                        <eos-container>
                            <div class="input-group">
                                <span class="input-group-addon">文字色</span>
                                <input 
                                type="text" 
                                class="form-control" 
                                aria-describedby="showEvents-text-effect-type" 
                                ng-model="$ctrl.model.color"
                                placeholder="#CCCCCC">
                            </div>
                        </eos-container>

                        <eos-container>
                            <div class="input-group">
                                <span class="input-group-addon">背景色</span>
                                <input 
                                type="text" 
                                class="form-control" 
                                aria-describedby="showEvents-text-effect-type" 
                                ng-model="$ctrl.model.backgroundColor"
                                placeholder="#000000 または transparent"
                                >
                            </div>
                        </eos-container>

                        <eos-container>
                            <div class="input-group">
                                <span class="input-group-addon">フォントサイズ</span>
                                <input 
                                type="text" 
                                class="form-control" 
                                aria-describedby="showEvents-text-effect-type" 
                                ng-model="$ctrl.model.size"
                                placeholder="20px"
                                >
                            </div>
                        </eos-container>

                        <eos-container>
                            <div class="input-group" style="width: 100%">
                                <span class="input-group-addon">テキスト配置</span>
                                <select class="fb-select form-control" ng-model="$ctrl.model.textAlignment">
                                    <option label="左" value="left" selected="selected">左</option>
                                    <option label="中央" value="center">中央</option>
                                    <option label="右" value="right">右</option>
                                </select>
                            </div>
                        </eos-container>

                        <eosEnterExitAnimations model="$ctrl.model"></eosEnterExitAnimations>

                        <eos-container>
                            <div class="input-group">
                                <span class="input-group-addon">表示時間（秒）</span>
                                <input 
                                type="number"
                                class="form-control" 
                                aria-describedby="showEvents-length-effect-type" 
                                ng-model="$ctrl.model.length">
                            </div>
                        </eos-container>
                    </div>
                    
                </div>
                `,
        controller: function(utilityService) {
            const ctrl = this;

            ctrl.openPresetModal = function() {
                utilityService.showOverlayEventsModal();
            };

            ctrl.$onInit = function() {
                if (ctrl.model.text == null) {
                    ctrl.model.text = "$(user) が $(text) を押しました！";
                }
                if (ctrl.model.override == null) {
                    ctrl.model.override = false;
                }
            };
        }
    });
}());
