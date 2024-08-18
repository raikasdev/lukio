window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }

const scrollObjects = document.querySelectorAll('div[data-scroll-to]');
// Trigger when div is in view (observer)
scrollObjects.forEach((object) => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      // If the page isn't long enough to scroll, don't track
      if (window.scrollY > 0) window.plausible(`Scroll to: ${object.dataset.scrollTo}`);
      observer.disconnect();
    }
  }, { threshold: 0.2 });
  observer.observe(object);
});
