import 'dotenv/config.js'
import { Configuration, OpenAIApi } from "openai";
import { FileBox }  from 'file-box'
import { generate_images, generate_image_novelai } from './image_converter.js'
import fs from 'fs';
import { ChatGPTAPIBrowser } from 'chatgpt'

import {
 WechatyBuilder,
 ScanStatus,
 log,
}                     from 'wechaty'
import qrcodeTerminal from 'qrcode-terminal'

const AUTOMATIC_MESSAGE = "[自动回复]\n你好！很抱歉的告诉你，我目前处于待机模式，所以暂时帮助不了你哦！ 请稍后再试。\n\n[Automatic Message]\nHello there! I'm sorry to inform you that I am currently not running at the moment. Please try again later"
export let OPENAI_API_KEY = null;
export let IMGUR_CLIENT_ID = null;
export let NOVEL_AI_AUTH_TOKEN = null;
let OPENAI_EMAIL = null;
let OPENAI_PASSWORD = null;

function readConfigFile() {
  return new Promise((resolve, reject) => {
      fs.readFile('config.json', 'utf8', (err, data) => {
          if (err) {
              reject(err);
          }
          try {
            const fileData = JSON.parse(data);
            resolve(fileData)
          } catch (e) {
              reject(e);
          }
      });
  })
  .catch((err) => {
      console.error(err);
  });
}

function onScan (qrcode, status) {
 if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
   qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

   const qrcodeImageUrl = [
     'https://wechaty.js.org/qrcode/',
     encodeURIComponent(qrcode),
   ].join('')

   log.info('Paimon', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

 } else {
   log.info('Paimon', 'onScan: %s(%s)', ScanStatus[status], status)
 }
}

function onLogin (user) {
 log.info('Paimon', '%s login', user)
}

function onLogout (user) {
 log.info('Paimon', '%s logout', user)
}

var isDown = true;

async function generateResponse(prompt) {
  let response = "I'm sorry, I'm not able to answer that question.\n对不起，我无法回答这个问题。";
  
  // try {
  const result = await api.sendMessage(prompt)
  response = result.response.replace(/\n/g, '');
  // } catch(error) {
  //   console.log(error)
  //   return;
  // }

  return response.toString();
}

async function generateImage(prompt) {
  const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createImage({
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  })
  
  return response.data.data[0].url
}

let alreadyResponding = false;

async function onMessage(msg) {
    if (msg.self())
        return;
    
    if (alreadyResponding) {
        console.log("message ignored")
        return;
    }
    alreadyResponding = true;
    
    let prompt = msg.text().toString();

    if (prompt == "!toggle") {
      isDown = !isDown;
      
      console.log(isDown ? "AI turned off" : "AI turned on")
      alreadyResponding = false;
      return;
    }
    
    if (prompt == "!help") {
      await msg.say("!genq <prompt>: Quick Generates an image with the prompt (less than 30 seconds)")
      await msg.say("!gen <prompt>: Generates an image with the prompt (1-2 minutes)")
      await msg.say("!novelai <prompt>: Generates an image using NovelAI with the prompt (less than 10 seconds)")
      alreadyResponding = false;
      return;
    }

    if (prompt.includes("纯爱")) {
      await msg.say("纯爱战士? 我可以证明这群里没有纯爱战士，全是ntr！！")
      alreadyResponding = false;
      return;
    }

    if (prompt.includes("!genq ")) {
      prompt = prompt.replace("!genq ", "")

      console.log(prompt)
      let image_url = await generateImage(prompt)
      const fileBox = FileBox.fromUrl(image_url)
      
      console.log(image_url)
    
      await msg.say(fileBox)
      alreadyResponding = false;
      return;
    } else if (prompt.includes("!gen ")) {
      prompt = prompt.replace("!gen ", "")
      console.log(prompt)

      await msg.say("Generating image.... Please wait (1-2 minutes)")
      let image_link = await generate_images(prompt)
      
      const fileBox = FileBox.fromUrl(image_link)
      
      console.log(image_link)
    
      await msg.say(fileBox)
      alreadyResponding = false;
      return;
    } else if (prompt.includes("!novelai ")) {
      prompt = prompt.replace("!novelai ", "")
      console.log(prompt)

      // await msg.say("Generating image.... Please wait (~10 seconds)")
      let image_link = await generate_image_novelai(prompt)
      
      const fileBox = FileBox.fromUrl(image_link)
      
      console.log(image_link)
    
      await msg.say(fileBox)
      alreadyResponding = false;
      return;
    }


    if (msg.room() != null) {
      await onMessageGroup(msg)
      alreadyResponding = false;
      return;
    }

    await respondToMessage(msg, false)
    alreadyResponding = false;
}

async function onMessageGroup(msg) {
  console.log("message is in a group!")

  if (mentionSelf(msg)) {
    console.log('this message were mentioned me! [You were mentioned] tip ([有人@我]的提示)')
    await respondToMessage(msg, true)
  }
}

function mentionSelf(msg) {
  let prompt = msg.text().toString();

  return prompt.includes('派蒙');
}

async function respondToMessage(msg, tagSender) {
  let response = null;
  let prompt = msg.text().toString();

  if (tagSender)
    prompt = prompt.replace("派蒙", "")

  if (!isDown)
    response = await generateResponse(prompt)
  else
    response = AUTOMATIC_MESSAGE;

  console.log(prompt)
  console.log(response)
  if (!tagSender)
    await msg.say(response);
  else
    await msg.say(`@${msg.from().name()} ${response}`);
}

const bot = WechatyBuilder.build({
  name: 'ding-dong-bot',
  puppet: 'wechaty-puppet-padlocal',
})
let api = null;

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.start()
 .then(() => {
    readConfigFile().then((fileData) => {
      OPENAI_API_KEY = fileData['OPENAI_API_KEY'];
      IMGUR_CLIENT_ID = fileData['IMGUR_CLIENT_ID'];
      NOVEL_AI_AUTH_TOKEN = fileData['NOVEL_AI_AUTH_TOKEN'];
      OPENAI_EMAIL = fileData['OPENAI_EMAIL'];
      OPENAI_PASSWORD = fileData['OPENAI_PASSWORD'];

      console.log(OPENAI_API_KEY)
      console.log(IMGUR_CLIENT_ID)
      console.log(NOVEL_AI_AUTH_TOKEN)
      console.log(OPENAI_EMAIL)
      console.log(OPENAI_PASSWORD)

      api = new ChatGPTAPIBrowser({
        email: OPENAI_EMAIL,
        password: OPENAI_PASSWORD
      })

      api.initSession()
    })
 })
 .then(() => log.info('Paimon', 'Paimon Bot Started.'))
 .catch(e => log.error('Paimon', e))