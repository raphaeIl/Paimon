import CommandExecutor from "../commandexecutor.js";
import { FileBox }  from 'file-box'
import { download_yt_video, download_bilibili_video } from '../../utils/video_downloader.js'

export default class VideoCommand extends CommandExecutor {
    async executeCommand(command, message, label, args) {
      super.executeCommand(command, message, label, args);

        console.log("VideoCommand")

        if (args.includes("youtube")) {
            download_yt_video(args, async () => {
                console.log(args)

                const fileBox = FileBox.fromFile("C:/Users/micha/Documents/vsc/workspace/paimon/res/video.mp4")

                await message.say(fileBox)
            })
            return;
        }

        download_bilibili_video(args, async () => {
            console.log(args)

            const fileBox = FileBox.fromFile("C:/Users/micha/Documents/vsc/workspace/paimon/res/video.mp4")

            await message.say(fileBox)
        })
    }
}