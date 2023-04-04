import router from './router';
import ytdl from 'ytdl-core';

type videoData = {resolution: string, format: string, mime: string | undefined, bitrate: number | undefined, audioBitrate: number | undefined, fps: number | undefined, itag: number, size: string};
type audioData = {bitrate: number | undefined, format: string, itag: number, codec: string | undefined, size: string};
type videoResult = {title: string, author: string, authorUrl: string, duration: string, thumbnail: string, videoContainer: videoData[], audioContainer: audioData[]}

router.get('/search', async (req, res) => {
    const queryUrl: any = req.query.url;
    if (!queryUrl) return res.status(400).send({ status: 'No url' });
    if (!ytdl.validateURL(queryUrl)) return res.status(400).send({ status: 'Invalid Url' });

    // Search for the corresponding yt video.
    const info = await ytdl.getInfo(queryUrl);
    const videoWithAudio = ytdl.filterFormats(info.formats, 'video');
    const audioOnly = ytdl.filterFormats(info.formats, 'audioonly');

    // Generate the response.
    const result = {
        title: info.videoDetails.title,
        author: info.videoDetails.author.name,
        authorUrl: info.videoDetails.author.channel_url,
        duration: info.videoDetails.lengthSeconds,
        thumbnail: info.videoDetails.thumbnails[0].url,
        videoContainer: [],
        audioContainer: []
    } as videoResult

    // Get data for audio and video streams as well as for audio only streams.
    const videoContainer: videoData[] = [];
    const audioContainer: audioData[] = [];
    for (let video of videoWithAudio) {
        videoContainer.push({ resolution: video.qualityLabel, format: video.container, mime: video.mimeType, bitrate: video.bitrate, audioBitrate: video.audioBitrate, fps: video.fps, itag: video.itag, size: video.contentLength})
    }
    for (let audio of audioOnly) {
        audioContainer.push({bitrate: audio.audioBitrate, format: audio.container, itag: audio.itag, codec: audio.audioCodec, size: audio.contentLength})
    }

    // Convert to json and send.
    result.videoContainer = videoContainer;
    result.audioContainer = audioContainer;
    const jsonString = JSON.stringify(result);
    res.send(jsonString);
});
  
export default router;