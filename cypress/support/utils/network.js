/**
 * DemoQA serves a large amount of third-party content (Google Ads, ad-quality
 * beacons, reCAPTCHA frames, bidding iframes). Those requests are the main
 * source of slowness, layout shifts and uncaught errors that are unrelated to
 * the application under test, so the suite stubs every request that does not
 * target a first-party host.
 */
export const FIRST_PARTY_HOST = /(^|\.)demoqa\.com$/;

export const isThirdParty = (url) => {
  try {
    return !FIRST_PARTY_HOST.test(new URL(url).hostname);
  } catch {
    return false;
  }
};
