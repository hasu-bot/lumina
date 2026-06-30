const root = document.documentElement;
const body = document.body;
const cursor = document.querySelector(".cursor-signal");
const hero = document.querySelector(".hero");

body.classList.add("is-ready");

if (window.matchMedia("(pointer: fine)").matches && cursor) {
  let cursorX = -100;
  let cursorY = -100;
  let targetX = -100;
  let targetY = -100;

  body.classList.add("has-pointer");

  const moveCursor = () => {
    cursorX += (targetX - cursorX) * 0.18;
    cursorY += (targetY - cursorY) * 0.18;
    body.style.setProperty("--cursor-x", `${cursorX - 27}px`);
    body.style.setProperty("--cursor-y", `${cursorY - 27}px`);
    requestAnimationFrame(moveCursor);
  };

  window.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;

    if (hero) {
      const rect = hero.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      body.style.setProperty("--mx", `${x * 100}%`);
      body.style.setProperty("--my", `${y * 100}%`);
      body.style.setProperty("--mx-num", x.toFixed(3));
      body.style.setProperty("--my-num", y.toFixed(3));
    }
  });

  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("pointerenter", () => body.classList.add("is-linking"));
    link.addEventListener("pointerleave", () => body.classList.remove("is-linking"));
  });

  requestAnimationFrame(moveCursor);
}

const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
  );

  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add("is-visible"));
}
