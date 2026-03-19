const display = document.getElementById("timer");
let timer = null;
let startTime = 0;
let endTime = 0;
let isRunning = false;
let duration = 0;
let remainingTime = 0;

function updateDisplay(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    display.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

function setFocus() {
    clearInterval(timer);
    timer = null;
    isRunning = false;

    duration = 25 * 60 * 1000;
    remainingTime = duration;
    updateDisplay(remainingTime);
}

function setShortBreak() {
    clearInterval(timer);
    timer = null;
    isRunning = false;

    duration = 5 * 60 * 1000;
    remainingTime = duration;
    updateDisplay(remainingTime);
}

function setLongBreak() {
    clearInterval(timer);
    timer = null;
    isRunning = false;

    duration = 15 * 60 * 1000;
    remainingTime = duration;
    updateDisplay(remainingTime);
}

function start() {
    if (isRunning) return;

    isRunning = true;
    startTime = Date.now();
    endTime = startTime + remainingTime;

    timer = setInterval(update, 100);
}


function pause() {
    if (!isRunning){
        return;
    }
    clearInterval(timer);
    remainingTime = endTime - Date.now();
    isRunning = false;
}

function restart() {
    clearInterval(timer);
    isRunning = false;
    remainingTime = duration;
    endTime = Date.now() + remainingTime;
    update();
}

function update() {
    const now = Date.now();
    const remaining = endTime - now;

    if (remaining <= 0) {
        clearInterval(timer);
        isRunning = false;
        remainingTime = 0;
        display.textContent = "00:00";
        return;
    }
    let minutes = Math.floor((remaining / (1000 * 60)));
    let seconds = Math.floor((remaining / 1000) % 60);
    display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const settingsButton = document.getElementById("settingsButton");
const settingsMenu = document.getElementById("settingsMenu");

settingsButton.addEventListener("click", function (event) {
    event.stopPropagation();
    settingsMenu.classList.toggle("hidden");
});

settingsMenu.addEventListener("click", function (event) {
    event.stopPropagation();
});

document.addEventListener("click", function () {
    settingsMenu.classList.add("hidden");
});

const saveSettings = document.getElementById("saveSettings");

saveSettings.addEventListener("click", function () {

    const pomodoro = Number(document.getElementById("pomodoroInput").value);

    const backgroundColor = document.getElementById("backgroundColorInput").value;
    const textColor = document.getElementById("textColorInput").value;

    // change colors
    if (backgroundColor) {
        document.body.style.backgroundColor = backgroundColor;
    }

    if (textColor) {
        display.style.color = textColor;
    }

    // update timer
    if (!isRunning && pomodoro > 0) {
        duration = pomodoro * 60 * 1000;
        remainingTime = duration;
        display.textContent = `${String(pomodoro).padStart(2,"0")}:00`;
    }

    settingsMenu.classList.add("hidden");

});