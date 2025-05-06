const playPauseButton = document.getElementById("playpause-icon");
const seekBarContainer = document.querySelector(".seek-bar-container");
const seekBar = document.getElementById("seek-bar");
const seekEclipse = document.getElementById("seek-eclipse");
const startTime = document.getElementById("start-time");
const endTime = document.getElementById("end-time");
const playIcon = document.querySelector(".fa-play");
const lyricsbtn = document.getElementById("lyrics-btn");
const albumsBtn = document.getElementById("albums-btn");
const artistsBtn = document.getElementById("artists-btn");
const tabButtons = document.querySelectorAll(".tab-btns");
const tabContent = document.querySelector(".explore-content");
const artistImage = document.getElementById("artist");

let tracks = [];
let currentTrackIndex = 0;
let audio = null;
let isTimerPlaying = false;

const fetchTrackData = async () => {
  const urls = [
    "https://spotify23.p.rapidapi.com/tracks/?ids=3nsfB1vus2qaloUdcBZvDu",
    "https://spotify23.p.rapidapi.com/tracks/?ids=2OzhQlSqBEmt7hmkYxfT6m",
    "https://spotify23.p.rapidapi.com/tracks/?ids=3NMrVbIVWT3fPXBj0rNDKG",
  ];
  const headers = {
    "x-rapidapi-key": "31db11b2bdmsh20acd01b1a08536p1681b3jsna936906d109b",
    "x-rapidapi-host": "spotify23.p.rapidapi.com",
  };

  try {
    const responses = await Promise.all(
      urls.map((url) => fetch(url, { headers }))
    );
    const results = await Promise.all(responses.map((res) => res.json()));
    tracks = results.map((result) => ({
      title: result.tracks[0].name,
      artist: result.tracks[0].artists[0].name,
      source: result.tracks[0].preview_url,
      image: result.tracks[0].album.images[0].url,
    }));
    loadTrack(currentTrackIndex);
  } catch (error) {
    console.error("Error fetching track data:", error);
  }
};

const loadTrack = (index) => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  const track = tracks[index];
  if (track && track.source) {
    audio = new Audio(track.source);
    document.getElementById("title").innerText = track.title;
    document.getElementById("artist-name").innerText = track.artist;
    artistImage.src = track.image;

    // Add the ontimeupdate listener to the current audio instance
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const barWidth = (100 / audio.duration) * audio.currentTime;
        const durationMinutes = Math.floor(audio.duration / 60)
          .toString()
          .padStart(2, "0");
        const durationSeconds = Math.floor(audio.duration % 60)
          .toString()
          .padStart(2, "0");
        const currentMinutes = Math.floor(audio.currentTime / 60)
          .toString()
          .padStart(2, "0");
        const currentSeconds = Math.floor(audio.currentTime % 60)
          .toString()
          .padStart(2, "0");

        seekBar.style.width = `${barWidth}%`;
        seekEclipse.style.setProperty("left", `${barWidth}%`);
        startTime.innerText = `${currentMinutes}:${currentSeconds}`;
        endTime.innerText = `${durationMinutes}:${durationSeconds}`;
      }
    };

    audio.addEventListener("ended", () => {
      isTimerPlaying = false;
      updateUIForPlaybackState();
      // Reset seek bar when the song ends
      seekBar.style.width = "0%";
      seekEclipse.style.setProperty("left", "0%");
      startTime.innerText = "00:00";
    });

    updateUIForPlaybackState();
  } else {
    console.error("Invalid track source");
  }
};

const updateUIForPlaybackState = () => {
  if (isTimerPlaying) {
    playIcon.classList.remove("fa-play");
    playIcon.classList.add("fa-pause");
  } else {
    playIcon.classList.remove("fa-pause");
    playIcon.classList.add("fa-play");
  }
};

playPauseButton.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    isTimerPlaying = true;
  } else {
    audio.pause();
    isTimerPlaying = false;
  }
  updateUIForPlaybackState();
});

const nextTrack = () => {
  currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  loadTrack(currentTrackIndex);
  audio.play();
  isTimerPlaying = true;
};

const prevTrack = () => {
  currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrackIndex);
  audio.play();
  isTimerPlaying = true;
};

document.getElementById("next").addEventListener("click", nextTrack);
document.getElementById("previous").addEventListener("click", prevTrack);

seekBar.addEventListener("click", (e) => {
  if (audio) {
    const scrubTime = (e.offsetX / seekBar.offsetWidth) * audio.duration;
    audio.currentTime = scrubTime;
  }
});

fetchTrackData();

// Fetching API Data for Tab Content
const fetchTabData = async (type) => {
  const apiConfig = {
    lyrics_btn: {
      url: `https://genius-song-lyrics1.p.rapidapi.com/song/lyrics/?id=7076626&text_format=plain`,
      method: "GET",
      headers: {
        "x-rapidapi-key": "31db11b2bdmsh20acd01b1a08536p1681b3jsna936906d109b",
        "x-rapidapi-host": "genius-song-lyrics1.p.rapidapi.com",
      },
    },
    albums_btn: {
      url: `https://spotify23.p.rapidapi.com/search/?q=Taylor%20Swift&type=albums&offset=0&limit=20&numberOfTopResults=5`,
      method: "GET",
      headers: {
        "x-rapidapi-key": "31db11b2bdmsh20acd01b1a08536p1681b3jsna936906d109b",
        "x-rapidapi-host": "spotify23.p.rapidapi.com",
      },
    },
    artists_btn: {
      url: `https://spotify23.p.rapidapi.com/search/?q=All%20Too%20Well%20(Taylor's%20Version)&type=artists&offset=0&limit=20&numberOfTopResults=5`,
      method: "GET",
      headers: {
        "x-rapidapi-key": "31db11b2bdmsh20acd01b1a08536p1681b3jsna936906d109b",
        "x-rapidapi-host": "spotify23.p.rapidapi.com",
      },
    },
  };

  try {
    const config = apiConfig[type];
    if (!config) {
      throw new Error(`Invalid type: ${type}`);
    }

    const { url, method, headers } = config;
    const response = await fetch(url, { method, headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    let content = "";
    if (type === "lyrics_btn") {
      const lyrics = result.lyrics.lyrics.body.plain || "Lyrics not available";
      const formattedLyrics = lyrics.split("\n").join("<br>");
      content += `
      <div class="lyrics-container">
        <div class="fade-overlay top"></div>
        <div class="fade-overlay bottom"></div>
        <div class="lyrics-text">
        ${formattedLyrics}
        </div>
      </div>
      `;
    } else if (type === "albums_btn") {
      const albums = result.albums?.items || [];
      content += "<div class='albums-container'>";
      albums.forEach((album) => {
        const spotifyLink = `https://open.spotify.com/album/${album.data.uri
          .split(":")
          .pop()}`;
        content += `
          <div>
            <a href="${spotifyLink}" target="_blank">
              <img src="${album.data.coverArt.sources[0].url}" alt="${album.data.name}" class="other-albums-img" >
            </a>
            <h3 class="albums-name">${album.data.name}</h3>
            <p class="albums-year">${album.data.date.year}</p>
          </div>`;
        console.log(spotifyLink);
      });
      content += "</div>";
    } else if (type === "artists_btn") {
      const artists = result.artists.items || [];
      content += "<div class='artists-container'>";
      artists.forEach((artist) => {
        const spotifyLink = `https://open.spotify.com/artist/${artist.data.uri
          .split(":")
          .pop()}`;
        content += `
          <div>
            <a href="${spotifyLink}" target="_blank">
              <img src="${artist.data.visuals.avatarImage.sources[0].url}" alt="${artist.data.profile.name}" class="related-artists-img">
            </a>
            <h3 class="artists-name">${artist.data.profile.name}</h3>
          </div>`;
        console.log(spotifyLink);
      });
      content += "</div>";
    }

    document.querySelector(".explore-content").innerHTML = content;
  } catch (error) {
    document.querySelector(
      ".explore-content"
    ).innerHTML = `<p>Error: ${error.message}</p>`;
    console.error(error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((button) => button.classList.remove("active"));
      button.classList.add("active");
      const type = button.getAttribute("data-type");
      tabContent.innerHTML = `<p>Loading ${type.replace("_btn", "")}...</p>`;
      fetchTabData(type);
    });
  });
});
