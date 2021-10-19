eventListeners();

function eventListeners(){
    document.querySelector('#formulario').addEventListener('submit', validarRegistro);
}

function validarRegistro(e){
    e.preventDefault();
    let usuario = document.querySelector('#usuario').value,
        password = document.querySelector('#password').value,
        tipo = document.querySelector('#tipo').value;

        if(usuario === '' || password === ''){
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Todos los campos son obligatorios',
                footer: '<a href="">Why do I have this issue?</a>'
              });
        } else {
            //Ambos campos son correctos, mandar ejecutar Ajax
            

            //Datos que se envian al servidor
            const datos = new FormData();
            datos.append('usuario', usuario);
            datos.append('password', password);
            datos.append('accion', tipo);

            //console.log(datos);

            //crear el llamado ajax
            const xhr = new XMLHttpRequest();

            //Abrir conexión

            xhr.open('POST', 'includes/modelos/modelo-admin.php', true);

            //retornar los datos
            xhr.onload = function() {
                if(this.status === 200){
                    let respuesta = JSON.parse(xhr.responseText);
                    
                    console.log(respuesta);
                    //Si la respuesta es correcta
                    if(respuesta.respuesta === 'correcto'){
                        //Si es un nuevo usuario
                        if(respuesta.tipo === 'crear'){
                            swal({
                                title: 'Usuario Creado',
                                text: 'El usuario se creo correctamente',
                                type: 'success'
                            });
                        }  else if(respuesta.tipo === 'login'){
                            swal({
                                title: 'Loggin Correcto',
                                text: 'Presiona OK',
                                type: 'success'
                            })
                            .then(resultado => {
                                if(resultado.value){
                                    window.location.href = 'index.php';
                                }
                            })
                        }
                    } else {
                        //Hubo un error
                        swal({
                            title: 'Error',
                            text: 'Hubo un error',
                            type: 'error'
                        });
                    }
                }
            }
            
            //Enviar la petición
            xhr.send(datos);
        }
}