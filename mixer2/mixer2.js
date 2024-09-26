// Define the list of audio files (variable number of MP3s)
const audioFiles = [
    { name: "Track 1", src: "audio1.mp3" },
    { name: "Track 2", src: "audio2.mp3" },
    { name: "Track 3", src: "audio3.mp3" }
];

// Ensure compatibility with browsers' AudioContext
const AudioContext = window.AudioContext || window.webkitAudioContext;

const mixerContainer = document.getElementById('mixerContainer');
const audioElements = [];
const audioContexts = [];
const progressBars = [];
const volumeControls = [];
const panControls = [];
const muteButtons = [];
const playButtons = [];

// Create audio controls for each track
audioFiles.forEach((file, index) => {
    const mixerDiv = document.createElement('div');
    mixerDiv.classList.add('mixer');

    const title = document.createElement('h3');
    title.textContent = file.name;
    mixerDiv.appendChild(title);

    const audioElement = new Audio(file.src);
    audioElement.crossOrigin = "anonymous";
    audioElements.push(audioElement);

    // Create AudioContext for each track
    const audioContext = new AudioContext();
    const track = audioContext.createMediaElementSource(audioElement);
    const panNode = audioContext.createStereoPanner();
    track.connect(panNode).connect(audioContext.destination);
    audioContexts.push(audioContext);  // Store each AudioContext

    // Volume control
    const volumeControl = document.createElement('input');
    volumeControl.type = 'range';
    volumeControl.min = '0';
    volumeControl.max = '1';
    volumeControl.step = '0.01';
    volumeControl.value = audioElement.volume;
    volumeControl.addEventListener('input', () => {
        audioElement.volume = volumeControl.value;
    });
    volumeControls.push(volumeControl);

    const volumeGroup = document.createElement('div');
    volumeGroup.classList.add('control-group');
    volumeGroup.innerHTML = `<label>Volume</label>`;
    volumeGroup.appendChild(volumeControl);
    mixerDiv.appendChild(volumeGroup);

    // Pan control
    const panControl = document.createElement('input');
    panControl.type = 'range';
    panControl.min = '-1';
    panControl.max = '1';
    panControl.step = '0.01';
    panControl.value = 0;
    panControl.addEventListener('input', () => {
        panNode.pan.value = panControl.value;
    });
    panControls.push(panControl);

    const panGroup = document.createElement('div');
    panGroup.classList.add('control-group');
    panGroup.innerHTML = `<label>Pan</label>`;
    panGroup.appendChild(panControl);
    mixerDiv.appendChild(panGroup);

    // Mute button
    const muteButton = document.createElement('button');
    muteButton.textContent = 'Mute';
    muteButton.addEventListener('click', () => {
        audioElement.muted = !audioElement.muted;
        muteButton.textContent = audioElement.muted ? 'Unmute' : 'Mute';
    });
    muteButtons.push(muteButton);
    mixerDiv.appendChild(muteButton);

    // Play/Stop button for each track
    const playButton = document.createElement('button');
    playButton.textContent = 'Play';
    playButton.addEventListener('click', () => {
        audioContext.resume(); // Resume the audio context if necessary
        if (audioElement.paused) {
            audioElement.play();
            playButton.textContent = 'Stop';
        } else {
            audioElement.pause();
            playButton.textContent = 'Play';
        }
    });
    playButtons.push(playButton); // Store the button for toggling
    mixerDiv.appendChild(playButton);

    // Progress bar
    const progressContainer = document.createElement('div');
    progressContainer.classList.add('progress-container');

    const progressBar = document.createElement('div');
    progressBar.classList.add('progress');
    progressContainer.appendChild(progressBar);
    mixerDiv.appendChild(progressContainer);
    progressBars.push(progressBar);

    // Update progress bar as track plays
    audioElement.addEventListener('timeupdate', () => {
        if (audioElement.duration) {
            const progress = (audioElement.currentTime / audioElement.duration) * 100;
            progressBar.style.width = progress + '%';
        }
    });

    // Append mixer to container
    mixerContainer.appendChild(mixerDiv);
});

// Play/Stop All toggle
const playAllButton = document.getElementById('playAll');
let allPlaying = false;  // Track the state of all audio elements

playAllButton.addEventListener('click', () => {
    if (!allPlaying) {
        // Resume AudioContext and play all tracks
        audioContexts.forEach(audioContext => {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        });

        audioElements.forEach((audio, index) => {
            if (audio.paused) {
                audio.play();
                playButtons[index].textContent = 'Stop'; // Toggle individual play buttons to "Stop"
            }
        });

        playAllButton.textContent = 'Stop All';
        allPlaying = true;  // Update state to "playing"
    } else {
        // Pause all tracks
        audioElements.forEach((audio, index) => {
            audio.pause();
            playButtons[index].textContent = 'Play'; // Toggle individual play buttons back to "Play"
        });

        playAllButton.textContent = 'Play All';
        allPlaying = false;  // Update state to "paused"
    }
});

// Reset all tracks and controls
document.getElementById('resetAll').addEventListener('click', () => {
    audioElements.forEach((audio, index) => {
        audio.pause();
        audio.currentTime = 0;
        progressBars[index].style.width = '0';
        volumeControls[index].value = 0.5;
        audio.volume = 0.5;
        panControls[index].value = 0;
        audio.muted = false;
        muteButtons[index].textContent = 'Mute';
        playButtons[index].textContent = 'Play'; // Reset individual play buttons to "Play"
    });

    // Reset Play All button state
    playAllButton.textContent = 'Play All';
    allPlaying = false;
});

// Synchronize tracks
document.getElementById('syncTracks').addEventListener('click', () => {
    const masterTime = audioElements[0].currentTime; // Use first track as reference
    audioElements.forEach(audio => {
        audio.currentTime = masterTime;
    });
});
