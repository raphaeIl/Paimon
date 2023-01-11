cd C:\Users\micha\Documents\vsc\workspace\paimon
CALL pm2 delete all set WECHATY_PUPPET=wechaty-puppet-padlocal
CALL set WECHATY_PUPPET_PADLOCAL_TOKEN=puppet_padlocal_9750e9c780d549b1ad598a08081f2675
CALL pm2 start bot.js --log
CALL pm2 logs bot --lines 20
cmd /k