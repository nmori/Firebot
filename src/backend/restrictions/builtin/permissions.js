"use strict";

const customRolesManager = require("../../roles/custom-roles-manager");
const teamRolesManager = require("../../roles/team-roles-manager");
const twitchRolesManager = require("../../../shared/twitch-roles");

const model = {
    definition: {
        id: "firebot:permissions",
        name: "役割",
        description: "視聴者の役割またはユーザー名に基づいて制限する.",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div class="modal-subheader" style="padding: 0 0 4px 0">
                Mode
            </div>
            <div style="margin-bottom: 10px">
<<<<<<< HEAD
                <label class="control-fb control--radio">役割 <span class="muted"><br />特定の役割のアクセスを制限する</span>
=======
                <label class="control-fb control--radio">Roles & Ranks <span class="muted"><br />特定の役割/ランクのアクセスを制限する</span>
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
                    <input type="radio" ng-model="restriction.mode" value="roles"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio" >視聴者 <span class="muted"><br />個別の視聴者名でアクセスを制限する</span>
                    <input type="radio" ng-model="restriction.mode" value="viewer"/>
                    <div class="control__indicator"></div>
                </label>
            </div>

            <div ng-if="restriction.mode === 'roles'">
                <div id="roles" class="modal-subheader" style="padding: 0 0 4px 0">
                    Viewer Roles
                </div>
                <div class="viewer-group-list">
                    <div ng-show="hasCustomRoles" style="margin-bottom: 10px;">
                        <div style="font-size: 16px;font-weight: 900;color: #b9b9b9;font-family: 'Quicksand';margin-bottom: 5px;">カスタム</div>
                        <label ng-repeat="customRole in getCustomRoles()" class="control-fb control--checkbox">{{customRole.name}}
                            <input type="checkbox" ng-click="toggleRole(customRole)" ng-checked="isRoleChecked(customRole)"  aria-label="..." >
                            <div class="control__indicator"></div>
                        </label>
                    </div>
                    <div style="font-size: 16px;font-weight: 900;color: #b9b9b9;font-family: 'Quicksand';margin-bottom: 5px;">Twitch</div>
                    <label ng-repeat="twitchRole in getTwitchRoles()" class="control-fb control--checkbox">{{twitchRole.name}}
                        <input type="checkbox" ng-click="toggleRole(twitchRole)" ng-checked="isRoleChecked(twitchRole)"  aria-label="..." >
                        <div class="control__indicator"></div>
                    </label>
                    <div ng-show="getTeamRoles().length > 0" style="margin-bottom: 10px;">
                        <div style="font-size: 16px;font-weight: 900;color: #b9b9b9;font-family: 'Quicksand';margin-bottom: 5px;">チーム</div>
                        <label ng-repeat="teamRole in getTeamRoles()" class="control-fb control--checkbox">{{teamRole.name}}
                            <input type="checkbox" ng-click="toggleRole(teamRole)" ng-checked="isRoleChecked(teamRole)"  aria-label="..." >
                            <div class="control__indicator"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div ng-if="restriction.mode === 'viewer'">
                <div id="username" class="modal-subheader" style="padding: 0 0 4px 0">
                    Username
                </div>
                <input type="text" class="form-control" aria-describedby="username" ng-model="restriction.username" placeholder="名前を入れる">
            </div>
        </div>
    `,
    optionsController: ($scope, viewerRolesService) => {
        if (!$scope.restriction.mode) {
            $scope.restriction.mode = "roles";
        }

        if (!$scope.restriction.roleIds) {
            $scope.restriction.roleIds = [];
        }

        $scope.hasCustomRoles = viewerRolesService.getCustomRoles().length > 0;
        $scope.getCustomRoles = viewerRolesService.getCustomRoles;
        $scope.getTeamRoles = viewerRolesService.getTeamRoles;
        $scope.getTwitchRoles = viewerRolesService.getTwitchRoles;

        $scope.isRoleChecked = function(role) {
            return $scope.restriction.roleIds.includes(role.id);
        };

        $scope.toggleRole = function(role) {
            if ($scope.isRoleChecked(role)) {
                $scope.restriction.roleIds = $scope.restriction.roleIds.filter(id => id !== role.id);
            } else {
                $scope.restriction.roleIds.push(role.id);
            }
        };
    },
    optionsValueDisplay: (restriction, viewerRolesService) => {
        if (restriction.mode === "roles") {
            const roleIds = restriction.roleIds;
<<<<<<< HEAD
            let output = "未選択";
=======
            let rolesOutput = "未選択";
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
            if (roleIds.length > 0) {
                output = roleIds
                    .filter(id => viewerRolesService.getRoleById(id) != null)
                    .map(id => viewerRolesService.getRoleById(id).name)
                    .join(", ");
            }
<<<<<<< HEAD
            return `役割 (${output})`;
=======
            const rolesDisplay = `Roles (${rolesOutput})`;

            const ranks = restriction.ranks ?? [];
            let ranksOutput = "未選択";
            if (ranks.length > 0) {
                const groupedByLadder = ranks.reduce((acc, r) => {
                    if (!acc.some(l => l.ladderId === r.ladderId)) {
                        acc.push({ ladderId: r.ladderId, rankIds: [] });
                    }
                    const ladder = acc.find(l => l.ladderId === r.ladderId);
                    ladder.rankIds.push(r.rankId);
                    return acc;
                }, []);
                ranksOutput = groupedByLadder
                    .filter(r => viewerRanksService.getRankLadder(r.ladderId) != null)
                    .map((r) => {
                        const ladder = viewerRanksService.getRankLadder(r.ladderId);
                        const rankNames = r.rankIds
                            .map(id => ladder.ranks.find(rank => rank.id === id))
                            .filter(rank => rank != null)
                            .map(rank => rank.name);
                        return `${ladder.name}: ${rankNames.join(", ")}`;
                    })
                    .join(", ");
            }
            const ranksDisplay = `Ranks (${ranksOutput})`;

            const itemsToDisplay = [];
            if (rolesOutput !== "未選択") {
                itemsToDisplay.push(rolesDisplay);
            }
            if (ranksOutput !== "未選択") {
                itemsToDisplay.push(ranksDisplay);
            }
            return itemsToDisplay.length > 0 ? itemsToDisplay.join(", ") : "役割/ランク (未選択)";
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        } else if (restriction.mode === "viewer") {
            return `視聴者 (${restriction.username ? restriction.username : '名無し'})`;
        }
        return "";
    },
    predicate: (triggerData, restrictionData) => {
        return new Promise(async (resolve, reject) => {
            if (restrictionData.mode === "roles") {
                const username = triggerData.metadata.username;

                const userCustomRoles = customRolesManager.getAllCustomRolesForViewer(username) || [];
                const userTeamRoles = await teamRolesManager.getAllTeamRolesForViewer(username) || [];
                const userTwitchRoles = (triggerData.metadata.userTwitchRoles || [])
                    .map(mr => twitchRolesManager.mapTwitchRole(mr));

                const allRoles = [
                    ...userTwitchRoles,
                    ...userTeamRoles,
                    ...userCustomRoles
                ].filter(r => r != null);

                // convert any mixer roles to twitch roles
                const expectedRoleIds = (restrictionData.roleIds || [])
                    .map(r => twitchRolesManager.mapMixerRoleIdToTwitchRoleId(r));

                const hasARole = allRoles.some(r => expectedRoleIds.includes(r.id));

                if (hasARole) {
                    resolve();
                } else {
                    reject("You do not have permission");
                }
            } else if (restrictionData.mode === "viewer") {
                const username = (triggerData.metadata.username || "").toLowerCase();
                if (username === restrictionData.username.toLowerCase()) {
                    resolve();
                } else {
                    reject("You do not have permission");
                }
            } else {
                resolve();
            }
        });
    }
};

module.exports = model;