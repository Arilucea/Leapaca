const MIN_SPEED = 0;
const MAX_SPEED = 2.5;

const main = async () => {
  await i18n.init();
  i18n.apply();

  const speedInput = document.getElementById("speed");
  const speedDisplay = document.getElementById("speedDisplay");
  const skipIntro = document.getElementById("skipIntro");
  // app-popup-main-vars
  const skipPreplay = document.getElementById("skipPreplay");
  const lockSpeed = document.getElementById("lockSpeed");
  // app-popup-vars

  const playButton = document.getElementById("playButton");
  const openSettings = document.getElementById("openSettings");
  const settingsPanel = document.getElementById("settingsPanel");
  const languageSelect = document.getElementById("language");
  const themeSelect = document.getElementById("theme");

  const DEFAULTS = {
    speed: 1,
    skipIntro: true,
    // app-popup-main-defaults
    skipPreplay: false,
    theme: "auto",
    lockSpeed: false,
    // app-popup-defaults
  };

  const handleStorageError = (operation) => {
    if (chrome.runtime.lastError) {
    }
  };

  const validateSpeed = (speed) => {
    const numSpeed = Number(speed);
    if (isNaN(numSpeed) || numSpeed < MIN_SPEED || numSpeed > MAX_SPEED) {
      return DEFAULTS.speed;
    }
    return numSpeed;
  };

  const applyTheme = (theme) => {
    if (!theme || typeof theme !== "string") {
      return;
    }

    if (theme === "auto") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  };

  chrome.storage.sync.get(DEFAULTS, (config) => {
    if (chrome.runtime.lastError) {
      return;
    }

    if (!config || typeof config !== "object") {
      return;
    }

    const validSpeed = validateSpeed(config.speed);
    speedInput.value = validSpeed;
    speedDisplay.textContent = `${validSpeed}×`;
    skipIntro.checked = Boolean(config.skipIntro);
    // app-popup-main-config
    skipPreplay.checked = Boolean(config.skipPreplay);
    lockSpeed.checked = Boolean(config.lockSpeed);

    languageSelect.value = i18n.currentLanguage;

    themeSelect.value = config.theme || DEFAULTS.theme;
    applyTheme(config.theme || DEFAULTS.theme);
    // app-popup-config
  });

  const save = () => {
    const validSpeed = validateSpeed(speedInput.value);

    chrome.storage.sync.set(
      {
        speed: validSpeed,
        skipIntro: skipIntro.checked,
        // app-popup-main-save
        skipPreplay: skipPreplay.checked,
        lockSpeed: lockSpeed.checked,
        // app-popup-save
      },
      () => {
        handleStorageError("save settings");
      },
    );
  };

  speedInput.addEventListener("input", () => {
    const validSpeed = validateSpeed(speedInput.value);
    speedDisplay.textContent = `${validSpeed}×`;
  });

  speedInput.addEventListener("change", () => {
    lockSpeed.checked = true;
    save();
  });

  skipIntro.addEventListener("change", save);
  // app-popup-main-listeners
  skipPreplay.addEventListener("change", save);
  lockSpeed.addEventListener("change", save);
  // app-popup-listeners

  openSettings.addEventListener("click", () => {
    settingsPanel.classList.add("open");
    openSettings.classList.add("active");
    playButton.classList.remove("active");
  });

  const sendPlaybackAction = (action, payload = null) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action, payload });
      }
    });
  };

  const closeSettingsHandler = () => {
    settingsPanel.classList.remove("open");
    openSettings.classList.remove("active");
    playButton.classList.add("active");
  };

  playButton.addEventListener("click", closeSettingsHandler);


  languageSelect.addEventListener("change", (e) => {
    const newLang = e.target.value;

    if (!newLang || typeof newLang !== "string") {
      return;
    }

    chrome.storage.sync.set({ language: newLang }, async () => {
      if (chrome.runtime.lastError) {
        return;
      }

      try {
        await i18n.init();
        i18n.apply();
        languageSelect.value = i18n.currentLanguage;
      } catch (error) {
      }
    });
  });

  themeSelect.addEventListener("change", (e) => {
    const newTheme = e.target.value;

    if (!newTheme || typeof newTheme !== "string") {
      return;
    }

    applyTheme(newTheme);
    chrome.storage.sync.set({ theme: newTheme }, () => {
      handleStorageError("save theme");
    });
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
