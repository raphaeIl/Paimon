import ChatManager from "../../managers/chat_manager.js";
import CommandExecutor from "../commandexecutor.js";

export default class TransformCommand extends CommandExecutor {
    async executeCommand(command, message, label, args) {
        super.executeCommand(command, message, label, args);
        args = args.split(' ')
        
        console.log(args)
        const name = args[0]
        const from = args[1]
        const third_person = args[2] == 'true'
        const third_person_pronoun = args[3]
        const pronoun = args[4]

        console.log("TransformCommand")

        await ChatManager.getInstance().transform(message, name, from, third_person, third_person_pronoun, pronoun);
        
        console.log("transformed")
    }
}