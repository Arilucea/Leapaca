const SELECTORS = {
  skipIntro: '.atvwebplayersdk-skipelement-button, .atvwebplayersdk-skiptrailer-button, [aria-label*="Intro"], [aria-label*="introducción"]',
  video: "video",
  skipPreplay: '.atvwebplayersdk-skipelement-button, [aria-label*="Recap"], [aria-label*="resumen"]',
};

const IS_HOME_PAGE = (path) => /^\/region\/[^/]+\/?$/.test(path) || path.includes('storefront');

