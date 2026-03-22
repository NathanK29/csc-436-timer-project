const display = document.getElementById("timer");
let timer = null;
let startTime = 0;
let endTime = 0;
let isRunning = false;
let duration = 0;
let remainingTime = 0;
let currentMode = 'focus';
let focusSecondsElapsed = 0;
let focusMinutesCounted = 0;
let lastFocusTickTime = null;
let focusCount = 0;

let focusDuration = 25 * 60 * 1000;
let shortBreakDuration = 5 * 60 * 1000;
let longBreakDuration = 15 * 60 * 1000;

function updateActiveTab() {
    document.getElementById('focus_button').classList.toggle('active-mode', currentMode === 'focus');
    document.getElementById('short_button').classList.toggle('active-mode', currentMode === 'shortBreak');
    document.getElementById('long_button').classList.toggle('active-mode', currentMode === 'longBreak');
}

function updateDisplay(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    display.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

function resetFocusTracking() {
    focusSecondsElapsed = 0;
    focusMinutesCounted = 0;
    lastFocusTickTime = null;
}

function setFocus() {
    clearInterval(timer);
    timer = null;
    isRunning = false;
    currentMode = 'focus';
    resetFocusTracking();
    updateActiveTab();

    duration = focusDuration;
    remainingTime = duration;
    updateDisplay(remainingTime);
}

function setShortBreak() {
    clearInterval(timer);
    timer = null;
    isRunning = false;
    currentMode = 'shortBreak';
    resetFocusTracking();
    updateActiveTab();

    duration = shortBreakDuration;
    remainingTime = duration;
    updateDisplay(remainingTime);
}

function setLongBreak() {
    clearInterval(timer);
    timer = null;
    isRunning = false;
    currentMode = 'longBreak';
    resetFocusTracking();
    updateActiveTab();

    duration = longBreakDuration;
    remainingTime = duration;
    updateDisplay(remainingTime);
}

function start() {
    if (isRunning) return;

    isRunning = true;
    startTime = Date.now();
    endTime = startTime + remainingTime;

    if (currentMode === 'focus') {
        lastFocusTickTime = Date.now();
    }

    timer = setInterval(update, 100);
}


function pause() {
    if (!isRunning){
        return;
    }
    clearInterval(timer);
    remainingTime = endTime - Date.now();
    isRunning = false;

    if (currentMode === 'focus' && lastFocusTickTime !== null) {
        focusSecondsElapsed += Date.now() - lastFocusTickTime;
        lastFocusTickTime = null;
    }
}

function restart() {
    clearInterval(timer);
    isRunning = false;
    remainingTime = duration;
    resetFocusTracking();
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
        if (currentMode === 'focus' && lastFocusTickTime !== null) {
            focusSecondsElapsed += now - lastFocusTickTime;
            lastFocusTickTime = null;
            const newMinutes = Math.floor(focusSecondsElapsed / 60000);
            for (let i = focusMinutesCounted; i < newMinutes; i++) {
                if (typeof window.onFocusMinuteCompleted === 'function') {
                    window.onFocusMinuteCompleted();
                }
            }
            focusMinutesCounted = newMinutes;
        }
        display.textContent = "00:00";

        const originalBg = document.body.style.backgroundColor || '';
        document.body.style.backgroundColor = 'red';
        playAlarm();
        setTimeout(() => {
            const savedBg = localStorage.getItem('bgColor');
            document.body.style.backgroundColor = savedBg || originalBg;
        }, 3000);

        if (currentMode === 'focus') {
            focusCount++;
            if (focusCount % 4 === 0) {
                setLongBreak();
            } else {
                setShortBreak();
            }
        } else {
            setFocus();
        }
        return;
    }

    if (currentMode === 'focus' && lastFocusTickTime !== null) {
        focusSecondsElapsed += now - lastFocusTickTime;
        lastFocusTickTime = now;
        const newMinutes = Math.floor(focusSecondsElapsed / 60000);
        for (let i = focusMinutesCounted; i < newMinutes; i++) {
            if (typeof window.onFocusMinuteCompleted === 'function') {
                window.onFocusMinuteCompleted();
            }
        }
        focusMinutesCounted = newMinutes;
    }

    let minutes = Math.floor((remaining / (1000 * 60)));
    let seconds = Math.floor((remaining / 1000) % 60);
    display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function playAlarm() {
    const sound = new (window.AudioContext || window.webkitAudioContext)();
    const beepCount = 4;
    const beepDuration = 0.15;
    const pauseDuration = 0.15;

    for (let i = 0; i < beepCount; i++) {
        const startAt = i * (beepDuration + pauseDuration);

        const oscillator = sound.createOscillator();
        const gainNode = sound.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = 880;
        gainNode.gain.value = 0.5;

        oscillator.connect(gainNode);
        gainNode.connect(sound.destination);

        oscillator.start(sound.currentTime + startAt);
        oscillator.stop(sound.currentTime + startAt + beepDuration);
    }
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
    const shortBreak = Number(document.getElementById("shortBreakInput").value);
    const longBreak = Number(document.getElementById("longBreakInput").value);

    const backgroundColor = document.getElementById("backgroundColorInput").value;
    const textColor = document.getElementById("textColorInput").value;

    if (backgroundColor) {
        document.body.style.backgroundColor = backgroundColor;
        localStorage.setItem('bgColor', backgroundColor);
    }

    if (textColor) {
        display.style.color = textColor;
        document.querySelector('.task-heading').style.color = textColor;
        localStorage.setItem('textColor', textColor);
    }

    if (pomodoro > 0) focusDuration = pomodoro * 60 * 1000;
    if (shortBreak > 0) shortBreakDuration = shortBreak * 60 * 1000;
    if (longBreak > 0) longBreakDuration = longBreak * 60 * 1000;

    if (!isRunning) {
        if (currentMode === 'focus') setFocus();
        else if (currentMode === 'shortBreak') setShortBreak();
        else setLongBreak();
    }

    settingsMenu.classList.add("hidden");

});