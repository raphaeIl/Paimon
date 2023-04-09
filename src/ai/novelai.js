import Config from '../managers/config.js';
import { NovelAi } from "novelai";

import fs from 'fs';
import { upload_png } from '../utils/image_converter.js'
import { promisify } from 'util'
import axios from "axios";
import unzipper from 'unzipper'
const writeFile = promisify(fs.writeFile);


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

    async generateImage(prompt, nsfw = false, furry = false, seed = 1312079470) {
        console.log('makingImg: ' + nsfw);
        console.log(prompt);
    
        const headers = {
            'Authorization': 'Bearer ' + Config.getInstance().data['NOVEL_AI_AUTH_TOKEN'],
            'Content-Type': 'application/json',
        };
    
        const uc = 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry';
    
        let model = 'nai-diffusion';
        if (furry) {
            model = 'nai-diffusion-furry';
        }
    
        const data = {
            'action': 'generate',
            'input': prompt,
            'model': model,
            'parameters': {
                'controlnet_strength': 1,
                'dynamic_thresholding': false,
                'height': 768,
                'legacy': false,
                'n_samples': 1,
                'negative_prompt': uc,
                'qualityToggle': true,
                'sampler': 'k_dpmpp_2m',
                'scale': 11,
                // 'seed': seed,
                'sm': false,
                'sm_dyn': false,
                'steps': 28,
                'ucPreset': 0,
                'width': 512,
            },
        };
    
        const url = 'https://api.novelai.net/ai/generate-image';
    
        try {
            const response = await axios.post(url, data, { headers: headers, responseType: 'arraybuffer' });
    
            console.log(response);
    
            const zip = await unzipper.Open.buffer(response.data);
            const imgFile = zip.files[0];
            const imgData = await imgFile.buffer();
    
            const imName = `C:/Users/micha/Documents/vsc/workspace/paimon/res/novelai_image.png`;
            
            await writeFile(imName, imgData);

            let image_link = await upload_png("C:/Users/micha/Documents/vsc/workspace/paimon/res/novelai_image.png");

            return image_link;
        } catch (error) {
            console.error('Error:', error);
            return 'error.png';
        }
    }

}