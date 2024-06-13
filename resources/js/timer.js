let countdownStarted = false;
let examStarted = false;
let unsafe = false;

function saveFormData() {
    Cookies.set('title', $('#title').val());
    Cookies.set('subject', $('#subject').val());
    Cookies.set('paper', $('#paper').val());
    Cookies.set('hours', $('#hours').val());
    Cookies.set('minutes', $('#minutes').val());
    Cookies.set('startTime', $('#start-time').val());
    Cookies.set('bg', $('#bg-color').val());
    Cookies.set('disturbing-effects', $('#disturbingEffects').is(':checked'));
    Cookies.set('pin', $('#pin').val());
}

function updateTitle() {
    let sub = $('#subject option:selected').text();
    let paper = $('#paper option:selected').text();
    $('#title').val(sub + " " + paper)
    $('#public-title').text(sub + " " + paper)
}

// Update duration display
function updateDuration() {
    const hours = parseInt($('#hours').val()) || 0;
    const minutes = parseInt($('#minutes').val()) || 0;
    const hoursText = hours === 1 ? 'hour' : 'hours';
    const minutesText = minutes === 1 ? 'minute' : 'minutes';
    $('#duration').text(` (${hours} ${hoursText} ${minutes} ${minutesText})`);
}

function loadFormData() {
    if (Cookies.get('title')) {
        $('#title').val(Cookies.get('title'));
    }
    if (Cookies.get('subject')) {
        $('#subject').val(Cookies.get('subject')).trigger('change');
    }
    if (Cookies.get('paper')) {
        $('#paper').val(Cookies.get('paper')).trigger('change');
    }
    if (Cookies.get('hours')) {
        $('#hours').val(Cookies.get('hours'));
    }
    if (Cookies.get('minutes')) {
        $('#minutes').val(Cookies.get('minutes'));
    }
    if (Cookies.get('startTime')) {
        $('#start-time').val(Cookies.get('startTime'));

    }
    if (Cookies.get('bg')) {
        $('#bg-color').val(Cookies.get('bg'));
    }
    if (Cookies.get('disturbing-effects')) {
        $('#disturbingEffects').prop('checked', Cookies.get('disturbing-effects') === "true");
    }
    if (Cookies.get('pin')) {
        $('#pin').val(Cookies.get('pin'));
    }

    updateDuration();
    calculateStartTime();
    changeBgColor();
    $('#public-title').text(Cookies.get('title'));
}

function updateCurrentTime() {
    let currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'});
    $('#current-time').text(currentTime);
}

function updateTimeLeft() {
    // Get the values of hours, minutes, and seconds inputs
    let hours = parseInt($('#hours').val()) || 0;
    let minutes = parseInt($('#minutes').val()) || 0;
    let seconds = parseInt($('#seconds').val()) || 0;

    // Convert hours, minutes, and seconds to total seconds
    let totalSeconds = hours * 3600 + minutes * 60 + seconds;

    // Get the value of the start time
    let startTimeStr = $('#start-time').val() || '00:00:00';

    // Split the start time into hours, minutes, and seconds
    let startTimeSplit = startTimeStr.split(':');
    let startHours = parseInt(startTimeSplit[0]) || 0;
    let startMinutes = parseInt(startTimeSplit[1]) || 0;
    let startSeconds = parseInt(startTimeSplit[2]) || 0;

    // Convert start time to total seconds
    let startTimeSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;

    // Get the current time
    let now = new Date();
    let currentHours = now.getHours();
    let currentMinutes = now.getMinutes();
    let currentSeconds = now.getSeconds();

    // Convert current time to total seconds
    let currentTimeSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

    // Calculate remaining time based on current time and start time
    let remainingTimeSeconds;
    if (currentTimeSeconds < startTimeSeconds) {
        // Calculate time left until start time
        remainingTimeSeconds = startTimeSeconds - currentTimeSeconds;
        $('#time-left').text('Time until start:');
        $('#time-left-div').css('color', 'blue');
        examStarted = false;
    } else {
        // Calculate time left until exam ends
        remainingTimeSeconds = totalSeconds - (currentTimeSeconds - startTimeSeconds);
        $('#time-left').text('Time left:');
        if (!examStarted) {
            $('#wishes').removeClass('hidden');
            setTimeout(() => {
                $('#wishes').addClass('hidden');
            }, 3000)
            examStarted = true;
        }
    }

    $('#hour-left').text(('0' + Math.max(Math.floor(remainingTimeSeconds / 3600), 0)).slice(-2));
    $('#min-left').text(('0' + Math.max(Math.floor((remainingTimeSeconds % 3600) / 60), 0)).slice(-2));

    // Clamp remaining time to 0 if it goes negative
    remainingTimeSeconds = Math.max(remainingTimeSeconds, 0);

    // Calculate the color transition (example: from black to red)
    let elapsedTime = totalSeconds - remainingTimeSeconds;
    let percentage = (elapsedTime / totalSeconds);
    let red = Math.floor(255 * percentage);
    let green = 0;
    let blue = 0;
    let color = 'rgb(' + red + ',' + green + ',' + blue + ')';

    // Apply the color to the #time-left element
    $('#time-left-div').css('color', color);

    // Start countdown if less than 1 minute left or if countdown hasn't started yet
    if ((remainingTimeSeconds === 60 || (remainingTimeSeconds <= 60 && !countdownStarted && remainingTimeSeconds > 0)) && examStarted) {
        startCountdown(remainingTimeSeconds);
    }
}


function calculateStartTime() {
    let hours = parseInt($('#hours').val()) || 0; // If value is empty or not a number, default to 0
    let minutes = parseInt($('#minutes').val()) || 0; // If value is empty or not a number, default to 0

    // Convert hours and minutes to minutes
    let totalMinutes = hours * 60 + minutes;

    // Get the value of the start time
    let startTime = $('#start-time').val() || '00:00'; // If value is empty, default to '00:00'

    // Split the start time into hours and minutes
    let startTimeSplit = startTime.split(':');
    let startHours = parseInt(startTimeSplit[0]) || 0; // If value is empty or not a number, default to 0
    let startMinutes = parseInt(startTimeSplit[1]) || 0; // If value is empty or not a number, default to 0

    // Add the total minutes to the start time
    let endMinutes = startMinutes + totalMinutes;
    let endHours = startHours + Math.floor(endMinutes / 60);
    endMinutes %= 60;

    // Format the end time
    let endTime = ('0' + endHours).slice(-2) + ':' + ('0' + endMinutes).slice(-2);

    // Update the #time-to-from element with the end time
    $('#time-to-from').text(startTime + ' to ' + endTime);
}

function randomColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);

    let rHex = r.toString(16).padStart(2, '0');
    let gHex = g.toString(16).padStart(2, '0');
    let bHex = b.toString(16).padStart(2, '0');

    // Construct the CSS rgb() color string
    return `#${rHex}${gHex}${bHex}`;
}

function showVideo() {
        $('#vid-end').removeClass('hidden').addClass('block');
        let video = $('#end').get(0);
        video.play();

        // Full-screen functionality
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.mozRequestFullScreen) { /* Firefox */
            video.mozRequestFullScreen();
        } else if (video.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) { /* IE/Edge */
            video.msRequestFullscreen();
        }

        video.addEventListener('ended', () => {
            $('#vid-end').addClass('hidden').removeClass('block');
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
            }
        })
}

async function hashCheck() {
    let pin = $('#pin').val();

    async function calculateHash(input) {
        const msgUint8 = new TextEncoder().encode(input);                           // encode as (utf-8) Uint8Array
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);         // hash the message
        const hashArray = Array.from(new Uint8Array(hashBuffer));                   // convert buffer to byte array
        // convert bytes to hex string
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    let hash = await calculateHash(pin);
    let precalculated = "4757d468ea4e280dbf687b7ce054797249104aed10588bf4839e6da0e02376af"
    return hash === precalculated
}

function startCountdown(seconds) {
    let countdown = seconds;
    countdownStarted = true;
    $('#countdown-box').removeClass('hidden');
    $('#countdown-timer').text(countdown);

    console.log("Its happening")

    let countdownInterval = setInterval(() => {
        countdown--;
        let countdownTimer = $('#countdown-timer');
        let audio = $('#audio')[0];
        countdownTimer.text(countdown);

        if ($('#disturbingEffects').is(':checked')) {
            let animations = ['pulse', 'breathe', 'rotate3d', 'bounce', 'swivel', 'fade-in', 'shake', 'floating', 'rotate', 'pulsate', 'slide-in', 'zoom-in', 'flash', 'spin', 'heartbeat'];
            let randomAnimation = animations[Math.floor(Math.random() * animations.length)];
            let randomBgColor = randomColor();
            let textColor = invertColor(randomBgColor, true);
            countdownTimer.removeClass().addClass(randomAnimation);
            countdownTimer.addClass('text-9xl').addClass('font-bold');
            $('#countdown-box').css('background-color', randomBgColor);
            countdownTimer.css('color', textColor);
        }

        if (countdown <= 0) {
            countdownTimer.text('End of Exam!!');
            clearInterval(countdownInterval);
            setTimeout(() => {
                $('#countdown-box').addClass('hidden');
            }, 5000);
            let confetti = setInterval(function () {
                party.confetti(document.body, {
                    count: party.variation.range(30, 50),
                    shapes: ["star", "roundedSquare", "rectangle", "circle", "square", "roundedRectangle"],
                    size: party.variation.range(0.5, 4),
                });
            }, 1500);
            if (examStarted) {
                audio.play();
            }
            setTimeout(function () {
                clearInterval(confetti)
            }, 60000);
            countdownStarted = false;
            hashCheck().then((res) => {
                    if (res) {
                        console.log("Video will be played")
                        setTimeout(showVideo, 150000)
                    }
                }
            )
            examStarted = false;
        }
    }, 1000);
}

function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    let r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    let zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function changeBgColor() {
    let bgColor = $('#bg-color').val();
    let textColor = invertColor(bgColor, true)
    console.log(bgColor, textColor);
    $('body, footer, #settings').css('background-color', bgColor).css('color', textColor);
}

$(document).ready(function () {
    loadFormData();

    $('#title, #subject, #paper, #hours, #minutes, #start-time, #bg-color, #disturbingEffects, #pin').on('input change keyup', saveFormData);
    $('#title').keyup(() => {
        $('#public-title').text($('#title').val());
    })
    $('#paper, #subject').change(updateTitle);
    $('#hours, #minutes').keyup(() => {
        updateDuration();
        let hours = $('#hours').val() || 0;
        let mins = $('#minutes').val() || 0;

        hours = parseInt(hours); mins = parseInt(mins);
        let hourStr = hours === 1 ? 'hour' : 'hours';
        let minuteStr = mins === 1 ? 'minute' : 'minutes';

        let durationStr = '';
        if (hours > 0) {
            durationStr += hours + ' ' + hourStr;
        }
        if (mins > 0) {
            if (hours > 0) {
                durationStr += ' ';
            }
            durationStr += mins + ' ' + minuteStr;
        }

        // Update the #duration element with the total duration
        $('#duration').text('(' + durationStr + ')');
    })

    $('#hours, #minutes, #start-time').change(calculateStartTime)

    $('#fullscreen').click(function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    setInterval(updateCurrentTime, 1000)
    setInterval(updateTimeLeft, 1000)

    $('#bg-color').change(changeBgColor);
    $('#current-date').text(() => {
        let date = new Date();
        let options = { timeZone: 'Asia/Kuala_Lumpur', day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    })

    $('#pin').keyup(async () => {
        let pin = $('#pin').val();

        async function calculateHash(input) {
            const msgUint8 = new TextEncoder().encode(input);                           // encode as (utf-8) Uint8Array
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);         // hash the message
            const hashArray = Array.from(new Uint8Array(hashBuffer));                   // convert buffer to byte array
            // convert bytes to hex string
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        let hash = await calculateHash(pin);
        let precalculated = "4757d468ea4e280dbf687b7ce054797249104aed10588bf4839e6da0e02376af"
        if (hash === precalculated) {
            unsafe = true;
        }
    })
});