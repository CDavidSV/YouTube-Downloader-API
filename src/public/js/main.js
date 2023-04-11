// Dom Variables
const linkInput = document.querySelector('#link');
const form = document.querySelector('#search-form');
const errorMsg = document.querySelector('#error');
const searchBtn = document.querySelector('#submit-button');
const loaders = document.querySelectorAll('#loader');
const videoData = document.querySelector('.video-metadata');

// Other Variables
const apiUrl = 'http://localhost:3000';
let searchTimeout;
let searchAllowed = true; 

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
    videoData.parentElement.classList.remove('disabled'); // Sho data div. 
    videoData.previousElementSibling.src = data.thumbnail;
    videoData.children[0].innerText = data.title;
    videoData.children[1].innerText = data.author;
    videoData.children[2].innerText = data.duration;
    loaders[0].classList.add('disabled'); // Hide loader.
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