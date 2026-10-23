const form = document.getElementById("contact-form");
const statusMessage = document.getElementById("form-status");
const submitButton = form.querySelector('button[type="submit"]');

// -------------------------
// Night mode
// -------------------------

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
  // מצב יום הוא ברירת המחדל אם שמירת ההעדפה אינה זמינה.
}

applyTheme(initialTheme);

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  applyTheme(nextTheme);

  try {
    localStorage.setItem("site-theme", nextTheme);
  } catch {
    // החלפת הצבעים עדיין עובדת גם בלי שמירה.
  }
});

// -------------------------
// Contact form
// -------------------------

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

  const name = form.querySelector("#name").value.trim();
  const phone = form.querySelector("#phone").value.trim();

  if (!goal || !grade || !name || !phone) {
    showStatus("אנא השלימי את השדות הנדרשים.", "error");
    return;
  }

  // מכינים את התשובות לשליחה.
  document.getElementById("selected-goal").value = goal;
  document.getElementById("selected-grade").value = grade;
  document.getElementById("selected-topics").value =
    topics.length > 0 ? topics.join(", ") : "לא נבחרו נושאים מסוימים";

  const originalButtonContent = submitButton.innerHTML;

  submitButton.disabled = true;
  submitButton.textContent = "שולחת...";
  statusMessage.className = "form-status";

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
  } catch {
    showStatus("נראה שיש בעיית חיבור. בדקי את האינטרנט ונסי שוב.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonContent;
  }
});
