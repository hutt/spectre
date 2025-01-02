/*
 * Light YouTube Embeds by @labnol
 * Credit: https://www.labnol.org/
 * Title from YT oauth by @kmhelander 
 * Optimzed by Google Bard
 */


function getYoutubeData(videoId) {

  let urlprefix = YT_DATA_URL_PREFIX;

  if (typeof urlprefix === 'undefined') {
    urlprefix = 'https://www.youtube-nocookie.com';
  }

  let ytDataUrl = `${urlprefix}/oembed?format=json&url=http%3A//youtube.com/watch%3Fv%3D` + videoId;
  return fetch(ytDataUrl)
    .then(res => res.json())
    .catch(err => { console.log(err) });
}

function labnolIframe(youtubePlayer) {
  let iframe = document.createElement('iframe');
  iframe.setAttribute('src', 'https://www.youtube-nocookie.com/embed/' + youtubePlayer.dataset.id + '?autoplay=1&rel=0');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', '1');
  iframe.setAttribute('allow',
    'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
  youtubePlayer.parentNode.replaceChild(iframe, youtubePlayer);
}

function initYouTubeVideos() {

  let urlprefix = YT_THUMBNAIL_URL_PREFIX;
  
  if (typeof urlprefix === 'undefined') {
    urlprefix = '//i.ytimg.com';
  }

  let playerElements = document.getElementsByClassName('youtube-player');
  for (let n = 0; n < playerElements.length; n++) {
    let videoId = playerElements[n].dataset.id;
    let thisPlayerId = 'playerid-' + n.toString();

    getYoutubeData(videoId)
      .then(out => {
        document.getElementById(thisPlayerId).innerHTML = out.title.substr(0, 140);
        placeholder.alt = "YouTube: " + out.title.substr(0, 140);
      })
      .catch(err => { console.log(err) });

    let div = document.createElement('div');
    div.setAttribute('data-id', videoId);
    let picture = div.appendChild(document.createElement('picture'));
    let placeholder_webp = picture.appendChild(document.createElement('source'));
    placeholder_webp.srcset = `${urlprefix}/vi_webp/ID/mqdefault.webp 300w, ${urlprefix}/vi_webp/ID/hqdefault.webp 600w, ${urlprefix}/vi_webp/ID/maxresdefault.webp 1000w`.replaceAll('ID', videoId);
    placeholder_webp.type = 'image/webp';
    let placeholder_jpg = picture.appendChild(document.createElement('source'));
    placeholder_jpg.srcset = `${urlprefix}/vi/ID/mqdefault.jpg 300w, ${urlprefix}/vi/ID/hqdefault.jpg 600w, ${urlprefix}/vi/ID/maxresdefault.jpg 1000w`.replaceAll('ID', videoId);
    placeholder_jpg.type = 'image/jpeg';
    let placeholder = picture.appendChild(document.createElement('img'));
    placeholder.src = `${urlprefix}/vi/ID/hqdefault.jpg`.replace('ID', videoId);
    placeholder.width = '640';
    placeholder.height = '360';
    
    let videoTitle = document.createElement('div');
    videoTitle.setAttribute('class', 'videotitle');
    videoTitle.setAttribute('id', thisPlayerId);
    videoTitle.appendChild(document.createTextNode(''));
    div.appendChild(videoTitle);

    let playButton = document.createElement('div');
    playButton.setAttribute("class", "play");
    div.appendChild(playButton); 

    let privacyNote = document.createElement('div');
    if (typeof privacyNoteText === 'undefined') {
      privacyNoteText = "Click to Load YouTube Video";
    }

    privacyNote.setAttribute("class", "privacy-note");
    privacyNote.appendChild(document.createTextNode(privacyNoteText));
    div.appendChild(privacyNote);
    
    div.onclick = function() { labnolIframe(this); };
    playerElements[n].appendChild(div);
  }
}

document.addEventListener('DOMContentLoaded', initYouTubeVideos);
