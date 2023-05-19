import { url } from 'inspector';
import router from './router';
import ytdl from 'ytdl-core';
import { query } from 'express';

type videoData = {resolution: string, format: string, mime: string | undefined, bitrate: number | undefined, hasAudio: boolean, audioBitrate: number | undefined, fps: number | undefined, itag: number, size: string};
type audioData = {bitrate: number, format: string, itag: number, codec: string | undefined, size: string};
type videoResult = {title: string, author: string, authorUrl: string, duration: string, thumbnail: string, videoContainer: videoData[], audioContainer: audioData[]}

/**
 * Converts seconds to a valid HH:MM:SS time format.
 * @param timestamp time value in seconds.
 */
function convertTime(timestamp: number) {
    const hours = Math.floor(timestamp / 3600);
    const minutes = Math.floor(timestamp / 60 % 60);
    const seconds = Math.floor(timestamp % 60);

    let timeStr = '';

    if (hours > 0) {
        timeStr += `${hours}:`;
    } else {
        timeStr += `00:`;
    }

    if (minutes < 10) {
        timeStr += `0${minutes}:`
    } else {
        timeStr += `${minutes}:`
    }

    if (seconds < 10) {
        timeStr += `0${seconds}`
    } else {
        timeStr += `${seconds}`
    }

    return timeStr;
}

router.get('/search', async (req, res) => {
    const queryUrl: any = req.query.url;
    if (!queryUrl) return res.status(400).send({ status: 'failed', title: 'No Url' });
    if (!ytdl.validateURL(queryUrl)) return res.status(400).send({ status: 'failed', title: 'Invalid Url' });

    console.log(`[${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).replace(/,/g, '')}] Request for video data received`.yellow);

    // Search for the corresponding yt video.
    let info;
    try {
       info = await ytdl.getInfo(queryUrl);
    } catch {
        console.log(`[${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).replace(/,/g, '')}] Request for video data failed`.red);
        return;
    }
     
    const videoWithAudio = ytdl.filterFormats(info.formats, 'video');
    const audioOnly = ytdl.filterFormats(info.formats, 'audioonly');

    // Check if the video is live.
    if (info.videoDetails.isLiveContent) {
        return res.status(400).send({ status: 'failed', title: 'Invalid Url' });
    }

    // Generate the response.
    const result = {
        title: info.videoDetails.title,
        author: info.videoDetails.author.name,
        authorUrl: info.videoDetails.author.channel_url,
        duration: convertTime(parseInt(info.videoDetails.lengthSeconds) - 1),
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        videoContainer: [],
        audioContainer: [],
        url: queryUrl
    } as videoResult

    // Get data for audio and video streams as well as for audio only streams.
    const videoContainer: videoData[] = [];
    const audioContainer: audioData[] = [];
    for (let video of videoWithAudio) {
        let audio: boolean = video.hasAudio;
        if (!video.contentLength) continue;
        if (video.container === 'mp4') {
            audio = true;
        }

        videoContainer.push({ resolution: video.qualityLabel, format: video.container, mime: video.mimeType, bitrate: video.bitrate, hasAudio: audio, audioBitrate: video.audioBitrate, fps: video.fps, itag: video.itag, size: video.contentLength})
    }
    for (let audio of audioOnly) {
        if (!audio.contentLength) continue;
        if (audio.audioBitrate) {
            audioContainer.push({bitrate: audio.audioBitrate, format: 'mp3', itag: audio.itag, codec: audio.audioCodec, size: audio.contentLength})
        }
    }

    // Sort video array based on quality and audio array based on bitrate, then add to the result object.
    videoContainer.sort((obj1, obj2) => parseInt(obj2.resolution) - parseInt(obj1.resolution));
    audioContainer.sort((obj1, obj2) => obj2.bitrate - obj1.bitrate);
    result.videoContainer = videoContainer;
    result.audioContainer = audioContainer;

    // Convert to json and send.
    const jsonString = JSON.stringify(result);
    res.send(jsonString);
});
  
export default router;