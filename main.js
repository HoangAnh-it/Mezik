const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const dashBoard = $(".dashboard");
const playList = $(".play-list");
const header = $("header h3");
const cd = $(".cd img");
const repeatBtn = $(".control__repeat");
const prevBtn = $(".control__prev");
const playBtn = $(".control__play");
const nextBtn = $(".control__next");
const randomBtn = $(".control__random");
const audio = $("audio");
const progress = $(".progress");

var notifications =
    "Hiện tại chưa có chức năng thêm bài hát. Sau khi xóa sẽ mất. Nếu xóa, reload để tải lại danh sách bài hát";

var isPlaying = false;
var isRepeat = false;
var isRandom = false;
var isChange = false;

const cdW = cd.offsetWidth;

const cdAnimation = cd.animate([{ transform: "rotate(360deg)" }], {
    duration: 10000,
    iterations: Infinity,
});

const app = {
    songs: [
        {
            name: "Bước qua nhau",
            singer: "Vũ.",
            image: "./assets/img/buoc-qua-nhau.png",
            path: "./assets/music/buoc-qua-nhau.mp3",
        },
        {
            name: "Ghé qua",
            singer: "Dick x PC x Tofu",
            image: "./assets/img/ghe-qua.png",
            path: "./assets/music/ghe-qua.mp3",
        },
        {
            name: "25",
            singer: "Táo x Young H x Sol'Bass x Nah x B Ray x Chú 13 x Khói",
            image: "./assets/img/25.png",
            path: "./assets/music/25.mp3",
        },
        {
            name: "Death bed",
            singer: "Powful",
            image: "./assets/img/death-bed.png",
            path: "./assets/music/death-bed.mp3",
        },
        {
            name: "Dusk Till Dawn",
            singer: "ZAYN",
            image: "./assets/img/dusk-till-dawn.png",
            path: "./assets/music/dusk-till-dawn.mp3",
        },
        {
            name: "Ngày khác lạ",
            singer: "Đen Vâu.",
            image: "./assets/img/cd.png",
            path: "./assets/music/ngay-khac-la.mp3",
        },
        {
            name: "Take me to church",
            singer: "Hozier",
            image: "./assets/img/cd.png",
            path: "./assets/music/take-me-to-church.mp3",
        },
        {
            name: "Thở",
            singer: "Dalab",
            image: "./assets/img/tho.png",
            path: "./assets/music/tho.mp3",
        },
        {
            name: "Thức giấc",
            singer: "Dalab",
            image: "./assets/img/thuc-giac.png",
            path: "./assets/music/thuc-giac.mp3",
        },

        {
            name: "Lạ lùng",
            singer: "Vũ.",
            image: "./assets/img/la-lung.png",
            path: "./assets/music/la-lung.mp3",
        },
    ],

    currentIndex: 0,
    previousIndex: 0,

    definedProperties() {
        Object.defineProperty(this, "playingSong", {
            get() {
                return this.songs[this.currentIndex];
            },
        });
    },

    render() {
        const html = this.songs.map((song, index) => {
            return `
            <div class="song data-index-${index}" data-mydb="${index}">
                    <img src="${song.image}" alt="" class="icon" />

                    <div class="info">
                        <h2>${song.name}</h2>
                        <h3>${song.singer}</h3>
                    </div>

                    <button class="options">
                        <i class="ti-trash"></i>
                    </button>
            </div>
            `;
        });

        playList.innerHTML = html.join("");

        if (!isChange) {
            this.loadSong();
        }
        this.setBackgroundSongActive();
        isChange = false;
    },

    loadSong() {
        if (!Number.isNaN(this.currentIndex)) {
            header.textContent = this.playingSong.name;
            cd.src = this.playingSong.image;
            audio.src = this.playingSong.path;
            this.setIntoView();
        }
    },

    handleEvent() {
        repeatBtn.onclick = function () {
            this.classList.toggle("active");
            isRepeat = !isRepeat;
        };

        prevBtn.onclick = function () {
            app.prevSong();
            app.loadSong();
            if (isPlaying) audio.play();
        };

        playBtn.onclick = function () {
            isPlaying = !isPlaying;
            this.classList.toggle("playing");
            if (this.currentIndex !== NaN) {
                if (isPlaying) {
                    audio.play();
                } else {
                    audio.pause();
                }
            }
        };

        nextBtn.onclick = function () {
            app.nextSong();
            app.loadSong();
            if (isPlaying) audio.play();
        };

        randomBtn.onclick = function () {
            isRandom = !isRandom;
            this.classList.toggle("active");
        };

        document.onscroll = function () {
            const scroll = document.documentElement.scrollTop;
            const newW = cdW - scroll > 0 ? cdW - scroll : 0;
            document.documentElement.style.setProperty("--cd-dimension", newW + "px");
            cd.style.opacity = newW / cdW;
        };

        audio.onplay = function () {
            cdAnimation.play();
        };

        audio.onpause = function () {
            cdAnimation.pause();
        };

        audio.ontimeupdate = function () {
            app.updateProgress();
        };

        audio.onended = function () {
            // check random first, check repeat later
            if (isRepeat) {
                audio.play();
            } else if (isRandom) {
                app.randomSong();
                app.loadSong();
                audio.play();
            } else {
                app.nextSong();
                app.loadSong();
                audio.play();
            }
        };

        progress.onchange = function () {
            app.setProgress();
        };

        playList.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.song-item-active)");
            const trashNode = e.target.closest(".options");
            if (songNode || trashNode) {
                //check options button  first, check node later
                if (trashNode) {
                    const id = e.target.closest(".song").dataset.mydb;
                    app.deleteSong(Number(id));
                } else if (songNode) {
                    app.choseSong(Number(songNode.dataset.mydb));
                    app.loadSong();

                    if (!isPlaying) {
                        playBtn.click();
                    } else {
                        audio.play();
                    }
                }
            }
        };
    },

    updateProgress() {
        const now = audio.currentTime;
        const length = audio.duration;
        const percent = Math.floor((now / length) * 100);
        progress.value = percent;
    },

    setProgress() {
        const percent = progress.value;
        const length = audio.duration;
        const time = (percent * length) / 100;
        audio.currentTime = time;
    },

    setBackgroundSongActive() {
        if (!Number.isNaN(this.currentIndex)) {
            $(`.data-index-${this.previousIndex}`).classList.remove("song-item-active");
            $(`.data-index-${this.currentIndex}`).classList.add("song-item-active");
        }
    },

    nextSong() {
        this.previousIndex = this.currentIndex;
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.setBackgroundSongActive();
    },

    prevSong() {
        this.previousIndex = this.currentIndex;
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.setBackgroundSongActive();
    },

    randomSong() {
        this.previousIndex = this.currentIndex;
        let newIndex;

        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.setBackgroundSongActive();
    },

    choseSong(id) {
        if (Number.isNaN(this.currentIndex)) {
            this.previousIndex = id;
        } else {
            this.previousIndex = this.currentIndex;
        }
        this.currentIndex = id;
        this.setBackgroundSongActive();
    },

    setIntoView() {
        if (this.currentIndex <= 4) {
            document.documentElement.scrollTop = 0;
        } else {
            $(`.data-index-${this.currentIndex}`).scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    },

    deleteSong(id) {
        if (confirm(notifications)) {
            this.songs.splice(id, 1);
            if (id === this.currentIndex) {
                this.currentIndex = NaN;
                audio.pause();
                audio.currentTime = 0;
                cd.src = "./assets/img/cd.png";
                audio.src = "";
                header.textContent = "Choose your favorite music:)";
                cdAnimation.pause();
            } else if (id < this.currentIndex) {
                this.currentIndex -= 1;
            }
            isChange = true;
            this.render();
        }
    },

    start() {
        this.definedProperties();
        cdAnimation.pause();
        this.handleEvent();
        this.render();
    },
};

app.start();
