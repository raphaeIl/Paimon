import fs from 'fs';
import base64toFile from 'node-base64-to-file'
import webp from 'webp-converter'
import pkg from 'imgur';
const { ImgurClient } = pkg;
import Dalle from 'node-craiyon'
import { NovelAI, resolution } from "nai-studio";
import { IMGUR_CLIENT_ID, NOVEL_AI_AUTH_TOKEN } from './bot.js'

async function base64_to_webp(base64_image) {
    try {
    const imagePath = await base64toFile(base64_image, { filePath: './', fileName: "image", types: ['png'], fileMaxSize: 3145728 });
    console.log(imagePath)
  } catch (error) {
    console.log(error)
  }
}

async function webp_to_png(webp_path) {
    webp.grant_permission()
    const result = await webp.dwebp(webp_path,"image.png","-o");
}

async function upload_png(png_path) {
    const client = new ImgurClient({ clientId: IMGUR_CLIENT_ID });
    const response = await client.upload({
    image: fs.createReadStream(png_path),
    type: 'stream',
    });

    return response.data['link']
}

async function base64_to_link(baes64_image) {
    await base64_to_webp(baes64_image)
    await webp_to_png("image.webp")
    let link = await upload_png("image.png")

    return link
}

export async function generate_images(prompt) {
    const dalle = new Dalle()
    const images = await dalle.generateImages(prompt)

    let base64_image = images[0]

    base64_image = base64_image.replace(/\n/g, '');

    return await base64_to_link(base64_image);
}

export async function generate_image_novelai(prompt) {
    const auth = NOVEL_AI_AUTH_TOKEN;

    const nai = new NovelAI(auth);
    const image = await nai.image(prompt, "", { ...resolution.normal.portrait });
    fs.writeFileSync("novelai_image.png", image);

    let image_link = await upload_png("novelai_image.png");
    return image_link
}

// generate_image_novelai("{masterpiece},{best quality},{1girl},Amazing,beautiful detailed eyes,finely detail,Depth of field,extremely detailed CG,original, extremely detailed wallpaper")