const cards = document.querySelector('#cards');

async function getMemberData() {
    const response = await fetch('./data/members.json');
    const data = await response.json();
    displayMemberData(data.members);
}

getMemberData();

const displayMemberData = (members) => 
    {
        members.forEach((member) => {
        let card = document.createElement('section');
        let image = document.createElement('img');
        let address = document.createElement('p');
        let phone = document.createElement('p');
        let website = document.createElement('a');

        // Reduce clutter and make it more readable
        setImageAttributes(image, `./images/${member.image_icon_filename}`, `${member.image_icon_filename} Logo`, '128px', 'auto');
        setMemberInfo(address, phone, website, member.address, member.phone_number, member.website_url);

        card.appendChild(image);
        card.appendChild(address);
        card.appendChild(phone);
        card.appendChild(website);

        cards.appendChild(card);
    });
}

function setImageAttributes(element, source, alt, height, width) 
{
    element.setAttribute('src', source);
    element.setAttribute('alt', alt);
    element.setAttribute('loading', 'lazy');
    element.setAttribute('width', height);
    element.setAttribute('height', width);
}

function setMemberInfo(addressElement, phoneElement, websiteElement, address, phone, website) 
{
    addressElement.textContent = address;
    phoneElement.textContent = phone;;
    websiteElement.textContent = website;
    websiteElement.setAttribute('href', "#");
}


