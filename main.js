function pauseToggle(){
    let player = document.getElementById("videoplayer");
    if (player.paused){
        player.play();
    } else {
      player.pause();
    }
}
function seekForward(){
    let player = document.getElementById("videoplayer");
    player.currentTime = player.currentTime + 5
    // player.playbackRate = 3
    // this will need to be properly calculated to +5s
    // from linear? interpolation of speed to 1s
}
function seekBackward(){
    let player = document.getElementById("videoplayer");
    player.currentTime = player.currentTime - 5
    // player.playbackRate = 3
    // this will need to be properly calculated to -5s
    // from linear? interpolation of speed to 1s
}
function seekRandom(){
    const player = document.getElementById("videoplayer");
    let rand_time = Math.floor(Math.random() * Math.round(player.duration))
    player.currentTime = rand_time
}

function muteToggle(){
    let player = document.getElementById("videoplayer");
    if (player.muted){
        player.muted = false;
        return
    }
    player.muted = true;
}
function volumeUp(){
    let player = document.getElementById("videoplayer");
    if (player.volume >= 1){ return }
    player.volume = player.volume + 0.1
}
function volumeDown(){
    let player = document.getElementById("videoplayer");
    if (player.volume <= 0.1){ return }
    player.volume = player.volume - 0.1
}

async function fetchMedia(){
    //play a sound effect
    var audio = new Audio('./assets/click7.mp3');
    audio.play();

    //replace the player with a loading gif
    document.getElementById("loadscreen").style = ""

    let video = getRandomLink()
    const player = document.getElementById("videoplayer");
    player.src = video
}

//TODO: write this function & HTML
function settingsToggle(){
    console.log("settings toggle")
    
//     <div id="settingsContiner">
//     <div id="settings">
//         <h1>Neave TV 2</h1>
//         <input type="checkbox" id="optionRealisim">
//         <label for="optionRealisim">Realisim mode</label>

//         <input type="checkbox" id="optionRealisim">
//         <label for="optionRealisim">Realisim mode</label>
//     </div>
// </div>
}

async function startEvents(ambientMode){ 
  //load the inintal video
  await fetchMedia()

  var canvas = document.getElementById('backgroundPlayer');
  var ctx = canvas.getContext('2d');
  const player = document.getElementById("videoplayer");

  if (ambientMode=="true"){
    player.addEventListener("play", () => {
      function step() {
        ctx.drawImage(player, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  
    player.addEventListener("loadedmetadata", () => {
      canvas.width = player.videoWidth;
      canvas.height = player.videoHeight;
    })
  }

  player.addEventListener("ended", async () => {
    //get new mdedia after were done this one, dont radomize time
    await fetchMedia()
  })

  player.addEventListener("click", async (e) => {
    //get new media if we want new media, randomize the time

    if (e.target.dataset.clickdisabled == "true"){ return }
    await fetchMedia()
    
    //this might cause some issues but havent seen any bugs yet
    //so im just gonna leave it here
    player.addEventListener("loadeddata" , () =>{
        seekRandom()
    })
  })

  player.addEventListener("loadeddata", () => { 
    //once media has loaded
    //remove the loading screen
    //start playing the video
    //inintalize the ambient mode (only if ambient mode is enabled)

    document.getElementById("loadscreen").style = "display: none;"
    const player = document.getElementById("videoplayer");
    player.play()
  })

  //keyboard events
  window.addEventListener("keydown", (e) => {
      switch (e.key){
          case "ArrowUp": volumeUp(); break;
          case "ArrowDown": volumeDown(); break;
          case "ArrowLeft": seekBackward(); break;
          case "ArrowRight": seekForward(); break;
          case " ": pauseToggle(); break;
          case "m": muteToggle(); break;
          case "Escape": settingsToggle(); break;
          case "Enter": linkToMedia(); break;
          default: console.log(e.key); break;
      }
  })
}

window.addEventListener("DOMContentLoaded", async () => {

  //check the users settings for ambient mode
  let ambientMode = localStorage.getItem("ambientMode")
  if (ambientMode==undefined || ambientMode==null) {
  
    //usually means the user has not visited this site before
    //show them the intro screen
    document.getElementById("intro_screen").style = ""
    document.getElementById("intro_screen").addEventListener("click", async () => {
      document.getElementById("intro_screen").style = "display: none;"
      await startEvents("true")
    })

    //enable ambient mode by default
    localStorage.setItem("ambientMode", true) 
    return
  }

  await startEvents(ambientMode)
})
