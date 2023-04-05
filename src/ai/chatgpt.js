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
    last_id = null;

    constructor(openai_api_key = null) {

        this.ai = new ChatGPTAPI({
            apiKey: openai_api_key == null ? Config.getInstance().data['OPENAI_API_KEY'] : openai_api_key,
        });
    }

    async generateResponse(prompt) {
        const result = await this.ai.sendMessage(prompt, {
            parentMessageId: this.last_id
        })
        
        this.last_id = result.id
        console.log(this.last_id)
        
        return result.text
    }

}