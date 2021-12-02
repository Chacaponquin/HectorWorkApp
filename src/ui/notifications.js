//EN CASO DE EL USUARIO NO TENER ACTIVADAS LAS NOTIFICACIONES DE ESCRITORIO SOLICITAR EL PERMISO
if (Notification.permission == "denied") {
    Notification.requestPermission().then((result) => {
        console.log(result);
    });
} else if (Notification.permission == "granted") {
    //FUNCION PARA ENVIAR NOTIFICACIONES
    //RECIBE TODOS LOS WORKS DE LA BASE DE DATOS
    ipcRenderer.on("allWorksNotf", (e, { works }) => {
        //CREA UN SET INTERVAL QUE SE EJECUTA CADA 30 MINUTOS
        setInterval(() => {
            works.forEach((work) => {
                //OBTENER EL DIA DEL WORK
                const workDay = new Date(work.day).getTime();

                //CREAR UN BUCLE PARA SABER SI ESTA A 1, 2 O 3 DIAS
                for (let i = 1; i <= 3; i++) {
                    //CALCULAR LA DIFERENCIA ENTRE EL DIA DEL WORK Y EL DIA ACTUAL
                    let difference = workDay - Date.now();

                    //SI LA DIFERENCIA ES MENOR A 1, 2 O 3 DIAS SE ENVIA LA NOTIFICACION DE AVISO Y SE DETIENE EL BUCLE
                    if (difference < 86400000 * i) {
                        //OBJETO CON LAS CARACTERISTICAS DE LA NOTIFICACION
                        let options = {
                            tag: work._id,
                            body: `Acuerdate que quedan menos de ${i} dias para realizarla`,
                        };

                        //ENVIAR LA NOTIFICACION AL SISTEMA
                        let notification = new Notification(`${work.work}`, options);
                        break;
                    }
                }
            });
        }, 1800000);
    });
}