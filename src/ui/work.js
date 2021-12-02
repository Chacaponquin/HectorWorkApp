class Works {
    constructor() {
        //DIV QUE CONTIENE LOS WORKS
        this.workContainer = document.querySelector(".works-container");
        //CREAR TODAS LAS TAREAS DE LA BASE DE DATOS
        this.updateWorks();
        //ARRAY CON TODOS LOS DIVS DE LOS WORKS
        this.workToDo = document.querySelectorAll(".workToDo");
    }

    //FUNCION PARA ACTUALIZAR LOS WORKS
    updateWorks() {
        //ENVIAR EL EVENTO DE ACTUALIZAR LOS DATOS
        ipcRenderer.send("updateWorks");

        //RECIBIR TODOS LOS WORKS DE LA BASE DE DATOS
        ipcRenderer.on("allWorks", (e, { works, checkSVG, trashSVG }) => {
            //VACIAR EL CONTENEDOR DE TAREAS
            this.workContainer.innerHTML = "";

            //CREAR CADA WORK
            works.map((work) => {
                this.workContainer.innerHTML += this.createWork(
                    work,
                    checkSVG,
                    trashSVG
                );
            });

            //ACTUALIZAR LAS FUNCIONES DE LOS BOTONES
            this.updateFunctions();
        });
    }

    //FUNCION PARA ACTUALIZAR FUNCIONES DE LOS BOTONES
    updateFunctions() {
        //ARRAY CON TODOS LOS BOTONES DE LOS WORKS
        const trashButtons = document.querySelectorAll(".trash");
        const checkButtons = document.querySelectorAll(".check");
        const subWorkCheck = document.querySelectorAll(".work-subWorks div input");

        //AÑADIR EL EVENTO DE ELIMINAR AL BUTON
        trashButtons.forEach((trash) => {
            trash.addEventListener("click", () => {
                const conf = confirm("¿Quieres borrar la tarea?");

                if (conf) {
                    ipcRenderer.send("deleteWork", { id: trash.id });
                    this.updateWorks();
                }
            });
        });

        //AÑADIR EL EVENTO DE COMPLETAR UN WORK
        checkButtons.forEach((check) => {
            check.addEventListener("click", (e) => {
                //EN CASO DE ESTAR MARCADA EL WORK SE CAMBIA A DESMARCADO Y VICEVERSA
                if (check.classList.contains("workChecked")) {
                    ipcRenderer.send("checkWork", { id: check.id, value: false });
                } else {
                    ipcRenderer.send("checkWork", { id: check.id, value: true });
                }

                this.updateWorks();
            });
        });

        subWorkCheck.forEach((input) => {
            input.addEventListener("change", (e) => {
                const parentID = e.target.parentNode.parentNode.parentNode.id;

                //EN CASO DE ESTAR LA SUBTAREA DESMARCADA SE MARCA Y VICEVERSA
                if (input.checked) {
                    ipcRenderer.send("updateSubWork", {
                        id: input.id,
                        value: true,
                        parentID: parentID,
                    });
                } else {
                    ipcRenderer.send("updateSubWork", {
                        id: input.id,
                        value: false,
                        parentID: parentID,
                    });
                }

                //RECIBE EL EVENTO DE WORK ACTUALIZADO
                ipcRenderer.on("updateWork", (e, args) => this.updateWorks());
            });
        });
    }

    //FUNCION PARA CREAR LA ESTRUCTURA DE CADA DIV DE WORK
    createWork(work, checkSVG, trashSVG) {
            //REVISAR SI EL WORK TIENE LAS SUBTAREAS COMPLETADAS
            const isComplete = work.subWorks.filter((el) => el.complete == false);

            return `
        <div class="workToDo ${work.complete ? "done" : ""}" id="${work._id}">
        <div class="workInf" id="${work._id}">
            <div>
            <h1>${work?.work}</h1>
            <p>${work?.day}</p>
            </div>
            
            <div class="buttonSection">
            ${
              isComplete.length == 0
                ? `<button class='workButton check ${
                    work.complete ? "workChecked" : ""
                  }' id="${work._id}">
            ${checkSVG}
            </button>`
                : ""
            }

            <button class="workButton trash" id="${work._id}">
            ${trashSVG}
            </button>
            </div>
        </div>
        <div class="description">${work?.description}</div>

        <div class="work-subWorks">${work.subWorks
          .map((subWork) => this.createSubWork(subWork))
          .flat()
          .join("")}</div>

        </div>
        `;
  }

  //FUNCION QUE DEVUELVE EL CONTENIDO HTML DE LAS TAREAS
  createSubWork(subWork) {
    return `
    <div>
        <input type="checkbox" id="${subWork.id}" ${
      subWork.complete ? "checked" : ""
    }>
        <p>${subWork.subWorkName}</p>
    </div>`;
  }
}

new Works();