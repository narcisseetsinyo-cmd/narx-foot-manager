const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("ggStore", {
  load: () => ipcRenderer.invoke("store:load"),
  save: (text) => ipcRenderer.invoke("store:save", text),
  exportFile: (name, text, ext) => ipcRenderer.invoke("file:export", { name, text, ext }),
  exportBinary: (name, b64, ext) => ipcRenderer.invoke("file:exportBinary", { name, b64, ext }),
  fetchText: (url) => ipcRenderer.invoke("net:fetchText", url),
  importFile: (exts) => ipcRenderer.invoke("file:import", { exts }),
  saveDoc: (cid, id, b64) => ipcRenderer.invoke("doc:save", { cid, id, b64 }),
  readDoc: (cid, id) => ipcRenderer.invoke("doc:read", { cid, id }),
  openDoc: (cid, id) => ipcRenderer.invoke("doc:open", { cid, id }),
  deleteDoc: (cid, id) => ipcRenderer.invoke("doc:delete", { cid, id })
});
