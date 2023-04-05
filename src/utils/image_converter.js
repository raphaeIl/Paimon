import fs from 'fs';
import base64toFile from 'node-base64-to-file'
import webp from 'webp-converter'
import pkg from 'imgur';
import Config from '../managers/config.js';
const { ImgurClient } = pkg;

import Tesseract from 'tesseract.js';

export async function recognize_text(image_path) {
  const result = await Tesseract.recognize(image_path, 'eng')

  return result.data.text;
}

export async function base64_to_webp(base64_image) {
    try {
    const imagePath = await base64toFile(base64_image, { filePath: './', fileName: "image", types: ['webp'], fileMaxSize: 3145728 });
    console.log(imagePath)
  } catch (error) {
    console.log(error)
  }
}

export async function webp_to_png(webp_path) {
    webp.grant_permission()
    const result = await webp.dwebp(webp_path,"../res/image.png","-o");
}

export async function upload_png(png_path) {
    const client = new ImgurClient({ clientId: Config.getInstance().data['IMGUR_CLIENT_ID'] });
    const response = await client.upload({
      image: fs.createReadStream(png_path),
      type: 'stream',
    });

    return response.data['link']
}

export async function base64_to_link(baes64_image) {
    await base64_to_webp(baes64_image)
    await webp_to_png("image.webp")
    let link = await upload_png("image.png")

    return link
}


