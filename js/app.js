async function loadData() {
  try {
    const response = await fetch("data/data.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderSite(data);
  } catch (err) {
    console.error("Error cargando data.json:", err);
  }
}

function renderSite(data) {
  document.getElementById("site-name").textContent = data.site.name;
  document.getElementById("site-tagline").textContent = data.site.tagline;

  const container = document.getElementById("items-container");
  container.innerHTML = "";

  data.items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h2>${item.title}</h2>
      <p>${item.description}</p>
      <a href="${item.url}">Ver más &rarr;</a>
    `;
    container.appendChild(card);
  });

  animateCards();
}

function animateCards() {
  if (typeof gsap === "undefined") return;
  gsap.from(".card", {
    y: 24,
    opacity: 0,
    duration: 0.5,
    stagger: 0.08,
    ease: "power2.out",
  });
}

document.addEventListener("DOMContentLoaded", loadData);
