const { app, BrowserWindow, ipcMain, dialog, Menu, shell, net } = require("electron");
const path = require("path");
const fs = require("fs");

const dataFile = () => path.join(app.getPath("userData"), "golden-generation-cup-data.json");
let win;
const refocus = () => { if (win && !win.isDestroyed()) { win.focus(); win.webContents.focus(); } };

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 380, minHeight: 600,
    backgroundColor: "#010C34", title: "NARX Foot Manager",
    icon: path.join(__dirname, "app", process.platform === "win32" ? "icon.ico" : "icon.png"),
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  const isMac = process.platform === "darwin";
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(isMac ? [{ label: "NARX Foot Manager", submenu: [
      { role: "about", label: "À propos de NARX Foot Manager" }, { type: "separator" },
      { role: "hide", label: "Masquer NARX Foot Manager" }, { role: "hideOthers", label: "Masquer les autres" }, { role: "unhide", label: "Tout afficher" },
      { type: "separator" }, { role: "quit", label: "Quitter NARX Foot Manager" } ] }] : []),
    { label: "Fichier", submenu: [
      { label: "Ouvrir le dossier des données", click: () => shell.openPath(app.getPath("userData")) },
      ...(isMac ? [{ type: "separator" }, { role: "close", label: "Fermer la fenêtre" }] : [{ type: "separator" }, { role: "quit", label: "Quitter" }]) ] },
    { label: "Édition", submenu: [
      { role: "undo", label: "Annuler" }, { role: "redo", label: "Rétablir" }, { type: "separator" },
      { role: "cut", label: "Couper" }, { role: "copy", label: "Copier" }, { role: "paste", label: "Coller" },
      { role: "selectAll", label: "Tout sélectionner" } ] },
    { label: "Affichage", submenu: [
      { role: "reload", label: "Actualiser" }, { role: "togglefullscreen", label: "Plein écran" },
      { role: "zoomIn", label: "Zoom avant" }, { role: "zoomOut", label: "Zoom arrière" }, { role: "resetZoom", label: "Taille réelle" } ] }
  ]));
  win.loadFile(path.join(__dirname, "app", "index.html"));
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
}

ipcMain.handle("store:load", () => {
  try { return fs.readFileSync(dataFile(), "utf8"); } catch (e) { return null; }
});
ipcMain.handle("store:save", (_e, text) => {
  const f = dataFile(), tmp = f + ".tmp";
  fs.mkdirSync(path.dirname(f), { recursive: true });
  try { if (fs.existsSync(f)) fs.copyFileSync(f, f + ".bak"); } catch (e) {}
  fs.writeFileSync(tmp, text, "utf8"); fs.renameSync(tmp, f); return true;
});
ipcMain.handle("file:export", async (_e, { name, text, ext }) => {
  const r = await dialog.showSaveDialog(win, { defaultPath: path.join(app.getPath("documents"), name),
    filters: [{ name: "Fichier NARX Foot Manager", extensions: [ext] }] });
  refocus();
  if (r.canceled || !r.filePath) return false;
  fs.writeFileSync(r.filePath, text, "utf8"); return true;
});
ipcMain.handle("file:exportBinary", async (_e, { name, b64, ext }) => {
  const r = await dialog.showSaveDialog(win, { defaultPath: path.join(app.getPath("documents"), name),
    filters: [{ name: ext === "pdf" ? "Document PDF" : "Image PNG", extensions: [ext] }] });
  refocus();
  if (r.canceled || !r.filePath) return false;
  fs.writeFileSync(r.filePath, Buffer.from(b64, "base64")); return true;
});
ipcMain.handle("net:fetchText", async (_e, url) => {
  if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(String(url))) throw new Error("Adresse non autorisée");
  const r = await net.fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return await r.text();
});
ipcMain.handle("file:import", async (_e, { exts }) => {
  const r = await dialog.showOpenDialog(win, { properties: ["openFile"], filters: [{ name: "Fichier NARX Foot Manager", extensions: exts }] });
  refocus();
  if (r.canceled || !r.filePaths.length) return null;
  return fs.readFileSync(r.filePaths[0], "utf8");
});

const safe = s => String(s || "").replace(/[^A-Za-z0-9_\-]/g, "");
const docPath = (cid, id) => path.join(app.getPath("userData"), "pieces", safe(cid), safe(id) + ".pdf");
ipcMain.handle("doc:save", (_e, { cid, id, b64 }) => {
  const f = docPath(cid, id); fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, Buffer.from(b64, "base64")); return true;
});
ipcMain.handle("doc:read", (_e, { cid, id }) => { try { return fs.readFileSync(docPath(cid, id)).toString("base64"); } catch (e) { return null; } });
ipcMain.handle("doc:open", async (_e, { cid, id }) => { const f = docPath(cid, id); if (!fs.existsSync(f)) return false; const err = await shell.openPath(f); return !err; });
ipcMain.handle("doc:delete", (_e, { cid, id }) => { try { fs.unlinkSync(docPath(cid, id)); } catch (e) {} return true; });

// Reprise automatique des données de l'ancienne version (Golden Generation Cup)
function migrateOldData() {
  try {
    const nd = app.getPath("userData"), od = path.join(app.getPath("appData"), "Golden Generation Cup");
    const f = "golden-generation-cup-data.json";
    if (!fs.existsSync(path.join(nd, f)) && fs.existsSync(path.join(od, f))) {
      fs.mkdirSync(nd, { recursive: true });
      fs.cpSync(path.join(od, f), path.join(nd, f));
      if (fs.existsSync(path.join(od, f + ".bak"))) fs.cpSync(path.join(od, f + ".bak"), path.join(nd, f + ".bak"));
      if (fs.existsSync(path.join(od, "pieces"))) fs.cpSync(path.join(od, "pieces"), path.join(nd, "pieces"), { recursive: true });
    }
  } catch (e) {}
}
if (process.platform === "win32") app.setAppUserModelId("tg.agoenyive2.goldengenerationcup");
app.whenReady().then(() => { migrateOldData(); createWindow(); });
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
