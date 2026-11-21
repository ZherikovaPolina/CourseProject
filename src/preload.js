const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('calorieAPI', {
  getProducts: () => ipcRenderer.invoke('products:getAll'),

  createProduct: (product) =>
    ipcRenderer.invoke('products:create', product),

  updateProduct: (id, product) =>
    ipcRenderer.invoke('products:update', id, product),

  deleteProduct: (id) =>
  ipcRenderer.invoke('products:delete', id),

getCalculationItems: () =>
  ipcRenderer.invoke('calculation:getAll'),

saveCalculationItem: (item) =>
  ipcRenderer.invoke('calculation:add', item),

deleteCalculationItem: (entryId) =>
  ipcRenderer.invoke('calculation:delete', entryId),

clearCalculationItems: () =>
  ipcRenderer.invoke('calculation:clear'),

getUserProfile: () =>
  ipcRenderer.invoke('profile:get'),

saveUserProfile: (profile) =>
  ipcRenderer.invoke('profile:save', profile)


});
