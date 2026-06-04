const SELECTORS = {
  skipIntro: '[data-testid="skip-overlay-button-skip-button"]',
  skipIntroText: 'Intro',
  video: "video",
  skipPreplay: '[data-testid="skip-overlay-button-skip-button"]',
  skipPreplayText: ['Recap', 'Resumen'],
  skipAd: '[data-testid="skip-overlay-button-skip-button"]',
  skipAdText: ['Skip', 'Saltar'],
};

const IS_HOME_PAGE = (path) => !document.querySelector('[data-testid="video-player"]');

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

/* APP_TRY_SKIP_ADS_START */
    const btnSkipAd = document.querySelector(SELECTORS.skipAd);
    if (!btnSkipAd || !isVisible(btnSkipAd)) return;

    const textsSkipAd = Array.isArray(SELECTORS.skipAdText) ? SELECTORS.skipAdText : [SELECTORS.skipAdText];
    const btnTextSkipAd = btnSkipAd.innerText.trim().toLowerCase();
    
    // Use exact match to avoid matching "Skip Intro" or "Skip Recap"
    if (!textsSkipAd.some(t => btnTextSkipAd === t.toLowerCase())) return;

    requestAnimationFrame(() => {
      btnSkipAd.click();
    });
/* APP_TRY_SKIP_ADS_END */
