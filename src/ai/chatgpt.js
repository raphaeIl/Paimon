import { ChatGPTAPI } from 'chatgpt'
import Config from '../managers/config.js';

export default class ChatGPT {

    static instance = null;

    static getInstance() {
        if (this.instance == null)
            this.instance = new ChatGPT()

        return this.instance;
    }

    ai = null;

    constructor() {

        this.ai = new ChatGPTAPI({
            apiKey: Config.getInstance().data['OPENAI_API_KEY']
        });
    }

    async generateResponse(prompt) {
        const result = await this.ai.sendMessage(prompt)
      
        return result.text
    }

}