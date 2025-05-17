const cards = document.querySelector('#cards');

async function getMemberData() 
{
    const response = await fetch('./data/members.json');
    const data = await response.json();

    displayBusinessCards(data.members);
}

getMemberData();

const displayBusinessCards = (members) =>
    {
        members.forEach((member) =>
            {
                let card = document.createElement('section');
                let businessName = document.createElement('h2');
                let tagline = document.createElement('p');
                let email = document.createElement('p');
                let phone = document.createElement('p');
                             
                setBusinessName(businessName, member.name);
                setTagline(tagline, member.tagline);

                setEmail(email, member.email);
                setPhone(phone, member.phone_number);

                card.appendChild(businessName);
                card.appendChild(tagline);
                card.appendChild(email);
                card.appendChild(phone);

                cards.appendChild(card);
            });        
    }


function setBusinessName(element, name)
{
    element.textContent = `${name}`;
}

function setTagline(element, tagline)
{
    element.textContent = `${tagline}`;
}

function setEmail(element, email)
{ 
    element.textContent = `Email: ${email}`;
}

function setPhone(element, phone)
{
    element.textContent = `Phone: ${phone}`;
}