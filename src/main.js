import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';

import {
  initializeDatabase,
  closeDatabase
} from './database/db.js';

import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from './database/products.js';

import {
  getCalculationItems,
  saveCalculationItem,
  deleteCalculationItem,
  clearCalculationItems
} from './database/calculationItems.js';

import {
  getUserProfile,
  saveUserProfile
} from './database/profile.js';


const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

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

  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  initializeDatabase(app.getPath('userData'));

  ipcMain.handle('products:getAll', () => {
    return getAllProducts();
  });

  ipcMain.handle('products:create', (_event, product) => {
  return createProduct(product);
});

ipcMain.handle('products:update', (_event, id, product) => {
  return updateProduct(id, product);
});

ipcMain.handle('products:delete', (_event, id) => {
  return deleteProduct(id);
});

  ipcMain.handle('calculation:getAll', (_event, date) => {
  return getCalculationItems(date);
});

  ipcMain.handle('calculation:add', (_event, item) => {
    return saveCalculationItem(item);
  });

  ipcMain.handle('calculation:delete', (_event, entryId) => {
    return deleteCalculationItem(entryId);
  });

ipcMain.handle('calculation:clear', (_event, date) => {
  return clearCalculationItems(date);
});


  ipcMain.handle('profile:get', () => {
    return getUserProfile();
  });

  ipcMain.handle('profile:save', (_event, profile) => {
    return saveUserProfile(profile);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  closeDatabase();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
