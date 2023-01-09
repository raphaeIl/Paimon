/**
 *   Wechaty - https://github.com/wechaty/wechaty
 *
 *   @copyright 2016-now Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
import 'dotenv/config.js'
import { Configuration, OpenAIApi } from "openai";
import robot from 'robotjs';
import request from 'request';
import cheerio from 'cheerio';
import clipboardy from 'clipboardy';
import { FileBox }  from 'file-box'
import { generate_images, generate_image_novelai } from './image_converter.js'
import fs from 'fs';

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

function init() {
  fs.readFile('config.json', (err, data) => {
    if (err) throw err;
  
    const fileData = JSON.parse(data);
  
    OPENAI_API_KEY = fileData['OPENAI_API_KEY'];
    IMGUR_CLIENT_ID = fileData['IMGUR_CLIENT_ID'];
    NOVEL_AI_AUTH_TOKEN = fileData['NOVEL_AI_AUTH_TOKEN'];
  
    console.log(OPENAI_API_KEY)
    console.log(IMGUR_CLIENT_ID)
    console.log(NOVEL_AI_AUTH_TOKEN)
  });
  
}

function onScan (qrcode, status) {
 if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
   qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

   const qrcodeImageUrl = [
     'https://wechaty.js.org/qrcode/',
     encodeURIComponent(qrcode),
   ].join('')

   log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

 } else {
   log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
 }
}

function onLogin (user) {
 log.info('StarterBot', '%s login', user)
}

function onLogout (user) {
 log.info('StarterBot', '%s logout', user)
}

function scrapeTitles_promise(url) {
    return new Promise((resolve, reject) => {
      request(url, (error, response, html) => {
        if (!error && response.statusCode == 200) {
          const $ = cheerio.load(html);
          const titles = [];
        
          $('p').each((i, element) => {
            const title = $(element).text();
            titles.push(title);
          });
  
          resolve(titles);
        } else {
          reject(error);
        }
      });
    });
  }

async function scrapeTitles(url) {
    return await scrapeTitles_promise(url);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var isDown = true;

async function generateResponse(prompt) {
    // send prompt in chatgpt

    robot.moveMouse(389, 630)
    robot.mouseClick()

    clipboardy.write(prompt)

    await sleep(1000);

    robot.keyToggle("control", "down")
    robot.keyTap("v")
    robot.keyToggle("control", "up")
    await sleep(1000);

    robot.keyTap("enter")

    await sleep(20000);

    robot.moveMouse(670, 550)
    robot.mouseClick()


    await sleep(5000);

    robot.moveMouse(239, 55)
    robot.mouseClick()

    robot.keyToggle("control", "down")
    robot.keyTap("a")
    robot.keyToggle("control", "up")

    robot.keyToggle("control", "down")
    robot.keyTap("c")
    robot.keyToggle("control", "up")

    let static_chat_link = await clipboardy.read()

    let titles = await scrapeTitles(static_chat_link)

    return titles[titles.length - 1]
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
    respondToMessage(msg, true)
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

init()
const bot = WechatyBuilder.build({
 name: 'ding-dong-bot',
 /**
  * How to set Wechaty Puppet Provider:
  *
  *  1. Specify a `puppet` option when instantiating Wechaty. (like `{ puppet: 'wechaty-puppet-padlocal' }`, see below)
  *  1. Set the `WECHATY_PUPPET` environment variable to the puppet NPM module name. (like `wechaty-puppet-padlocal`)
  *
  * You can use the following providers:
  *  - wechaty-puppet-wechat (no token required)
  *  - wechaty-puppet-padlocal (token required)
  *  - wechaty-puppet-service (token required, see: <https://wechaty.js.org/docs/puppet-services>)
  *  - etc. see: <https://github.com/wechaty/wechaty-puppet/wiki/Directory>
  */
 puppet: 'wechaty-puppet-padlocal',
})

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.start()
 .then(() => log.info('StarterBot', 'Starter Bot Started.'))
 .catch(e => log.error('StarterBot', e))