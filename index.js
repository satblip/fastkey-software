const {ipcRenderer, shell, Notification} = require('electron');

document.addEventListener('click', (event) => {
  if (event.target.href) {
    // Open links in external browser
    shell.openExternal(event.target.href);
    event.preventDefault();
  } else if (event.target.classList.contains('js-quit-action')) {
    window.close();
  }
});

const updateView = (event, key) => {
  document.querySelector('.js-key').textContent = key;
};

const sendNotification = () => {
  let notification = new Notification(
    'Arduino is connected'
  );

  // Show window when notification is clicked
  notification.onclick = () => {
    ipcRenderer.send('show-window');
  };
};

ipcRenderer.on('key-pressed', updateView);
