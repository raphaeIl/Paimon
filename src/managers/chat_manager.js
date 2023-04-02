import CommandManager from '../command/command_manager.js'
import ChatGPT from '../ai/chatgpt.js'

const BOT_ID = 'wxid_gi9kwdricxbf12'
const BOT_ALIAS = '爱酱'

const AUTOMATIC_MESSAGE = "[自动回复]\n你好！很抱歉的告诉你，我目前处于待机模式，所以暂时帮助不了你哦！ 请稍后再试。\n\n[Automatic Message]\nHello there! I'm sorry to inform you that I am currently not running at the moment. Please try again later"

export default class ChatManager {

    static instance = null;

    static getInstance() {
        if (this.instance == null)
            this.instance = new ChatManager()

        return this.instance;
    }

    async handleMessage(message) {
        if (message.self()) // message sent by self will be ignored
            return;
        
        if (message.talker().id == 'weixin')
            return;

        if (this.isCommand(message)) { // handle command
            CommandManager.getInstance().invoke(message)
            return;
        }
        
        if (this.isMessageGroup(message)) { // group messages handled differently
            await this.handleMessageGroup(message)
            return;
        }

        await this.respondToMessage(message) // chatgpt response
    }

    async handleMessageGroup(message) {
        if (this.mentionSelf(message))
            await this.respondToMessage(message)
    }      

    async respondToMessage(message) {
        let msg = message.text().toString()
        msg = msg.replace(`@${BOT_ALIAS}`, "")

        let response = await ChatGPT.getInstance().generateResponse(msg)

        return await message.say(response);
    }
    
    mentionSelf(msg) {
        return msg.text().toString().includes(`@${BOT_ALIAS}`)
    }

    isMessageGroup(msg) {
        return msg.room() != null
    }

    isCommand(msg) {
        return msg.text().charAt(0) == '!'
    }

}