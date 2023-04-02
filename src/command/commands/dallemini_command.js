import CommandExecutor from "../commandexecutor.js";
import { FileBox }  from 'file-box'

import DalleMini from '../../ai/dallemini.js'

export default class DalleMiniCommand extends CommandExecutor {
    async executeCommand(command, message, label, args) {
        super.executeCommand(command, message, label, args);

        console.log("DalleMiniCommand")

        console.log("DalleCommand")
        console.log(args)

        let image_link = await DalleMini.getInstance().generateImage(args)
        const fileBox = FileBox.fromUrl(image_link)
            
        console.log(image_link)
        
        await message.say(fileBox)
    }
}