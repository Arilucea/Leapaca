(() => {
  "use strict";

  const SELECTORS = {};

  const SKIP_DEBOUNCE_MS = 3000;
  const SPEED_TOLERANCE = 0.01;
  const THROTTLE_MS = 1000;
  const SAVE_SPEED_DEBOUNCE_MS = 1000;

  let config = {
    speed: 1,
    skipIntro: true,
    nextEpisode: true,
    skipPreplay: false,
    lockSpeed: false,
    skipAds: true,
  };

  let lastSkipIntroClick = 0;

  const initializedVideos = new WeakSet();

  const setVideoSpeed = (video, speed) => {
    if (!video || typeof speed !== "number" || speed <= 0) {
      return;
    }

    if (Math.abs(video.playbackRate - speed) > SPEED_TOLERANCE) {
      video.playbackRate = speed;
    }
  };

  chrome.storage.sync.get(config, (stored) => {
    if (chrome.runtime.lastError) {
      return;
    }

    if (stored && typeof stored === "object") {
      config = stored;
      applyConfigToVideo();
    }
  });

  chrome.storage.onChanged.addListener((changes) => {
    try {
      Object.keys(changes).forEach((key) => {
        config[key] = changes[key].newValue;
      });

      if (changes.speed || changes.lockSpeed) {
        applyConfigToVideo();
      }
    } catch (error) {
    }
  });

  const isVisible = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  const trySkipIntro = () => {
    if (!config.skipIntro) return;

    const btn = document.querySelector(SELECTORS.skipIntro);
    if (!btn || !isVisible(btn)) return;

    if (SELECTORS.skipIntroText) {
      const texts = Array.isArray(SELECTORS.skipIntroText) ? SELECTORS.skipIntroText : [SELECTORS.skipIntroText];
      const btnText = btn.innerText.toLowerCase();
      if (!texts.some(t => btnText.includes(t.toLowerCase()))) return;
    }

    const now = Date.now();
    if (now - lastSkipIntroClick < SKIP_DEBOUNCE_MS) return;

    lastSkipIntroClick = now;

    requestAnimationFrame(() => {
      btn.click();
    });
  };

  const trySkipAds = () => {
    if (!config.skipAds) return;

    // app-try-skip-ads
  };

  const tryNextEpisode = () => {
    if (!config.nextEpisode) return;

    // app-try-next-episode
  };

  const trySkipPreplay = () => {
    if (!config.skipPreplay) return;

    const btn = document.querySelector(SELECTORS.skipPreplay);
    if (!btn || !isVisible(btn)) return;

    if (SELECTORS.skipPreplayText) {
      const texts = Array.isArray(SELECTORS.skipPreplayText) ? SELECTORS.skipPreplayText : [SELECTORS.skipPreplayText];
      const btnText = btn.innerText.toLowerCase();
      if (!texts.some(t => btnText.includes(t.toLowerCase()))) return;
    }

    requestAnimationFrame(() => {
      btn.click();
    });
  };

  const applyConfigToVideo = () => {
    const videos = document.querySelectorAll(SELECTORS.video);
    videos.forEach((video) => {
      setVideoSpeed(video, config.speed);
    });
  };

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(...args), delay);
    };
  };

  const saveSpeedToStorage = debounce((speed) => {
    chrome.storage.sync.set({ speed }, () => {});
  }, SAVE_SPEED_DEBOUNCE_MS);

  const enforceSpeed = (video) => {
    if (config.lockSpeed && Math.abs(video.playbackRate - config.speed) > SPEED_TOLERANCE) {
      video.playbackRate = config.speed;
    }
  };

  const videoControllers = new WeakMap();

  const initVideo = (video) => {
    if (initializedVideos.has(video)) return;

    initializedVideos.add(video);
    setVideoSpeed(video, config.speed);

    const controller = new AbortController();
    videoControllers.set(video, controller);

    video.addEventListener(
      "ratechange",
      () => {
        const newSpeed = video.playbackRate;
        if (Math.abs(newSpeed - config.speed) < SPEED_TOLERANCE) return;

        if (config.lockSpeed) {
          video.playbackRate = config.speed;
        } else {
          config.speed = newSpeed;
          saveSpeedToStorage(newSpeed);
        }
      },
      { signal: controller.signal }
    );

    // app-video-init
  };

  const handleVideo = () => {
    document.querySelectorAll(SELECTORS.video).forEach((video) => {
      enforceSpeed(video);
      initVideo(video);
    });
  };

  const resetSpeed = () => {
    if (config.speed !== 1 || config.lockSpeed !== false) {
      config.speed = 1;
      config.lockSpeed = false;
      chrome.storage.sync.set({ speed: 1, lockSpeed: false }, () => {});
    }
  };

  const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  const runMutations = throttle(() => {
    trySkipIntro();
    tryNextEpisode();
    trySkipPreplay();
    trySkipAds();
    handleVideo();
  }, THROTTLE_MS);

  const runReset = throttle(() => {
    resetSpeed();
  }, THROTTLE_MS);

  const isHomePage = (path) => {
    // is-home-page-function
  };

  const observer = new MutationObserver(() => {
    if (isHomePage(window.location.pathname)) {
      runReset();
    } else {
      runMutations();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const video = document.querySelector("video");
    // app-on-message
  });
})();
