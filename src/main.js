
import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

import {
  initializeDatabase,
  closeDatabase
} from './database/db.js';

// Завершення роботи під час встановлення або видалення на Windows
if (started) {
  app.quit();
}

// Створення головного вікна
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Завантаження інтерфейсу
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
      )
    );
  }

  // Інструменти розробника
  mainWindow.webContents.openDevTools();
};

// Ініціалізація застосунку
app.whenReady().then(() => {
  // Створюємо базу даних перед відкриттям вікна
  initializeDatabase(app.getPath('userData'));

  createWindow();

  // Повторне відкриття вікна на macOS
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Закриваємо підключення до бази даних
app.on('before-quit', () => {
  closeDatabase();
});

// Закриття застосунку
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
