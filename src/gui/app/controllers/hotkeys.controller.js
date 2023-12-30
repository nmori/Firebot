"use strict";
(function() {
    //This handles the Hotkeys tab

    angular
        .module("firebotApp")
        .controller("hotkeysController", function(
            $scope,
            hotkeyService,
            utilityService
        ) {
            $scope.getHotkeys = function() {
                return hotkeyService.getHotkeys();
            };

            $scope.getDisplayForCode = function(code) {
                return hotkeyService.getDisplayFromAcceleratorCode(code);
            };

            $scope.openAddOrEditHotkeyModal = function(hotkey) {
                utilityService.showModal({
                    component: "addOrEditHotkeyModal",
                    resolveObj: {
                        hotkey: () => hotkey
                    },
                    closeCallback: resp => {
                        const action = resp.action,
                            hotkey = resp.hotkey;

                        switch (action) {
                        case "add":
                            hotkeyService.saveHotkey(hotkey);
                            break;
                        case "update":
                            hotkeyService.updateHotkey(hotkey);
                            break;
                        case "delete":
                            utilityService
                                .showConfirmationModal({
                                    title: "�z�b�g�L�[�̍폜",
                                    question: `�z�b�g�L�[�u"${hotkey.name}"�v���폜���܂���?`,
                                    confirmLabel: "�폜����",
                                    confirmBtnType: "btn-danger"
                                })
                                .then(confirmed => {
                                    if (confirmed) {
                                        hotkeyService.deleteHotkey(hotkey);
                                    }
                                });
                            break;
                        }
                    }
                });
            };
        });
}());
