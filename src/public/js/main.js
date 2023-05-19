// Dom Variables
const linkInput = document.querySelector('#link');
const form = document.querySelector('#search-form');
const errorMsg = document.querySelector('#error');
const searchBtn = document.querySelector('#submit-button');
const loaders = document.querySelectorAll('#loader');
const videoData = document.querySelector('.video-metadata');
const btns = document.querySelectorAll('.tab-btn');
const videoTable = document.querySelector('.video-table');
const audioTable = document.querySelector('.audio-table');

// Other Variables
const apiUrl = 'http://localhost:3000';
let videoUrl = "";
let searchTimeout;
let searchAllowed = true;
let selectedTab = 'video';
const btnMap = new Map();

// Events

// Functions
function clearSearchTimeout() {
    searchAllowed = true;
    searchBtn.classList.remove('disabled');
}

function clearBtn() {
    linkInput.value = "";
}

function clearTable(table) {
    for (var i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
    }
}

// fills the data for the video from the api.
function fillVideoData(data) {
    // Remove all rows from the tables except the header row.
    clearTable(videoTable);
    clearTable(audioTable);

    videoData.parentElement.parentElement.classList.remove('disabled'); // Sho data div. 
    videoData.previousElementSibling.src = data.thumbnail;
    videoData.children[0].innerText = data.title;
    videoData.children[0].href = data.url;
    videoData.children[1].innerText = data.author;
    videoData.children[1].href = data.authorUrl;
    videoData.children[2].innerText = data.duration;

    let btnCounter = 0;
    btnMap.clear();

    // Populate tables with the video and audio data.
    data.videoContainer.forEach(item => {
        let row = videoTable.insertRow();
        let resolution = row.insertCell(0);
        resolution.innerHTML = item.resolution;
        let format = row.insertCell(1);
        format.innerHTML = item.format;
        let size = row.insertCell(2);
        size.innerHTML = `${item.size / 1e+6 < 1 ? (item.size / 1e+6).toFixed(2) : Math.ceil(item.size / 1e+6)}mb`;
        let audio = row.insertCell(3);
        audio.innerHTML = item.hasAudio;

        // Add download button.
        let download = row.insertCell(4);
        const btn = document.createElement('button');
        btn.textContent = 'Download';
        btn.className = 'download-btn';
        btn.id = btnCounter;
        btn.setAttribute('onclick', 'downloadVideo(event)');
        download.appendChild(btn);
        btnMap.set(btnCounter, { onlyAudio: false, itag: item.itag});
        btnCounter++;
    });

    // Sames as before but for the audio table.
    data.audioContainer.forEach(item => {
        let row = audioTable.insertRow();
        let format = row.insertCell(0);
        format.innerHTML = item.format;
        let size = row.insertCell(1);
        size.innerHTML = `${item.size / 1e+6 < 1 ? (item.size / 1e+6).toFixed(2) : Math.ceil(item.size / 1e+6)}mb`;
        let audio = row.insertCell(2);
        audio.innerHTML = item.bitrate;
        let download = row.insertCell(3);
        const btn = document.createElement('button');
        btn.textContent = 'Download';
        btn.className = 'download-btn';
        btn.id = btnCounter;
        btn.setAttribute('onclick', 'downloadVideo(event)');
        download.appendChild(btn);
        btnMap.set(btnCounter, { onlyAudio: true, itag: item.itag});
        btnCounter++;
    });
}

function selectTab(e) {
    btns.forEach((btn) => {
        btn.classList.remove('selected');
        e.srcElement.classList.add('selected');
    });

    if (e.srcElement.id === "audio") {
        selectedTab = 'audio';
        videoTable.classList.add('disabled');
        audioTable.classList.remove('disabled');
    } else {
        selectedTab = 'video';
        audioTable.classList.add('disabled');
        videoTable.classList.remove('disabled');
    }
}

// Handles the search button.
function searchVideo(e) {
    e.preventDefault();
    if (!searchAllowed) return;

    videoData.parentElement.parentElement.classList.add('disabled');
    videoUrl = linkInput.value;

    // Verify link
    const ytRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g;
    if (!ytRegex.test(videoUrl)) {
        errorMsg.innerText = 'Error: Invalid URL';
        linkInput.classList.add('active');
        return;
    }

    // Clear any error, update style classes.
    errorMsg.innerText = '';
    linkInput.classList.remove('active');
    searchBtn.classList.add('disabled');
    loaders[0].classList.remove('disabled');
    searchAllowed = false;

    // Make a request to search for the video.
    fetch(`${apiUrl}/search?url=${videoUrl}`).then(response => response.json())
    .then(data => {
        fillVideoData(data);
        searchTimeout = setTimeout(clearSearchTimeout, 5000);
        loaders[0].classList.add('disabled'); // Hide loader.
    })
    .catch(() => errorMsg.innerText = 'Error: An error ocurred on our side, please try again later.');
}

// Handles the button clicked to download a video.
function downloadVideo(e) {
    const options = btnMap.get(parseInt(e.target.id));
    if (!options) return;

    // Data to send with the request.
    const data = {
        url: videoUrl,
        itag: options.itag
    };

    let downloadRoute = "";
    options.onlyAudio ? downloadRoute = 'audio' : downloadRoute = 'video';

    fetch(`${apiUrl}/${downloadRoute}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
    })
    .then(async (response) => {
        const filenameHeader = response.headers.get('Content-Disposition');

        // Extract the filename.
        const filename = filenameHeader.substring(filenameHeader.indexOf('filename="') + 'filename="'.length, filenameHeader.lastIndexOf('"'));
        const decodedFilename = decodeURIComponent(filename);

        return response.blob().then(blob => {
          // Create a temporary URL for the video blob.
          const videoUrl = URL.createObjectURL(blob);
          

    
          // Create a download link for the video.
          const download = document.createElement('a');
          download.href = videoUrl;
          download.download = decodedFilename;
    
          // Append the download link to the document body.
          document.body.appendChild(download);
    
          // Trigger the click event of the download link to start the download.
          download.click();
    
          // Clean up by removing the download link.
          document.body.removeChild(download);
        });
      })
    .catch((err) => {
        console.log(err);
    });
    return;
}