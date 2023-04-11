import { Readable, Writable } from 'stream';
import router from './router';
import ytdl from 'ytdl-core';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'child_process';
import { ReadStream, createReadStream, unlinkSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
import fluent from 'fluent-ffmpeg';
fluent.setFfmpegPath(ffmpegPath);

/**
 * Merges video and audio streams.
 * @param videoStream Readable video stream
 * @param audioStream Readable audio stream
 * @returns merged video and audio stream
 */
async function mergeAudioAndVideo(videoStream: Readable, audioStream: Readable): Promise<ReadStream> {
    return new Promise((resolve, reject) => {
        const tempFileName = uuidv4();
        
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
        `./src/downloads/${tempFileName}.mp4`
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

            const mergedStream = createReadStream(`./src/downloads/${tempFileName}.mp4`).on('close', () => {
                unlinkSync(`./src/downloads/${tempFileName}.mp4`);
            });
            resolve(mergedStream);
        });
    });
}

/**
 * @param audioStream Readable audio stream
 * @returns converted audio stream
 */
async function convertAudioStream(audioStream: Readable, bitrate: number, durationSec: number): Promise<ReadStream> {
    return new Promise((resolve, reject) => {
        const tempFileName = uuidv4();
        
        const ffmpegProcess = spawn(ffmpeg as string, [
            '-i', `pipe:3`,
            '-b:a', `${bitrate}k`,
            '-f', 'mp3',
            `./src/downloads/${tempFileName}.mp3`
        ], {
            stdio: [
                'pipe', 'pipe', 'pipe', 'pipe',
            ],
        });

        // Pipe the audio stream into the ffmpeg process
        audioStream.pipe(ffmpegProcess.stdio[3] as Writable);

        // When conversion is completed.
        ffmpegProcess.on('close', () => {
            console.log("Conversion Completed!");

            const mergedStream = createReadStream(`./src/downloads/${tempFileName}.mp3`).on('close', () => {
                unlinkSync(`./src/downloads/${tempFileName}.mp3`);
            });
            resolve(mergedStream);
        });
    });
}

// Processes a videos name and removes any special non allowed characters.
function verifyName(fileName: string) {
    fileName = fileName.replace(/[\:\*\?"<>\|]/g, '-');
    fileName = fileName.replace(/[\/\\]/g, '_');

    return encodeURIComponent(fileName);
}

// Shows the percentage completed for the current operation.
function progressBar(progress: number) {
    let progressBar: string = 'Downloading Video: \n [';

    const total = 60;
    for (let i = 0; i < total; i++) {
        if (i < progress * total / 100) {
            progressBar += '▮';
        } else {
            progressBar += ' ';
        }
    }
    progressBar += `] ${progress}%`;

    return progressBar;
}

router.post('/video', async (req, res) => {
    const { itag } = req.body;
    const { url } = req.body;
    if (!itag || !url) return res.status(400).send({ status: 'failed' });
    if (!ytdl.validateURL(url)) return res.status(400).send({ status: 'Invalid Url' });
    
    // Get info to download video.
    const info = await ytdl.getInfo(url);
    let downloadProgress: number;

    try {
        const format = ytdl.chooseFormat(info.formats, { quality: itag });
        const videoStream = ytdl.downloadFromInfo(info, { filter: 'video', format: format, highWaterMark: 1 << 25 }).on('progress', (length, downloaded, totallength) => {
            // Calculate download progress.
            const downloadedProgress = Math.round(downloaded * 100 / totallength);
            if (downloadProgress !== downloadedProgress) {
                downloadProgress = downloadedProgress;
                console.clear();
                const completion = progressBar(downloadProgress);
                console.log(completion);
            };
        });

        res.header('Content-Disposition', `attachment; filename="${verifyName(info.videoDetails.title)}.${format.container}"`);
        // If its format is webm or it has no audio, then send the downloaded video without merging.
        if (!format.hasAudio || format.container !== 'webm') {
            const audioStream = ytdl(url, {filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 }); // Download audio for merge.
            const merged = await mergeAudioAndVideo(videoStream, audioStream); // merge the video and audio and send them.
            res.header('Content-Type', 'video/mp4');
            merged.pipe(res);
        } else {
            res.header('Content-Type', 'video/webm');
            videoStream.pipe(res);
        }
    } catch (err) {
        console.log(err)
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
    const tempFileName = uuidv4();
    let downloadProgress: number;

    try {
        const format = ytdl.chooseFormat(info.formats, { filter: 'audio', quality: itag });
        const audioStream = ytdl.downloadFromInfo(info, { format: format, highWaterMark: 1 << 25 })
        .on('progress', (length, downloaded, totallength) => {
            // Calculate download progress.
            const downloadedProgress = Math.round(downloaded * 100 / totallength);
            if (downloadProgress !== downloadedProgress) {
                downloadProgress = downloadedProgress;
                console.clear();
                const completion = progressBar(downloadProgress);
                console.log(completion);
            };
        });
        const convertedStream = await convertAudioStream(audioStream, format.audioBitrate!, parseInt(info.videoDetails.lengthSeconds));
        
        res.set({
            'Content-Disposition': `attachment; filename="${verifyName(info.videoDetails.title)}.${format.container}"`,
            'Content-Type': 'audio/mpeg',
        });
        convertedStream.pipe(res);

    } catch (err) {
        res.status(400).send({ status: 'failed' });
    }
});

export default router;