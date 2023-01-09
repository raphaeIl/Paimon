cd C:\Users\micha\Documents\vsc\workspace\paimon
CALL pm2 delete all set WECHATY_PUPPET=wechaty-puppet-padlocal
CALL set WECHATY_PUPPET_PADLOCAL_TOKEN=your_puppet_padlocal_token
CALL pm2 start bot.js --log
CALL pm2 logs bot --lines 20
cmd /k