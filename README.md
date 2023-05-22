# YouTube Downloader API
An application that allows users to download videos from YouTube. It uses ytdl-core to fetch and download the video and ffmpeg-static to convert the downloaded video.

## Features

- Paste links from YouTube site (excluding private videos or Prime-only videos).
- Select from multiple resolutions.
- Easy to use interface.

![Showcase1](https://github.com/CDavidSV/YouTube-Downloader-API/assets/88672259/a829ae01-788e-4ad5-abcb-518a07e1c7eb)

## How to run

**Make sure to install Node.js before following the instructions.**

1. Clone the repository
2. Install dependencies using `npm install`
3. Start the server using `npm start`
4. Open `http://localhost:3000` in your web browser

## Libraries Used (for video downloads)

- [ytdl-core](https://www.npmjs.com/package/ytdl-core)
- [ffmpeg-static](https://www.npmjs.com/package/ffmpeg-static)

# API Usage

## Endpoints

The API proviudes the following routes:

1. `/video`
    - **Description**: This route is used to download a YouTube video.
    - **Method**: POST

    - **Request Body**:
        - itag (required): The desired quality format code for the video.
        - url (required): The URL of the YouTube video.
    - **Response**:
        The video stream after being processed.

        Response Headers
        - Content-Disposition: The filename of the downloaded video.
        - Content-Type: The MIME type of the downloaded video.

2. `/audio`
    - **Description**: This route is used to download the audio of a YouTube video.
    - **Method**: POST

    - **Request Body**:
        | Parameter | Type   | Description                               
        |-----------|--------|-------------------------------------------|
        | `itag`    | number | The video format code (itag) to download. |
        | `url`     | string | The YouTube video URL to download.        |                     
    - **Response**:
        The audio stream after being processed.

        Response Headers
        - Content-Disposition: The filename of the downloaded audio.
        - Content-Type: The MIME type of the downloaded audio.

3. `/search`
    - **Description**: This route is used to search for video data on YouTube based on a provided URL.
    - **Method**: GET

    Query Parameters
    | Parameter | Type   | Description                          |
    |-----------|--------|--------------------------------------|
    | `url`     | number | The YouTube video URL to search for. |

    - **Response**:
    The response of this endpoint provides detailed information about the video retrieved from the provided URL.

    Response Body
    The response body contains the following properties:
    | Property         | Type             | Description                                                                   |
    |------------------|------------------|-------------------------------------------------------------------------------|
    | `title`          | string           | The title of the YouTube video.                                               |
    | `author`         | string           | The name of the video author.                                                 |
    | `authorUrl`      | string           | The URL of the video author's channel.                                        |
    | `duration`       | string           | The duration of the video in the format HH:MM:SS.                             |
    | `thumbnail`      | string           | The URL of the thumbnail image for the video.                                 |
    | `videoContainer` | Array of objects | An array containing information about the available video containers/formats. |
    | `audioContainer` | Array of objects | An array containing information about the available audio containers/formats. |
    | `url`            | string           | The URL of the video that was searched.                                       |

    Each object in the videoContainer array contains the following properties:

    | Property       | Type    | Description                            |
    |----------------|---------|----------------------------------------|
    | `resolution`   | string  | The resolution of the video.           |
    | `format`       | string  | The format of the video container.     |
    | `mime`         | string  | The MIME type of the video container.  |
    | `bitrate`      | number  | The bitrate of the video.              |
    | `hasAudio`     | boolean | Indicates whether the video has audio. |
    | `audioBitrate` | number  | The bitrate of the video's audio.      |
    | `fps`          | number  | The frames per second of the video.    |
    | `itag`         | number  | The video format code (itag).          |
    | `size`         | string  | The size of the video container.       |

    Each object in the audioContainer array contains the following properties:

    | Property  | Type   | Description                        |
    |-----------|--------|------------------------------------|
    | `bitrate` | number | The bitrate of the audio.          |
    | `format`  | string | The format of the audio container. |
    | `itag`    | number | The audio format code (itag).      |
    | `codec`   | string | The audio codec used.              |
    | `size`    | string | The size of the audio container.   |

## Disclaimer 

This application was made purely for educational purposes and is not intended for use in downloading copyrighted material. Please note that using this application to download videos from YouTube may violate the terms of service for the website and may be considered copyright infringement. It is the user's responsibility to ensure that they are not breaking any laws or terms of service by using this application. I do not endorse or condone the unauthorized downloading of copyrighted material and cannot be held responsible for any legal consequences that may arise as a result of using this application. By using this application, you acknowledge that you understand and accept these risks and agree to use the application at your own discretion.
