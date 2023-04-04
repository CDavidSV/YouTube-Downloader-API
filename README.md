# YouTube Downloader API
An application that allows users to download videos from YouTube. It uses ytdl-core to fetch and download the video and ffmpeg-static to convert the downloaded video.

## Features

- Paste links from YouTube site (excluding private videos or Prime-only videos).
- Select from multiple resolutions.
- Easy to use interface.

![Showcase]()

## How to run

**Make sure to install Node.js before following the instructions.**

1. Clone the repository
2. Install dependencies using `npm install`
3. Start the server using `ts-node ./src/index.ts `
4. Open `http://localhost:3000` in your web browser

## Libraries Used

- [ytdl-core](https://www.npmjs.com/package/ytdl-core) 
- [open](https://www.npmjs.com/package/open) 
- [ffmpeg-static](https://www.npmjs.com/package/ffmpeg-static) 
- [express](https://www.npmjs.com/package/express) 

## Disclaimer 

This application was made purely for educational purposes and is not intended for use in downloading copyrighted material. Please note that using this application to download videos from YouTube may violate the terms of service for the website and may be considered copyright infringement. It is the user's responsibility to ensure that they are not breaking any laws or terms of service by using this application. I do not endorse or condone the unauthorized downloading of copyrighted material and cannot be held responsible for any legal consequences that may arise as a result of using this application. By using this application, you acknowledge that you understand and accept these risks and agree to use the application at your own discretion.
