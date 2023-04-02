import CommandExecutor from "../commandexecutor.js";

export default class GitHubCommand extends CommandExecutor {
    async executeCommand(command, message, label, args) {
        super.executeCommand(command, message, label, args);

        await message.say("Github Link for this Project (Unfinished, feel free to give suggestion or help me (⋟﹏⋞)): \nhttps://github.com/raphaeIl/Paimon")

        console.log("GitHubCommand")
    }
}