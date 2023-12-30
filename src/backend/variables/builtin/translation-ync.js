"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");
const logger = require("../../logwrapper");

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
        handle: "translationYnc",
        description: "ゆかりねっとコネクターNEO経由で翻訳します",
        categories: [VariableCategory.JP],
        possibleDataOutput: [OutputDataType.TEXT],
        examples: [
            {
                usage: "translationYnc[basetext,to_lang,from_lang,format]",
                description: '翻訳します'
            },
            {
                usage: "translationYnc[おはよう,en,ja,{message}({from}>{to})]",
                description: '翻訳します'
            }
        ]
    },
    evaluator: async (_, basetext = '', to_lang='en',from_lang='ja',format='{message} ({from} => {to})',port='8080') => {

        var message = format;

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

            const crypto = require("crypto");

            const translateQuery={
                operation: 'translates',
                params: [
                    {
                        id: crypto.randomUUID(),
                        lang:[
                            from_lang,
                            to_lang
                        ],
                        text: basetext
                    }
                ]
            };
            var headers = {
                'Content-Type': 'application/json'
            };
            const response = await axios({
                method:'post',
                url: 'http://127.0.0.1:'+String(port)+'/',
                data : JSON.stringify(translateQuery),
                header: headers
            });
            
            if ( response.data.detect_language === to_lang)
            {
                message =message.replace("{from}", to_lang);     
                message =message.replace("{to}", from_lang);     

                for(var i=0;i<response.data.result.length;i++){
                    if(response.data.result[i].lang === from_lang){
                        message =message.replace("{message}", response.data.result[i].text);                
                    }
                } 
    
            }else{
                message =message.replace("{from}", from_lang);     
                message =message.replace("{to}", to_lang);     
                
                for(var j=0;j<response.data.result.length;j++){
                    if(response.data.result[j].lang === to_lang){
                        message =message.replace("{message}", response.data.result[j].text);                
                    }
                } 
            }
            
        } catch (error) {
            logger.error("Error running http request", error.message);
        }

        return message ?? '';

    }
};

