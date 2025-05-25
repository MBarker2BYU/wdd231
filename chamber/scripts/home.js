    // OpenWeather API setup
    const apiKey = 'e76fca265a6ee2e92faa79e4ac4d0d6c';
    const latitude = 26.668174771096886;
    const longitude = -81.98061166970946;
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;

    // Function to convert string to title case    
    function titleCase(str) 
    {
        return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) 
        {
            return match.toUpperCase();
        });
    }

    // Fetch and display current weather
    async function fetchCurrentWeather() {
      try {
        const response = await fetch(currentWeatherUrl);
        const data = await response.json();
        const temp = Math.round(data.main.temp);
        const desc = data.weather[0].description;
        
        const weatherIconContainer = document.getElementById('weather-icon-container');
        const currentTemp = document.getElementById('current-temp');
        const weatherDescription = document.getElementById('weather-description');
        const highTemp = document.getElementById('high-temp');
        const lowTemp = document.getElementById('low-temp');
        const humidity = document.getElementById('humidity');
        const sunrise = document.getElementById('sunrise');
        const sunset = document.getElementById('sunset');

        const weatherIcon = document.createElement('img');
        weatherIcon.classList.add('weather-icon');

        const iconsrc = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;        
        weatherIcon.setAttribute('src', iconsrc);
        weatherIcon.setAttribute('alt', desc);
        
        weatherIconContainer.appendChild(weatherIcon);

        const high = Math.round(data.main.temp_max);
        const low = Math.round(data.main.temp_min);
        const humidityValue = data.main.humidity;
        const sunriseCalc = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sunsetCalc = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        
        currentTemp.textContent = `${temp}°F`;
        weatherDescription.textContent = titleCase(desc);
        highTemp.textContent = `High: ${high}°`;
        lowTemp.textContent = `Low: ${low}°`;
        humidity.textContent = `Humidity: ${humidityValue}%`;
        sunrise.textContent = `Sunrise: ${sunriseCalc}`;
        sunset.textContent = `Sunset: ${sunsetCalc}`;
      } catch (error) {
        console.error('Error fetching current weather:', error);
        document.getElementById('current-weather').textContent = 'Unable to load weather data';
      }
    }

    // Fetch and display weather forecast
    async function fetchWeatherForecast() {
      try {
        const response = await fetch(forecastUrl);
        const data = await response.json();
        const dailyData = {};

        // Group forecast data by day
        data.list.forEach(entry => 
            {
                const date = new Date(entry.dt * 1000);
                const day = date.toLocaleDateString('en-US', { weekday: 'long' });
                if (!dailyData[day]) {
                    dailyData[day] = { temps: [] };
                }
                dailyData[day].temps.push(entry.main.temp);
            });

        // Get today's and the next two days' highs
        const days = Object.keys(dailyData).slice(0, 3); // Friday, Saturday, Sunday
        if (days[0]) {
          const high = Math.round(Math.max(...dailyData[days[0]].temps));
          document.getElementById('day1').textContent = `Today: ${high}°F`;
        }
        if (days[1]) {
          const high = Math.round(Math.max(...dailyData[days[1]].temps));
          document.getElementById('day2').textContent = `${days[1]}: ${high}°F`;
        }
        if (days[2]) {
          const high = Math.round(Math.max(...dailyData[days[2]].temps));
          document.getElementById('day3').textContent = `${days[2]}: ${high}°F`;
        }
      } catch (error) {
        console.error('Error fetching forecast:', error);
        document.getElementById('day1').textContent = 'Unable to load forecast';
      }
    }

    // Fetch weather data on page load
    // fetchCurrentWeather();
    // fetchWeatherForecast();

    // Business Cards
    
    async function getMemberData() 
    {
        try {
            const response = await fetch('./data/members.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch members.json: ${response.statusText}`);
            }
            const data = await response.json();

            const shuffledMembers = data.members.sort(() => 0.5 - Math.random()); // Shuffle the array
            const selectedMembers = shuffledMembers.slice(0, 3);

            displayMemberData(selectedMembers);
        } catch (error) {
            console.error('Error fetching or displaying member data:', error);
        }
    }

    function displayMemberData(members)
    {
        const cards = document.getElementById('business-cards');
        if (!cards) {
            console.error('Cards element not found.');
            return;
        }

        members.forEach(member => 
            {
                const card = document.createElement('div');
                card.classList.add('business-card');

                const top = document.createElement('div');
                top.classList.add('card-top');

                const bottom = document.createElement('div');
                bottom.classList.add('card-bottom');

                const bottomImage = document.createElement('div');
                bottomImage.classList.add('bottom-image');

                const bottomInfo = document.createElement('div');
                bottomInfo.classList.add('bottom-info');

                bottom.appendChild(bottomImage);
                bottom.appendChild(bottomInfo);

                card.appendChild(top);
                card.appendChild(bottom);

                const name = document.createElement('h2');
                name.textContent = member.name;

                const tagline = document.createElement('p');
                tagline.textContent = member.tagline;
                
                const image = document.createElement('img');
                image.classList.add('business-card-image');
                image.setAttribute('src', `./images/${member.image_icon_filename}`);
                
                if (member.use_dark_background) 
                {
                    bottomImage.style.backgroundColor = 'var(--osu-black)';
                }

                const email = document.createElement('p');
                email.textContent = member.email;

                const phone = document.createElement('p');
                phone.textContent = member.phone_number;

                const url = document.createElement('p');
                url.textContent = member.website_url;

                top.appendChild(name);
                top.appendChild(tagline);

                bottomImage.appendChild(image);

                bottomInfo.appendChild(email);
                bottomInfo.appendChild(phone);
                bottomInfo.appendChild(url);

                cards.appendChild(card);
            });
    }

    document.addEventListener('DOMContentLoaded', () => 
        {
            fetchCurrentWeather();
            fetchWeatherForecast();
            getMemberData();            
        });