"use strict";
(function() {
    //This handles the Settings tab

    const fs = require("fs");
    const path = require("path");
    const dataAccess = require("../../backend/common/data-access");
    const moment = require("moment");

    angular
        .module("firebotApp")
        .controller("settingsController", function(
            $scope,
            $timeout,
            $q,
            settingsService,
            utilityService,
            listenerService,
            integrationService,
            connectionService,
            $http,
            backendCommunicator,
            ttsService,
            accountAccess,
            backupService
        ) {
            $scope.settings = settingsService;


            $scope.categories = [
                {
                    name: "���",
                    description: "�O�ς�x�[�^�Œʒm�ȂǁA���܂��܂Ȑݒ肪�\�ł�",
                    icon: "fa-sliders-v-square",
                    template: "<general-settings />"
                },
                {
                    name: "�Z�b�g�A�b�v",
                    description: "���Ȃ��̐ݒ�𑼂̐l�Ƌ��L������A���̐l�̐ݒ����荞�߂܂�",
                    icon: "fa-box-full",
                    template: "<setups-settings />"
                },
                {
                    name: "�N������",
                    description: "�l�X�ȋN�������i�R�}���h�A�C�x���g�Ȃǁj�̓������������܂�",
                    icon: "fa-bolt",
                    template: "<trigger-settings />"
                },
                {
                    name: "�f�[�^�x�[�X",
                    description: "�����҃f�[�^�x�[�X�̃I�v�V�����ƃc�[��",
                    icon: "fa-database",
                    template: "<database-settings />"
                },
                {
                    name: "�I�[�o�[���C",
                    description: "�V�����t�H���g�̒ǉ��A�V�����C���X�^���X�̍쐬�A���̑��̃I�[�o�[���C�ݒ�����܂�",
                    icon: "fa-tv",
                    template: "<overlay-settings />"
                },
                {
                    name: "�A�g",
                    description: "�T�[�h�p�[�e�B���c�[����A�v����Firebot�������N�����܂�",
                    icon: "fa-globe",
                    template: "<integration-settings />"
                },
                {
                    name: "���������iText To Speech�j",
                    description: "�ǂݏグ�����̐ݒ��ς����܂�",
                    icon: "fa-volume",
                    template: "<tts-settings />"
                },
                {
                    name: "�o�b�N�A�b�v",
                    description: "�o�b�N�A�b�v�ƃo�b�N�A�b�v�ݒ���Ǘ����A�f�[�^�������Ȃ��悤�ɂ��܂�",
                    icon: "fa-file-archive",
                    template: "<backups-settings />"
                },
                {
                    name: "�X�N���v�g",
                    description: "�X�N���v�g�̐ݒ�A�X�^�[�g�A�b�v�X�N���v�g�̒ǉ��Ȃǂ����܂�",
                    icon: "fa-code",
                    template: "<scripts-settings />"
                },
                {
                    name: "���p",
                    description: "�f�o�b�O���[�h�Awhile���[�v�A���̑��̃c�[���ȂǁA�l�X�ȍ��x�Ȑݒ�����܂�",
                    icon: "fa-tools",
                    template: "<advanced-settings />"
                }
            ];

            $scope.selectedCategory = $scope.categories[0];
            $scope.setSelectedCategory = (category) => {
                $scope.selectedCategory = category;
            };

            $scope.getSelectedVoiceName = () => {
                const selectedVoiceId = settingsService.getDefaultTtsVoiceId();
                const voice = ttsService.getVoiceById(selectedVoiceId);
                return voice ? voice.name : "�s���ȉ���";
            };

            $scope.ttsVoiceOptions = ttsService.getVoices().reduce((acc, v) => {
                acc[v.id] = v.name;
                return acc;
            }, {});

            $scope.ttsVolumeSlider = {
                value: settingsService.getTtsVoiceVolume(),
                options: {
                    floor: 0,
                    ceil: 1,
                    step: 0.1,
                    precision: 1,
                    translate: function(value) {
                        return Math.floor(value * 10);
                    },
                    onChange: (_, value) => {
                        settingsService.setTtsVoiceVolume(value);
                    }
                }
            };

            $scope.ttsRateSlider = {
                value: settingsService.getTtsVoiceRate(),
                options: {
                    floor: 0.1,
                    ceil: 10,
                    step: 0.1,
                    precision: 1,
                    onChange: (_, value) => {
                        settingsService.setTtsVoiceRate(value);
                    }
                }
            };

            const streamerName = accountAccess.accounts.streamer.username;

            const testTTSMessages = [
                "�ǂ���������߂�����������",
                "�b���ł���̂͂������Ƃł���",
                "���Ȃ��͑f���炵���Ǝv��",
                "����҂ɂ͂��s���H�����ɂ��B�͂͂́B",
                "����̓e�X�g���b�Z�[�W�ł��B�r�[�v�u�[�v",
                `�\���󂠂�܂���A${streamerName}����B�\���󂠂�܂��񂪁A����͂ł��܂���B`
            ];

            $scope.testTTS = () => {
                ttsService.readText(testTTSMessages[Math.floor(Math.random() * testTTSMessages.length)], "default");
            };

                $scope.refreshSliders = function() {
                $timeout(function() {
                    $scope.$broadcast('rzSliderForceRender');
                });
            };

            // $scope.showSetupWizard = utilityService.showSetupWizard;
            $scope.showSetupWizard = () => {
                utilityService.showModal({
                    component: "setupWizardModal"
                });
            };

            $scope.integrations = integrationService;

            $scope.openRootFolder = function() {
                listenerService.fireEvent(listenerService.EventType.OPEN_ROOT);
            };

            $scope.openLogsFolder = function() {
                backendCommunicator.fireEvent("openLogsFolder");
            };

            $scope.openVariableInspector = function() {
                backendCommunicator.fireEvent("show-variable-inspector");
            };

            $scope.startBackup = function() {
                $scope.isBackingUp = true;
                $scope.backupCompleted = false;
                backupService.startBackup();
            };

            $scope.currentMaxBackups = settingsService.maxBackupCount();

            $scope.updateMaxBackups = function(option) {
                settingsService.setMaxBackupCount(option);
            };

            $scope.openDevTools = () => {
                firebotAppDetails.openDevTools();
            };

            $scope.recalculateQuoteIds = () => {
                utilityService
                    .showConfirmationModal({
                        title: "���pID�̍Čv�Z",
                        question: `�{����ID��t�^���Ȃ����Ă悢�ł����H`,
                        confirmLabel: "���s",
                        confirmBtnType: "btn-danger"
                    })
                    .then(confirmed => {
                        if (confirmed) {
                            backendCommunicator.fireEvent("recalc-quote-ids");
                        }
                    });
            };

            $scope.toggleWhileLoops = () => {
                const whileLoopsEnabled = settingsService.getWhileLoopEnabled();

                if (whileLoopsEnabled) {
                    settingsService.setWhileLoopEnabled(false);
                } else {
                    utilityService
                        .showConfirmationModal({
                            title: "���[�v�̗L����",
                            question: "���̋@�\��L���ɂ���Ƃ������Ƃ́AWhile Loops�̌�p�ɂ��p�t�H�[�}���X��̖�肪��������AFirebot���t���[�Y�����肷��\�������邱�Ƃ𗝉��������ƂɂȂ�܂�",
                            confirmLabel: "����������ŗL��������",
                            confirmBtnType: "btn-primary"
                        })
                        .then(confirmed => {
                            if (confirmed) {
                                settingsService.setWhileLoopEnabled(true);
                            }
                        });
                }
            };

            $scope.setActiveChatUsers = (value) => {
                value = value === true;
                settingsService.setActiveChatUsers(value);
                ipcRenderer.send("setActiveChatUsers", value);
            };

            $scope.setActiveChatUserTimeout = (value) => {
                if (value == null) {
                    value = "10";
                }
                settingsService.setActiveChatUserListTimeout(value);
                ipcRenderer.send('setActiveChatUserTimeout', value);
            };

            $scope.audioOutputDevices = [{
                label: "����̃f�o�C�X",
                deviceId: "default"
            }];

            $q.when(navigator.mediaDevices.enumerateDevices()).then(deviceList => {
                deviceList = deviceList
                    .filter(
                        d =>
                        d.kind === "audiooutput" &&
                        d.deviceId !== "communications" &&
                        d.deviceId !== "default"
                    )
                    .map(d => {
                        return { label: d.label, deviceId: d.deviceId };
                    });

                $scope.audioOutputDevices = $scope.audioOutputDevices.concat(
                    deviceList
                );
            });

            listenerService.registerListener(
                { type: listenerService.ListenerType.BACKUP_COMPLETE },
                function(manualActivation) {
                    $scope.isBackingUp = false;

                    if (manualActivation) {
                        // we only want to act if the backup was manually triggered
                        $scope.backupCompleted = true;
                        // after 5 seconds, hide the completed message
                        $timeout(() => {
                            if ($scope.backupCompleted) {
                                $scope.backupCompleted = false;
                            }
                        }, 5000);
                    }
                }
            );

            if (settingsService.getAutoUpdateLevel() > 3) {
                settingsService.setAutoUpdateLevel(3);
            }

            $scope.autoUpdateSlider = {
                value: settingsService.getAutoUpdateLevel(),
                options: {
                    showSelectionBar: true,
                    showTicks: true,
                    showTicksValues: true,
                    stepsArray: [{ value: 2 }, { value: 3 }],
                    translate: function(value) {
                        return $scope.getAutoUpdateLevelString(value);
                    },
                    ticksTooltip: function(index) {
                        switch (index) {
                            case 0:
                                return "�o�O���C��������A�@�\��ǉ������肷��A�b�v�f�[�g�B(��Fv1.0����v1.1.1)";
                            case 1:
                                return "���W���[�ȐV�o�[�W�����ł���A�b�v�f�[�g�B�j��I�ȕύX���܂މ\��������܂��B(��Fv1.0����v2.0�ցj";
                            default:
                                return "";
                        }
                    },
                    getSelectionBarColor: function() {
                        return "orange";
                    },
                    getPointerColor: function() {
                        return "orange";
                    },
                    onChange: function() {
                        settingsService.setAutoUpdateLevel($scope.autoUpdateSlider.value);
                    }
                }
            };

            $scope.getAutoUpdateLevelString = function(level) {
                switch (level) {
                    case 0:
                        return "Off";
                    case 2:
                        return "����l";
                    case 3:
                        return "����ŃA�b�v�f�[�g";
                    case 4:
                        return "�J���ŃA�b�v�f�[�g";
                    default:
                        return "";
                }
            };

            $scope.currentPort = settingsService.getWebSocketPort();

            /**
             * Modals
             */

            $scope.openStartupScriptsModal = function() {
                utilityService.showModal({
                    component: "startupScriptsListModal",
                    size: "sm",
                    backdrop: true,
                    keyboard: true
                });
            };

            $scope.showFontManagementModal = function() {
                utilityService.showModal({
                    component: "fontManagementModal",
                    size: "sm"
                });
            };

            $scope.showBackupListModal = function() {
                const showBackupListModalContext = {
                    templateUrl: "backupListModal.html",
                    size: "sm",
                    controllerFunc: (
                        $scope,
                        settingsService,
                        $uibModalInstance,
                        $q,
                        listenerService,
                        utilityService
                    ) => {
                        $scope.backups = [];

                        const backupFolderPath = path.resolve(`${dataAccess.getUserDataPath() + path.sep}backups`) + path.sep;

                        $scope.loadingBackups = true;
                        $q
                            .when(
                                new Promise(resolve => {
                                    fs.readdir(backupFolderPath, (err, files) => {
                                        const backups = files
                                            .filter(f => f.endsWith(".zip"))
                                            .map(function(v) {
                                                const fileStats = fs.statSync(backupFolderPath + v);
                                                const backupDate = moment(fileStats.birthtime);

                                                let version = "Unknown Version";
                                                const versionRe = /_(v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+(?:\.\d+)?)?)(?:_|\b)/;
                                                const match = v.match(versionRe);
                                                if (match != null) {
                                                    version = match[1];
                                                }

                                                return {
                                                    name: v.replace(".zip", ""),
                                                    backupTime: backupDate.toDate().getTime(),
                                                    backupDateDisplay: backupDate.format(
                                                        "MMM Do, h:mm A"
                                                    ),
                                                    backupDateFull: backupDate.format(
                                                        //"ddd, MMM Do YYYY, h:mm:ss A"
                                                        "YYYY/MMM/ddd Do , h:mm:ss A"
                                                    ),
                                                    fromNowDisplay: utilityService.capitalize(
                                                        backupDate.fromNow()
                                                    ),
                                                    dayDifference: moment().diff(backupDate, "days"),
                                                    version: version,
                                                    size: Math.round(fileStats.size / 1000),
                                                    isManual: v.includes("manual"),
                                                    neverDelete: v.includes("NODELETE")
                                                };
                                            })
                                            .sort(function(a, b) {
                                                return b.backupTime - a.backupTime;
                                            });

                                        resolve(backups);
                                    });
                                })
                            )
                            .then(backups => {
                                $scope.loadingBackups = false;
                                $scope.backups = backups;
                            });

                        $scope.togglePreventDeletion = function(backup) {
                            backup.neverDelete = !backup.neverDelete;
                            const oldName = `${backup.name}.zip`;
                            backup.name = backup.neverDelete
                                ? (backup.name += "_NODELETE")
                                : backup.name.replace("_NODELETE", "");

                            fs.renameSync(
                                backupFolderPath + oldName,
                                `${backupFolderPath + backup.name}.zip`
                            );
                        };

                        $scope.deleteBackup = function(index, backup) {
                            utilityService
                                .showConfirmationModal({
                                    title: "�o�b�N�A�b�v�̍폜",
                                    question: "���̃o�b�N�A�b�v���폜���Ă��悢�ł����H",
                                    confirmLabel: "�폜����"
                                })
                                .then(confirmed => {
                                    if (confirmed) {
                                        $scope.backups.splice(index, 1);
                                        fs.unlinkSync(`${backupFolderPath + backup.name}.zip`);
                                    }
                                });
                        };

                        $scope.restoreBackup = function(backup) {
                            utilityService
                                .showConfirmationModal({
                                    title: "�o�b�N�A�b�v����̕���",
                                    question: "���̃o�b�N�A�b�v���g���Đݒ�𕜌����Ă��悢�ł����H",
                                    confirmLabel: "�������J�n"
                                })
                                .then(confirmed => {
                                    if (confirmed) {
                                        $uibModalInstance.dismiss("cancel");

                                        const backupFilePath =
                                            path.join(backupService.BACKUPS_FOLDER_PATH, `${backup.name}.zip`);

                                        backupService.initiateBackupRestore(backupFilePath);
                                    }
                                });
                        };

                        $scope.openBackupFolder = function() {
                            listenerService.fireEvent(listenerService.EventType.OPEN_BACKUP);
                        };

                        $scope.dismiss = function() {
                            $uibModalInstance.dismiss("cancel");
                        };
                    }
                };
                utilityService.showModal(showBackupListModalContext);
            };

            $scope.showChangePortModal = function() {
                const showChangePortModalContext = {
                    templateUrl: "changePortModal.html",
                    size: "sm",
                    controllerFunc: ($scope, settingsService, $uibModalInstance) => {
                        $scope.newPort = settingsService.getWebSocketPort();

                        $scope.newPortError = false;

                        // When the user clicks a call to action that will close the modal, such as "Save"
                        $scope.changePort = function() {
                            // validate port number
                            const newPort = $scope.newPort;
                            if (
                                newPort == null ||
                                newPort === "" ||
                                newPort <= 1024 ||
                                newPort >= 49151
                            ) {
                                $scope.newPortError = true;
                                return;
                            }

                            // Save port. This will save to both firebot and the overlay.
                            settingsService.setWebSocketPort(newPort);

                            $uibModalInstance.close(newPort);
                        };

                        // When they hit cancel, click the little x, or click outside the modal, we dont want to do anything.
                        $scope.dismiss = function() {
                            $uibModalInstance.dismiss("cancel");
                        };
                    },
                    closeCallback: port => {
                        // Update the local port scope var so setting input updates
                        $scope.currentPort = port;
                    }
                };
                utilityService.showModal(showChangePortModalContext);
            };
        });
}());
