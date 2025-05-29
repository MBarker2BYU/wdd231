const data = new URLSearchParams(window.location.search);

const thanks = document.getElementById('results');

function showResults() 
{
    const name = data.get('first') + ' ' + data.get('last');
    const ordinance = data.get('ordinance');  
    const date = data.get('date');
    const location = data.get('location');
    const phone = data.get('phone');
    const email = data.get('email');

    const nameElement = document.createElement('p');
    nameElement.textContent = `Name: ${name}`;

    const ordinanceElement = document.createElement('p');
    ordinanceElement.textContent = `Ordinance: ${ordinance}`;

    const dateElement = document.createElement('p');
    dateElement.textContent = `Date: ${date}`;

    const locationElement = document.createElement('p');
    locationElement.textContent = `Location: ${location}`;

    const phoneElement = document.createElement('p');
    phoneElement.textContent = `Phone: ${phone}`;

    const emailElement = document.createElement('p');
    emailElement.textContent = `Email: ${email}`;

    thanks.appendChild(nameElement);
    thanks.appendChild(ordinanceElement);
    thanks.appendChild(dateElement);
    thanks.appendChild(locationElement);
    thanks.appendChild(phoneElement);
    thanks.appendChild(emailElement);

}

showResults();