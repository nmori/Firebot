"use strict";
(function() {
    angular.module("firebotApp")
        .filter("eventfilter", function() {
            return function(events, search) {
                if (search == null || search === "") {
                    return events;
                }
                return events.filter(e =>
                    e.name.toLowerCase().includes(search.toLowerCase())
                    || e.description.toLowerCase().includes(search.toLowerCase())
                    || e.source?.name?.toLowerCase().includes(search.toLowerCase())
                );
            };
        });

    //This a wrapped dropdown element that automatically handles the particulars

    angular.module("firebotApp").component("searchableEventDropdown", {
        bindings: {
            selected: "<",
            update: "&"
        },
        template: `
      <ui-select ng-model="$ctrl.selectedEvent" on-select="$ctrl.selectOption($item, $model)" theme="bootstrap">
        <ui-select-match placeholder="�C�x���g�̑I���⌟��... ">{{$select.selected.name}}</ui-select-match>
        <ui-select-choices repeat="option in $ctrl.options | filter: { name: $select.search }" style="position:relative;">
          <div>
            <div ng-bind-html="option.name | highlight: $select.search" style="display: inline-block"></div>
            <tooltip ng-if="option.isIntegration" text="$ctrl.getSourceName(option.sourceId) +'���̃C�x���g���@�\���邽�߂ɂ́A�ݒ�->�A�g�Ń����N����Ă���K�v������܂��B'"></tooltip>
          </div>
          <small class="muted"><strong>{{option.source.name}}</strong> | {{option.description}}</small>
        </ui-select-choices>
      </ui-select>
      `,
        controller: function(listenerService) {
            const ctrl = this;

            const events = listenerService.fireEventSync("getAllEvents", false);
            const sources = listenerService.fireEventSync("getAllEventSources", false);

            const getSelected = () => {
                // sort events by name
                ctrl.options = events.sort((a, b) => {
                    const textA = a.name.toUpperCase();
                    const textB = b.name.toUpperCase();
                    return textA < textB ? -1 : textA > textB ? 1 : 0;
                });

                //find the selected event in the list
                ctrl.selectedEvent = ctrl.options.find(
                    e =>
                        e.id === ctrl.selected.eventId &&
                        e.sourceId === ctrl.selected.sourceId
                );
            };

            // when the element is initialized
            ctrl.$onInit = () => {
                getSelected();

                // Add source info to event objects for filtering
                events.forEach(e => {
                    e.source = {
                        id: e.sourceId,
                        name: ctrl.getSourceName(e.sourceId)
                    };
                });
            };

            ctrl.$onChanges = () => {
                getSelected();
            };

            ctrl.getSourceName = (sourceId) => {
                const source = sources.find(s => s.id === sourceId);

                if (source) {
                    return source.name;
                }
                return null;
            };

            //when a new event is selected, set the selected type
            ctrl.selectOption = (option) => {
                ctrl.update({
                    event: { eventId: option.id, sourceId: option.sourceId, name: option.name }
                });
            };
        }
    });
}());
