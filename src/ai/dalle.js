import Config from '../managers/config.js';
import { Configuration, OpenAIApi } from "openai";

export default class Dalle {

    static instance = null;

    static getInstance() {
        if (this.instance == null)
            this.instance = new Dalle()

        return this.instance;
    }

    ai = null;

    constructor() {
        const configuration = new Configuration({
            apiKey: Config.getInstance().data['OPENAI_API_KEY'],
        });
        
        this.ai = new OpenAIApi(configuration);
    }

    async generateImage(prompt) {
        const response = await this.ai.createImage({
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        })
        
        return response.data.data[0].url
      }

}