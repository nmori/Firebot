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
                    breadcrumbName: "Edit Hotkey",
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
                                    title: "ホットキーの削除",
                                    question: `ホットキー「"${hotkey.name}"」を削除しますか?`,
                                    confirmLabel: "削除する",
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
