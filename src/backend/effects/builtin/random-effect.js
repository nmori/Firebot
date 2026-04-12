"use strict";

const effectRunner = require("../../common/effect-runner");
const util = require("../../utility");
const { EffectCategory } = require('../../../shared/effect-constants');

const randomQueuesCache = {};

/**
 * The Random Effect effect
 */
const randomEffect = {
    /**
   * The definition of the Effect
   */
    definition: {
        id: "firebot:randomeffect",
        name: "貍泌・繧偵Λ繝ｳ繝繝縺ｫ螳溯｡・,
        description: "貍泌・繝ｪ繧ｹ繝医°繧峨Λ繝ｳ繝繝縺ｧ螳溯｡後☆繧・,
        icon: "fad fa-random",
        categories: [EffectCategory.ADVANCED, EffectCategory.SCRIPTING],
        dependencies: []
    },
    /**
   * Global settings that will be available in the Settings tab
   */
    globalSettings: {},
    /**
   * The HTML template for the Options view (ie options when effect is added to something such as a button.
   * You can alternatively supply a url to a html file via optionTemplateUrl
   */
    optionsTemplate: `


    <eos-container>
        <p>莉･荳九・貍泌・繝ｪ繧ｹ繝医°繧峨Λ繝ｳ繝繝螳溯｡後☆繧九・</p>

        <div style="padding-top: 10px;">
            <firebot-checkbox
                model="effect.weighted"
                label="Weighted Chances"
                tooltip="繝√ぉ繝・け縺吶ｋ縺ｨ縲∵ｼ泌・遒ｺ邇・・驥阪∩縺ｮ蛟､縺ｫ繧医▲縺ｦ豎ｺ縺ｾ繧翫∪縺吶ゅメ繧ｧ繝・け繧貞､悶＠縺溷ｴ蜷医∝推貍泌・縺ｯ蜷後§遒ｺ邇・〒驕ｸ謚槭＆繧後∪縺吶・
                style="margin-bottom: 0"
            />
        </div>
    </eos-container>

    <eos-container pad-top="true">
        <effect-list effects="effect.effectList"
            trigger="{{trigger}}"
            trigger-meta="triggerMeta"
            update="effectListUpdated(effects)"
            header="貍泌・"
            modalId="{{modalId}}"
            hide-numbers="true"></effect-list>
    </eos-container>

    <eos-container header="繧ｪ繝励す繝ｧ繝ｳ" pad-top="true">
        <firebot-checkbox
            ng-hide="effect.weighted"
            model="effect.dontRepeat"
            label="郢ｰ繧願ｿ斐＆縺ｪ縺・
            tooltip="繝√ぉ繝・け縺励◆蝣ｴ蜷医√Μ繧ｹ繝亥・縺ｮ蜷・ｼ泌・縺ｯ縲∝・蠎ｦ繧ｷ繝｣繝・ヵ繝ｫ縺輔ｌ繧句燕縺ｫ荳蠎ｦ縺縺大・逕溘＆繧後∝酔縺俶ｼ泌・縺碁｣邯壹＠縺ｦ郢ｰ繧願ｿ斐＆繧後ｋ縺ｮ繧帝亟縺弱∪縺吶・
        />
        <firebot-checkbox
            model="effect.bubbleOutputs"
            label="隕ｪ繝ｪ繧ｹ繝医↓貍泌・蜃ｺ蜉帙ｒ驕ｩ逕ｨ縺吶ｋ"
            tooltip="貍泌・蜃ｺ蜉帙ｒ隕ｪ貍泌・繝ｪ繧ｹ繝医〒蛻ｩ逕ｨ蜿ｯ閭ｽ縺ｫ縺吶ｋ縺九←縺・°"
        />
    </eos-container>
    `,
    /**
   * The controller for the front end Options
   */
    optionsController: $scope => {

        $scope.effectListUpdated = function (effects) {
            $scope.effect.effectList = effects;
        };
    },
    /**
   * When the effect is triggered by something
   */
    onTriggerEvent: event => {
        return new Promise(resolve => {

            const effect = event.effect;
            const effectList = effect.effectList;
            const outputs = effect.outputs;

            if (!effectList || !effectList.list) {
                return resolve(true);
            }

            const enabledEffectList = effectList.list.filter(e => (e.active == null || !!e.active));
            if (!enabledEffectList.length) {
                return resolve(true);
            }

            let chosenEffect = null;

            const dontRepeat = effect.dontRepeat;

            // if we shouldnt repeat, we need to use queues
            if (dontRepeat) {

                const containsAll = (arr1, arr2) =>
                    arr2.every(arr2Item => arr1.includes(arr2Item));

                // get array of effect ids in this random effect
                const newEffectIds = enabledEffectList.map(e => e.id);

                // try to find queue in cache
                let cacheEntry = randomQueuesCache[effect.id];
                if (!cacheEntry) {
                    // we don't have a preexisting queue in the cache, create a new one
                    cacheEntry = {
                        queue: util.shuffleArray(newEffectIds),
                        currentEffectIds: newEffectIds
                    };

                    // add to the cache
                    randomQueuesCache[effect.id] = cacheEntry;
                } else {
                    // theres an existing queue in the cache, check if the effect list has changed at all since last time
                    // and if so, rebuild the queue
                    const effectsHaventChanged = containsAll(newEffectIds, cacheEntry.currentEffectIds);
                    if (!effectsHaventChanged) {
                        cacheEntry.currentEffectIds = newEffectIds;
                        cacheEntry.queue = util.shuffleArray(newEffectIds);
                    }
                }


                if (cacheEntry.queue.length === 0) {
                    // We need to make a new queue
                    let newShuffle = [];
                    if (newEffectIds.length < 2) {
                        newShuffle = util.shuffleArray(newEffectIds);
                    } else {
                        do {
                            newShuffle = util.shuffleArray(newEffectIds);
                        } while (cacheEntry.lastEffectId && newShuffle[0] === cacheEntry.lastEffectId);
                        cacheEntry.queue = newShuffle;
                    }
                }

                // gets the next effect from beginning of queue and removes it
                const chosenEffectId = cacheEntry.queue.shift();
                cacheEntry.lastEffectId = chosenEffectId;
                chosenEffect = effectList.list.find(e => e.id === chosenEffectId);

            } else {
                // we don't care about repeats, just get an effect via random index
                const randomIndex = util.getRandomInt(0, enabledEffectList.length - 1);
                chosenEffect = enabledEffectList[randomIndex];

                //removed any cached queues
                if (randomQueuesCache[effect.id]) {
                    delete randomQueuesCache[effect.id];
                }
            }

            if (chosenEffect == null) {
                return resolve(true);
            }

            const processEffectsRequest = {
                trigger: event.trigger,
                effects: {
                    id: effectList.id,
                    list: [chosenEffect],
                    queue: effectList.queue
                },
                outputs: outputs
            };

            effectRunner.processEffects(processEffectsRequest)
                .then(result => {
                    if (result != null && result.success === true) {
                        if (result.stopEffectExecution) {
                            return resolve({
                                success: true,
                                outputs: effect.bubbleOutputs ? result.outputs : undefined,
                                execution: {
                                    stop: true,
                                    bubbleStop: true
                                }
                            });
                        }
                    }
                    resolve({
                        success: true,
                        outputs: effect.bubbleOutputs ? result?.outputs : undefined
                    });
                });
        });
    }
};

module.exports = randomEffect;
