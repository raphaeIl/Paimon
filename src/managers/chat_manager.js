import CommandManager from '../command/command_manager.js'
import ChatGPT from '../ai/chatgpt.js'
import * as PUPPET from 'wechaty-puppet'
import { recognize_text } from '../utils/image_converter.js'
import { decode_silk, transcribe_audio } from '../utils/utils.js'

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

    audio_language = 'zh'

    async handleMessage(message) {
        // console.log(message)

        if (message.self()) // message sent by self will be ignored
            return;
        
        if (message.talker().id == 'weixin') // ignored messages by WeChat Team
            return;

        if (this.isCommand(message)) { // handle command
            CommandManager.getInstance().invoke(message)
            return;
        }

        if (this.isMessageFile(message)) {
            this.handleMessageFile(message)
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

    async handleMessageFile(message) {
        console.log("hi")
        const fileBox = await message.toFileBox()
        const fileExtension = fileBox.name.split('.').pop();

        // let image_path = `res/file_${message.talker().id}.${fileExtension}`
        let image_path = `res/user_sent_file.${fileExtension}`

        await fileBox.toFile(image_path, true)
        console.log(`File saved to ${image_path}`);

        if  (message.type() == PUPPET.types.Message.Image) {
            let text = await recognize_text(image_path)
            let response = await ChatGPT.getInstance().generateResponse(text)

            console.log(`text recognized: ${text}`)

            await message.say(response);
            return;
        } else if (message.type() == PUPPET.types.Message.Audio) {
            await decode_silk("C:/Users/micha/Documents/vsc/workspace/paimon/res/user_sent_file.sil")
            
            let transcript = await transcribe_audio("C:/Users/micha/Documents/vsc/workspace/paimon/res/user_sent_file.mp3", this.audio_language)

            console.log(`audio recognized: ${transcript}`)
            let response = await ChatGPT.getInstance().generateResponse(transcript)

            await message.say(response);
            return;
        }
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

    isMessageFile(msg) {
        const fileTypeList = [
            PUPPET.types.Message.Attachment,
            PUPPET.types.Message.Audio,
            PUPPET.types.Message.Image,
            PUPPET.types.Message.Video,
          ]

        return fileTypeList.includes(msg.type())
    }

    isMessageGroup(msg) {
        return msg.room() != null
    }

    isCommand(msg) {
        return msg.text().charAt(0) == '!'
    }

}