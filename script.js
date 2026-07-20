// Jugaad docs — command filter, mobile category nav, and presentation polish

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  // ---- Command filter ----

  const filterInput = document.getElementById("command-filter");
  const noResults = document.getElementById("no-results");
  const allCards = document.querySelectorAll(".command-card");

  let resultCount = null;

  if (filterInput) {
    // "/" hint chip inside the input.
    const hint = document.createElement("span");
    hint.className = "filter-hint";
    hint.textContent = "/";
    filterInput.parentElement.appendChild(hint);

    // Live result count, injected after the filter bar.
    resultCount = document.createElement("p");
    resultCount.className = "result-count";
    filterInput.closest(".filter-bar").insertAdjacentElement("afterend", resultCount);

    const total = allCards.length;

    // Deliberately "entries", not "commands". There are 84 actual slash
    // commands but ~106 cards, because subcommands (/fun, /owo, /grind, /image)
    // get their own card. Saying "commands" here would contradict the 84 on the
    // landing page.
    function setCount(shown, query) {
      if (!query) {
        resultCount.innerHTML = "<b>" + total + "</b> entries";
        return;
      }
      resultCount.innerHTML =
        "<b>" + shown + "</b> of " + total + " entries match “" + query + "”";
    }

    function runFilter() {
      const query = filterInput.value.trim();
      const categories = document.querySelectorAll(".command-category");
      let anyVisible = false;
      let shown = 0;

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
        shown += visibleInCategory;
      });

      if (noResults) {
        noResults.style.display = anyVisible ? "none" : "block";
      }
      setCount(shown, query);
    }

    filterInput.addEventListener("input", runFilter);

    // Escape clears the field rather than just blurring it.
    filterInput.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        filterInput.value = "";
        runFilter();
        filterInput.blur();
      }
    });

    setCount(total, "");
  }

  // Press "/" anywhere to jump into the filter — but not while the user is
  // already typing into something.
  if (filterInput) {
    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = document.activeElement;
      const tag = el && el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (el && el.isContentEditable)) return;
      e.preventDefault();
      filterInput.focus();
      filterInput.select();
    });
  }

  // ---- Copy-to-clipboard per command ----
  //
  // Injected rather than written into commands.html so the ~106 cards stay
  // plain content. No clipboard API (insecure context, denied permission) just
  // means no button, not a broken one.
  if (allCards.length && navigator.clipboard) {
    allCards.forEach(function (card) {
      const code = card.querySelector("code");
      if (!code) return;

      // Card signatures look like "/balance [user]" or "/image wanted [image]".
      // Copy only the invocable part — keep leading words (command + any
      // subcommand), drop the [optional] / <required> argument placeholders, so
      // what lands on the clipboard actually runs when pasted into Discord.
      const text = code.textContent
        .trim()
        .split(/\s+/)
        .reduce(function (acc, word) {
          if (acc.stop || /^[[<]/.test(word)) {
            acc.stop = true;
            return acc;
          }
          acc.parts.push(word);
          return acc;
        }, { parts: [], stop: false })
        .parts.join(" ");

      if (!text) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-cmd";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy " + text);

      btn.addEventListener("click", function () {
        navigator.clipboard.writeText(text).then(
          function () {
            btn.textContent = "Copied";
            btn.classList.add("done");
            setTimeout(function () {
              btn.textContent = "Copy";
              btn.classList.remove("done");
            }, 1400);
          },
          function () {
            btn.textContent = "Failed";
            setTimeout(function () {
              btn.textContent = "Copy";
            }, 1400);
          },
        );
      });

      card.appendChild(btn);
    });
  }

  // ---- Mobile category nav ----

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

  // ---- Sidebar scrollspy ----

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

    function pickActive() {
      const marker = 120;
      let current = null;
      sections.forEach(function (section) {
        if (section.style.display === "none") return;
        if (section.getBoundingClientRect().top <= marker) current = section;
      });
      setActive(current ? linkFor.get(current) : null);
    }

    const spy = new IntersectionObserver(pickActive, {
      rootMargin: "-100px 0px 0px 0px",
      threshold: [0, 0.25, 0.5, 1],
    });

    sections.forEach(function (section) {
      spy.observe(section);
    });

    // The observer only fires on threshold crossings; scrolling within one long
    // section still needs to keep the highlight correct.
    window.addEventListener("scroll", pickActive, { passive: true });
  }
})();
