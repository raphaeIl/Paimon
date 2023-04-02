import Config from '../managers/config.js';
import { NovelAi } from "novelai";

import fs from 'fs';
import { upload_png } from '../utils/image_converter.js'


export default class NovelAI {

    static instance = null;

    static getInstance() {
        if (this.instance == null)
            this.instance = new NovelAI()

        return this.instance;
    }

    ai = null;

    constructor() {
        this.ai = new NovelAi()
    }

    async generateImage(prompt) {
        const NOVELAI_EMAIL = Config.getInstance().data['NOVELAI_EMAIL']
        const NOVELAI_PASSWORD = Config.getInstance().data['NOVELAI_PASSWORD']

        const accessToken = await (
            await this.ai.login(NOVELAI_EMAIL, NOVELAI_PASSWORD)
        ).accessToken;

        const data = await this.ai.generateImage(accessToken, {
            input: prompt,
            model: "safe",
            resolution: "landscape",
            sampling: "k_euler_ancestral",
        });

        const buffer = Buffer.from(data.imageBase64, "base64");
        fs.writeFileSync("C:/Users/micha/Documents/vsc/workspace/paimon/res/novelai_image.png", buffer);
    
        let image_link = await upload_png("C:/Users/micha/Documents/vsc/workspace/paimon/res/novelai_image.png");

        return image_link
    }

}