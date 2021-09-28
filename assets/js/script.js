const APIKey = "fb5ee4acd32f9e510ff4bf073921379e";

var citySearchForm = $('#citySearchForm');
var citySearchInput = $('#citySearch');
var searchBTN = $('#searchBtn');
var clearBtn = $('#clearBtn');
var dailyForecast = $('.daily-forecast');
var previousCityList = $('#search-history');
const forecastTitle = $('<h4>').addClass('forecast-title');


const currentCity = $('#current-city');
const currentDate = $('#current-date');
const currentForecastDisplay = $('.card-body');
const dailyCard = $('.daily');

var cityLat;
var cityLon;
const MAX_HISTORY_LENGTH=10;

function getCities(){
    // retrieve all from ls
    return JSON.parse(localStorage.getItem('cities')) || [];
}

var formSubmitHandler = function (event) {
    event.preventDefault();
    clear();

    const city = citySearchInput.val().trim().toLowerCase();
           const cities = getCities();

    // duplicates
    if(!cities.includes(city)){
        cities.push(city);
    }
    /// max length
    if (cities.length > MAX_HISTORY_LENGTH){
        // remove the oldest
        cities.splice(0, 1)
    }
    
    displaySearchHistory();

    
    if (city) {
        renderDashboard(city);
        citySearchInput.val('');
        localStorage.setItem('cities', JSON.stringify(cities));
    } else {
        alert('please enter a valid city')
    }
};


function renderDashboard(city){
    getWeather(city)
    .then(function(weatherData){
        console.log(weatherData);
    
        currentCity.text(city.toLowerCase() + " - ");
    
        const currentForecast = $('<ul>');
        const currentTemp = $('<li>').text("temp: " + weatherData.current.temp + " °C");
        const currentFeelsLike = $('<li>').text("feels-like: " + weatherData.current.feels_like + " °C");
        const currentWind = $('<li>').text("wind-speed: " + weatherData.current.wind_speed + " km/h");
        const currentHumidity = $('<li>').text("humidity: " + weatherData.current.humidity + " %");
        const currentUvi = $('<li>').text("uv-index: " + weatherData.current.uvi);
        const uviIcon = $('<i>').addClass('fas fa-sun');

        currentForecastDisplay.append(
            currentForecast.append(
                currentTemp,
                currentFeelsLike,
                currentWind,
                currentHumidity,
                currentUvi.append(uviIcon)
            )
        );

        const uvi = weatherData.current.uvi

        if (uvi < 2) {
            uviIcon.addClass('low-uv')
        } else if (uvi >= 2 && uvi < 5) {
            uviIcon.addClass('med-uv')
        } else if (uvi >= 5 && uvi < 7) {
            uviIcon.addClass('med-high-uv')
        } else {
            uviIcon.addClass('high-uv')
        }

        dailyCard.append(forecastTitle);
        forecastTitle.text('5-day forecast:');
        currentDate.text(moment().format("dddd, MMMM Do YYYY").toLowerCase());

        const iconImg = $('<img>').attr('src', generateIconUrl(weatherData.current.weather[0].icon));
        currentDate.append(iconImg);
    
        for (let i = 1; i < 6; i++) { //as index 0 is also current
            
            
            const forecastContainer = $('<div>').addClass('col-2').attr('id', i);
            const forecastList = $('<ul>').addClass('forecast-item');
            const forecastDate = $('<h5>').text(moment().add(i, 'days').format("MMM Do").toLowerCase());
            const forecastMaxTemp = $('<li>').text("max: " + weatherData.daily[i].temp.max + " °C").addClass('forecast-item'); 
            const forecastMinTemp = $('<li>').text("min: " + weatherData.daily[i].temp.min + " °C").addClass('forecast-item');
            const forecastWind = $('<li>').text("wind: " + weatherData.daily[i].wind_speed + " km/h").addClass('forecast-item');
            const forecastHumidity = $('<li>').text("humidity: " + weatherData.daily[i].humidity + " %").addClass('forecast-item');
            const iconImg = $('<img>').attr('src', generateIconUrl(weatherData.daily[i].weather[0].icon));
    
            dailyForecast.append(
                forecastContainer.append(
                    forecastList.append(
                        forecastDate,
                        iconImg,
                        forecastMaxTemp,
                        forecastMinTemp,
                        forecastWind,
                        forecastHumidity
                    )
                )
            )
        }
    });    
}
//current forecast
function getCurrentForecast (city) {
    var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey + "&units=metric";

    return fetch(queryURL)
    .then(function (response) {
        if (response.ok) {
            return response.json();
        } else {
            alert('error: ' + response.statusText);
        }
    });
};

//weekly forecast
function getWeeklyForecast (cityLat, cityLon) {
    var queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + cityLat + "&lon=" + cityLon + "&exclude=minutely,hourly,alerts&units=metric&appid=" + APIKey;

    return fetch(queryURL)
    .then(function (response) {
        if (response.ok) {
            return response.json();
        } else {
            alert('error: ' + response.statusText);
        }
    })
};

function getWeather(city) {
    return getCurrentForecast(city)
        .then(function(currentWeatherResponse){
            cityLat = currentWeatherResponse.coord.lat;
            cityLon = currentWeatherResponse.coord.lon;

            return getWeeklyForecast(cityLat, cityLon)
        })
}


function generateIconUrl(iconCode){
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function clear() { //for UX
    dailyForecast.empty();
    forecastTitle.remove();
    currentForecastDisplay.empty();
    currentCity.text('');
    currentDate.text('');
}

function clearStorage() {
    localStorage.clear();
    location.reload();
    displaySearchHistory();
}

function displaySearchHistory() {
    //get from storage
    let storedCities = getCities(); 
    previousCityList.empty();

    for (let i = 0; i < storedCities.length; i++) {
        const previousCity = $('<button>').text(storedCities[i]);
        previousCity.addClass('history-button');
        
        previousCityList.append(previousCity);
    }
}



previousCityList.on('click', '.history-button', function(event) {
    event.preventDefault();
    let city = $(event.target).text();
    console.log(city);
    renderDashboard(city);
    displaySearchHistory();
    clear();
})


$(window).on("load", displaySearchHistory); 
citySearchForm.on('submit', formSubmitHandler);
clearBtn.on('click', clearStorage);
