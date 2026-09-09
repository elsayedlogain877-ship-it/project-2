/* =========================================================
   Personal Portfolio – Main JavaScript File
   Assignment 10: All logic here, no Bootstrap, no external libs
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     1) DARK / LIGHT THEME SWITCH
     - dark mode  => add "dark" class to <html>
     - light mode => remove that class
     - preference is saved in localStorage so it persists on reload
     ========================================================= */
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById("theme-toggle-button");

  function applyTheme(theme) {
    if (theme === "dark") {
      htmlEl.classList.add("dark");
    } else {
      htmlEl.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }

  // If the user already picked a theme before, apply it. Otherwise keep
  // whatever is set by default in the HTML (dark).
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isDark = htmlEl.classList.contains("dark");
      applyTheme(isDark ? "light" : "dark");
    });
  }

  /* =========================================================
     2) SCROLL SPY - update the active Navbar link on scroll
     ========================================================= */
  const navLinks = Array.from(
    document.querySelectorAll("#header .nav-links a[href^='#']")
  );

  // Note: style.css already has a ".nav-links a.active" rule
  // (sets the color and animates the underline), so we only need
  // to add/remove the "active" class, no other classes to swap.

  // Match each nav link with its target section
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  function setActiveLink(activeLink) {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link === activeLink);
    });
  }

  function getHeaderHeight() {
    const header = document.getElementById("header");
    return header ? header.offsetHeight : 0;
  }

  let scrollSpyTicking = false;
  function updateScrollSpy() {
    const offset = getHeaderHeight() + 20;
    const scrollPos = window.scrollY + offset;

    let currentSection = sections[0];
    for (const item of sections) {
      if (item.section.offsetTop <= scrollPos) {
        currentSection = item;
      }
    }

    // If the user scrolled to the very bottom, force the last link
    // (Contact) to be active, even if its section is shorter than the
    // viewport.
    const scrolledToBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 5;
    if (scrolledToBottom) {
      currentSection = sections[sections.length - 1];
    }

    if (currentSection) {
      setActiveLink(currentSection.link);
    }
    scrollSpyTicking = false;
  }

  window.addEventListener("scroll", () => {
    if (!scrollSpyTicking) {
      window.requestAnimationFrame(updateScrollSpy);
      scrollSpyTicking = true;
    }
  });

  // Run once on page load
  updateScrollSpy();

  /* =========================================================
     3) PORTFOLIO SECTION - Tabs / Filter (no Bootstrap)
     ========================================================= */
  const filterButtons = Array.from(
    document.querySelectorAll(".portfolio-filter")
  );
  const portfolioItems = Array.from(
    document.querySelectorAll("#portfolio-grid .portfolio-item")
  );

  const FILTER_ACTIVE_CLASSES = [
    "bg-linear-to-r",
    "from-primary",
    "to-secondary",
    "text-white",
  ];
  const FILTER_INACTIVE_CLASSES = [
    "bg-white",
    "dark:bg-slate-800",
    "text-slate-600",
    "dark:text-slate-300",
    "border",
    "border-slate-300",
    "dark:border-slate-700",
  ];

  function setActiveFilterButton(activeBtn) {
    filterButtons.forEach((btn) => {
      if (btn === activeBtn) {
        btn.classList.add("active", ...FILTER_ACTIVE_CLASSES);
        btn.classList.remove(...FILTER_INACTIVE_CLASSES);
      } else {
        btn.classList.remove("active", ...FILTER_ACTIVE_CLASSES);
        btn.classList.add(...FILTER_INACTIVE_CLASSES);
      }
    });
  }

  function filterPortfolio(filterValue) {
    portfolioItems.forEach((item) => {
      const matches =
        filterValue === "all" || item.dataset.category === filterValue;
      item.classList.toggle("hidden", !matches);
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveFilterButton(btn);
      filterPortfolio(btn.dataset.filter);
    });
  });

  /* =========================================================
     4) TESTIMONIALS CAROUSEL (manual, vanilla JS)
     ========================================================= */
  const carouselTrack = document.getElementById("testimonials-carousel");
  const nextBtn = document.getElementById("next-testimonial");
  const prevBtn = document.getElementById("prev-testimonial");
  const indicatorsContainer = document.querySelector(".carousel-indicator")
    ? document.querySelector(".carousel-indicator").parentElement
    : null;

  if (carouselTrack) {
    const slides = Array.from(
      carouselTrack.querySelectorAll(".testimonial-card")
    );
    const totalSlides = slides.length;
    let currentIndex = 0;

    // Detect text direction (rtl/ltr) to move the track the right way
    const isRTL =
      getComputedStyle(carouselTrack).direction === "rtl" ||
      htmlEl.getAttribute("dir") === "rtl";

    // Number of visible cards depends on screen size
    function getVisibleCount() {
      const w = window.innerWidth;
      if (w >= 1024) return 3; // lg
      if (w >= 640) return 2; // sm
      return 1; // mobile
    }

    function getMaxIndex() {
      return Math.max(0, totalSlides - getVisibleCount());
    }

    function renderIndicators() {
      if (!indicatorsContainer) return;
      const maxIndex = getMaxIndex();
      const pagesCount = maxIndex + 1;

      indicatorsContainer.innerHTML = "";
      for (let i = 0; i < pagesCount; i++) {
        const dot = document.createElement("button");
        dot.className =
          "carousel-indicator w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer";
        dot.dataset.index = i;
        dot.classList.add(...getIndicatorClasses(i === currentIndex));
        dot.addEventListener("click", () => goToSlide(i));
        indicatorsContainer.appendChild(dot);
      }
    }

    function getIndicatorClasses(isActive) {
      return isActive
        ? ["bg-accent"]
        : ["bg-slate-400", "dark:bg-slate-600"];
    }

    function updateIndicators() {
      if (!indicatorsContainer) return;
      const dots = Array.from(
        indicatorsContainer.querySelectorAll(".carousel-indicator")
      );
      dots.forEach((dot, i) => {
        dot.classList.remove(
          "bg-accent",
          "bg-slate-400",
          "dark:bg-slate-600"
        );
        dot.classList.add(...getIndicatorClasses(i === currentIndex));
      });
    }

    function updateCarouselPosition() {
      const visibleCount = getVisibleCount();
      const stepPercent = 100 / visibleCount;
      const sign = isRTL ? -1 : 1;
      const translateValue = sign * currentIndex * stepPercent;
      carouselTrack.style.transform = `translateX(${translateValue}%)`;
    }

    function goToSlide(index) {
      const maxIndex = getMaxIndex();
      if (index < 0) index = maxIndex;
      if (index > maxIndex) index = 0;
      currentIndex = index;
      updateCarouselPosition();
      updateIndicators();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);

    // Optional autoplay: advance to the next slide every 6 seconds
    let autoPlayTimer = setInterval(nextSlide, 6000);
    const carouselWrapper = carouselTrack.closest(".relative");
    if (carouselWrapper) {
      carouselWrapper.addEventListener("mouseenter", () =>
        clearInterval(autoPlayTimer)
      );
      carouselWrapper.addEventListener("mouseleave", () => {
        autoPlayTimer = setInterval(nextSlide, 6000);
      });
    }

    // Recalculate on window resize (responsive)
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const maxIndex = getMaxIndex();
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        renderIndicators();
        updateCarouselPosition();
      }, 150);
    });

    // Initial run
    renderIndicators();
    updateCarouselPosition();
  }

  /* =========================================================
     5) SETTINGS SIDEBAR - Customizer (Colors & Fonts)
     ========================================================= */
  const settingsToggle = document.getElementById("settings-toggle");
  const settingsSidebar = document.getElementById("settings-sidebar");
  const closeSettings = document.getElementById("close-settings");
  const resetSettingsBtn = document.getElementById("reset-settings");
  const fontOptionButtons = Array.from(
    document.querySelectorAll(".font-option")
  );
  const themeColorsGrid = document.getElementById("theme-colors-grid");

  function openSidebar() {
    settingsSidebar.classList.remove("translate-x-full");
    settingsSidebar.classList.add("translate-x-0");
  }

  function closeSidebar() {
    settingsSidebar.classList.add("translate-x-full");
    settingsSidebar.classList.remove("translate-x-0");
  }

  if (settingsToggle && settingsSidebar) {
    settingsToggle.addEventListener("click", () => {
      const isOpen = settingsSidebar.classList.contains("translate-x-0");
      isOpen ? closeSidebar() : openSidebar();
    });
  }

  if (closeSettings) {
    closeSettings.addEventListener("click", closeSidebar);
  }

  // Close the sidebar when clicking outside of it
  document.addEventListener("click", (e) => {
    if (!settingsSidebar || !settingsSidebar.classList.contains("translate-x-0"))
      return;
    const clickedInsideSidebar = settingsSidebar.contains(e.target);
    const clickedToggleBtn = settingsToggle && settingsToggle.contains(e.target);
    if (!clickedInsideSidebar && !clickedToggleBtn) {
      closeSidebar();
    }
  });

  /* ---------- 5.a) Font Switcher ---------- */
  const FONT_CLASS_MAP = {
    alexandria: "font-alexandria",
    tajawal: "font-tajawal",
    cairo: "font-cairo",
  };
  const ALL_FONT_CLASSES = Object.values(FONT_CLASS_MAP);

  function applyFont(fontKey) {
    const fontClass = FONT_CLASS_MAP[fontKey] || FONT_CLASS_MAP.tajawal;
    document.body.classList.remove(...ALL_FONT_CLASSES);
    document.body.classList.add(fontClass);
    localStorage.setItem("selectedFont", fontKey);

    fontOptionButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.font === fontKey);
    });
  }

  fontOptionButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyFont(btn.dataset.font));
  });

  const savedFont = localStorage.getItem("selectedFont");
  if (savedFont) applyFont(savedFont);
  else {
    // Default font (Tajawal) marked as active the first time the sidebar opens
    fontOptionButtons.forEach((btn) => {
      if (btn.dataset.font === "tajawal") btn.classList.add("active");
    });
  }

  /* ---------- 5.b) Color Theme Switcher ---------- */
  // A set of ready-made palettes, each with primary / secondary / accent
  const COLOR_THEMES = [
    { name: "Default", primary: "#6366f1", secondary: "#8b5cf6", accent: "#a855f7" },
    { name: "Ocean", primary: "#0ea5e9", secondary: "#06b6d4", accent: "#22d3ee" },
    { name: "Emerald", primary: "#10b981", secondary: "#22c55e", accent: "#84cc16" },
    { name: "Sunset", primary: "#f97316", secondary: "#ef4444", accent: "#f59e0b" },
    { name: "Royal", primary: "#6366f1", secondary: "#8b5cf6", accent: "#d946ef" },
    { name: "Rose", primary: "#e11d48", secondary: "#f43f5e", accent: "#fb7185" },
    { name: "Slate", primary: "#334155", secondary: "#0f172a", accent: "#64748b" },
    { name: "Amber", primary: "#d97706", secondary: "#b45309", accent: "#fbbf24" },
  ];

  function applyColorTheme(theme, save = true) {
    htmlEl.style.setProperty("--color-primary", theme.primary);
    htmlEl.style.setProperty("--color-secondary", theme.secondary);
    htmlEl.style.setProperty("--color-accent", theme.accent);

    if (save) {
      localStorage.setItem("selectedColorTheme", JSON.stringify(theme));
    }

    if (themeColorsGrid) {
      Array.from(themeColorsGrid.children).forEach((swatch) => {
        swatch.classList.toggle(
          "ring-2",
          swatch.dataset.themeName === theme.name
        );
        swatch.classList.toggle(
          "ring-primary",
          swatch.dataset.themeName === theme.name
        );
      });
    }
  }

  function buildColorSwatches() {
    if (!themeColorsGrid) return;
    themeColorsGrid.innerHTML = "";

    COLOR_THEMES.forEach((theme) => {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.title = theme.name;
      swatch.dataset.themeName = theme.name;
      swatch.className =
        "w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:scale-105 focus:outline-none";
      swatch.style.background = `linear-gradient(135deg, ${theme.primary} 33%, ${theme.secondary} 66%, ${theme.accent} 100%)`;
      swatch.addEventListener("click", () => applyColorTheme(theme));
      themeColorsGrid.appendChild(swatch);
    });
  }

  buildColorSwatches();

  const savedColorTheme = localStorage.getItem("selectedColorTheme");
  if (savedColorTheme) {
    try {
      applyColorTheme(JSON.parse(savedColorTheme), false);
    } catch (e) {
      /* Ignore corrupted localStorage data */
    }
  } else {
    applyColorTheme(COLOR_THEMES[0], false);
  }

  /* ---------- 5.c) Reset Settings ---------- */
  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener("click", () => {
      localStorage.removeItem("selectedFont");
      localStorage.removeItem("selectedColorTheme");

      applyFont("tajawal");
      applyColorTheme(COLOR_THEMES[0]);
      localStorage.removeItem("selectedColorTheme"); // keep it unsaved (default only)
    });
  }

  /* =========================================================
     6) SCROLL TO TOP BUTTON
     ========================================================= */
  const scrollToTopBtn = document.getElementById("scroll-to-top");

  if (scrollToTopBtn) {
    function toggleScrollToTopVisibility() {
      if (window.scrollY > 400) {
        scrollToTopBtn.classList.remove("opacity-0", "invisible");
        scrollToTopBtn.classList.add("opacity-100", "visible");
      } else {
        scrollToTopBtn.classList.add("opacity-0", "invisible");
        scrollToTopBtn.classList.remove("opacity-100", "visible");
      }
    }

    window.addEventListener("scroll", toggleScrollToTopVisibility);
    toggleScrollToTopVisibility();

    scrollToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* =========================================================
     7) CUSTOM SELECT (Project Type / Budget) in the Contact form
     - Bonus: the HTML uses a custom dropdown instead of a native <select>
     ========================================================= */
  const customSelects = document.querySelectorAll(".custom-select-wrapper");

  customSelects.forEach((wrapper) => {
    const trigger = wrapper.querySelector(".custom-select");
    const optionsBox = wrapper.querySelector(".custom-options");
    const selectedText = wrapper.querySelector(".selected-text");
    const chevron = wrapper.querySelector(".fa-chevron-down");
    const options = wrapper.querySelectorAll(".custom-option");

    if (!trigger || !optionsBox) return;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = !optionsBox.classList.contains("hidden");
      // Close any other open custom selects
      document.querySelectorAll(".custom-options").forEach((box) => {
        if (box !== optionsBox) box.classList.add("hidden");
      });
      optionsBox.classList.toggle("hidden", isOpen);
      if (chevron) chevron.classList.toggle("rotate-180", !isOpen);
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        selectedText.textContent = option.dataset.value;
        selectedText.classList.remove(
          "text-slate-500",
          "dark:text-slate-400"
        );
        selectedText.classList.add("text-slate-800", "dark:text-white");
        optionsBox.classList.add("hidden");
        if (chevron) chevron.classList.remove("rotate-180");
      });
    });
  });

  // Close every custom select when clicking anywhere else on the page
  document.addEventListener("click", () => {
    document.querySelectorAll(".custom-options").forEach((box) => {
      box.classList.add("hidden");
    });
    document.querySelectorAll(".custom-select .fa-chevron-down").forEach((c) => {
      c.classList.remove("rotate-180");
    });
  });
});