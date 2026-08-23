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

  renderOrbit(data.items);
}

function renderOrbit(items) {
  const orbit = document.getElementById("hero-orbit");
  orbit.innerHTML = "";

  const withImage = items.filter((item) => item.image);
  const total = withImage.length;

  withImage.forEach((item, index) => {
    const angle = (360 / total) * index - 90;
    const img = document.createElement("img");
    img.className = "orbit-image";
    img.src = item.image;
    img.alt = item.title;
    img.style.setProperty("--angle", `${angle}deg`);
    orbit.appendChild(img);
  });

  if (typeof gsap !== "undefined") {
    gsap.from(".orbit-image", {
      opacity: 0,
      scale: 0.6,
      duration: 0.7,
      stagger: 0.1,
      ease: "back.out(1.6)",
    });
  }
}

document.addEventListener("DOMContentLoaded", loadData);
