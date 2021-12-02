const { ipcRenderer } = require("electron");

class AddWorks {
    constructor() {
        //VARIABLE QUE IDENTIFICA SI SE ESTA MOSTRANDO LA TARJETA
        this.cardShow = false;

        //ELEMENTOS DE LA BARRA DE TAREAS
        this.navBar = document.querySelector(".navBar div");
        this.navBarButton = document.querySelector(".showCard-button");
        this.addWorkCard = document.querySelector(".addWork-card");
        this.addWorkForm = document.querySelector(".addWork-card form");

        //DATOS DEL FORMULARIO
        this.workName = document.querySelector(".workName");
        this.workDay = document.querySelector(".day");
        this.workDescription = document.querySelector(".description");
        this.subWorkButton = document.querySelector(".subWork-button");
        this.subWorkContainer = document.querySelector(".subWorks-container");

        //UBICAR LA TARJETA
        const buttonHeight = this.navBarButton.clientHeight;
        this.addWorkCard.style.top = `${buttonHeight + 30}px`;

        //AÑADIR EL EVENTO A EL BOTON
        this.addWorkForm.addEventListener("submit", this.saveWork.bind(this));
        this.navBarButton.addEventListener("click", this.cardActions.bind(this));
        this.subWorkButton.addEventListener("click", this.addSubWork.bind(this));

        //ESCONDER LA TARJETA DE NUEVO WORK
        this.addWorkCard.style.display = "none";
    }

    //FUNCION PARA AÑADIR UN INPUT DE SUBTAREA
    addSubWork() {
        //ARRAY CON TODOS LOS INPUTS DE SUBTAREAS
        const subWorks = document.querySelectorAll(".subWork");

        //SOLO SE PODRA AÑADIR UN NUEVO INPUT SI NO EXISTE NINGUNO O SI EL ULTIMO INPUT TIENE ALGO ESCRITO
        if (subWorks.length == 0 || subWorks[subWorks.length - 1].value != "") {
            let newInput = document.createElement("input");
            newInput.type = "text";
            newInput.className = "subWork";
            newInput.required = true;
            newInput.spellcheck = false;
            this.subWorkContainer.appendChild(newInput);
        }
    }

    //FUNCION PARA CREAR UNA NUEVO WORK
    saveWork(e) {
        e.preventDefault();
        //ARRAY CON TODAS LAS SUBTAREAS
        const subWorks = document.querySelectorAll(".subWork");

        //EN CASO DE INSERTAR UNA FECHA PASADA SALTARA UNA ALERTA
        if (new Date(this.workDay.value).getTime() < Date.now()) {
            alert("No puedes añadir una tarea con una fecha pasada");
            return;
        }

        //ESTRUCTURA DE EL NUEVO WORK CREADO
        const newWork = {
            work: this.workName.value,
            day: this.workDay.value,
            description: this.workDescription.value,
            complete: false,
            subWorks: [],
        };

        //AÑADIR TODAS LAS SUBTAREAS AL NUEVO WORK
        subWorks.forEach((subWork, i) => {
            newWork.subWorks = [
                ...newWork.subWorks,
                {
                    subWorkName: subWork.value,
                    complete: false,
                    id: `${Date.now()}${i}`,
                },
            ];
        });

        //RESETEAR EL FORMULARIO
        this.addWorkForm.reset();

        //ENVIAR LOS DATOS A TRAVES DEL EVENTO A ELECTRON
        ipcRenderer.send("newTask", newWork);

        //RECIBIR EL DOCUMENTO CREADOI EN CASO DE LOGRARSE CON EXITO LA TAREA
        ipcRenderer.on("newTask-created", (e, args) => {
            this.updateWorks();
        });

        //CERRAR LA VENTANA DE NUEVO WORK
        this.addWorkCard.style.display = "none";
        this.cardShow = false;
    }

    //FUNCION PARA ESCONDER Y APARECER LA TARJETA
    cardActions() {
        if (this.cardShow) {
            this.addWorkCard.style.display = "none";
            this.cardShow = false;

            //VACIAR EL CONTENEDOR DE SUBTAREAS
            this.subWorkContainer.innerHTML = "";
        } else {
            this.addWorkCard.style.display = "flex";
            this.cardShow = true;
        }
    }

    updateWorks() {
        ipcRenderer.send("updateWorks");
    }
}

new AddWorks();