const display = document.getElementById("timer");
let timer = null;
let startTime = 0;
let endTime = 0;
let isRunning = false;
let duration = 0;
let remainingTime = 0;

function handleStart() {
    if (remainingTime > 0) {
        const setNew = confirm("Set a new timer?");
        if (setNew) {
            askTime();
        } else {
            start(remainingTime / 1000);
        }
    } else {
        askTime();
    }
}

function askTime(){
    const input = prompt("Enter timer length in minutes:", "15");
    if (input === null){
        return;
    }

    const minutes = Number(input);

    if (isNaN(minutes) || minutes <= 0){
        alert("Please enter a valid number");
        return;
    }
    clearInterval(timer);
    isRunning = false;
    duration = minutes * 60 * 1000;
    remainingTime = duration;

    start(minutes * 60);
}

function start(time) {
    if (isRunning){
        return;
    }

    if (remainingTime === 0){
        duration = time * 1000;
        remainingTime = duration;
    }

    startTime = Date.now();
    endTime = startTime + remainingTime;
    timer = setInterval(update, 10);
    isRunning = true;


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

const colorSelect = document.getElementById("colorSelect");

colorSelect.addEventListener("change", function () {
    document.body.style.backgroundColor = this.value;
});