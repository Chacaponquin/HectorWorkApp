const { BrowserWindow, ipcMain } = require("electron");
const db = require("./db");
const { checkSVG, trashSVG } = require("./ui/initialStates");

//CONTADOR PARA NO ENVIAR AL SETINTERVAL DE LAS NOTIFICACIONES MAS WORKS Y EVITAR UN BUCLE INFINITO
let cont = 0;

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.loadFile("src/index.html");
}

//EVENTO PARA CREAR UN NUEVO WORK
ipcMain.on("newTask", (e, args) => {
    db.insert(args, (err, newDoc) => {
        if (err) {
            console.log(err);

            e.reply("error", err);
            return;
        }

        e.reply("newTask-created", newDoc);
    });
});

//EVENTO PARA ACTUALIZAR LOS WORKS
ipcMain.on("updateWorks", (e, args) => {
    //ENCONTRAR TODOS LOS WORKS DE LA BASE DE DATOS
    db.find({}, (err, works) => {
        if (err) {
            console.log(err);

            e.reply("error", err);
            return;
        }

        e.reply("allWorks", { works, checkSVG, trashSVG });

        //ENVIAR LOS WORKS AL SETINTERVAL SI EL CONTADOR ES IGUAL A 0 Y DESPUES SUMAR 1 AL CONTADOR PARA QUE NO SE VUELVA A ENVIAR EN OTRO MOMENTO
        if (cont == 0) {
            e.reply("allWorksNotf", { works });
            cont++;
        }
    });
});

//EVENTO PARA ELIMINAR WORKS
ipcMain.on("deleteWork", (e, { id }) => {
    //REMOVER DE LA BASE DE DATOS EL WORK CON EL ID RECIBIDO
    db.remove({ _id: id }, (err, num) => {
        if (err) {
            console.log(err);

            e.reply("error", err);
            return;
        }
    });
});

//EVENTO PARA COMPLETAR UNA TAREA
ipcMain.on("checkWork", (e, { id, value }) => {
    db.update({ _id: id }, { $set: { complete: value } }, { multi: true },
        (err, num) => {
            if (err) {
                console.log(err);

                e.reply("error", err);
                return;
            }
        }
    );
});

//EVENTO PARA COMPLETAR UNA SUBTAREA
ipcMain.on("updateSubWork", (e, { id, value, parentID }) => {
    db.find({ _id: parentID }, (err, foundWork) => {
        if (err) {
            console.log(err);

            e.reply("error", err);
            return;
        }

        //ENCUENTRA Y CAMBIA LA SUBTAREA A EL VALOR RECIBIDO
        foundWork[0].subWorks.forEach((el) => {
            if (el.id == id) {
                el.complete = value;
            }
        });

        //REVISAR SI TODAS LAS SUBTAREAS ESTAN COMPLETADAS
        //EN CASO DE ESTARLO CAMBIAR EL ESTADO DEL WORK A COMPLETADO
        let isComplete = foundWork[0].subWorks.filter((el) => el.complete == false);
        if (isComplete.length == 0) {
            foundWork[0].complete = true;
        } else {
            foundWork[0].complete = false;
        }

        //ACTUALIZA LA SUBTAREA
        db.update({ _id: parentID },
            foundWork[0], { returnUpdatedDocs: true },
            (err, num) => {
                if (err) {
                    console.log(error);

                    e.reply("error", error);
                    return;
                }

                //REPLICA UN EVENTO PARA DECOR QUE SE ACTUALIZO LA TAREA
                e.reply("updateWork");
            }
        );
    });
});

module.exports = { createWindow };