import { Client } from 'craiyon'

import { upload_png, webp_to_png } from '../utils/image_converter.js'
import sharp from 'sharp'

export default class DalleMini {

    static instance = null;

    static getInstance() {
        if (this.instance == null)
            this.instance = new DalleMini()

        return this.instance;
    }

    ai = null;

    constructor() {
        this.ai = new Client();
    }

    async generateImage(prompt) {
        const result = await this.ai.generate({
            prompt: prompt,
          });

        let image = result.images[0]
        let savePath = '../res/dallemini_image.png'

        await image.saveToFile(savePath)
        
        await sharp(savePath).webp().toFile('../res/dallemini_image.webp');
        await webp_to_png(savePath)
        let link = await upload_png('../res/image.png')
        
        return link;
    }
}