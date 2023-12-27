"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.EVENT] = true;
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.CUSTOM_SCRIPT] = true;
triggers[EffectTrigger.PRESET_LIST] = true;
triggers[EffectTrigger.CHANNEL_REWARD] = true;
triggers[EffectTrigger.QUICK_ACTION] = true;


module.exports = {
    definition: {
        handle: "laynaGetData",
        description: "まるっとれいなの変数を取得します。",
        categories: [VariableCategory.JP],
        possibleDataOutput: [OutputDataType.TEXT],
        examples: [
            {
                usage: "laynaGetData[tag,port]",
                description: 'まるっとれいなの変数tagの値を受け取ります'
            }
        ]
    },
    evaluator: async (_, tag = '', port='21000') => {

        var ReturnTag = '';
        try {         

            const axiosDefault = require("axios").default;

            const axios = axiosDefault.create({
    
            });
    
            axios.interceptors.request.use(request => {
                //logger.debug('HTTP Request Effect [Request]: ', JSON.parse(JSON.stringify(request)));
                return request;
            });
    
            axios.interceptors.response.use(response => {
                //logger.debug('HTTP Request Effect [Response]: ', JSON.parse(JSON.stringify(response)));
                return response;
            });            

            const response = await axios({
                method:'get',
                url: 'http://127.0.0.1:'+port+'/get?'+tag
            });

            for (const actionItem of response.data) 
            {
                ReturnTag = actionItem['Value'];
                break;
            }

        } catch (error) {
            logger.error("Error running http request", error.message);
        }

        return ReturnTag ?? '';

    }
};

