const {
  app,
  BrowserWindow,
  ipcMain,
  Tray
} = require('electron');
const path = require('path');
const SerialPort = require('serialport');
const usbDetect = require('usb-detection');

usbDetect.startMonitoring();

usbDetect.on('change', device => {
  setTimeout(() => {
    console.log('Checking USB');
    return SerialPort.list((err, ports) => {
      if (err) {
        throw err;
      }

      ports.forEach(item => {
        if (item.vendorId === '2341' && item.productId === '8036') {
          console.log(item);
          var port = new SerialPort(item.comName, {
            baudRate: 115200
          });

          port.on('data', function (buffer) {
            const key = buffer.toString('utf8');
            console.log('Data:', key);
            return window.webContents.send('key-pressed', key);
          });
        }
      });
    });
  }, 1000);
});

const assetsDirectory = path.join(__dirname, 'assets');

let tray = null;
let window = null;

app.dock.hide();

app.on('ready', () => {
  createTray();
  createWindow();
});

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit();
});

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'sunTemplate.png'));
  tray.on('right-click', toggleWindow);
  tray.on('double-click', toggleWindow);
  tray.on('click', function (event) {
    toggleWindow();
  });
};

const getWindowPosition = () => {
  const windowBounds = window.getBounds();
  const trayBounds = tray.getBounds();

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  return {x: x, y: y};
};

const createWindow = () => {
  window = new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false
    }
  });

  window.loadURL(`file://${path.join(__dirname, 'index.html')}`);

  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide();
    }
  });
};

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide();
  } else {
    showWindow();
  }
};

const showWindow = () => {
  const position = getWindowPosition();
  window.setPosition(position.x, position.y, false);
  window.show();
  window.focus();
  // window.toggleDevTools();
};

ipcMain.on('show-window', () => {
  showWindow();
});
