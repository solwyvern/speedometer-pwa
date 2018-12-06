'use strict';

const appOpts = {
  dom: {
    body: document.querySelector('body'),
    start: document.querySelector('#start'),
    readout: document.querySelector('#readout'),
    showMph: document.querySelector('#show-mph'),
    showKmh: document.querySelector('#show-kmh'),
  },
  readoutUnit: 'mph',
  readoutUnits: {
    mph: 2.23694,
    kmh: 3.6
  },
  watchId: null,
};

document.querySelector('#show-mph').addEventListener('click', (event) => {
  appOpts.readoutUnit = 'mph';
  if (!appOpts.dom.showMph.classList.contains('selected')) {
    toggleReadoutButtons();
  }
});

document.querySelector('#show-kmh').addEventListener('click', (event) => {
  appOpts.readoutUnit = 'kmh';
  if (!appOpts.dom.showKmh.classList.contains('selected')) {
    toggleReadoutButtons();
  }
});

document.querySelector('#start').addEventListener('click', (event) => {
  if (appOpts.watchId) {
    navigator.geolocation.clearWatch(appOpts.watchId);
    appOpts.watchId = null;
    appOpts.dom.start.textContent = '🔑 Start';
    appOpts.dom.start.classList.toggle('selected');
  } else {
    const options = {
      enableHighAccuracy: true
    };
    appOpts.watchId = navigator.geolocation.watchPosition(parsePosition,
      null, options);
    appOpts.dom.start.textContent = '🛑 Stop';
    appOpts.dom.start.classList.toggle('selected');
  }
});

const toggleReadoutButtons = () => {
  appOpts.dom.showKmh.classList.toggle('selected');
  appOpts.dom.showMph.classList.toggle('selected');
};

const startAmbientSensor = () => {
  if ('AmbientLightSensor' in window) {
    navigator.permissions.query({ name: 'ambient-light-sensor' })
    .then(result => {
      if (result.state === 'denied') {
        return;
      }

      const sensor = new AmbientLightSensor();
      sensor.onreading = () => {
        if (sensor.illuminance < 3 && !appOpts.dom.body.classList.contains('dark')) {
          appOpts.dom.body.classList.toggle('dark');
        } else if (sensor.illuminance > 3 && appOpts.dom.body.classList.contains('dark')) {
          appOpts.dom.body.classList.toggle('dark');
        };
      };
      sensor.start();
    });
  }
}

const parsePosition = (position) => {
  appOpts.dom.readout.textContent = Math.round(
    position.coords.speed * appOpts.readoutUnits[appOpts.readoutUnit]);
};

const startServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js', {
      scope: './'
    })
    .then(registration => {
      registration.addEventListener('updatefound',
        () => {
          console.log('service worker ready');
        });
    });
  }
}

startAmbientSensor();
startServiceWorker();