// Jugaad docs — command filter, mobile category nav, and presentation polish

(function () {
  function fuzzyMatch(query, target) {
    if (!query) return true;
    query = query.toLowerCase();
    target = target.toLowerCase();
    if (target.includes(query)) return true;

    let qi = 0;
    for (let ti = 0; ti < target.length && qi < query.length; ti++) {
      if (target[ti] === query[qi]) qi++;
    }
    return qi === query.length;
  }

  const filterInput = document.getElementById("command-filter");
  const noResults = document.getElementById("no-results");

  if (filterInput) {
    filterInput.addEventListener("input", function () {
      const query = filterInput.value.trim();
      const categories = document.querySelectorAll(".command-category");
      let anyVisible = false;

      categories.forEach(function (category) {
        const cards = category.querySelectorAll(".command-card");
        let visibleInCategory = 0;

        cards.forEach(function (card) {
          const name = card.getAttribute("data-name") || "";
          const match = fuzzyMatch(query, name);
          card.style.display = match ? "" : "none";
          if (match) visibleInCategory++;
        });

        category.style.display = visibleInCategory > 0 ? "" : "none";
        if (visibleInCategory > 0) anyVisible = true;
      });

      if (noResults) {
        noResults.style.display = anyVisible ? "none" : "block";
      }
    });
  }

  const navToggle = document.getElementById("mobile-nav-toggle");
  const sidebar = document.getElementById("sidebar");

  if (navToggle && sidebar) {
    navToggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });

    sidebar.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        sidebar.classList.remove("open");
      });
    });
  }

  // ---- Presentation ----

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header gets a shadow once the page is scrolled off the top.
  const header = document.querySelector(".site-header");
  const toTop = document.querySelector(".to-top");

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (toTop) toTop.classList.toggle("visible", y > 600);
  }

  if (header || toTop) {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // Reveal-on-scroll for opted-in elements.
  //
  // The hidden-initial-state CSS lives behind .js-reveal and is only switched on
  // here, so any failure path leaves the content plainly visible instead of
  // stuck at opacity 0. A failsafe timer also force-reveals everything in case
  // the observer never delivers callbacks (some headless/prerender renderers).
  const revealTargets = document.querySelectorAll("[data-reveal]");

  function revealAll() {
    revealTargets.forEach(function (el) {
      el.classList.add("revealed");
    });
  }

  if (revealTargets.length && !reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-reveal");

    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          // Stagger siblings slightly so a grid cascades instead of popping.
          const delay = Number(entry.target.getAttribute("data-reveal-delay")) || 0;
          setTimeout(function () {
            entry.target.classList.add("revealed");
          }, delay);
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });

    setTimeout(revealAll, 1500);
  }

  // Sidebar scrollspy — highlights the category currently in view.
  const sidebarLinks = document.querySelectorAll(".sidebar a[href^='#']");

  if (sidebarLinks.length && "IntersectionObserver" in window) {
    const linkFor = new Map();
    const sections = [];

    sidebarLinks.forEach(function (link) {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      if (!section) return;
      linkFor.set(section, link);
      sections.push(section);
    });

    let activeLink = null;

    function setActive(link) {
      if (link === activeLink) return;
      if (activeLink) activeLink.classList.remove("active");
      if (link) link.classList.add("active");
      activeLink = link;
    }

    const spy = new IntersectionObserver(
      function () {
        // Pick the last section whose top has passed the header line.
        const marker = 120;
        let current = null;
        sections.forEach(function (section) {
          if (section.getBoundingClientRect().top <= marker) current = section;
        });
        setActive(current ? linkFor.get(current) : null);
      },
      { rootMargin: "-100px 0px 0px 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach(function (section) {
      spy.observe(section);
    });

    // The observer only fires on threshold crossings; scrolling within one long
    // section still needs to keep the highlight correct.
    window.addEventListener(
      "scroll",
      function () {
        const marker = 120;
        let current = null;
        sections.forEach(function (section) {
          if (section.style.display === "none") return;
          if (section.getBoundingClientRect().top <= marker) current = section;
        });
        setActive(current ? linkFor.get(current) : null);
      },
      { passive: true },
    );
  }
})();
