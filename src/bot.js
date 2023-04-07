import 'dotenv/config.js'

import { WechatyBuilder, ScanStatus, log } from 'wechaty'
import qrcodeTerminal from 'qrcode-terminal'
import ChatManager from './managers/chat_manager.js';
import Config from './managers/config.js';

export default class Client {

  BOT_ID = 'wxid_gi9kwdricxbf12'
  BOT_ALIAS = '爱酱'

  static instance = null;

  static getInstance() {
      if (this.instance == null)
          this.instance = new Client()

      return this.instance;
  }

  self = null;

  async start() {
    await Config.init();

    const bot = WechatyBuilder.build({
      name: 'Paimon',
      puppet: 'wechaty-puppet-padlocal',  
    })
    
    bot.on('scan',    this.onScan)
    bot.on('login', (user) => this.onLogin(user))
    
    bot.on('logout',  this.onLogout)
    bot.on('message', this.onMessage)
    
    bot.start().then(async () => { 
      log.info('Paimon', 'Paimon Started.')
    })
    
  }

  onScan (qrcode, status) {
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
  
  async onLogin (user) {
    log.info('%s login', user)

    console.log(`user ${user} login`)
    this.self = user

    await this.setBotUsername(this.BOT_ALIAS)

   // try {
   //   // const fileBox = FileBox.fromUrl('https://wechaty.github.io/wechaty/images/bot-qr-code.png')
   //   // console.log(fileBox)
   //   await user.avatar("https://wechaty.github.io/wechaty/images/bot-qr-code.png")
   // } catch (e) {
   //   console.error('change avatar failed', e)
   // }
  }
  
  onLogout (user) {
   log.info('Paimon', '%s logout', user)
  }

  async onMessage(msg) {
    await ChatManager.getInstance().handleMessage(msg)
  }

  async setBotUsername(username) {
    try {
      await this.self.name(username)
      console.log("sucessfully set bot username: " + username)
      this.BOT_ALIAS = username
    } catch (e) {
      console.error('change name failed', e)
    }
  }
}

async function main() {
  let bot = Client.getInstance();

  await bot.start()
}

main()




