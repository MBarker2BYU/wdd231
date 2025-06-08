// Handle visit message
const visitMessage = document.getElementById("visitMessage");
const lastVisit = localStorage.getItem("lastVisit");
const now = Date.now();
const oneDay = 24 * 60 * 60 * 1000;

if (!lastVisit) {
    visitMessage.textContent = "Welcome! Let us know if you have any questions.";
} else {
    const daysSinceLastVisit = Math.floor((now - lastVisit) / oneDay);
    if (daysSinceLastVisit < 1) {
        visitMessage.textContent = "Back so soon! Awesome!";
    } else {
        visitMessage.textContent = `You last visited ${daysSinceLastVisit} ${daysSinceLastVisit === 1 ? "day" : "days"} ago.`;
    }
}
localStorage.setItem("lastVisit", now);

// Fetch and display discover items
// fetch("data/discover.json")
//     .then(response => response.json())
//     .then(data => {
//         const grid = document.querySelector(".discover-grid");
//         data.items.forEach(item => {
//             const card = document.createElement("article");
//             card.className = "card";
//             card.innerHTML = `
//                 <h2>${item.name}</h2>
//                 <figure>
//                     <img src="images/${item.image}" alt="${item.name}" width="300" height="200">
//                 </figure>
//                 <address>${item.address}</address>
//                 <p>${item.description}</p>
//                 <button>Learn More</button>
//             `;
//             grid.appendChild(card);
//         });
//     });

fetch("data/discover.json")
    .then(response => response.json())
    .then(data => {
        const grid = document.querySelector(".discover-grid");
        const placeholders = grid.querySelectorAll(".card.loading");
        data.items.forEach((item, index) => {
            const card = document.createElement("article");
            card.className = "card";
            card.innerHTML = `
                <h2>${item.name}</h2>
                <figure>
                    <img src="images/${item.image}" alt="${item.name}" width="300" height="200">
                </figure>
                <address>${item.address}</address>
                <p>${item.description}</p>
                <button>Learn More</button>
            `;
            // Replace placeholder with actual card
            if (placeholders[index]) {
                placeholders[index].replaceWith(card);
            } else {
                grid.appendChild(card); // Fallback for unexpected cases
            }
        });
        // Remove any remaining placeholders (if data.items < 8)
        placeholders.forEach((placeholder, index) => {
            if (index >= data.items.length) placeholder.remove();
        });
    });