import CommandExecutor from "../commandexecutor.js";
import CommandManager from '../command_manager.js'

export default class HelpCommand extends CommandExecutor {
    async executeCommand(command, message, label, args) {
        super.executeCommand(command, message, label, args);

        const commands = CommandManager.getInstance().commands;
        let displayString = "--------------------Help--------------------\n"


        for (let i = 0; i < commands.length; i++) {
            let cmd = commands[i]

            displayString += `!${cmd.label} [${cmd.aliases.join(', ')}] Usage: ${cmd.usage} - ${cmd.description}\n\n`
        }

        displayString = displayString.trim().replace(/\n$/, '');

        await message.say(displayString);
    }
}