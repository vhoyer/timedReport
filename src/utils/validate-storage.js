function storageAvailable(type) {
  const storage = window[type];

  try {
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22
      // Firefox
      || e.code === 1014
      // test name field too, because code might not be present
      // everything except Firefox
      || e.name === 'QuotaExceededError'
      // Firefox
      || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      // acknowledge QuotaExceededError only if there's something already stored
      && storage.length !== 0;
  }
}

// Check if browser have support for window.localStorage
if (!storageAvailable('localStorage')) {
  // eslint-disable-next-line no-alert
  alert("Please Update your browser for a better experience, I haven't tested with an outdated browser, so you may have no experience at all xD\n\nHey, I'm doing you a favor");
}
