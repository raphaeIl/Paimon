export default class Command {

    label = null
    aliases = null
    description = null
    usage = null;
    hint = null
    commandExecutor = null;

    constructor(label, aliases, description, usage, hint, commandExecutor) {
        this.label = label
        this.aliases = aliases
        this.description = description
        this.usage = usage
        this.hint = hint
        this.commandExecutor = commandExecutor
    }


}