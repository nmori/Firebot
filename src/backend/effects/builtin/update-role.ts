import { EffectType } from "../../../types/effects";
import { BasicViewer } from "../../../types/viewers";
import { TwitchApi } from "../../streaming-platforms/twitch/api";
import customRolesManager from "../../roles/custom-roles-manager";
import viewerDatabase from "../../viewers/viewer-database";
import logger from "../../logwrapper";

/**
 * The 'Update Role' effect
 */
const effect: EffectType<{
    addRoleId: string;
    customViewer: string;
    removeRoleId: string;
    removeAllRoleId: string;
    viewerType: "current" | "custom";
}> = {
    /**
   * The definition of the Effect
   */
    definition: {
        id: "firebot:update-roles",
        name: "役割の更新",
        description: "役割からユーザーを追加、削除、クリアします。",
        icon: "fad fa-user-tag",
        categories: ["fun", "advanced", "firebot control"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="カスタム役割の操作" pad-top="true">
            <div>
                <label class="control-fb control--checkbox"> ユーザに役割を付与</tooltip>
                    <input type="checkbox" ng-init="shouldAddRole = (effect.addRoleId != null && effect.addRoleId !== '')" ng-model="shouldAddRole" ng-click="effect.addRoleId = undefined">
                    <div class="control__indicator"></div>
                </label>
                <div uib-collapse="!shouldAddRole" style="margin: 0 0 15px 15px;">
                    <div class="btn-group" uib-dropdown>
                        <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                        {{getRoleName(effect.addRoleId)}} <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                            <li role="menuitem" ng-repeat="role in roles" ng-click="effect.addRoleId = role.id"><a href>{{role.name}}</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div style="margin-top:5px;">
                <label class="control-fb control--checkbox"> ユーザから役割を外す</tooltip>
                    <input type="checkbox" ng-init="shouldRemoveRole = (effect.removeRoleId != null && effect.removeRoleId !== '')" ng-model="shouldRemoveRole" ng-click="effect.removeRoleId = undefined">
                    <div class="control__indicator"></div>
                </label>
                <div uib-collapse="!shouldRemoveRole" style="margin: 0 0 15px 15px;">
                    <div class="btn-group" uib-dropdown>
                        <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                        {{getRoleName(effect.removeRoleId)}} <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                            <li role="menuitem" ng-repeat="role in roles" ng-click="effect.removeRoleId = role.id"><a href>{{role.name}}</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div style="margin-top:5px;">
                <label class="control-fb control--checkbox"> すべてのユーザーを役割から削除</tooltip>
                    <input type="checkbox" ng-init="shouldRemoveAllRole = (effect.removeAllRoleId != null && effect.removeAllRoleId !== '')" ng-model="shouldRemoveAllRole" ng-click="effect.removeAllRoleId = undefined">
                    <div class="control__indicator"></div>
                </label>
                <div uib-collapse="!shouldRemoveAllRole" style="margin: 0 0 15px 15px;">
                    <div class="btn-group" uib-dropdown>
                        <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                        {{getRoleName(effect.removeAllRoleId)}} <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                            <li role="menuitem" ng-repeat="role in roles" ng-click="effect.removeAllRoleId = role.id"><a href>{{role.name}}</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </eos-container>

        <eos-container header="対象視聴者" ng-show="effect.removeRoleId != null || effect.addRoleId != null">
            <div style="padding: 0 10px 0 0;">
                <label class="control-fb control--radio">関連視聴者 <tooltip text="'このボタンを押した視聴者、コマンドを実行した視聴者など'"></tooltip>
                    <input type="radio" ng-model="effect.viewerType" value="current"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio" style="margin-bottom: 10px;">指定視聴者
                    <input type="radio" ng-model="effect.viewerType" value="custom"/>
                    <div class="control__indicator"></div>
                </label>
                <div ng-show="effect.viewerType === 'custom'" style="padding-left: 30px;">
                    <input class="form-control" type="text" ng-model="effect.customViewer" placeholder="ユーザ名" replace-variables></input>
                </div>
            </div>
        </eos-container>
    `,
    /**
   * The controller for the front end Options
   */
    optionsController: ($scope, viewerRolesService) => {

        if ($scope.effect.viewerType == null) {
            $scope.effect.viewerType = "current";
        }

        $scope.roles = viewerRolesService.getCustomRoles();

        $scope.getRoleName = (roleId) => {
            const role = $scope.roles.find(r => r.id === roleId);
            return role ? role.name : "選択してください";
        };
    },
    getDefaultLabel: (effect, viewerRolesService) => {
        if (effect.addRoleId && effect.removeRoleId || effect.addRoleId && effect.removeAllRoleId || effect.removeRoleId && effect.removeAllRoleId) {
            return "複数の操作";
        }
        const viewer = effect.viewerType === "current" ? "関連視聴者" : effect.customViewer;

        if (effect.addRoleId) {
            return `${viewer} を ${viewerRolesService.getRoleById(effect.addRoleId)?.name ?? "不明な役割"} に追加`;
        }

        if (effect.removeRoleId) {
            return `${viewer} を ${viewerRolesService.getRoleById(effect.removeRoleId)?.name ?? "不明な役割"} から削除`;
        }

        if (effect.removeAllRoleId) {
            return `役割 ${viewerRolesService.getRoleById(effect.removeAllRoleId)?.name ?? "不明な役割"} をクリア`;
        }

        return "";
    },
    /**
   * When the effect is triggered by something
   */
    onTriggerEvent: async (event) => {
        const effect = event.effect;

        if (effect.removeAllRoleId) {
            customRolesManager.removeAllViewersFromRole(effect.removeAllRoleId);
            return;
        }

        const user: BasicViewer = {
            id: "",
            username: ""
        };

        if (effect.viewerType === "current") {
            user.id = event.trigger.metadata.userId as string | undefined ?? event.trigger.metadata.eventData?.userId as string | undefined;
            user.username = event.trigger.metadata.username ?? event.trigger.metadata.eventData?.username as string | undefined;
            user.displayName = event.trigger.metadata.userDisplayName as string | undefined ?? event.trigger.metadata.eventData?.userDisplayName as string | undefined;
        } else {
            user.username = effect.customViewer ? effect.customViewer.trim() : "";
        }

        if (user.id == null || user.id === "") {
            if (user.username === "") {
                logger.warn(`Unable to ${effect.addRoleId ? "add" : "remove"} custom role. No user information provided.`);
                return;
            }

            const viewer = await viewerDatabase.getViewerByUsername(user.username);

            if (viewer) {
                user.id = viewer._id;
                user.displayName = viewer.displayName;
            } else {
                const twitchUser = await TwitchApi.users.getUserByName(user.username);

                if (twitchUser == null) {
                    logger.warn(`Unable to ${effect.addRoleId ? "add" : "remove"} custom role for ${user.username}. User does not exist.`);
                    return;
                }

                user.id = twitchUser.id;
                user.displayName = twitchUser.displayName;
            }
        }

        if (effect.addRoleId) {
            customRolesManager.addViewerToRole(effect.addRoleId, user);
        }

        if (effect.removeRoleId) {
            customRolesManager.removeViewerFromRole(effect.removeRoleId, user.id);
        }

        return true;
    }
};

export = effect;
