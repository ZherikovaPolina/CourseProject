const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('calorieAPI', {
  getProducts: () => ipcRenderer.invoke('products:getAll'),
});
