import CommandManager from '../command/command_manager.js'
import ChatGPT from '../ai/chatgpt.js'
import * as PUPPET from 'wechaty-puppet'
import { recognize_text } from '../utils/image_converter.js'
import { decode_silk, transcribe_audio } from '../utils/utils.js'
import Client from "../bot.js"

const AUTOMATIC_MESSAGE = "[自动回复]\n你好！很抱歉的告诉你，我目前处于待机模式，所以暂时帮助不了你哦！ 请稍后再试。\n\n[Automatic Message]\nHello there! I'm sorry to inform you that I am currently not running at the moment. Please try again later"

export default class ChatManager {

    static instance = null;

    static getInstance() {
        if (this.instance == null)
            this.instance = new ChatManager()

        return this.instance;
    }

    audio_language = 'zh'
    conversation_ids = { }

    async handleMessage(message) {
        if (message.type() == PUPPET.types.Message.Recalled)
            return;
        
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
        let from_id = this.getIdFromMessage(message);

        const fileBox = await message.toFileBox()
        const fileExtension = fileBox.name.split('.').pop();

        // let image_path = `res/file_${message.talker().id}.${fileExtension}`
        let image_path = `res/user_sent_file.${fileExtension}`

        await fileBox.toFile(image_path, true)
        console.log(`File saved to ${image_path}`);

        if  (message.type() == PUPPET.types.Message.Image) {
            let text = await recognize_text(image_path)
            let response = await ChatGPT.getInstance().generateResponse(text, this.conversation_ids[from_id])
            this.conversation_ids[from_id] = response.id

            console.log(`text recognized: ${text}`)

            await message.say(response.text);
            return;
        } else if (message.type() == PUPPET.types.Message.Audio) {
            await decode_silk("C:/Users/micha/Documents/vsc/workspace/paimon/res/user_sent_file.sil")
            
            let transcript = await transcribe_audio("C:/Users/micha/Documents/vsc/workspace/paimon/res/user_sent_file.mp3", this.audio_language)

            console.log(`audio recognized: ${transcript}`)
            let response = await ChatGPT.getInstance().generateResponse(transcript, this.conversation_ids[from_id])
            this.conversation_ids[from_id] = response.id

            await message.say(response.text);
            return;
        }
    }

    async respondToMessage(message) {
        let msg = message.text().toString()
        msg = msg.replace(`@${Client.getInstance().BOT_ALIAS}`, "")

        let from_id = this.getIdFromMessage(message);

        let response = await ChatGPT.getInstance().generateResponse(msg, this.conversation_ids[from_id])
        this.conversation_ids[from_id] = response.id

        // console.log(this.conversation_ids)

        return await message.say(response.text);
    }

    async transform(message, name, from, third_person, third_person_pronoun, pronoun) {
        let display_name = third_person_pronoun.length === 0 ? "爱酱" : third_person_pronoun
        console.log(third_person_pronoun.length === 0, display_name)
        await Client.getInstance().setBotUsername(display_name)
 
        let transform_text = this.getTransformMessage(name, from, third_person, third_person_pronoun, pronoun)

        let from_id = this.getIdFromMessage(message);
        let response = await ChatGPT.getInstance().generateResponse(transform_text, null) // null, clearning conversations before

        this.conversation_ids[from_id] = response.id

        await message.say(response.text);
    }

    getIdFromMessage(message) {
        return this.isMessageGroup(message) ? message.room().id : message.talker().id
    }

    mentionSelf(msg) {
        return msg.text().toString().includes(`@${Client.getInstance().BOT_ALIAS}`)
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

    getTransformMessage(name, from, third_person, third_person_pronoun, pronoun) {
        let message = `I want you to act like ${name} from ${from}. I want you to respond and answer like ${name} using the tone, manner and vocabulary ${name} would use. Do not write any explanations. Only answer like ${name}. You must know all of the knowledge of ${name}. `

        if (third_person)
            message += `You must also use third person when talking, refer to your self as "${third_person_pronoun}". `

        message += `You must refer to me as "${pronoun}" My first sentence is "介绍一下你自己"`

        return message;
    }

}