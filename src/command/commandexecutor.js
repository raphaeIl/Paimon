export default class CommandExecutor {

    async executeCommand(command, message, label, args) {
        if (command.hint != "")
            await message.say(command.hint)
    }

}