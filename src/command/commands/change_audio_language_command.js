import CommandExecutor from "../commandexecutor.js";
import ChatManager from "../../managers/chat_manager.js";

export default class ChangeAudioLanguage extends CommandExecutor {
    async executeCommand(command, message, label, args) {
        super.executeCommand(command, message, label, args);
        
        console.log("ChangeAudioLanguage")
        console.log(args)

        let lang = ''
        switch (args.toLowerCase()) {
            case 'chinese':
                lang = 'zh'
                break
            case 'english':
                lang = 'en-US'
                break
        }

        ChatManager.getInstance().audio_language = lang;

        await message.say(`Audio Language succesfully changed to: ${lang}`)
    }
}