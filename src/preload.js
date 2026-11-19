const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('calorieAPI', {
  getProducts: () => ipcRenderer.invoke('products:getAll'),

  createProduct: (product) =>
    ipcRenderer.invoke('products:create', product),

  updateProduct: (id, product) =>
    ipcRenderer.invoke('products:update', id, product)
});
