// החלפה בין מצב יום למצב לילה
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeLabel = document.getElementById("theme-label");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const isDark = theme === "dark";

  themeIcon.textContent = isDark ? "☀" : "☾";
  themeLabel.textContent = isDark ? "מצב יום" : "מצב לילה";

  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "הפעילי מצב יום" : "הפעילי מצב לילה",
  );
}

let initialTheme = "light";

try {
  const savedTheme = localStorage.getItem("site-theme");

  if (savedTheme === "dark" || savedTheme === "light") {
    initialTheme = savedTheme;
  }
} catch {
  // החלפת המצבים עדיין תעבוד גם אם localStorage אינו זמין.
}

applyTheme(initialTheme);

themeToggle.addEventListener("click", () => {
  const nextTheme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";

  applyTheme(nextTheme);

  try {
    localStorage.setItem("site-theme", nextTheme);
  } catch {
    // מצב התצוגה ישתנה גם אם לא ניתן לשמור את ההעדפה.
  }
});

// טופס יצירת קשר ובדיקת מספר טלפון ישראלי
const form = document.getElementById("contact-form");
const statusMessage = document.getElementById("form-status");
const submitButton = form.querySelector('button[type="submit"]');
const phoneInput = document.getElementById("phone");
const phoneError = document.getElementById("phone-error");

function isValidIsraeliMobilePhone(value) {
  const normalized = value.replace(/[\s()-]/g, "");

  return /^(?:05\d{8}|\+9725\d{8}|009725\d{8})$/.test(normalized);
}

function validatePhone(showError = true) {
  const value = phoneInput.value.trim();
  const valid = isValidIsraeliMobilePhone(value);

  phoneInput.setAttribute("aria-invalid", String(!valid));

  if (showError && !valid) {
    phoneError.textContent = value
      ? "מספר הטלפון אינו תקין. בדקי את המספר ונסי שוב."
      : "נא להזין מספר טלפון.";
  } else {
    phoneError.textContent = "";
  }

  return valid;
}

// בדיקה בזמן הקלדה
phoneInput.addEventListener("input", () => {
  if (!phoneInput.value.trim()) {
    phoneInput.setAttribute("aria-invalid", "false");
    phoneError.textContent = "";
  } else {
    validatePhone(true);
  }
});

// בדיקה כשהמשתמשת יוצאת משדה הטלפון
phoneInput.addEventListener("blur", () => {
  if (phoneInput.value.trim()) {
    validatePhone(true);
  }
});

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `form-status ${type}`;
}

function getSelectedValue(name) {
  const selected = form.querySelector(`input[name="${name}"]:checked`);

  return selected ? selected.value : "";
}

function getSelectedTopics() {
  return [...form.querySelectorAll('input[name="topic-choice"]:checked')].map(
    (input) => input.value,
  );
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const goal = getSelectedValue("goal-choice");
  const grade = getSelectedValue("grade-choice");
  const topics = getSelectedTopics();
  const name = document.getElementById("name").value.trim();

  // בדיקת שדות חובה
  if (!goal || !grade || !name || !phoneInput.value.trim()) {
    showStatus("אנא השלימי את השדות הנדרשים.", "error");

    if (!phoneInput.value.trim()) {
      validatePhone(true);
      phoneInput.focus();
    }

    return;
  }

  // לא שולחים את הטופס אם מספר הטלפון אינו תקין
  if (!validatePhone(true)) {
    showStatus("אנא בדקי את מספר הטלפון לפני שליחת הטופס.", "error");

    phoneInput.focus();
    return;
  }

  // העברת התשובות לשדות שיישלחו ל-Formspree
  document.getElementById("selected-goal").value = goal;
  document.getElementById("selected-grade").value = grade;

  document.getElementById("selected-topics").value = topics.length
    ? topics.join(", ")
    : "לא נבחרו נושאים מסוימים";

  const originalButtonText = submitButton.innerHTML;

  submitButton.disabled = true;
  submitButton.textContent = "שולחת...";

  statusMessage.className = "form-status";
  statusMessage.textContent = "";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      showStatus("לא הצלחנו לשלוח את הפרטים. נסי שוב בעוד רגע.", "error");
      return;
    }

    showStatus("תודה! הפרטים נשלחו בהצלחה ואחזור אלייך בהקדם.", "success");

    form.reset();

    phoneInput.setAttribute("aria-invalid", "false");
    phoneError.textContent = "";
  } catch {
    showStatus("נראה שיש בעיית חיבור. בדקי את האינטרנט ונסי שוב.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
  }
});
