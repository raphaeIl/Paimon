import Command from "./command.js";
import DalleCommand from './commands/dalle_command.js'
import DalleMiniCommand from './commands/dallemini_command.js'
import GitHubCommand from './commands/github_command.js'
import HelpCommand from './commands/help_command.js'
import NovelAICommand from './commands/novelai_command.js'

export default class CommandManager {

    static instance = null;

    static getInstance() {
        if (this.instance == null)
            this.instance = new CommandManager()

        return this.instance;
    }

    commands = null;

    constructor() {
        this.commands = []
        
        this.registerCommand("help", ['Help', 'h'], "Displays all the available commands and their information.", "!help", "", new HelpCommand())
        this.registerCommand("github", ['GitHub', 'gh', 'git'], "Link for this project's Github", "!github", "", new GitHubCommand())
        this.registerCommand("dalle", ['Dalle', 'd'], "Generates an image using DALL·E", "!dalle <prompt>", "Generating your image with DALL·E... (~30s)", new DalleCommand())
        this.registerCommand("dallemini", ['DalleMini', 'dm'], "Generates an image using DALL·E Mini", "!dallemini <prompt>", "Generating your image with DALL·E Mini... (~1-2min)", new DalleMiniCommand())
        this.registerCommand("novelai", ['NovelAI', 'na'], "Generates an image using NovelAI", "!novelai <prompt>", "Generating your image with NovelAI.....\n (~10s)", new NovelAICommand())
    }

    registerCommand(label, aliases, description, usage, hint, commandExecutor) {
        this.commands.push(new Command(label, aliases, description, usage, hint, commandExecutor))
    }

    invoke(message) {
        let msg = message.text().toString()
        let label = msg.slice(1).split(' ')[0];
        let args = msg.slice(label.length + 2);

        console.log(label)
        console.log(args)

        let handler = this.getExecutor(label)

        console.log(handler)

        if (handler == null)
            console.log(label + " is an invalid command!");

        let command = this.getCommand(label)

        handler.executeCommand(command, message, label, args)
    }

    getExecutor(label) {
        return this.getCommand(label).commandExecutor
    }

    getCommand(label) {
        for (let i = 0; i < this.commands.length; i++) {
            let cmd = this.commands[i]

            if (cmd.label == label || cmd.aliases.includes(label))
                return cmd
        }

        return null;
    }
}