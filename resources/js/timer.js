let countdownStarted = false;
function saveFormData() {
    Cookies.set('title', $('#title').val());
    Cookies.set('subject', $('#subject').val());
    Cookies.set('paper', $('#paper').val());
    Cookies.set('hours', $('#hours').val());
    Cookies.set('minutes', $('#minutes').val());
    Cookies.set('startTime', $('#start-time').val());
    Cookies.set('bg', $('#bg-color').val());
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
    let startTime = $('#start-time').val() || '00:00:00';
    
    // Split the start time into hours, minutes, and seconds
    let startTimeSplit = startTime.split(':');
    let startHours = parseInt(startTimeSplit[0]) || 0;
    let startMinutes = parseInt(startTimeSplit[1]) || 0;
    let startSeconds = parseInt(startTimeSplit[2]) || 0;
    
    // Convert start time to total seconds
    let startTimeSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;
    
    // Calculate end time in total seconds
    let endTimeSeconds = startTimeSeconds + totalSeconds;
    
    // Convert end time back to hours, minutes, and seconds
    let endHours = Math.floor(endTimeSeconds / 3600);
    let endMinutes = Math.floor((endTimeSeconds % 3600) / 60);
    let endSeconds = endTimeSeconds % 60;
    
    // Get the current time
    let now = new Date();
    let currentHours = now.getHours();
    let currentMinutes = now.getMinutes();
    let currentSeconds = now.getSeconds();
    
    // Convert current time to total seconds
    let currentTimeSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;
    
    // Calculate the remaining time in total seconds
    let remainingTimeSeconds = endTimeSeconds - currentTimeSeconds;
    
    // Convert remaining time back to hours, minutes, and seconds
    let remainingHours = Math.floor(remainingTimeSeconds / 3600);
    let remainingMinutes = Math.floor((remainingTimeSeconds % 3600) / 60);
    let remainingSeconds = remainingTimeSeconds % 60;
    
    // Adjust remaining time if negative
    if (remainingTimeSeconds < 0) {
        remainingHours = 0;
        remainingMinutes = 0;
        remainingSeconds = 0;
        remainingTimeSeconds = 0;
    }
    
    $('#hour-left').text(('0' + remainingHours).slice(-2));
    $('#min-left').text(('0' + remainingMinutes).slice(-2));

    // Calculate the color transition
    let elapsedTime = totalSeconds - remainingTimeSeconds;
    let percentage = (elapsedTime / totalSeconds);

    // Interpolate color from black to red
    let red = Math.floor(255 * percentage);
    let green = 0;
    let blue = 0;
    
    let color = 'rgb(' + red + ',' + green + ',' + blue + ')';
    let loading = $('.loading').css('width', `${percentage*100}%`);
    
    // Apply the color to the #time-left element
    $('#time-left-div').css('color', color);

    if (remainingTimeSeconds === 60 || (remainingTimeSeconds <= 60 && countdownStarted === false && remainingTimeSeconds > 0)) {
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
function startCountdown(seconds) {
    let countdown = seconds;
    countdownStarted = true;
    $('#countdown-box').removeClass('hidden');
    $('#countdown-timer').text(countdown);

    console.log("Its happening")

    let countdownInterval = setInterval(() => {
        countdown--;
        $('#countdown-timer').text(countdown);

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            $('#countdown-box').addClass('hidden');
            let confetti = setInterval(function () {
                party.confetti(document.body, {
                    count: party.variation.range(30, 50),
                    shapes: ["star", "roundedSquare", "rectangle", "circle", "square", "roundedRectangle"],
                    size: party.variation.range(0.5, 4),
                });
            }, 500);
            setTimeout(function () {
                clearInterval(confetti)
            }, 5000);
            countdownStarted = false;
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

    $('#title, #subject, #paper, #hours, #minutes, #start-time, #bg-color').on('input change keyup', saveFormData);
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
});