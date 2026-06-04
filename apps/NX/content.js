const SELECTORS = {
  skipIntro: 'button[data-uia="player-skip-intro"]',
  nextEpisode: 'button[data-uia="player-next-episode"]',
  nextEpisodeSeamless:
    'button[data-uia="next-episode-seamless-button-draining"]',
  video: "video",
  playbackSpeed: 'div[data-uia="playback-speed"]',
  skipPreplay: 'button[data-uia="player-skip-preplay"]',
};

const IS_HOME_PAGE = (path) => /^\/browse\/?$/.test(path);

/* APP_ON_MESSAGE_START */
    if (request.action === "pip" && video) {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(console.error);
      } else {
        if (video.disablePictureInPicture) video.disablePictureInPicture = false;
        video.requestPictureInPicture().catch(console.error);
      }
    }
/* APP_ON_MESSAGE_END */

/* APP_VIDEO_INIT_START */
      const disablePipSeeking = () => {
        if (navigator.mediaSession) {
          const actions = ["seekbackward", "seekforward", "seekto", "previoustrack", "nexttrack"];
          actions.forEach(action => {
            try {
              navigator.mediaSession.setActionHandler(action, null);
            } catch (e) {}
          });
        }
      };
      
      video.addEventListener("enterpictureinpicture", () => {
        disablePipSeeking();
        // Netflix might re-enable these handlers, so we try a few times
        const interval = setInterval(disablePipSeeking, 200);
        setTimeout(() => clearInterval(interval), 2000);
      });
/* APP_VIDEO_INIT_END */

/* APP_TRY_NEXT_EPISODE_START */
    if (!config.nextEpisode) return;
    const btn = document.querySelector(SELECTORS.nextEpisode);
    const btnSeamless = document.querySelector(SELECTORS.nextEpisodeSeamless);

    const target =
      (btn && isVisible(btn) && btn) ||
      (btnSeamless && isVisible(btnSeamless) && btnSeamless);

    if (!target) return;

    requestAnimationFrame(() => {
      target.click();
    });
/* APP_TRY_NEXT_EPISODE_END */
