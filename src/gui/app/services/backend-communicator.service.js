"use strict";

(function() {

    /*
        This service is the new way to communicate to the backend.
        It ensures we do not cause a memory leak by registering the same listener for an event on ipcRenderer
    */

    angular
        .module("firebotApp")
        .factory("backendCommunicator", function($q) {

            const { randomUUID } = require("crypto");

            const service = {};

            const knownEvents = new Set();

            const listeners = {};

            function registerEventWithElectron(eventName) {
                knownEvents.add(eventName);

                return (function(name) {
                    ipcRenderer.on(name, function(_, data) {
                        const eventListeners = listeners[name];
                        for (const listener of eventListeners) {
                            if (listener.async) {
                                listener.callback(data).then((returnValue) => {
                                    service.fireEvent(`${name}:reply`, returnValue);
                                });
                            } else {
                                $q.resolve(true, () => listener.callback(data));
                            }
                        }
                    });
                })(eventName);
            }

            service.on = function(eventName, callback, async = false) {

                if (typeof callback !== "function") {
                    throw new Error("Can't register an event without a callback.");
                }

                const id = randomUUID(),
                    event = {
                        id: id,
                        callback: callback,
                        async: async
                    };


                if (listeners.hasOwnProperty(eventName)) {
                    listeners[eventName].push(event);
                } else {
                    listeners[eventName] = [event];
                    registerEventWithElectron(eventName);
                }

                return id;
            };

            service.onAsync = (eventName, callback) => service.on(eventName, callback, true);

            service.off = function(eventName, id) {
                const bucket = listeners[eventName];
                if (!bucket || !id) {
                    return false;
                }
                const idx = bucket.findIndex(l => l.id === id);
                if (idx === -1) {
                    return false;
                }
                bucket.splice(idx, 1);
                return true;
            };

            service.onScoped = function(scope, eventName, callback, async = false) {
                const id = service.on(eventName, callback, async);
                if (scope && typeof scope.$on === "function") {
                    scope.$on("$destroy", () => service.off(eventName, id));
                }
                return id;
            };

            service.onScopedAsync = (scope, eventName, callback) => service.onScoped(scope, eventName, callback, true);

            service.__listeners__ = listeners;

            service.fireEventAsync = function(type, data) {
                if (data !== undefined) {
                    data = JSON.parse(JSON.stringify(data));
                }
                return $q.when(new Promise((resolve) => {
                    ipcRenderer.send(type, data);
                    ipcRenderer.once(`${type}:reply`, (_, eventData) => {
                        resolve(eventData);
                    });
                }));
            };

            service.fireEventSync = function(type, data) {
                return ipcRenderer.sendSync(type, data);
            };

            service.fireEvent = function(type, data) {
                ipcRenderer.send(type, data);
            };

            service.send = service.fireEvent;

            return service;
        });
})();
