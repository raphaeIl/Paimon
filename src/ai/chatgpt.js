import { ChatGPTAPI } from 'chatgpt'
import Config from '../managers/config.js';

export default class ChatGPT {

    static instance = null;

    static getInstance(openai_api_key = null) {
        if (this.instance == null)
            this.instance = new ChatGPT(openai_api_key)

        return this.instance;
    }

    ai = null;

    constructor(openai_api_key = null) {
        this.ai = new ChatGPTAPI({
            apiKey: openai_api_key == null ? Config.getInstance().data['OPENAI_API_KEY'] : openai_api_key,
        });
    }

    async generateResponse(prompt, last_message_id = null) {
        const result = await this.ai.sendMessage(prompt, {
            parentMessageId: last_message_id
        })
        
        return result
    }

}