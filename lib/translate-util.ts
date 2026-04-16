export const setGoogleTranslate = (langCode: string) => {
  if (langCode === 'en') {
    // Clear cookie to revert to original
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + document.domain;
  } else {
    document.cookie = `googtrans=/en/${langCode}; path=/`;
  }
  window.location.reload();
};
