"use strict";
(function() {
    angular.module("firebotApp").component("eventListTextOptions", {
        bindings: {
            model: "=",
            isGlobal: "<"
        },
        template: `
                <div>
                    <eos-container header="Text Settings" ng-hide="$ctrl.isGlobal">
                        <label class="control-fb control--radio">プリセットを使う<span class="muted"><br />プリセットは、設定 → オーバーレイで編集できます。<a href ng-click="$event.stopPropagation();$ctrl.openPresetModal();">here</a>. </span>
                            <input type="radio" ng-model="$ctrl.model.override" ng-value="false"/> 
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--radio" >カスタマイズ <span class="muted"><br />プリセットを上書き</span>
                            <input type="radio" ng-model="$ctrl.model.override" ng-value="true"/>
                            <div class="control__indicator"></div>
                        </label>
                    </eos-container>

                    <div ng-if="$ctrl.model.override || $ctrl.isGlobal">
                        <eos-container>
                            <div class="input-group">
                                <span class="input-group-addon">Text</span>
                                <input 
                                type="text" 
                                class="form-control" 
                                aria-describedby="showEvents-text-effect-type" 
                                ng-model="$ctrl.model.text">
                            </div>

                            <eos-collapsable-panel show-label="変数を表示" hide-label="変数を隠す">
                                <ul>
                                    <li><b>$(user)</b> - ボタンを実行している人、またはコマンドを使用している人の名前に置換</li>
                                    <li><b>$(text)</b> - 対話ボタンのテキストまたはチャットコマンドIDに置換</li>
                                    <li><b>$(cost)</b> - コマンドまたはボタンのコストに置換</li>
                                    <li><b>$(cooldown)</b> - コマンドまたはボタンの待ち時間に置換</li>
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
                                placeholder="#000000 or transparent"
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
                                <span class="input-group-addon">テキスト位置</span>
                                <select class="fb-select form-control" ng-model="$ctrl.model.textAlignment">
                                    <option label="Left" value="left" selected="selected">左</option>
                                    <option label="Center" value="center">中央</option>
                                    <option label="Right" value="right">右</option>
                                </select>
                            </div>
                        </eos-container>

                        <eosEnterExitAnimations model="$ctrl.model"></eosEnterExitAnimations>

                        <eos-container>
                            <div class="input-group">
                                <span class="input-group-addon">継続時間(秒)</span>
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
                    ctrl.model.text = "$(user) pressed $(text)!";
                }
                if (ctrl.model.override == null) {
                    ctrl.model.override = false;
                }
            };
        }
    });
}());
