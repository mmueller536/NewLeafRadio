var intervalNotSet = true;
var timer;
var fadeOutTimer;
var fadeInTimer;
var coffeeBreakFlag = true;
var checkWeatherFlag = false;
var lat = 0;
var long = 0;
var filePathPrefix = "Normal";
var maxVolume = 1;

async function playRadio() {
    coffeeBreakFlag = false;
    let now = new Date();

    let later = new Date(now);
    later.setMilliseconds(0);
    later.setSeconds(0);
    later.setMinutes(0);
    later.setHours(now.getHours()+1);
    console.log("Next song change: "+ later);

    let timeToElapse = later.getTime() - now.getTime();
    console.log("Milliseconds before then: "+ timeToElapse);

    if (checkWeatherFlag) {
        await updateCurrentWeather();
    }
    console.log("playing song...");
    playSong(now.getHours());

    timer = setTimeout(function() {
        if (!coffeeBreakFlag) {
            fadeOut();
        }
    }, timeToElapse);
}

function stopRadio() {
    coffeeBreakFlag = true;
    clearInterval(fadeOutTimer);
    fadeOutTimer = null;
    clearInterval(fadeInTimer);
    fadeInTimer = null;
    clearTimeout(timer);

    let oldAudio = document.querySelector('audio');
    if(oldAudio)
        oldAudio.remove();
}

function playSong(hour){
    let prefix = filePathPrefix;
    let suffix = (hour >= 12)? 'PM' : 'AM';
    hour = (hour > 12)? hour - 12 : hour;
    hour = (hour == 0)? 12 : hour;


    let oldAudio = document.querySelector('audio');
    if(oldAudio)
        oldAudio.remove();

    let player = document.createElement('audio');
    player.id = `current-song`
    player.src = `https://cdn.glitch.com/a032b7da-b36c-4292-9322-7d4c98be233b%2F${prefix}NewLeaf_${hour}${suffix}.mp3?v=1570640087304`
    player.volume = 0;
    player.loop = true;
    document.body.append(player);

    player.play();
    fadeIn();
}

function fadeOut(){
    console.log('swapping songs');
    if (!fadeOutTimer){
        fadeOutTimer = setInterval(function(){
            if (!coffeeBreakFlag) {
                let currentVolume = $('#current-song')[0].volume;
                if(currentVolume - .1 > 0)
                    $('#current-song')[0].volume -= .1;
                else{
                    $('#current-song')[0].volume = 0;
                    clearInterval(fadeOutTimer);
                    fadeOutTimer = null;
                    playRadio();
                }
            }
        }, 500);
    }
}

function fadeIn(){
    if (!fadeInTimer) {
        fadeInTimer = setInterval(function(){
            if (fadeOutTimer) {
                clearInterval(fadeInTimer);
                fadeInTimer = null;
            }
            if (!coffeeBreakFlag) {
                let currentVolume = $('#current-song')[0].volume;
                if(currentVolume + .1 < maxVolume)
                    $('#current-song')[0].volume += .1
                else {
                    $('#current-song')[0].volume = maxVolume;
                    clearInterval(fadeInTimer);
                    fadeInTimer = null;
                }
            }
        }, 500);
    }
}

function swapButtons(){
    if ($('#start')[0].style.display == "block"){
        $('#start')[0].style.display = "none";
        $('#stop')[0].style.display = "block"
    } else {
        $('#stop')[0].style.display = "none";
        $('#start')[0].style.display = "block";
    }
}

function weatherChanged(selected){
    if (selected.id == "none") {
        $('#custom-weather-sub')[0].style.display = "none";
        checkWeatherFlag = false;
        filePathPrefix = "Normal";
        if (!coffeeBreakFlag) {
            playRadio();
        }
    } else if (selected.id == "custom") {
        checkWeatherFlag = false;
        $('#custom-weather-sub')[0].style.display = "block";
        filePathPrefix = $('#custom-weather-sub').find('.active')[0].id;
        if (!coffeeBreakFlag) {
            playRadio();
        }
    } else if (selected.id == "dynamic") {
        checkWeatherFlag = true;
        $('#custom-weather-sub')[0].style.display = "none";
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(async function(pos) {
                lat = pos.coords.latitude;
                long = pos.coords.longitude;
                try {
                    if (!coffeeBreakFlag) {
                        playRadio();
                    }
                } catch {
                    showModal();
                }
            });
        }
    }
}

function customWeatherRequest(selected) {
    filePathPrefix = selected.id;
    if (!coffeeBreakFlag) {
        playRadio();
    }
}

function determineWeather(data) {
    let rainIcons = [
        'rain_sleet',
        'fzra',
        'rain_fzra',
        'snow_fzra',
        'sleet',
        'rain',
        'rain_showers',
        'rain_showers_hi',
        'tsra',
        'tsra_sct',
        'tsra_hi',
        'tornado',
        'hurricane',
        'tropical_storm'
    ];

    let snowIcons = [
        'snow',
        'rain_snow',
        'snow_sleet',
        'blizzard'
    ];

    let icon_name = data.icon.substring(data.icon.lastIndexOf('/')+1, data.icon.indexOf('?'));

    if (snowIcons.includes(icon_name)){
        return "Snow";
    } else if (rainIcons.includes(icon_name)){
        return "Rain";
    } else {
        return "Normal";
    }
}

async function updateCurrentWeather() {
    let pointData = await (await fetch(`https://api.weather.gov/points/${Number(lat).toFixed(4)},${Number(long).toFixed(4)}`)).json();
    console.log("Detected County Code: "+ pointData.properties.county.substring(pointData.properties.county.lastIndexOf('/')+1, pointData.properties.county.length));
    let forecastUrl = pointData.properties.forecastHourly

    let forecast = await (await fetch(forecastUrl)).json();
    let currentHour = forecast.properties.periods[0];
    let precipitation = determineWeather(currentHour);
    console.log("Interpreted Precipitaion: "+ precipitation);
    filePathPrefix = precipitation;
}

function shrinkModal() {
    $(".modal")[0].style.display = "none";
    let weatherOptions = $('#weather-options');
    let currentSelection = weatherOptions.find('.active');
    currentSelection.removeClass('active');
    
    let newSelection = weatherOptions.find('#none').parent();
    newSelection.addClass('active');

    filePathPrefix = 'Normal';
    if(!coffeeBreakFlag){
        playRadio();
    }
}

function showModal() {
    $(".modal")[0].style.display = "block";
}

function slideVolume(volume){
    clearInterval(fadeInTimer);
    fadeInTimer = 0;
    maxVolume = volume.value / 100;
    if($('#current-song')[0])
        $('#current-song')[0].volume = maxVolume;
}