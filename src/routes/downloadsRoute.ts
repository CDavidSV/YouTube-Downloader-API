import { Readable, Writable } from 'stream';
import router from './router';
import ytdl from 'ytdl-core';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'child_process'
import { ReadStream, createReadStream } from 'fs';

/**
 * Merges video and audio streams.
 * @param video Readable video stream
 * @param audio Readable audio stream
 * @param title Video Title
 * @returns merged video stream
 */
async function mergeAudioAndVideo(videoStream: Readable, audioStream: Readable, fileName: string): Promise<ReadStream> {
    return new Promise((resolve, reject) => {
        const ffmpegProcess = spawn(ffmpeg as string, [
        '-hwaccel', 'auto',
        '-i', `pipe:3`,
        '-i', `pipe:4`,
        '-map', '0:v',
        '-map', '1:a',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-crf', '17',
        '-preset', 'veryfast',
        '-f', 'mp4',
        `./src/downloads/${fileName}`
        ], {
            stdio: [
                'pipe', 'pipe', 'pipe', 'pipe', 'pipe',
            ],
        });

        // Pipe the video and audio streams into the ffmpeg process
        videoStream.pipe(ffmpegProcess.stdio[3] as Writable);
        audioStream.pipe(ffmpegProcess.stdio[4] as Writable);

        // When merging is completed.
        ffmpegProcess.on('close', () => {
            console.log("Merging Completed!");

            const mergedStream = createReadStream(`./src/downloads/${fileName}`);
            resolve(mergedStream);
        });
    });
}

router.post('/video', async (req, res) => {
    const { itag } = req.body;
    const { url } = req.body;
    if (!itag || !url) return res.status(400).send({ status: 'failed' });
    if (!ytdl.validateURL(url)) return res.status(400).send({ status: 'Invalid Url' });
    
    // Get info to download video.
    const info = await ytdl.getInfo(url);

    try {
        const format = ytdl.chooseFormat(info.formats, { quality: itag });
        const videoStream = ytdl.downloadFromInfo(info, { format: format, highWaterMark: 1 << 25 })

        if (!format.hasAudio) {
            const audioStream = ytdl(url, {filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 });
            const merged = await mergeAudioAndVideo(videoStream, audioStream, 'test.mp4');
            merged.pipe(res);
        } else {
            videoStream.pipe(res);
        }
    } catch (err) {
        console.log(err);
        res.status(400).send({ status: 'failed' });
    }
});

router.post('/audio', async (req, res) => {
    const { itag } = req.body;
    const { url } = req.body;
    if (!itag || !url) return res.status(400).send({ status: 'failed' });
    if (!ytdl.validateURL(url)) return res.status(400).send({ status: 'Invalid Url' });

    // Get info to download video.
    const info = await ytdl.getInfo(url);

    try {
        const format = ytdl.chooseFormat(info.formats, {filter: 'audio', quality: itag });
        const audioStream = ytdl.downloadFromInfo(info, { format: format, highWaterMark: 1 << 25 })
        
        res.set({
            'Content-Disposition': `attachment; filename="audio.mp3"`,
            'Content-Type': 'audio/mpeg',
        });
        audioStream.pipe(res);
    } catch (err) {
        console.log(err);
        res.status(400).send({ status: 'failed' });
    }
});

export default router;