import CommandExecutor from "../commandexecutor.js";
import ChatManager from "../../managers/chat_manager.js";

export default class ClearCommand extends CommandExecutor {
    async executeCommand(command, message, label, args) {
        super.executeCommand(command, message, label, args);
        let from_id = ChatManager.getInstance().getIdFromMessage(message);

        ChatManager.getInstance().conversation_ids[from_id] = null

        console.log("ClearCommand")
    }
}