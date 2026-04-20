/**
 * ==========================================
 * APP: CALCULADORA DE SUELDOS (VERSIÓN FINAL)
 * ==========================================
 * Desarrollado para procesamiento local de nómina.
 * Incluye: 
 * - Login visual.
 * - Validación robusta de inputs (Regex).
 * - Procesamiento de CSV con totales individuales y generales.
 * - Nombre de archivo automático por mes y año.
 */

// ==========================================
// 1. MÓDULO DE LOGIN (SEGURIDAD VISUAL)
// ==========================================
document.getElementById("login-button").addEventListener("click", () => {
    const usernameInput = document.getElementById("usernameInput").value;
    const passwordInput = document.getElementById("passwordInput").value;
    const errorMessage = document.getElementById("login-error");

    // Credenciales estáticas para acceso local
    const usuarioCorrecto = "admin";
    const passwordCorrecto = "sueldos2026";

    if (usernameInput === usuarioCorrecto && passwordInput === passwordCorrecto) {
        // Acceso concedido
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("calculator-screen").style.display = "block";
    } else {
        // Acceso denegado
        errorMessage.style.display = "block";
    }
});

// ==========================================
// 2. MÓDULO DE CÁLCULO Y PROCESAMIENTO
// ==========================================
document.getElementById("calculate-button").addEventListener("click", () => {
    
    // Captura del archivo CSV
    const fileInput = document.getElementById("csvFileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecciona un archivo CSV primero.");
        return;
    }

    /**
     * FUNCIÓN DE ROBUSTEZ: obtenerValorSeguro
     * Valida que el input sea un número positivo (int o float), no esté vacío
     * y no contenga caracteres especiales o signos negativos.
     */
    function obtenerValorSeguro(idInput, nombreCampo) {
        const valorTexto = document.getElementById(idInput).value.trim();

        if (valorTexto === "") {
            alert(`Error: El campo "${nombreCampo}" no puede estar vacío.`);
            return null; 
        }

        // Regex: solo números positivos y punto decimal opcional
        const regexEstricto = /^\d+(\.\d+)?$/;

        if (!regexEstricto.test(valorTexto)) {
            alert(`Error: Valor inválido en "${nombreCampo}". \nSolo números positivos. No uses comas, letras ni signos.`);
            return null;
        }

        return Number(valorTexto);
    }

    // Captura y validación de parámetros globales
    const pricePerHour = obtenerValorSeguro("pricePerHour", "Precio por hora");
    const pricePerExtraHour = obtenerValorSeguro("pricePerExtraHour", "Precio por hora extra");
    const percentageWhiteSalary = obtenerValorSeguro("percentageWhiteSalary", "Porcentaje en blanco");

    // Freno de seguridad si los inputs están mal
    if (pricePerHour === null || pricePerExtraHour === null || percentageWhiteSalary === null) return;
    
    if (percentageWhiteSalary > 100) {
        alert("El porcentaje no puede ser mayor a 100.");
        return;
    }

    // ==========================================
    // 3. PROCESAMIENTO CON PAPAPARSE
    // ==========================================
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            
            // Acumuladores para el TOTAL GENERAL de la empresa
            let granTotalBruto = 0;
            let granTotalBlanco = 0;
            let granTotalNegro = 0;

            // Mapeo y cálculo de la lista de empleados
            const datosProcesados = results.data
                .filter(emp => emp.empleado) // Limpieza de filas vacías
                .map(emp => {
                    // Cálculo individual
                    const totalBruto = (pricePerHour * (emp.horas_trabajadas || 0)) + 
                                       (pricePerExtraHour * (emp.horas_extras || 0)) + 
                                       (emp.extra_presencialidad || 0);

                    const enBlanco = (totalBruto * percentageWhiteSalary) / 100;
                    const enNegro = totalBruto - enBlanco;

                    // Sumar al total de la empresa
                    granTotalBruto += totalBruto;
                    granTotalBlanco += enBlanco;
                    granTotalNegro += enNegro;

                    return {
                        empleado: emp.empleado,
                        sueldo_total_bruto: totalBruto,
                        total_en_blanco: enBlanco,
                        total_en_negro: enNegro
                    };
                });

            // Agregar fila de RESUMEN TOTAL al final del CSV
            const filaTotales = {
                empleado: "--- TOTAL GENERAL ---",
                sueldo_total_bruto: granTotalBruto,
                total_en_blanco: granTotalBlanco,
                total_en_negro: granTotalNegro
            };
            datosProcesados.push(filaTotales);

            // Actualizar interfaz visual con el total acumulado
            const summaryCont = document.getElementById("summary-container");
            if (summaryCont) {
                summaryCont.style.display = "block";
                document.getElementById("grand-total-display").innerText = granTotalBruto.toLocaleString('es-AR');
            }

            // Generar CSV y descargar
            const csvFinal = Papa.unparse(datosProcesados);
            descargarArchivo(csvFinal);
            
            document.getElementById("result").innerText = "¡Cálculo finalizado y archivo descargado!";
        },
        error: function(err) {
            alert("Error al procesar el CSV. Revisa el formato del archivo.");
            console.error(err);
        }
    });
});

/**
 * FUNCIÓN AUXILIAR: descargarArchivo
 * Genera el nombre automático basado en el mes y año actual.
 */
function descargarArchivo(contenido) {
    // Obtener mes y año actual para el nombre del archivo
    const fecha = new Date();
    const mes = fecha.toLocaleString('es-ES', { month: 'long' }); 
    const anio = fecha.getFullYear();
    const nombreArchivo = `sueldos_${mes}_${anio}.csv`;

    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    link.click();
    
    // Limpieza de memoria
    URL.revokeObjectURL(link.href);
}