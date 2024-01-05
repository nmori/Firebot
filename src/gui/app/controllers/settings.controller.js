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
                    name: "一般",
                    description: "外観やベータ版通知など、さまざまな設定が可能です",
                    icon: "fa-sliders-v-square",
                    template: "<general-settings />"
                },
                {
                    name: "セットアップ",
                    description: "あなたの設定を他の人と共有したり、他の人の設定を取り込めます",
                    icon: "fa-box-full",
                    template: "<setups-settings />"
                },
                {
                    name: "起動条件",
                    description: "様々な起動条件（コマンド、イベントなど）の動作を微調整します",
                    icon: "fa-bolt",
                    template: "<trigger-settings />"
                },
                {
                    name: "データベース",
                    description: "視聴者データベースのオプションとツール",
                    icon: "fa-database",
                    template: "<database-settings />"
                },
                {
                    name: "オーバーレイ",
                    description: "新しいフォントの追加、新しいインスタンスの作成、その他のオーバーレイ設定をします",
                    icon: "fa-tv",
                    template: "<overlay-settings />"
                },
                {
                    name: "連携",
                    description: "サードパーティ製ツールやアプリとFirebotをリンクさせます",
                    icon: "fa-globe",
                    template: "<integration-settings />"
                },
                {
                    name: "合成音声（Text To Speech）",
                    description: "読み上げ音声の設定を変えられます",
                    icon: "fa-volume",
                    template: "<tts-settings />"
                },
                {
                    name: "バックアップ",
                    description: "バックアップとバックアップ設定を管理し、データが失われないようにします",
                    icon: "fa-file-archive",
                    template: "<backups-settings />"
                },
                {
                    name: "スクリプト",
                    description: "スクリプトの設定、スタートアップスクリプトの追加などをします",
                    icon: "fa-code",
                    template: "<scripts-settings />"
                },
                {
                    name: "応用",
                    description: "デバッグモード、whileループ、その他のツールなど、様々な高度な設定をします",
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
                return voice ? voice.name : "不明な音声";
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
                "良い一日をお過ごしください",
                "話ができるのはいいことですね",
                "あなたは素晴らしいと思う",
                "歯医者にはいつ行く？歯が痛い。ははは。",
                "これはテストメッセージです。ビープブープ",
                `申し訳ありません、${streamerName}さん。申し訳ありませんが、それはできません。`
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
                        title: "引用IDの再計算",
                        question: `本当にIDを付与しなおしてよいですか？`,
                        confirmLabel: "実行",
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
                            title: "ループの有効化",
                            question: "この機能を有効にするということは、While Loopsの誤用によりパフォーマンス上の問題が生じたり、Firebotがフリーズしたりする可能性があることを理解したことになります",
                            confirmLabel: "理解した上で有効化する",
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
                label: "既定のデバイス",
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
                                return "バグを修正したり、機能を追加したりするアップデート。(例：v1.0からv1.1.1)";
                            case 1:
                                return "メジャーな新バージョンであるアップデート。破壊的な変更を含む可能性があります。(例：v1.0からv2.0へ）";
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
                        return "既定値";
                    case 3:
                        return "安定版アップデート";
                    case 4:
                        return "開発版アップデート";
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
                                    title: "バックアップの削除",
                                    question: "このバックアップを削除してもよいですか？",
                                    confirmLabel: "削除する"
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
                                    title: "バックアップからの復元",
                                    question: "このバックアップを使って設定を復元してもよいですか？",
                                    confirmLabel: "復元を開始"
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

                        // When they hit cancel, click the little x, or click outside the modal, we don't want to do anything.
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
