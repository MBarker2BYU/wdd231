const url = 'https://byui-cse.github.io/cse-ww-program/data/latter-day-prophets.json';
const cards = document.querySelector('#cards');

async function getProphetData() 
{
    const response = await fetch(url);
    const data = await response.json();
    displayProphets(data.prophets);
}

getProphetData();

const displayProphets = (prophets) => 
    {
        prophets.forEach((prophet) =>
            {
                let card = document.createElement('section');
                let fullName = document.createElement('h2');
                let dob = document.createElement('span');
                let pod = document.createElement('span');
                let portrait = document.createElement('img');

                //Reduce cluter and make it more readable
                setProphetName(fullName, prophet.name, prophet.lastname);
                setProphetBirthInfo(dob, pod, prophet.birthdate, prophet.birthplace);
                setImageAttributes(portrait, prophet.imageurl, `Portrait of ${prophet.name} ${prophet.lastname}`, '100%', 'auto');

                card.appendChild(fullName);
                card.appendChild(dob);
                card.appendChild(pod);
                card.appendChild(portrait);

                cards.appendChild(card);
            });
    }

function setProphetName(element, firstName, lastName)
{
    element.textContent = `${firstName} ${lastName}`;
}

function setProphetBirthInfo(dateElement, placeElement, date, place)
{
    dateElement.textContent = `Date of Birth: ${date}`;
    placeElement.textContent = `Place of Birth: ${place}`;
}

function setImageAttributes(element, source, alt, height, width) 
{
    element.setAttribute('src', source);
    element.setAttribute('alt', alt);
    element.setAttribute('loading', 'lazy');
    element.setAttribute('width', height);
    element.setAttribute('height', width);
}