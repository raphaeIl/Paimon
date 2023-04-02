import 'dotenv/config.js'

import { WechatyBuilder, ScanStatus, log } from 'wechaty'
import qrcodeTerminal from 'qrcode-terminal'
import ChatManager from './managers/chat_manager.js';
import Config from './managers/config.js';

class Client {

  async start() {
    await Config.init();

    const bot = WechatyBuilder.build({
      name: 'Paimon',
      puppet: 'wechaty-puppet-padlocal',  
    })
    
    bot.on('scan',    this.onScan)
    bot.on('login',   this.onLogin)
    bot.on('logout',  this.onLogout)
    bot.on('message', this.onMessage)
    
    bot.start().then(() => log.info('Paimon', 'Paimon Started.'))
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
  
  onLogin (user) {
   log.info('Paimon', '%s login', user)
  }
  
  onLogout (user) {
   log.info('Paimon', '%s logout', user)
  }

  async onMessage(msg) {
    await ChatManager.getInstance().handleMessage(msg)
  }
}


async function main() {
  let bot = new Client()

  await bot.start()
}

main()




