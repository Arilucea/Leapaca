/* APP_POPUP_VARS_START */
  const enablePip = document.getElementById("enablePip");
  const videoPip = document.getElementById("videoPip");
/* APP_POPUP_VARS_END */

/* APP_POPUP_DEFAULTS_START */
enablePip: true,
/* APP_POPUP_DEFAULTS_END */

/* APP_POPUP_CONFIG_START */
    enablePip.checked = Boolean(config.enablePip);
    videoPip.style.display = config.enablePip ? "flex" : "none";
    nextEpisode.checked = Boolean(config.nextEpisode);
/* APP_POPUP_CONFIG_END */

/* APP_POPUP_SAVE_START */
enablePip: enablePip.checked,
/* APP_POPUP_SAVE_END */

/* APP_POPUP_LISTENERS_START */
enablePip.addEventListener("change", () => {
  videoPip.style.display = enablePip.checked ? "flex" : "none";
  save();
});
  videoPip.addEventListener("click", () => sendPlaybackAction("pip"));
nextEpisode.addEventListener("change", save);
skipAd.addEventListener("change", save);
/* APP_POPUP_LISTENERS_END */

/* APP_POPUP_MAIN_VARS_START */
const nextEpisode = document.getElementById("nextEpisode");
const skipAd = document.getElementById("skipAd");
/* APP_POPUP_MAIN_VARS_END */

const mainDefaultsPlaceholder = {
/* APP_POPUP_MAIN_DEFAULTS_START */
nextEpisode: true,
skipAd: true,
/* APP_POPUP_MAIN_DEFAULTS_END */
};

/* APP_POPUP_MAIN_CONFIG_START */
nextEpisode.checked = Boolean(config.nextEpisode);
skipAd.checked = Boolean(config.skipAd);
/* APP_POPUP_MAIN_CONFIG_END */

const mainSavePlaceholder = {
/* APP_POPUP_MAIN_SAVE_START */
nextEpisode: nextEpisode.checked,
skipAd: skipAd.checked,
/* APP_POPUP_MAIN_SAVE_END */
};

/* APP_POPUP_MAIN_LISTENERS_START */
nextEpisode.addEventListener("change", save);
skipAd.addEventListener("change", save);
/* APP_POPUP_MAIN_LISTENERS_END */
