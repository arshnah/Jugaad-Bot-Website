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

    // Deliberately "entries", not "commands". There are 86 actual slash
    // commands but ~106 cards, because subcommands (/fun, /owo, /grind, /image)
    // get their own card. Saying "commands" here would contradict the 86 on the
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

  // ---- Live stats ----
  //
  // Progressive enhancement, deliberately. The numbers are already correct in
  // the HTML; this only overwrites them if the API answers. A missing meta tag,
  // an unreachable box, a CORS refusal or malformed JSON all leave the page
  // exactly as served — the failure mode is "slightly stale", never "blank".
  //
  // The meta content must be an https:// origin. The site is served over HTTPS
  // and browsers block http:// fetches from an https:// page, so an http origin
  // here silently fails no matter what the server does.
  const apiBase = (document.querySelector('meta[name="jugaad-api"]')?.content || "").replace(/\/$/, "");

  function applyStats(stats) {
    document.querySelectorAll("[data-stat]").forEach(function (el) {
      const value = stats[el.getAttribute("data-stat")];
      if (typeof value === "number") el.textContent = value.toLocaleString();
    });

    // The search trigger and footer quote the command count in prose.
    const commands = stats.commands;
    if (typeof commands === "number") {
      const trigger = document.querySelector("#search-trigger .grow");
      if (trigger) trigger.textContent = "Search " + commands + " commands…";
      document.querySelectorAll("[data-stat-text]").forEach(function (el) {
        el.textContent = el.getAttribute("data-stat-text").replace("{commands}", commands);
      });
    }
  }

  if (apiBase) {
    fetch(apiBase + "/stats", { headers: { accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(applyStats)
      .catch(function () {
        // Intentionally silent: the served numbers are the fallback.
      });
  }

  // ---- Leaderboard page ----

  const boardEl = document.getElementById("leaderboard");
  if (boardEl && apiBase) {
    const tabs = document.querySelectorAll(".board-tab");

    function renderBoard(type) {
      boardEl.innerHTML = '<p class="board-empty">Loading…</p>';
      fetch(apiBase + "/leaderboard?type=" + encodeURIComponent(type) + "&limit=15")
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(function (data) {
          if (!data.entries || !data.entries.length) {
            boardEl.innerHTML = '<p class="board-empty">Nothing here yet.</p>';
            return;
          }
          boardEl.innerHTML = data.entries
            .map(function (e) {
              // textContent-style escaping: names come from Discord display
              // names, which can contain anything.
              const safe = String(e.name).replace(/[&<>"']/g, function (c) {
                return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
              });
              return (
                '<li class="board-row">' +
                '<span class="board-rank">' + e.rank + "</span>" +
                '<span class="board-name">' + safe + "</span>" +
                '<span class="board-value">' + String(e.label ?? e.value) + "</span>" +
                "</li>"
              );
            })
            .join("");
        })
        .catch(function () {
          boardEl.innerHTML =
            '<p class="board-empty">Leaderboards are offline right now. Try <code>/rank</code> in Discord.</p>';
        });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.toggle("active", t === tab);
        });
        renderBoard(tab.getAttribute("data-board"));
      });
    });

    renderBoard("level");
  } else if (boardEl) {
    boardEl.innerHTML =
      '<p class="board-empty">Leaderboards aren\'t switched on yet. Use <code>/rank</code> in Discord.</p>';
  }

  // ---- testers.html filter ----
  //
  // Same interaction as the commands filter, on a page that had 75 test cards
  // and no way to narrow them. Matches on the command name in the card's <h3>
  // plus the step text, so "cooldown" finds every test that mentions one.

  const testFilter = document.getElementById("test-filter");
  const testNoResults = document.getElementById("test-no-results");

  if (testFilter) {
    const testCards = [...document.querySelectorAll(".test-card")].map(function (card) {
      const h3 = card.querySelector("h3");
      return {
        card: card,
        name: h3 ? h3.textContent.trim() : "",
        hay: card.textContent.replace(/\s+/g, " ").trim().toLowerCase(),
      };
    });

    const testHint = document.createElement("span");
    testHint.className = "filter-hint";
    testHint.textContent = "/";
    testFilter.parentElement.appendChild(testHint);

    const testCount = document.createElement("p");
    testCount.className = "result-count";
    testFilter.closest(".filter-bar").insertAdjacentElement("afterend", testCount);

    function runTestFilter() {
      const query = testFilter.value.trim();
      let shown = 0;

      // Fuzzy (subsequence) matching only against the command name. Against the
      // whole card it's meaningless — "daily" subsequence-matched 54 of 75 cards,
      // because d-a-i-l-y turns up scattered through any long paragraph. The body
      // is matched on substring so "cooldown" still finds every test that
      // mentions one.
      const lower = query.toLowerCase();
      testCards.forEach(function (entry) {
        const match = fuzzyMatch(query, entry.name) || (lower && entry.hay.includes(lower));
        entry.card.style.display = match ? "" : "none";
        if (match) shown++;
      });

      // Hide a category heading once every test under it is filtered out.
      document.querySelectorAll(".test-category").forEach(function (section) {
        const visible = [...section.querySelectorAll(".test-card")].some(function (c) {
          return c.style.display !== "none";
        });
        section.style.display = visible ? "" : "none";
      });

      if (testNoResults) testNoResults.style.display = shown ? "none" : "block";
      testCount.innerHTML = query
        ? "<b>" + shown + "</b> of " + testCards.length + " tests match “" + query + "”"
        : "<b>" + testCards.length + "</b> tests";
    }

    testFilter.addEventListener("input", runTestFilter);
    testFilter.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        testFilter.value = "";
        runTestFilter();
        testFilter.blur();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = document.activeElement;
      const tag = el && el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (el && el.isContentEditable)) return;
      e.preventDefault();
      testFilter.focus();
      testFilter.select();
    });

    runTestFilter();
  }

  // ---- Global command palette ----
  //
  // Searches every command from any page. commands.html is the single source of
  // truth: on that page the index is read straight out of the DOM, and on the
  // others it's lazily fetched and parsed on first open. Nothing is generated
  // or duplicated, so the index can't drift out of sync with the catalog.

  let commandIndex = null;
  let indexPromise = null;

  function parseCommands(doc) {
    const out = [];
    doc.querySelectorAll(".command-category").forEach(function (section) {
      const heading = section.querySelector("h2");
      const cat = heading ? heading.textContent.trim() : "";
      section.querySelectorAll(".command-card").forEach(function (card) {
        const code = card.querySelector("code");
        const desc = card.querySelector(".desc");
        out.push({
          name: card.getAttribute("data-name") || "",
          sig: code ? code.textContent.trim() : "",
          desc: desc ? desc.textContent.trim() : "",
          cat: cat,
          id: section.id || "",
        });
      });
    });
    return out;
  }

  function loadIndex() {
    if (commandIndex) return Promise.resolve(commandIndex);
    if (indexPromise) return indexPromise;

    if (document.querySelector(".command-category")) {
      commandIndex = parseCommands(document);
      return Promise.resolve(commandIndex);
    }

    // Fetching a sibling page fails under file:// (treated as cross-origin).
    // Resolving to an empty index is the graceful path: the palette then offers
    // a link to commands.html instead of showing a broken box.
    indexPromise = fetch("commands.html")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then(function (html) {
        commandIndex = parseCommands(new DOMParser().parseFromString(html, "text/html"));
        return commandIndex;
      })
      .catch(function () {
        commandIndex = [];
        return commandIndex;
      });

    return indexPromise;
  }

  const paletteEl = document.createElement("div");
  paletteEl.className = "palette";
  paletteEl.id = "palette";
  paletteEl.hidden = true;
  paletteEl.innerHTML =
    '<div class="palette-box" role="dialog" aria-modal="true" aria-label="Search commands">' +
    '<input type="text" id="palette-input" placeholder="Search commands…" autocomplete="off" ' +
    'role="combobox" aria-expanded="true" aria-controls="palette-results" />' +
    '<ul class="palette-results" id="palette-results" role="listbox"></ul>' +
    '<div class="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span>' +
    "<span><kbd>enter</kbd> open</span><span><kbd>esc</kbd> close</span></div>" +
    "</div>";
  document.body.appendChild(paletteEl);

  const paletteInput = paletteEl.querySelector("#palette-input");
  const paletteList = paletteEl.querySelector("#palette-results");
  let paletteRows = [];
  let cursor = 0;
  let lastFocus = null;

  function commandsHref(entry) {
    return "commands.html?q=" + encodeURIComponent(entry.name) + (entry.id ? "#" + entry.id : "");
  }

  // Rank, don't just filter. fuzzyMatch is subsequence-based, which is right for
  // short command names but useless against a full sentence — "slot" subsequence-
  // matches the description of /shop, /rob and /buy, which buried /slots at
  // position 8. Descriptions are therefore matched on substring only, and scored
  // below every name match.
  function score(query, e) {
    if (!query) return 0;
    const q = query.toLowerCase();
    const name = e.name.toLowerCase();
    if (name === q) return 0;
    if (name.startsWith(q)) return 1;
    if (name.includes(q)) return 2;
    if (e.sig.toLowerCase().includes(q)) return 3;
    if (fuzzyMatch(query, e.name)) return 4;
    if (e.desc.toLowerCase().includes(q)) return 5;
    return -1;
  }

  function renderPalette(query) {
    const list = commandIndex || [];
    const hits = list
      .map(function (e) {
        return { e: e, s: score(query, e) };
      })
      .filter(function (r) {
        return r.s >= 0;
      })
      .sort(function (a, b) {
        return a.s - b.s;
      })
      .slice(0, 40)
      .map(function (r) {
        return r.e;
      });

    paletteRows = hits;
    cursor = 0;

    if (!list.length) {
      paletteList.innerHTML =
        '<li class="palette-empty">Couldn\'t load the command list. ' +
        '<a href="commands.html">Open the commands page</a> instead.</li>';
      return;
    }
    if (!hits.length) {
      paletteList.innerHTML = '<li class="palette-empty">Nothing matches “' + query + "”.</li>";
      return;
    }

    paletteList.innerHTML = hits
      .map(function (e, i) {
        return (
          '<li role="option" aria-selected="' + (i === 0) + '">' +
          '<a href="' + commandsHref(e) + '">' +
          '<span class="cmd">' + e.sig + "</span>" +
          '<span class="txt">' + e.desc + "</span>" +
          '<span class="cat">' + e.cat + "</span>" +
          "</a></li>"
        );
      })
      .join("");
  }

  function moveCursor(delta) {
    const items = paletteList.querySelectorAll('li[role="option"]');
    if (!items.length) return;
    if (items[cursor]) items[cursor].setAttribute("aria-selected", "false");
    cursor = (cursor + delta + items.length) % items.length;
    items[cursor].setAttribute("aria-selected", "true");
    items[cursor].scrollIntoView({ block: "nearest" });
  }

  function openPalette() {
    lastFocus = document.activeElement;
    paletteEl.hidden = false;
    paletteInput.value = "";
    paletteList.innerHTML = '<li class="palette-empty">Loading…</li>';
    paletteInput.focus();
    loadIndex().then(function () {
      if (!paletteEl.hidden) renderPalette("");
    });
  }

  function closePalette() {
    paletteEl.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  const searchTrigger = document.getElementById("search-trigger");
  if (searchTrigger) searchTrigger.addEventListener("click", openPalette);

  paletteInput.addEventListener("input", function () {
    renderPalette(paletteInput.value.trim());
  });

  paletteEl.addEventListener("click", function (e) {
    if (e.target === paletteEl) closePalette();
  });

  paletteInput.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveCursor(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveCursor(-1);
    } else if (e.key === "Enter") {
      const link = paletteList.querySelectorAll('li[role="option"] a')[cursor];
      if (link) {
        e.preventDefault();
        link.click();
      }
    }
  });

  // Cmd/Ctrl+K opens the palette anywhere. "/" is left to the page's own filter
  // when it has one, so the shortcut always means "search what's in front of me".
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      paletteEl.hidden ? openPalette() : closePalette();
      return;
    }
    if (e.key === "/" && !filterInput && !testFilter && paletteEl.hidden) {
      const el = document.activeElement;
      const tag = el && el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (el && el.isContentEditable)) return;
      e.preventDefault();
      openPalette();
    }
  });

  // Arriving from the palette: ?q= prefills the filter so the linked command is
  // the only one on screen, rather than dumping the reader in a 105-card list.
  if (filterInput) {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      filterInput.value = q;
      filterInput.dispatchEvent(new Event("input"));
    }
  }
})();
