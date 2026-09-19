// =========================================================
// script.js — interactions du portfolio
// =========================================================

// ---- 1. Année automatique dans le footer ----
document.getElementById("year").textContent = new Date().getFullYear();

// ---- 2. Menu mobile (hamburger) ----
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen);
});

// Ferme le menu quand on clique sur un lien (utile sur mobile)
navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ---- 3. Petite animation "faux entraînement de modèle" dans le hero ----
// (juste pour l'effet visuel, ça ne calcule rien de réel)
const accCounter = document.getElementById("accCounter");
const epochCounter = document.getElementById("epochCounter");

if (accCounter && epochCounter) {
  let epoch = 0;
  const maxEpoch = 50;
  const interval = setInterval(() => {
    epoch++;
    epochCounter.textContent = epoch;
    // courbe qui monte vite puis ralentit, plafonnée à 97%
    const acc = Math.min(97, Math.round(97 * (1 - Math.exp(-epoch / 12))));
    accCounter.textContent = acc;
    if (epoch >= maxEpoch) clearInterval(interval);
  }, 120);
}

// ---- 4. Validation du formulaire de contact avant envoi ----
const form = document.getElementById("contactForm");
const feedback = document.getElementById("formFeedback");

function setError(fieldName, message) {
  const errorEl = form.querySelector(`.field-error[data-for="${fieldName}"]`);
  const inputEl = form.querySelector(`#${fieldName}`);
  if (errorEl) errorEl.textContent = message || "";
  if (inputEl) inputEl.classList.toggle("invalid", Boolean(message));
}

function validateForm() {
  let valid = true;

  const nom = form.nom.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  if (nom.length < 2) {
    setError("nom", "Merci d'indiquer ton nom complet.");
    valid = false;
  } else {
    setError("nom", "");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError("email", "Adresse e-mail invalide.");
    valid = false;
  } else {
    setError("email", "");
  }

  if (message.length < 10) {
    setError("message", "Ton message doit contenir au moins 10 caractères.");
    valid = false;
  } else {
    setError("message", "");
  }

  return valid;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // on gère l'envoi nous-mêmes, en JavaScript

  feedback.textContent = "";
  feedback.className = "form-feedback";

  if (!validateForm()) {
    feedback.textContent = "Merci de corriger les champs en rouge.";
    feedback.classList.add("error");
    return;
  }

  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Envoi en cours...";

  try {
    // Envoie les données du formulaire vers contact.php
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
    });

    const result = await response.json();

    if (result.success) {
      feedback.textContent = result.message || "Message envoyé avec succès !";
      feedback.classList.add("success");
      form.reset();
    } else {
      feedback.textContent = result.message || "Une erreur est survenue.";
      feedback.classList.add("error");
    }
  } catch (err) {
    // Cas où contact.php n'est pas accessible (ex : hébergement statique GitHub Pages)
    feedback.textContent =
      "Impossible de contacter le serveur (PHP non disponible sur cet hébergement).";
    feedback.classList.add("error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Envoyer le message";
  }
});
