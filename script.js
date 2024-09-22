const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);

const toggleBtn = document.querySelector('#unitToggle');
let isMetric = true; // By default, assume the units are in metric (the superior unit!)
let currentCity = 'Toronto'; // Store the current city, by default show Toronto

getWeather(currentCity);

toggleBtn.addEventListener('change', function() {
    isMetric = !isMetric;
    
    if (currentCity) {
        getWeather(currentCity);
    }
});

// Handle submit when user inputs location request
function handleSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('input-city').value;
    currentCity = input;
    getWeather(input);
}

// Calls fetchWeather to make API call and return processed JSON. Call displayData to update DOM.
async function getWeather(city) {
    const data = await fetchWeather(city);
    displayData(data);
}

// Makes API call and returns process JSON file with helper function. Error handling if no data.
async function fetchWeather(city) {
    try {
        clearError();
        const apiUrl = generateApiUrl(city);
        const response = await fetch(apiUrl, {mode: 'cors'});

        if (!response.ok) {
            throw new Error(`Error fetching weather data: ${response.status}`)
        }

        const weatherData = await response.json();
        return processData(weatherData);

    } catch(error) {
        throwErrorMsg();
        console.error('Error: ', error);
    } finally {
        form.reset();
    }
}

// Generate API URL
function generateApiUrl(city) {
    const apiKey = 'FD9NQNJ44S7H9C25BLXV9LE6F';
    const baseUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';
    const unitGroup = isMetric ? 'metric' : 'us';
    const params = `unitGroup=${unitGroup}&elements=datetime%2Ctempmax%2Ctempmin%2Ctemp%2Cwindspeed%2Cconditions&include=current%2Cfcst&key=FD9NQNJ44S7H9C25BLXV9LE6F&contentType=json`;

    console.log(`${baseUrl}/${city}?${params}&key=${apiKey}`);
    return `${baseUrl}/${city}?${params}&key=${apiKey}`;
}

// From JSON output of API call, parse pertinent information
function processData(data) {
    const temp = Math.round(data.currentConditions.temp);
    const wind = Math.round(data.currentConditions.windspeed);
    const condition = data.currentConditions.conditions;
    const high = data.days[0].tempmax;
    const low = data.days[0].tempmin;

    const myData = {
        currentTemp: temp,
        wind: wind,
        location: data.resolvedAddress.replace(',',''),
        conditions: condition,
        highTemp: high,
        lowTemp: low,
    }

    return myData;
}

// Update the DOM with new weather information
function displayData(newData) {

    clearAnimation();

    const city = document.querySelector('#city');
    const temp = document.querySelector('#temperature');
    const wind = document.querySelector('#wind');
    const conditions = document.querySelector('#conditions');
    const range = document.querySelector('#range');

    city.textContent = newData.location;
    temp.textContent = isMetric ? `${newData.currentTemp}°C` : `${newData.currentTemp}°F`;
    wind.textContent = isMetric ? `W: ${newData.wind} km/h` : `Wind: ${newData.wind} mph`;
    conditions.textContent = newData.conditions;
    range.textContent = isMetric ? `H: ${newData.highTemp}°C ${'\xa0'.repeat(3)} L: ${newData.lowTemp}°C` : `H: ${newData.highTemp}°F ${'\xa0'.repeat(3)} L: ${newData.lowTemp}°F`;
    
}

function clearAnimation() {

    const weatherInfo = document.getElementsByClassName('info');

    Array.from(weatherInfo).forEach((div) => {
        if (div.classList.contains('fade-in')) {
            div.classList.remove('fade-in');
            div.offsetWidth;
            div.classList.add('fade-in');
        }
        else {
            div.classList.add('fade-in');
        }
    })
}

function throwErrorMsg() {
    const error = document.querySelector('.error');
    
    error.style.visibility = 'visible';
}

function clearError() {
    const error = document.querySelector('.error');

    error.style.visibility = 'hidden';
}

