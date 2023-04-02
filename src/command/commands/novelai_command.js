import CommandExecutor from "../commandexecutor.js";
import NovelAI from '../../ai/novelai.js'
import { FileBox }  from 'file-box'

export default class NovelAICommand extends CommandExecutor {
    async executeCommand(command, message, label, args) {
      super.executeCommand(command, message, label, args);

        console.log("NovelAICommand")

        let image_link = await NovelAI.getInstance().generateImage(args)
        const fileBox = FileBox.fromUrl(image_link)


        console.log(image_link)
        await message.say(fileBox)
    }
}