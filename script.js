/*
  [KUAFÖR ADI] — etkileşimler
  Mobil menü, scroll, reveal ve randevu formu.
  Backend bağlamak için yalnızca submitAppointment() içini değiştirin.
*/

(function () {
  const header = document.querySelector("#header");
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.querySelector("#mobile-nav");
  const heroMedia = document.querySelector(".hero__media");

  const MESSAGES = {
    fullName: "Lütfen adınızı ve soyadınızı girin.",
    phone: "Lütfen telefon numaranızı girin.",
    phoneInvalid: "Lütfen geçerli bir telefon numarası girin.",
    email: "Lütfen e-posta adresinizi girin.",
    emailInvalid: "Lütfen geçerli bir e-posta adresi girin.",
    service: "Lütfen bir hizmet seçin.",
    date: "Lütfen bir tarih seçin.",
    datePast: "Geçmiş bir tarih seçilemez.",
    dateClosed: "Pazar günleri kapalıyız. Lütfen başka bir gün seçin.",
    time: "Lütfen bir saat seçin.",
    timePast: "Bu saat geçti. Lütfen ileri bir saat seçin.",
    timePassed: "Bugün için uygun saat kalmadı. Lütfen başka bir gün seçin."
  };

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initHeaderScroll() {
    if (!header) return;

    const onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function closeMenu(restoreFocus) {
    if (!header || !panel || !toggle) return;

    header.classList.remove("is-open");
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    panel.inert = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Menüyü aç");
    document.body.classList.remove("nav-open");

    if (restoreFocus) toggle.focus();
  }

  function openMenu() {
    if (!header || !panel || !toggle) return;

    header.classList.add("is-open");
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    panel.inert = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Menüyü kapat");
    document.body.classList.add("nav-open");

    const firstLink = panel.querySelector("a");
    if (firstLink) firstLink.focus();
  }

  function initMobileNav() {
    if (!toggle || !panel) return;

    toggle.addEventListener("click", function () {
      if (header.classList.contains("is-open")) closeMenu(false);
      else openMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (!header.classList.contains("is-open")) return;

      if (event.key === "Escape") {
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab") return;

      const items = [toggle].concat(Array.from(panel.querySelectorAll("a")));
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 980 && header.classList.contains("is-open")) {
        closeMenu(false);
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;

        const target = document.querySelector(id);
        if (!target) return;

        event.preventDefault();
        closeMenu(false);
        if (history.pushState) history.pushState(null, "", id);
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start"
        });
      });
    });
  }

  function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      items.forEach(function (item) { item.classList.add("is-visible"); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (item) { observer.observe(item); });
  }

  function initHours() {
    const today = new Date().getDay();
    const row = document.querySelector('.hours__list [data-day="' + today + '"]');
    if (!row) return;

    row.classList.add("is-today");
    const badge = document.createElement("span");
    badge.className = "hours__badge";
    badge.textContent = "Bugün";
    row.querySelector("span").appendChild(badge);
  }

  function initHeroMedia() {
    if (!heroMedia) return;
    heroMedia.addEventListener("error", function () {
      heroMedia.remove();
    });
  }

  function todayISO() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
  }

  function parseISODate(value) {
    const parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidPhone(value) {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }

  function setFieldError(field, message) {
    const error = field.parentElement.querySelector(".field__error");
    if (!error) return;

    const hint = field.parentElement.querySelector(".field__hint");
    const describedBy = [hint ? hint.id : "", message ? error.id : ""].filter(Boolean).join(" ");

    if (message) {
      error.hidden = false;
      error.textContent = message;
      field.classList.add("is-invalid");
      field.setAttribute("aria-invalid", "true");
    } else {
      error.hidden = true;
      error.textContent = "";
      field.classList.remove("is-invalid");
      field.removeAttribute("aria-invalid");
    }

    if (describedBy) field.setAttribute("aria-describedby", describedBy);
    else field.removeAttribute("aria-describedby");
  }

  function validateField(field, timeSelect, dateValue) {
    const value = field.value.trim();
    let message = "";

    if (field.name === "note") return true;

    if (field.name === "time") {
      const available = Array.from(timeSelect.options).some(function (item) {
        return item.value && !item.disabled;
      });

      if (!value) {
        message = dateValue === todayISO() && !available ? MESSAGES.timePassed : MESSAGES.time;
      } else {
        const option = Array.from(timeSelect.options).find(function (item) {
          return item.value === value;
        });
        if (!option || option.disabled) {
          message = dateValue === todayISO() ? MESSAGES.timePast : MESSAGES.time;
        }
      }
    } else if (field.required && !value) {
      message = MESSAGES[field.name] || "Bu alan zorunludur.";
    } else if (field.name === "fullName" && value.length < 2) {
      message = MESSAGES.fullName;
    } else if (field.name === "phone" && !isValidPhone(value)) {
      message = MESSAGES.phoneInvalid;
    } else if (field.name === "email" && !isValidEmail(value)) {
      message = MESSAGES.emailInvalid;
    } else if (field.name === "date" && value) {
      const selected = parseISODate(value);
      const today = parseISODate(todayISO());
      if (selected < today) message = MESSAGES.datePast;
      else if (selected.getDay() === 0) message = MESSAGES.dateClosed;
    }

    setFieldError(field, message);
    return !message;
  }

  function refreshTimeOptions(dateInput, timeSelect) {
    const isToday = dateInput.value === todayISO();
    const now = new Date();

    Array.from(timeSelect.options).forEach(function (option) {
      if (!option.value) return;
      if (!isToday) {
        option.disabled = false;
        return;
      }
      const parts = option.value.split(":").map(Number);
      const slot = new Date();
      slot.setHours(parts[0], parts[1], 0, 0);
      option.disabled = slot <= now;
    });

    const selected = timeSelect.selectedOptions[0];
    if (selected && selected.disabled) timeSelect.value = "";
  }

  function clearFormState(form) {
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      setFieldError(field, "");
    });
    const alert = document.querySelector("#form-alert");
    if (alert) {
      alert.hidden = true;
      alert.textContent = "";
    }
  }

  function showFormError(message) {
    const alert = document.querySelector("#form-alert");
    if (!alert) return;
    alert.hidden = false;
    alert.textContent = message;
  }

  function getPayload(form) {
    const data = new FormData(form);
    return {
      fullName: String(data.get("fullName") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      service: String(data.get("service") || "").trim(),
      date: String(data.get("date") || "").trim(),
      time: String(data.get("time") || "").trim(),
      note: String(data.get("note") || "").trim()
    };
  }

  /*
    Randevu talebini gönderir.
    Gerçek API için aşağıdaki fetch bloğunu kullanın.
    payload: { fullName, phone, email, service, date, time, note }
  */
  async function submitAppointment(payload) {
    // const response = await fetch("/api/randevu", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Accept: "application/json"
    //   },
    //   body: JSON.stringify(payload)
    // });
    //
    // if (!response.ok) {
    //   const errorBody = await response.json().catch(function () { return {}; });
    //   throw new Error(errorBody.message || "Randevu talebi gönderilemedi.");
    // }
    //
    // return response.json();

    await new Promise(function (resolve) { setTimeout(resolve, 650); });
    return { ok: true, payload: payload };
  }

  function initBookingForm() {
    const form = document.querySelector("#booking-form");
    const success = document.querySelector("#form-success");
    const submitBtn = document.querySelector("#booking-submit");
    const resetBtn = document.querySelector("#booking-reset");
    if (!form || !success || !submitBtn) return;

    const dateInput = form.querySelector("#date");
    const timeSelect = form.querySelector("#time");
    const defaultLabel = submitBtn.textContent;

    dateInput.min = todayISO();
    refreshTimeOptions(dateInput, timeSelect);

    dateInput.addEventListener("focus", function () {
      dateInput.min = todayISO();
    });

    dateInput.addEventListener("change", function () {
      refreshTimeOptions(dateInput, timeSelect);
      if (dateInput.getAttribute("aria-invalid") === "true") {
        validateField(dateInput, timeSelect, dateInput.value);
      }
    });

    form.addEventListener("input", function (event) {
      const field = event.target;
      if (!(field instanceof HTMLElement)) return;
      if (field.getAttribute("aria-invalid") === "true") {
        validateField(field, timeSelect, dateInput.value);
      }
    });

    form.addEventListener("focusout", function (event) {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return;
      if (field.name === "note") return;
      if (field.value.trim() || field.getAttribute("aria-invalid") === "true") {
        validateField(field, timeSelect, dateInput.value);
      }
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      refreshTimeOptions(dateInput, timeSelect);

      const fields = Array.from(form.querySelectorAll("input, select, textarea"));
      let valid = true;
      let firstInvalid = null;

      fields.forEach(function (field) {
        const fieldIsValid = validateField(field, timeSelect, dateInput.value);
        if (!fieldIsValid && !firstInvalid) firstInvalid = field;
        if (!fieldIsValid) valid = false;
      });

      if (!valid) {
        showFormError("Lütfen işaretli alanları kontrol edin.");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const alert = document.querySelector("#form-alert");
      if (alert) alert.hidden = true;

      submitBtn.disabled = true;
      submitBtn.textContent = "Gönderiliyor…";
      form.setAttribute("aria-busy", "true");

      try {
        await submitAppointment(getPayload(form));
        form.hidden = true;
        success.hidden = false;
        const title = success.querySelector("h3");
        if (title) title.focus();
      } catch (error) {
        showFormError(error.message || "Randevu talebi gönderilemedi. Lütfen tekrar deneyin.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = defaultLabel;
        form.removeAttribute("aria-busy");
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        form.reset();
        dateInput.min = todayISO();
        refreshTimeOptions(dateInput, timeSelect);
        clearFormState(form);
        success.hidden = true;
        form.hidden = false;
        const first = form.querySelector("input");
        if (first) first.focus();
      });
    }
  }

  initHeaderScroll();
  initMobileNav();
  initSmoothScroll();
  initReveal();
  initHours();
  initHeroMedia();
  initBookingForm();
})();
