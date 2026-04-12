"use strict";

(function() {
    angular
        .module("firebotApp")
        .component("firebotAudioOutputDeviceSelect", {
            bindings: {
                device: "="
            },
            template: `
                <firebot-dropdown
                    ng-model="$ctrl.deviceId"
                    on-update="$ctrl.updateSelectedDevice()"
                    options="$ctrl.audioOutputDeviceOptions"
                    option-toggling="false"
                    placeholder="出力先を選択"
                />
            `,
            controller: function($q, soundService) {
                const $ctrl = this;

                $ctrl.deviceId = "";
                $ctrl.audioOutputDeviceOptions = [];

                $ctrl.updateSelectedDevice = () => {
                    const foundDevice = $ctrl.audioOutputDeviceOptions.find(d => d.value === $ctrl.deviceId);

                    if (foundDevice) {
                        $ctrl.device = {
                            label: foundDevice.name,
                            deviceId: foundDevice.value
                        };
                    }
                };

                $ctrl.$onInit = async () => {
                    const deviceList = (await soundService.getOutputDevices())
                        .toSorted((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));

                    $ctrl.audioOutputDeviceOptions = [
                        { name: "アプリ既定", value: undefined },
                        { name: "システム既定", value: "default" },
                        ...deviceList.map(d => ({ name: d.label, value: d.deviceId })),
                        { name: "divider" },
                        { name: "オーバーレイに送信", value: "overlay" }
                    ];

                    $ctrl.deviceId = $ctrl.device?.deviceId;
                };
            }
        });
}());