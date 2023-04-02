import CommandExecutor from "../commandexecutor.js";
import { FileBox }  from 'file-box'
import Dalle from '../../ai/dalle.js'

export default class DalleCommand extends CommandExecutor {
    async executeCommand(command, message, label, args) {
        super.executeCommand(command, message, label, args);
        
        console.log("DalleCommand")
        console.log(args)

        let image_link = await Dalle.getInstance().generateImage(args)
        const fileBox = FileBox.fromUrl(image_link)
            
        console.log(image_link)
        
        await message.say(fileBox)
    }
}