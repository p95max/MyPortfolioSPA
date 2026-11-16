(() => {
  const telegram = window.Telegram?.WebApp;
  const shareButton = document.getElementById('share-button');
  const settingsButton = document.getElementById('settings-button');
  const status = document.getElementById('status');

  const setStatus = (message, kind = '') => {
    status.textContent = message;
    status.className = `status ${kind}`.trim();
  };

  const browserLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Location is not available on this device.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () => reject(new Error('Location permission was not granted.')),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
      );
    });

  const telegramLocation = () =>
    new Promise((resolve, reject) => {
      const manager = telegram?.LocationManager;
      if (!manager?.init || !manager?.getLocation) {
        browserLocation().then(resolve, reject);
        return;
      }
      manager.init(() => {
        if (!manager.isLocationAvailable) {
          browserLocation().then(resolve, reject);
          return;
        }
        manager.getLocation((location) => {
          if (location) {
            resolve({
              latitude: location.latitude,
              longitude: location.longitude,
            });
            return;
          }
          if (manager.isAccessRequested && !manager.isAccessGranted) {
            settingsButton.hidden = false;
          }
          reject(new Error('Location permission was not granted.'));
        });
      });
    });

  settingsButton.addEventListener('click', () => {
    telegram?.LocationManager?.openSettings?.();
  });

  shareButton.addEventListener('click', async () => {
    shareButton.disabled = true;
    settingsButton.hidden = true;
    setStatus('Requesting location…');
    telegram?.HapticFeedback?.impactOccurred('light');

    try {
      const location = await telegramLocation();
      setStatus('Sending location securely…');
      const response = await fetch('/fuel-bot/location', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          init_data: telegram.initData,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not send the location.');
      }
      telegram?.HapticFeedback?.notificationOccurred('success');
      setStatus('Location sent. Returning to the bot…', 'success');
      window.setTimeout(() => telegram?.close(), 500);
    } catch (error) {
      telegram?.HapticFeedback?.notificationOccurred('error');
      setStatus(error instanceof Error ? error.message : 'Location request failed.', 'error');
      shareButton.disabled = false;
    }
  });

  if (!telegram?.initData) {
    setStatus('Open this page using the button in the Telegram bot.', 'error');
    return;
  }

  telegram.ready();
  telegram.expand();
  shareButton.disabled = false;
  setStatus('Ready to request your location.');
})();
