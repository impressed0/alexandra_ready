const loginBox = document.getElementById("loginBox");
const adminActions = document.getElementById("adminActions");
const adminPassword = document.getElementById("adminPassword");
const loginBtn = document.getElementById("loginBtn");
const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");
const answers = document.getElementById("answers");
const adminMessage = document.getElementById("adminMessage");

const STORAGE_KEY = "cute-date-admin-password";

function getPassword() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

function setMessage(text, isError = false) {
  adminMessage.textContent = text;
  adminMessage.className = "form-message";
  if (text) {
    adminMessage.classList.add(isError ? "error" : "success");
  }
}

async function loadAnswers() {
  const password = getPassword();

  if (!password) {
    return;
  }

  setMessage("");
  answers.innerHTML = `<div class="empty-state">Загружаю ответы...</div>`;

  try {
    const response = await fetch("/api/invitations", {
      headers: {
        "x-admin-password": password
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Не получилось загрузить ответы.");
    }

    loginBox.classList.add("hidden");
    adminActions.classList.remove("hidden");
    renderAnswers(data.items);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    loginBox.classList.remove("hidden");
    adminActions.classList.add("hidden");
    answers.innerHTML = "";
    setMessage(error.message, true);
  }
}

function renderAnswers(items) {
  if (!items.length) {
    answers.innerHTML = `<div class="empty-state">Пока нет ответов 🥺</div>`;
    return;
  }

  answers.innerHTML = items.map((item) => {
    const createdAt = new Date(item.created_at).toLocaleString("ru-RU", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    const mood = escapeHtml(item.mood || "Не выбрано");
    const dayNote = escapeHtml(item.day_note || "Не написано");
    const wishes = escapeHtml(item.wishes || "Без пожеланий");

    return `
      <article class="answer-card">
        <div class="answer-top">
          <div>
            <h3>Ответ №${item.id}</h3>
            <small>Получен: ${createdAt}</small>
          </div>
          <button class="btn delete" data-delete-id="${item.id}">Удалить</button>
        </div>

        <div class="answer-meta">
          <div><b>Настроение:</b> ${mood}</div>
          <div><b>Как прошёл день:</b><br>${dayNote}</div>
          <div><b>Дата:</b> ${escapeHtml(item.date)}</div>
          <div><b>Время:</b> ${escapeHtml(item.time)}</div>
          <div><b>Еда:</b> ${escapeHtml(item.food)}</div>
        </div>

        <div class="answer-wishes">
          <b>Пожелания:</b><br>
          ${wishes}
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-delete-id]").forEach((button) => {
    button.addEventListener("click", () => deleteAnswer(button.dataset.deleteId));
  });
}

async function deleteAnswer(id) {
  const confirmed = confirm("Удалить этот ответ?");
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/invitations/${id}`, {
      method: "DELETE",
      headers: {
        "x-admin-password": getPassword()
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Не получилось удалить ответ.");
    }

    loadAnswers();
  } catch (error) {
    setMessage(error.message, true);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loginBtn.addEventListener("click", () => {
  const password = adminPassword.value.trim();

  if (!password) {
    setMessage("Введи пароль.", true);
    return;
  }

  localStorage.setItem(STORAGE_KEY, password);
  loadAnswers();
});

refreshBtn.addEventListener("click", loadAnswers);

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  adminPassword.value = "";
  loginBox.classList.remove("hidden");
  adminActions.classList.add("hidden");
  answers.innerHTML = "";
  setMessage("Ты вышел из админки.");
});

adminPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    loginBtn.click();
  }
});

if (getPassword()) {
  loadAnswers();
}
