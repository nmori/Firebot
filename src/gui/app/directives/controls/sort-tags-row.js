"use strict";

(function() {
    angular.module("firebotApp")
        .component("sortTagsRow", {
            bindings: {
                context: "<",
                item: "=",
                onUpdate: "&"
            },
            template: `
<<<<<<< HEAD
                <div class="sort-tags p-px">
                    <span ng-repeat="tag in sts.getSortTagsForItem($ctrl.context, $ctrl.item.sortTags) track by tag.id" class="sort-tag mr-2">
                        <span class="mb-px">{{tag.name}}</span>
                        <button role="button" ng-click="$ctrl.removeSortTag(tag.id)" aria-label="タグを外す" class="mb-px">
                            <i class="far fa-times"></i>
                        </button>
                    </span>
                    <button
                        role="button"
                        class="sort-tag-add mb-px"
                        aria-label="Add tag"
                        ng-click="$event.stopPropagation()"
                        context-menu="$ctrl.getSortTagsContextMenu()"
                        context-menu-on="click"
                        context-menu-orientation="right"
                        ng-show="$ctrl.getSortTagsContextMenu().length > 0"
                    >
                        <i class="far fa-plus"></i>
                    </button>
=======
                <div
                    style="display: flex; position: relative;"
                    uib-popover-template="'sortTagsPopover.html'"
                    popover-is-open="$ctrl.isPopupVisible"
                    popover-placement="auto bottom-left"
                    popover-append-to-body="true"
                    popover-trigger="'outsideClick'"
                >
                    <div class="sort-tags p-px" ng-class="{ 'hidden-tags': hasOverflow() }">
                        <span ng-repeat="tag in getSortTags() track by tag.id" class="sort-tag mr-2">
                            <span class="mb-px">{{tag.name}}</span>
                        </span>
                        <button
                            role="button"
                            class="sort-tag-add mb-px"
                            aria-label="タグを追加"
                        >
                            <i class="far fa-plus"></i>
                        </button>
                    </div>
                    <div style="position: absolute;" ng-show="hasOverflow()" uib-tooltip-html="getSortTagNames()">
                        <button
                            role="button"
                            class="sort-tag-add mb-px"
                            aria-label="タグを編集"
                        >
                            {{getSortTags().length}} tags <i class="far fa-chevron-right"></i>
                        </button>
                    </div>
                    <script type="text/ng-template" id="sortTagsPopover.html">
                        <div style="max-height: 315px; min-width: 175px; max-width: 225px; overflow-y: auto; overflow-x: hidden; padding: 10px 10px 0;">
                            <label
                                ng-repeat="tag in sts.getSortTags($ctrl.context) track by tag.id"
                                class="control-fb control--checkbox"
                                style="max-width: 200px; min-width: 150px;"
                            > {{tag.name}}
                                <input type="checkbox" ng-click="$ctrl.toggleSortTag(tag)" ng-checked="$ctrl.item.sortTags.includes(tag.id)">
                                <div class="control__indicator"></div>
                            </label>
                            <div class="button mb-2" ng-click="editSortTags()" ng-if="sts.getSortTags($ctrl.context).length === 0">
                                Add tags
                            </div>
                            <hr class="divider mt-1 mb-1" ng-if="sts.getSortTags($ctrl.context).length > 0" />
                            <div class="button mt-4 mb-2" ng-click="editSortTags()" ng-if="sts.getSortTags($ctrl.context).length > 0">
                                Add/edit tags
                            </div>
                        </div>
                    </script>
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
                </div>
            `,
            controller: function($scope, sortTagsService) {
                const $ctrl = this;

                $scope.sts = sortTagsService;

                $ctrl.removeSortTag = (tagId) => {
                    $ctrl.item.sortTags = $ctrl.item.sortTags.filter(id => id !== tagId);
                    $ctrl.onUpdate();
                };

                $ctrl.addSortTag = (sortTag) => {
                    if (!$ctrl.item.sortTags.some(id => id === sortTag.id)) {
                        $ctrl.item.sortTags.push(sortTag.id);
                        $ctrl.onUpdate();
                    }
                };

                $ctrl.getSortTagsContextMenu = () => {
                    if ($ctrl.item.sortTags == null) {
                        $ctrl.item.sortTags = [];
                    }

                    const sortTags = sortTagsService.getSortTags($ctrl.context).filter(st => !$ctrl.item.sortTags.includes(st.id));
                    return sortTags.map(st => {
                        return {
                            html: `<a href> ${st.name}</a>`,
                            click: () => {
                                $ctrl.addSortTag(st);
                            }
                        };
                    });
                };

                $ctrl.$onInit = () => {
                    if ($ctrl.item.sortTags == null) {
                        $ctrl.item.sortTags = [];
                    }
                };
            }
        });
}());