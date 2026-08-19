/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
const form = document.querySelector("#shorten-form");
const urlInput = document.querySelector("#url");
const formMessage = document.querySelector("#form-message");
const submitButton = form.querySelector('button[type="submit"]');
const result = document.querySelector("#result");
const shortUrl = document.querySelector("#short-url");
const copyButton = document.querySelector("#copy-button");
const copyMessage = document.querySelector("#copy-message");
const resetButton = document.querySelector("#reset-button");
const themeToggle = document.querySelector("#theme-toggle");

function getInitialTheme() {
    try {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
    } catch {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setTheme(theme, persist = false) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = theme;
    themeToggle.setAttribute("aria-pressed", String(isDark));
    const label = isDark ? "Включить светлую тему" : "Включить тёмную тему";
    themeToggle.setAttribute("aria-label", label);
    themeToggle.title = label;

    if (persist) {
        try {
            localStorage.setItem("theme", theme);
        } catch {
            return;
        }
    }
}

setTheme(getInitialTheme());

themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme, true);
});

const errorMessages = {
    invalid_json: "Сервер не смог прочитать запрос. Попробуйте ещё раз.",
    invalid_url: "Введите корректную ссылку с http:// или https://.",
    rate_limit_exceeded: "Слишком много запросов. Попробуйте немного позже.",
};

function validateUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function setFormMessage(message = "", tone = "") {
    formMessage.textContent = message;
    formMessage.dataset.tone = tone;
}

function setLoading(isLoading) {
    form.classList.toggle("is-loading", isLoading);
    submitButton.disabled = isLoading;
    urlInput.readOnly = isLoading;
    form.setAttribute("aria-busy", String(isLoading));
}

function getErrorMessage(status, payload) {
    const errorCode = payload?.error?.code;

    if (errorCode && errorMessages[errorCode]) {
        return errorMessages[errorCode];
    }

    if (status === 429) {
        return errorMessages.rate_limit_exceeded;
    }

    if (status === 404 || status >= 500) {
        return "Сервис временно недоступен. Попробуйте позже.";
    }

    return payload?.error?.message || "Не удалось сократить ссылку. Попробуйте ещё раз.";
}

async function readJson(response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

function showResult(url) {
    shortUrl.href = url;
    shortUrl.textContent = url;
    result.hidden = false;
    copyMessage.textContent = "";
    resetButton.focus();
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const url = urlInput.value.trim();

    if (!validateUrl(url)) {
        urlInput.setAttribute("aria-invalid", "true");
        setFormMessage(errorMessages.invalid_url, "error");
        urlInput.focus();
        return;
    }

    urlInput.removeAttribute("aria-invalid");
    setFormMessage("Сокращаем ссылку…");
    setLoading(true);

    try {
        const response = await fetch("/api/links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });
        const payload = await readJson(response);

        if (!response.ok) {
            throw new Error(getErrorMessage(response.status, payload));
        }

        if (typeof payload?.short_url !== "string" || !validateUrl(payload.short_url)) {
            throw new Error("Сервер вернул некорректный ответ. Попробуйте позже.");
        }

        setFormMessage();
        showResult(payload.short_url);
    } catch (error) {
        const message = error instanceof TypeError
            ? "Нет связи с сервером. Проверьте подключение и попробуйте ещё раз."
            : error.message;
        setFormMessage(message, "error");
    } finally {
        setLoading(false);
    }
});

urlInput.addEventListener("input", () => {
    urlInput.removeAttribute("aria-invalid");
    setFormMessage();
});

copyButton.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(shortUrl.href);
        copyMessage.textContent = "Ссылка скопирована.";
        copyButton.querySelector("span").textContent = "Скопировано";
    } catch {
        copyMessage.textContent = "Не удалось скопировать. Выделите ссылку вручную.";
    }
});

resetButton.addEventListener("click", () => {
    result.hidden = true;
    form.reset();
    setFormMessage();
    copyMessage.textContent = "";
    copyButton.querySelector("span").textContent = "Копировать";
    urlInput.focus();
});
