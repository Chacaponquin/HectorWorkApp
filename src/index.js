const { createWindow } = require("./main");
const { app } = require("electron");

app.whenReady().then(createWindow);

app.on("window-all-closed", function() {
    if (process.platform != "darwin") app.quit();
});