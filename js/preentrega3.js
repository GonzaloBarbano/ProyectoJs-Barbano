let usuariosRegistrados = [];
document.addEventListener("DOMContentLoaded", function () {
    let prestamoForm = document.getElementById("prestamoForm");
    let btnCalcular = document.getElementById("btnCalcular");
    let btnVolver = document.getElementById("btnVolver");
    let resultadoDiv = document.getElementById("resultado");
    let volverSimuladorDiv = document.getElementById("volverSimulador");
    let btnPedir = document.getElementById("btnPedir");
    let btnConsultar = document.getElementById("btnConsultar");
    let btnRegistrar = document.getElementById("btnRegistrar");
    
    let prestamosData = [];

    btnRegistrar.addEventListener("click", function () {
        let nombre = document.getElementById("nombre").value;
        let apellido = document.getElementById("apellido").value;
        let dni = document.getElementById("dni").value;
    
        if (!nombre || !apellido || !dni) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, complete todos los campos para registrar al usuario.',
            });
        } else {
            let usuario = {
                nombre: nombre,
                apellido: apellido,
                dni: dni,
            };
            usuariosRegistrados.push(usuario);
            document.getElementById("btnPedir").disabled = false;
            Swal.fire({
                icon: 'success',
                title: 'Usuario registrado con éxito',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

    btnConsultar.addEventListener("click", function () {
        let dniConsultado = document.getElementById("dniConsulta").value;
    
        // Verifica si el campo DNI está vacío
        if (!dniConsultado) {
            Toastify({
                text: "Por favor, completa el campo DNI antes de consultar.",
                duration: 3000, 
                close: true, 
                gravity: "bottom", 
                position: "right", 
            }).showToast();
        } else {
            // Busca el usuario en prestamosData
            let usuarioEncontrado = prestamosData.find((usuario) => usuario.dni === dniConsultado);
    
            if (usuarioEncontrado) {
                resultadoDiv.innerHTML = ""; 
    
                // Muestra los datos del préstamo del usuario encontrado
                usuarioEncontrado.resultado.forEach(function (pago) {
                    const resultadoHTML = `
                        <p>Mes: ${pago.mes}</p>
                        <p>Cuota: $${pago.cuotaMensual.toFixed(2)}</p>
                        <p>Interés: $${pago.interesMensual.toFixed(2)}</p>
                        <p>Amortización: $${pago.amortizacion.toFixed(2)}</p>
                        <p>Saldo pendiente: $${pago.saldoPendiente.toFixed(2)}</p>
                        <hr>
                    `;
                    resultadoDiv.innerHTML += resultadoHTML;
                });
            } else {
                resultadoDiv.innerHTML = "DNI incorrecto o usuario no encontrado.";
            }
        }
    });
    

    btnCalcular.addEventListener("click", function () {
        let plazoPrestamoMeses = parseInt(document.getElementById("plazo").value);

        if (plazoPrestamoMeses <= 72) {
            let montoPrestamo = parseFloat(document.getElementById("monto").value);
            let tasaInteresAnual = 10;
            let prestamo = new Prestamo(montoPrestamo, tasaInteresAnual, plazoPrestamoMeses);
            let cronogramaPago = prestamo.Cronograma();

            // Almacena la referencia a la tabla en una variable
            let tablaResultado = document.getElementById("tablaResultado");

            let resultadoBody = document.getElementById("resultadoBody");

            resultadoBody.innerHTML = "";

            // Agrega las filas de datos a la tabla
            cronogramaPago.forEach(function (pago) {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${pago.mes}</td>
                    <td>$${pago.cuotaMensual.toFixed(2)}</td>
                    <td>$${pago.interesMensual.toFixed(2)}</td>
                    <td>$${pago.amortizacion.toFixed(2)}</td>
                    <td>$${pago.saldoPendiente.toFixed(2)}</td>
                `;
                resultadoBody.appendChild(fila);
            });
            tablaResultado.style.display = "table";

        } else {
            // Error si el plazo es mayor que 72
            resultadoDiv.innerHTML = "El plazo no puede ser mayor a 72 meses";
            volverSimuladorDiv.style.display = "none";
            btnPedir.style.display = "none";
        }
    });

    btnVolver.addEventListener("click", function () {
        resultadoDiv.innerHTML = "";
        volverSimuladorDiv.style.display = "none";
        window.location.href = "index.html";
    });

    let prestamoData = {}; // Objeto para almacenar los datos del préstamo

    btnPedir.addEventListener("click", function () {
        let dni = document.getElementById("dni").value;
        prestamoData.dni = dni;
    
        // Calcula el cronograma de pagos
        let plazoPrestamoMeses = parseInt(document.getElementById("plazo").value);
        let montoPrestamo = parseFloat(document.getElementById("monto").value);
        let tasaInteresAnual = 10;
        let prestamo = new Prestamo(montoPrestamo, tasaInteresAnual, plazoPrestamoMeses);
        let cronogramaPago = prestamo.Cronograma();
    
        // Almacena el cronograma de pagos en el objeto prestamoData
        prestamoData.cronogramaPago = cronogramaPago;
    
        // Guarda todo el objeto prestamoData en localStorage
        localStorage.setItem(`prestamoData_${dni}`, JSON.stringify(prestamoData));
    });
    btnConsultar.addEventListener("click", function () {
        let dniConsultado = document.getElementById("dniConsulta").value;
    
        // Obtiene los datos del préstamo almacenados en localStorage usando la clave única
        let storedData = localStorage.getItem(`prestamoData_${dniConsultado}`);
    
        if (storedData) {
            let parsedData = JSON.parse(storedData);
    
            if (parsedData.cronogramaPago) {
                resultadoDiv.innerHTML = ""; 
    
                // Muestra los datos del cronograma de pagos del usuario encontrado
                parsedData.cronogramaPago.forEach(function (pago) {
                    const resultadoHTML = `
                        <p>Mes: ${pago.mes}</p>
                        <p>Cuota: $${pago.cuotaMensual.toFixed(2)}</p>
                        <p>Interés: $${pago.interesMensual.toFixed(2)}</p>
                        <p>Amortización: $${pago.amortizacion.toFixed(2)}</p>
                        <p>Saldo pendiente: $${pago.saldoPendiente.toFixed(2)}</p>
                        <hr>
                    `;
                    resultadoDiv.innerHTML += resultadoHTML;
                });
            } else {
                resultadoDiv.innerHTML = "Datos de cronograma de pagos no encontrados.";
            }
        } else {
            resultadoDiv.innerHTML = "DNI incorrecto o usuario no encontrado.";
        }
    });
});

class Prestamo {
    constructor(monto, tasaInteres, plazoMeses) {
        this.monto = monto;
        this.tasaInteres = tasaInteres;
        this.plazoMeses = plazoMeses;
    }

    calcularCuotaMensual() {
        let tasaMensual = this.tasaInteres / 12 / 100;
        let cuota = (this.monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -this.plazoMeses));
        return cuota;
    }

    Cronograma() {
        let cronograma = [];
        let cuotaMensual = this.calcularCuotaMensual();
        let saldoPendiente = this.monto;
        for (let mes = 1; mes <= this.plazoMeses; mes = mes + 1) {
            let interesMensual = saldoPendiente * (this.tasaInteres / 12 / 100);
            let amortizacion = cuotaMensual - interesMensual;
            saldoPendiente = saldoPendiente - amortizacion;

            cronograma.push({
                mes,
                cuotaMensual,
                interesMensual,
                amortizacion,
                saldoPendiente,
            });
        }
        return cronograma;
    }
}



//KEY   1bfec8e38aa897897d3b9f3f


async function convertirDivisas() {
    let cantidad = document.getElementById('cantidad').value;
    let deDivisa = document.getElementById('deDivisa').value;
    let aDivisa = document.getElementById('aDivisa').value;
    let apiKey = '1bfec8e38aa897897d3b9f3f'; 

    let url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${deDivisa}`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.result === "success") {
            let tasaCambio = data.conversion_rates[aDivisa];
            let resultado = cantidad * tasaCambio;
            
            // Mostrar el resultado en el elemento HTML
            let resultadoConversion = document.getElementById('resultadoConversion');
            resultadoConversion.innerHTML = `${cantidad} ${deDivisa} equivale a ${resultado.toFixed(2)} ${aDivisa}`;
        } else {
            alert('Error en la conversión: ' + data.error);
        }
    } catch (error) {
        console.error('Error al obtener tasas de cambio:', error);
    }
}