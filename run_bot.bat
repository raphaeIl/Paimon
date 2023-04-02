cd C:\Users\micha\Documents\vsc\workspace\paimon
CALL pm2 delete all set WECHATY_PUPPET=wechaty-puppet-padlocal
CALL set WECHATY_PUPPET_PADLOCAL_TOKEN=puppet_padlocal_fadabe64ca6a4175bdddf435498075da
CALL pm2 start src/bot.js --log
CALL pm2 logs bot --lines 20
cmd /k