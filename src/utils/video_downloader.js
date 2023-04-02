import ytdl from 'ytdl-core'
import fs from 'fs'
import { download } from 'bilibili-save-nodejs'


const filePath = 'C:/Users/micha/Documents/vsc/workspace/paimon/res/video.mp4';

export async function download_yt_video(video_url, onFinish) {
    const file = fs.createWriteStream(filePath);

    await ytdl(video_url, { filter: format => format.container === 'mp4' })
        .pipe(file)
        .on('finish', function() {
            console.log('Video downloaded successfully!');
            onFinish()
        })
        .on('error', function(error) {
            console.error(error);
        });
}

export async function download_bilibili_video(video_url, onFinish) {
    const filePath = 'C:/Users/micha/Documents/vsc/workspace/paimon/res/';

    
    if (fs.existsSync('C:/Users/micha/Documents/vsc/workspace/paimon/res/video.mp4')) {
        fs.unlink('C:/Users/micha/Documents/vsc/workspace/paimon/res/video.mp4', (err) => {
            if (err) throw err;
            console.log('File deleted successfully!');
        });
    }

    download({
        downloadRange: "byVedio",
        downloadType: "mp4",
        downloadPath: video_url,
        downloadFolder: filePath
    })
    .then(() => {
        console.log("Download sucessful!")
        onFinish()
    })
    .catch((e) => console.log("error"));
}


