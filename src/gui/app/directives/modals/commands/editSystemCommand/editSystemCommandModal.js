"use strict";

(function() {
    angular.module("firebotApp").component("editSystemCommandModal", {
        templateUrl: "./directives/modals/commands/editSystemCommand/editSystemCommandModal.html",
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function() {
            const $ctrl = this;

            $ctrl.command = {};

<<<<<<< HEAD
            $ctrl.$onInit = function() {
=======
            $ctrl.command.allowTriggerBySharedChat = String($ctrl.command.allowTriggerBySharedChat);

            $ctrl.sharedChatRadioOptions = {
                true: "Allow",
                false: "Ignore",
                inherit: { text: "Inherit", tooltip: "設定 > トリガー > 共有チャットがコマンドをトリガーすることを許可する から設定を継承します。" }
            };

            $ctrl.$onInit = function () {
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
                if ($ctrl.resolve.command != null) {
                    // doing the json stuff is a relatively simple way to deep copy a command object.
                    $ctrl.command = JSON.parse(JSON.stringify($ctrl.resolve.command));
                }
            };

            $ctrl.effectListUpdated = function(effects) {
                $ctrl.command.effects = effects;
            };

            $ctrl.reset = function() {
                $ctrl.close({
                    $value: {
                        action: "reset",
                        command: $ctrl.command
                    }
                });
            };
            $ctrl.save = function() {
                if ($ctrl.command.trigger == null || $ctrl.command.trigger === "") {
                    return;
                }

                $ctrl.close({
                    $value: {
                        action: "save",
                        command: $ctrl.command
                    }
                });
            };
        }
    });
}());
