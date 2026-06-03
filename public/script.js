const calmIntro = document.getElementById("calmIntro");
const calmNextBtn = document.getElementById("calmNextBtn");
const calmMessage = document.getElementById("calmMessage");
const dayNoteInput = document.getElementById("dayNote");
const moodButtons = document.querySelectorAll(".mood-card");

const pausePage = document.getElementById("pausePage");
const pauseBackBtn = document.getElementById("pauseBackBtn");

const hero = document.getElementById("hero");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const dateForm = document.getElementById("dateForm");
const inviteForm = document.getElementById("inviteForm");
const result = document.getElementById("result");
const formMessage = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");

const calmState = {
  mood: "",
  dayNote: "",
  shouldStop: false
};

const dateInput = document.getElementById("date");
dateInput.min = new Date().toISOString().split("T")[0];

moodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    moodButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");

    calmState.mood = button.dataset.mood;
    calmState.shouldStop = button.dataset.stop === "true";

    calmMessage.textContent = "";
    calmMessage.className = "form-message";
  });
});

calmNextBtn.addEventListener("click", () => {
  calmState.dayNote = dayNoteInput.value.trim();

  if (!calmState.mood) {
    calmMessage.textContent = "Сначала выбери настроение, чтобы я понял, можно ли идти дальше 💗";
    calmMessage.className = "form-message error";
    return;
  }

  calmIntro.classList.add("hidden");

  if (calmState.shouldStop) {
    pausePage.classList.remove("hidden");
    pausePage.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  hero.classList.remove("hidden");
  hero.scrollIntoView({ behavior: "smooth", block: "start" });
});

pauseBackBtn.addEventListener("click", () => {
  pausePage.classList.add("hidden");
  calmIntro.classList.remove("hidden");

  calmState.mood = "";
  calmState.shouldStop = false;
  moodButtons.forEach((item) => item.classList.remove("selected"));

  calmMessage.textContent = "Можно выбрать другое настроение, если стало немного легче.";
  calmMessage.className = "form-message success";

  calmIntro.scrollIntoView({ behavior: "smooth", block: "start" });
});

const cuteNoTexts = [
  "Нет",
  "точно? 🥺",
  "не убегай 💗",
  "попробуй да 😌",
  "я стесняюсь",
  "ну пожалуйста"
];

let noTextIndex = 0;

function moveNoButton() {
  const heroRect = hero.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const maxX = Math.max(20, heroRect.width - btnRect.width - 40);
  const maxY = Math.max(20, heroRect.height - btnRect.height - 40);

  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  noBtn.style.position = "absolute";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;

  noTextIndex = (noTextIndex + 1) % cuteNoTexts.length;
  noBtn.textContent = cuteNoTexts[noTextIndex];
}

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveNoButton();
});

noBtn.addEventListener("click", moveNoButton);

yesBtn.addEventListener("click", () => {
  hero.classList.add("hidden");
  dateForm.classList.remove("hidden");
  dateForm.scrollIntoView({ behavior: "smooth", block: "start" });
});

inviteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  formMessage.textContent = "";
  formMessage.className = "form-message";
  submitBtn.disabled = true;
  submitBtn.textContent = "Сохраняю ответ... 💌";

  const formData = new FormData(inviteForm);

  const payload = {
    mood: calmState.mood || "Не выбрано",
    dayNote: calmState.dayNote || "Не написано",
    date: formData.get("date"),
    time: formData.get("time"),
    food: formData.get("food"),
    wishes: formData.get("wishes")?.trim() || "Без особых пожеланий 💗"
  };

  try {
    const response = await fetch("/api/invitations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Не получилось сохранить ответ.");
    }

    dateForm.classList.add("hidden");
    result.classList.remove("hidden");
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.classList.add("error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Отправить ответ 💌";
  }
});
