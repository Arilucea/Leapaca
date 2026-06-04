const i18n = {
  manualMessages: null,
  currentLanguage: "auto",

  init: async () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ language: "auto" }, async (items) => {
        if (chrome.runtime.lastError) {
          i18n.currentLanguage = "en";
          resolve();
          return;
        }

        let lang = items.language;

        if (lang === "auto") {
          const browserLang = (
            navigator.language ||
            navigator.userLanguage ||
            "en"
          ).toLowerCase();
          lang = browserLang.startsWith("es") ? "es" : "en";
        }

        i18n.currentLanguage = lang;

        try {
          const url = chrome.runtime.getURL(
            `_locales/${i18n.currentLanguage}/messages.json`,
          );
          const response = await fetch(url);

          if (!response.ok) {
            i18n.manualMessages = null;
          } else {
            try {
              i18n.manualMessages = await response.json();
            } catch (jsonError) {
              i18n.manualMessages = null;
            }
          }
        } catch (error) {
          i18n.manualMessages = null;
        }

        resolve();
      });
    });
  },

  t: (key) => {
    if (!key || typeof key !== "string") {
      return String(key);
    }

    if (i18n.manualMessages && i18n.manualMessages[key]) {
      return i18n.manualMessages[key].message;
    }

    const nativeMsg = chrome.i18n.getMessage(key);
    if (nativeMsg) {
      return nativeMsg;
    }

    return key;
  },

  apply: () => {
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (!key) return;

      const translation = i18n.t(key);

      if (element.tagName === "INPUT" && element.getAttribute("placeholder")) {
        element.setAttribute("placeholder", translation);
      } else {
        element.innerHTML = translation;
      }
    });

    const titleElements = document.querySelectorAll("[data-i18n-title]");
    titleElements.forEach((element) => {
      const key = element.getAttribute("data-i18n-title");
      if (key) {
        element.setAttribute("title", i18n.t(key));
      }
    });

    const labelElements = document.querySelectorAll("[data-i18n-label]");
    labelElements.forEach((element) => {
      const key = element.getAttribute("data-i18n-label");
      if (key) {
        element.setAttribute("aria-label", i18n.t(key));
      }
    });

    const titleElement = document.querySelector("title[data-i18n]");
    if (titleElement) {
      const titleKey = titleElement.getAttribute("data-i18n");
      if (titleKey) {
        document.title = i18n.t(titleKey);
      }
    }
  },
};

window.i18n = i18n;
