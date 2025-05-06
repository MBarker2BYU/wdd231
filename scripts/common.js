const today = new Date();
const currentyear = document.getElementById("currentyear");
const lastmodified = document.getElementById("lastmodified");

currentyear.textContent = "\u00A9" + today.getFullYear();
lastmodified.textContent = document.lastModified;