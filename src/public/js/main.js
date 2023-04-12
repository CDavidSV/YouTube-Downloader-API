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
let searchTimeout;
let searchAllowed = true;
let selectedTab = 'video';

// Events

// Functions
function clearSearchTimeout() {
    searchAllowed = true;
    searchBtn.classList.remove('disabled');
}

function clearBtn() {
    linkInput.value = "";
}

// fills the data for the video from the api.
function fillVideoData(data) {
    videoData.parentElement.parentElement.classList.remove('disabled'); // Sho data div. 
    videoData.previousElementSibling.src = data.thumbnail;
    videoData.children[0].innerText = data.title;
    videoData.children[1].innerText = data.author;
    videoData.children[2].innerText = data.duration;
    loaders[0].classList.add('disabled'); // Hide loader.

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
        download.appendChild(btn);
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
        download.appendChild(btn);
    });
}

function selectTab(e) {
    btns.forEach((btn) => {
        btn.classList.remove('selected');
        e.srcElement.classList.add('selected');
    });

    if (selectedTab === 'video') {
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

    videoData.parentElement.classList.add('disabled');

    // Verify link
    const ytRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g;
    if (!ytRegex.test(linkInput.value)) {
        errorMsg.innerText = 'Error: Invalid URL';
        linkInput.classList.add('active');
        return;
    }

    // Clear any error, update style classes, set the cooldown.
    errorMsg.innerText = '';
    linkInput.classList.remove('active');
    searchBtn.classList.add('disabled');
    loaders[0].classList.remove('disabled');
    searchAllowed = false;
    searchTimeout = setTimeout(clearSearchTimeout, 5000);

    // Make a request to search for the video.
    fetch(`${apiUrl}/search?url=${linkInput.value}`).then(response => response.json())
    .then(data => fillVideoData(data))
    .catch((error) => errorMsg.innerText = 'Error: An error ocurred on our side, please try again later.' + error);
}