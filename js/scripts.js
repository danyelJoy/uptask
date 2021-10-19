eventListeners();

//Lista de proyectos
let listaProyectos = document.querySelector('ul#proyectos');

function eventListeners(){

    //Document Ready
    document.addEventListener('DOMContentLoaded', function(){
        actualizarProgreso();
    });
    //Boton para crear proyecto
    document.querySelector('.crear-proyecto a').addEventListener('click', nuevoProyecto);
     
    //Boton para una nueva tarea
    if(document.querySelector('.nueva-tarea') !== null){
        document.querySelector('.nueva-tarea').addEventListener('click', agregarTarea);
    }    

    //Botones para las acciones de las tareas
    document.querySelector('.listado-pendientes').addEventListener('click', accionesTareas);
}

function nuevoProyecto(e){
    e.preventDefault();
    //console.log('Presionaste en nuevo proyecto');
    let listaProyectos = document.querySelector('ul#proyectos');
    //Crear un input para el nombre del proyecto
        if (!document.querySelector('nuevo-proyecto')){

        let nuevoProyecto = document.createElement('li');
        nuevoProyecto.innerHTML = '<input type="text" id="nuevo-proyecto">';
        listaProyectos.appendChild(nuevoProyecto);

        //Seleccionar el ID con el nuevoProyecto
        let inputNuevoProyecto = document.querySelector('#nuevo-proyecto');

        //Al presionar enter crear el nuevo proyecto

        inputNuevoProyecto.addEventListener('keypress', function(e){
            let tecla = e.which || e.keyCode;

            if(tecla === 13){
                guardarProyectoDB(inputNuevoProyecto.value);
                listaProyectos.removeChild(nuevoProyecto);
            }
        });
    }

}

function guardarProyectoDB(nombreProyecto){
    //console.log(nombreProyecto);
    // Crear llamado ajax
    let xhr = new XMLHttpRequest();
    //Enviar datos formdata
     let datos = new FormData();
     datos.append('proyecto', nombreProyecto);
     datos.append('accion', 'crear');    

    //Abrir conexión
    xhr.open('POST', 'includes/modelos/modelo-proyecto.php', true);

    //En la carga
    xhr.onload = function(){
        if(this.status === 200){
            //Obtener datos de la respuesta
            //console.log(JSON.parse(xhr.responseText));
            let respuesta = JSON.parse(xhr.responseText);
            let proyecto = respuesta.nombre_proyecto,
                id_proyecto = respuesta.id_insertado,
                tipo = respuesta.tipo,
                resultado = respuesta.respuesta;

                //Comprobar la inserción

                if(resultado === 'correcto'){
                    //Fue exitoso
                    if(tipo === 'crear'){
                        //Se creo nuevo proyecto
                        let nuevoProyecto = document.createElement('li');
                        nuevoProyecto.innerHTML = `
                            <a href="index.php?id_proyecto=${id_proyecto}" id="proyecto:${id_proyecto}">
                                ${proyecto};
                            </a>    
                        `;
                        //Agregar al html
                        listaProyectos.appendChild(nuevoProyecto);
                        //Enviar una alerta
                        swal({
                            title: 'Proyecto Creado',
                            text: 'El proyecto: '+ proyecto + 'se creó correctamente',
                            type: 'success'
                        })
                        .then(resultado => {
                            // Redireccionar a la nueva URL
                            if(resultado.value){
                                window.location.href = 'index.php?id_proyecto=' + id_proyecto;
                            }
                        });                        
                        
                    } else {
                        // Se actualizo o elimino
                    }
                } else {
                    //Hubo un error
                    Swal({
                        type: 'error',
                        title: 'Error',
                        text: 'hubo un error'                        
                      });
                }            
        }
    }
    //Enviar el request
    xhr.send(datos);
}
//Agregar una nueva tarea al proyecto actual
function agregarTarea(e){
    e.preventDefault();
    let nombreTarea = document.querySelector('.nombre-tarea').value;

    //Validar que el campo tenga algo escrito

    if(nombreTarea === ''){
        Swal({
            type: 'error',
            title: 'Error',
            text: 'Una tarea no puede ir vacia.'                        
          });
    } else {
        // La tarea tiene algo, insertar en PHP

        //Crear llamado  a AJAX
        let xhr = new XMLHttpRequest;        

        //Crear Formdata
        let datos = new FormData();
        datos.append('tarea', nombreTarea);
        datos.append('accion', 'crear');
        datos.append('id_proyecto', document.querySelector('#id_proyecto').value);


        //Abrir la conexión
        xhr.open('POST', 'includes/modelos/modelo-tareas.php', true);

        // Ejecutar la respuesta
        xhr.onload = function(){
            if(this.status === 200){
                
                //Todo correcto
                let respuesta = JSON.parse(xhr.responseText);
                //console.log(respuesta);
                let resultado = respuesta.respuesta,
                    tarea = respuesta.tarea,
                    id_insertado = respuesta.id_insertado,
                    tipo = respuesta.tipo;

                if(resultado === 'correcto'){
                    //Se agregó correctamente
                    if(tipo === 'crear'){
                        //Lanzar la alerta
                        Swal({
                            type: 'success',
                            title: 'Tarea Creada',
                            text: 'La tarea: ' + tarea + ' se creó correctamente'                        
                          });

                          //Seleccionar el  parrafo con lista vacia
                          let parrafoListaVacia = document.querySelectorAll('.lista-vacia');
                          if(parrafoListaVacia.length > 0){
                              document.querySelector('.lista-vacia').remove();
                          }

                          //Construirel template
                          let nuevaTarea = document.createElement('li');

                          //Agregamos el ID
                          nuevaTarea.id = 'tarea:' + id_insertado;

                          //Agregar la clase tarea
                          nuevaTarea.classList.add('tarea');

                          //Construir el shtml
                          nuevaTarea.innerHTML = `
                                <p>${tarea}</p>
                                <div class="acciones">
                                   <i class="far fa-check-circle"></i>
                                   <i class="fas fa-trash"></i>
                                </div>                          
                          `;
                          //Agregarlo al HTML
                          let listado = document.querySelector('.listado-pendientes ul');
                          listado.appendChild(nuevaTarea);

                          //Limpiar el formulario
                          document.querySelector('.agregar-tarea').reset();
                          //Actualizar progreso
                          actualizarProgreso();
                    }   
                } else {
                    // Huno un error
                    Swal({
                        type: 'error',
                        title: 'Error',
                        text: 'Hubo un error'                        
                      });
                }
            }
        }
        // Enviar la consulta
        xhr.send(datos)
    }
}

//Cambia estado de tareas o eliminar

function accionesTareas(e){
    e.preventDefault();
     //Delegation
    if(e.target.classList.contains('fa-check-circle')){
        if(e.target.classList.contains('completo')){
            e.target.classList.remove('completo');
            cambiarEstadoTarea(e.target, 0);
        } else {
            e.target.classList.add('completo');
            cambiarEstadoTarea(e.target, 1);
        }
    } 
    if(e.target.classList.contains('fa-trash')){
        Swal({
            title: '¿Estas seguro(a)?',
            text: "Esta acción no se puede revertir",
            type: 'warning',
            showCancelButton: true, 
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Borrar',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.value) {

                let tareaEliminar = e.target.parentElement.parentElement;
                //Borrar DB
                eliminarTareaBD(tareaEliminar);

                //Borrar HTML
                tareaEliminar.remove();

              Swal(
                'Eliminado!',
                'Has eliminado la información.',
                'success'
              )
            }
          })
    } 
}
//Completa o desacompleta una tarea
function cambiarEstadoTarea(tarea, estado){
     let idTarea = tarea.parentElement.parentElement.id.split(':');
     
     //Crear llamado AJAX
    let xhr = new XMLHttpRequest;

    //Información
    let datos = new FormData();
    datos.append('id',idTarea[1]);
    datos.append('accion', 'actualizar');
    datos.append('estado', estado);

    //Abrir conexión
    xhr.open('POST', 'includes/modelos/modelo-tareas.php', true);

    // Onload
    xhr.onload= function(){
        if(this.status === 200){
             //console.log(JSON.parse(xhr.responseText)); 
             actualizarProgreso();

        }
    }
    //Enviar la paticion
    xhr.send(datos);    

}
//Eliminar la tarea de la BD
function eliminarTareaBD(tarea){
    let idTarea = tarea.id.split(':');
     
    //Crear llamado AJAX
    let xhr =  new XMLHttpRequest;

    //Información
    let datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'eliminar');
    

    //Abrir conexión
    xhr.open('POST', 'includes/modelos/modelo-tareas.php', true);

    // Onload
    xhr.onload= function(){
        if(this.status === 200){
            console.log(JSON.parse(xhr.responseText)); 
            //Comprobar que haya tareas restantes
            let listaTareasRestante = document.querySelectorAll('li.tarea');
            if(listaTareasRestante.length === 0 ){
                document.querySelector('.listado-pendientes ul').innerHTML("<p class='lista-vacia'> No hay tareas en este proyecto</p>");
            }
            //Actualizar el progreso
            actualizarProgreso();
        }
    }
    //Enviar la paticion
    xhr.send(datos);
}

//Actualiza el avance de las tareas
 function actualizarProgreso (){
     const tareas = document.querySelectorAll('li.tarea');

     //Optener las tareas completadas
     const tareasCompletas = document.querySelectorAll('i.completo');

     //Determinar el avance
     const avance =Math.round((tareasCompletas.length / tareas.length) * 100);
     
     //Asignar el avance a la barra
     const porcentaje = document.querySelector('#porcentaje');
     porcentaje.style.width = avance+'%';
     
 }