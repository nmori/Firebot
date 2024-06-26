"use strict";

(function() {

    angular.module("firebotApp")
        .component("addOrEditDiscordFileUploadModal", {
            template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">Discord チャネル</h4>
            </div>
            <div class="modal-body">

                <div>
                    <div class="modal-subheader" style="padding: 0 0 4px 0">
                        ファイル名
                    </div>
                    <div style="width: 100%; position: relative;">
                        <div class="form-group" ng-class="{'has-error': $ctrl.nameError}">
                            <input type="text" id="nameField" class="form-control" ng-model="$ctrl.file.name" ng-keyup="$event.keyCode == 13 && $ctrl.save() " aria-describedby="helpBlock" placeholder="ファイル名の入力">
                            <span id="helpBlock" class="help-block" ng-show="$ctrl.nameError">ファイル名をいれてください</span>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 15px;">
                    <div class="modal-subheader" style="padding: 0 0 4px 0">
                        ファイル
                    </div>
                    <div style="width: 100%; position: relative;">
                        <div class="form-group" ng-class="{'has-error': $ctrl.descError}">
                            <file-chooser model="$ctrl.file.path" aria-describedby="pathHelpBlock" options="{ filters: [ {name: 'ファイル', extensions: ['*']} ]}"></file-chooser>
                            <span id="pathHelpBlock" class="help-block" ng-show="$ctrl.pathError">ファイルを選択してください</span>
                        </div>
                    </div>
                </div>

            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
            </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function($timeout) {
                const $ctrl = this;

                $timeout(() => {
                    angular.element("#nameField").trigger("focus");
                }, 50);


                $ctrl.file = {
                    name: "",
                    path: ""
                };

                $ctrl.$onInit = function() {
                    if ($ctrl.resolve.file != null) {
                        $ctrl.file = JSON.parse(JSON.stringify($ctrl.resolve.file));
                    }
                };

                $ctrl.nameError = false;
                $ctrl.descError = false;
                $ctrl.pathError = false;

                function validateName() {
                    const name = $ctrl.file.name;
                    return name != null && name.length > 0;
                }

                function validatePath() {
                    const path = $ctrl.file.path;
                    return path != null && path.length > 0;
                }

                $ctrl.save = function() {
                    $ctrl.nameError = false;
                    $ctrl.urlError = false;

                    if (!validateName()) {
                        $ctrl.nameError = true;
                    }

                    if (!validatePath()) {
                        $ctrl.pathError = true;
                    }

                    if ($ctrl.nameError || $ctrl.pathError) {
                        return;
                    }

                    $ctrl.close({
                        $value: {
                            file: $ctrl.file
                        }
                    });
                };
            }
        });
}());
