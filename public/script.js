const socket = io('/')
var listOfParticipents = [];
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
})
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId, name) => {
            let obj = { "name": name, "id": userId }
            listOfParticipents.push(obj);

            connectToNewUser(userId, stream)
            $("ul").append(`<li class="message"><a>${name} Entered Hall.</a></li>`);
            scrollToBottom()
        })
        // input value
    let text = $("input");
    // when press enter send message
    $('html').keydown(function(e) {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val(), NAME);
            text.val('')
        }
    });
    socket.on("createMessage", (message, name) => {
        $("ul").append(`<li class="message"><b>${name}</b><br/>${message}</li>`);
        scrollToBottom()
    })
})

socket.on('user-disconnected', (userId, name) => {

    for (var i = 0; i < listOfParticipents.length; i++) {
        if (listOfParticipents[i].id === userId) {
            listOfParticipents.splice(i, 1);

        }
    }


    $("ul").append(`<li class="message"><a>${name} Left the Hall.</a></li>`);
    scrollToBottom()
    if (peers[userId]) {
        const fakeImages = document.querySelectorAll("video");
        for (var i = 0; i < fakeImages.length; i++) {

            var myobj = document.getElementById(fakeImages[i].id);

        }
        peers[userId].close()
    }
})

myPeer.on('open', id => {

    socket.emit('join-room', ROOM_ID, id, NAME)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    var video = document.createElement('video')

    video.id = userId;
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })



    //video.append(intro);
    videoGrid.append(video)
}



const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;

    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}