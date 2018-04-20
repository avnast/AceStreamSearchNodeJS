function play_video(infohash) {
    const div = document.getElementById(div_id);

    stop_playback();
    
    div.innerHTML = '';
    
    const info_url = 'http://'+ace
            +'/ace/manifest.m3u8?format=json&infohash='+encodeURI(infohash);

    http_get(info_url).then(
        (responseText) => {
            try {
                const data = JSON.parse(responseText);
                if (data['error']) {
                    div.appendChild(document.createTextNode(data['error']));
                } else {
                    const playback_url = data['response']['playback_url'];
                    const command_url = data['response']['command_url'];

                    div.innerHTML = '<video id="'+video_id+'"></video>';
                    const video = document.getElementById(video_id);
                    // store command_url
                    video.setAttribute('data-command-url', command_url);
                    // open hls
                    video.width = video_width;
                    video.controls = false;
                    // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
                    // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
                    // This is using the built-in support of the plain video element, without using hls.js.
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        console.log('playing with built-in HLS support');
                        video.src = playback_url;
                        video.addEventListener('canplay',function() {
                            video.play();
                        });
                    } else if(Hls.isSupported()) {
                        console.log('playing with hls.js');
                        let hls = new Hls();
                        hls.loadSource(playback_url);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED,function() {
                            video.play();
                        });
                    }
                    let button = document.createElement('button', {
                        id: 'stop_button',
                        title: 'Stop and close',
                        class: 'w-100'
                    });
                    button.innerHTML = 'X';
                    button.addEventListener('click', stop_playback);
                    button.addEventListener('tap', stop_playback);
                    div.appendChild(button);

                    /*
                    videojs(video_id, {
                        sources: [{ src: playback_url, type: 'application/x-mpegurl'}],
                        preload: 'none',
                        width: video_width,
                        autoplay: true,
                        controls: true
                    }).ready(function(e) {
                        console.log('videojs player ready'); console.log(e);

                        this.on('error', (e)=>{ console.log('error: ', e); });
                        this.on('loadeddata', (e)=>{ console.log('loadeddata: ', e); });
                        this.on('loadedmetadata', (e)=>{ console.log('loadedmetadata: ', e); });
                        this.on('progress', (e)=>{ console.log('progress: ', this.buffered()); });
                        
                        this.el().setAttribute('data-command-url', command_url);
                        
                        let button = this.addChild('CloseButton');
                        //button.handleClick = 'stop_playback';
                        button.one('tap', stop_playback);
                        button.one('close', stop_playback);
                    });
                    */
                }
            } catch (e) {
                div.appendChild(document.createTextNode(e.message));
            }
        },
        (errorText) => {
            div.appendChild(document.createTextNode(errorText));
        }
    );
    return false;
}

function http_get(url) {
    return new Promise((resolve, reject) => {
        const x = new XMLHttpRequest();
        x.open('GET', url);
        x.withCredentials = false;
        x.onload = () => resolve(x.responseText);
        x.onerror = () => reject('XMLHttpRequest error: '+x.status+' '+x.statusText);
        x.send();
    });
}

function stop_playback(e) {
    let player;
    if (player = document.getElementById(video_id)) {
        if (player.hasAttribute('data-command-url'))
            http_get(player.getAttribute('data-command-url')+'?method=stop');
        player.pause();
        //player.src = null;
        //e.target.remove();
    }
}