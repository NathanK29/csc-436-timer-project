let timer = null;
let startTime = 0;
let endTime = 0;
let isRunning = false;

function start(time) {
    let timeFormat = time * 1000;
    if (!isRunning) {
        startTime = Date.now();
        endTime = Date.now() + timeFormat;
        timer = setInterval(update, 1000);
        isRunning = true;
    }
}

function stop() {

}

function update() {
    const now = Date.now();
    let seconds = Math.floor(now / 1000 % 60);
    if(now >= endTime) {
        clearInterval(timer)
        isRunning = false;
    }
    console.log(seconds);

}

start(10)