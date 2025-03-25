const fs = require("fs");
const path = require("path");
const db = require("./firebaseConfig");
const CryptoJS = require("crypto-js");
const readline = require("readline");
const baseFolderPath = "C:/Users/dario/Downloads/Practica 2_03_Enero"; // Ruta de la carpeta a monitorear
// const PASSWORD = "clave-segura";

const cifrarDatos = (texto, PASSWORD) => {
  return CryptoJS.AES.encrypt(texto, PASSWORD).toString();
};

// Crear una interfaz para leer la entrada del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(`👀 Monitoreando la carpeta: ${baseFolderPath}`);

// Pedir al usuario la clave
rl.question("Por favor, ingrese la clave: ", (PASSWORD) => {
  console.log("Clave recibida:", PASSWORD);

  // Aquí puedes usar la clave en tu programa
  // Por ejemplo, pasarla a las funciones de cifrado
  leerArchivosDeCarpetas(PASSWORD);

  // Cerrar la interfaz
  rl.close();
});

// Modificar leerArchivosDeCarpetas para aceptar la clave como parámetro
const leerArchivosDeCarpetas = async (PASSWORD) => {
  try {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    for (const mes of meses) {
      const carpetaMes = path.join(baseFolderPath, mes);
      if (!fs.existsSync(carpetaMes)) continue; // Si la carpeta no existe, la salta

      const archivos = fs
        .readdirSync(carpetaMes)
        .filter((archivo) => archivo.endsWith(".txt"));

      for (const archivo of archivos) {
        const filePath = path.join(carpetaMes, archivo);
        console.log(`📂 Procesando archivo: ${archivo} en ${mes}`);
        await procesarArchivo(filePath, PASSWORD);
      }
    }
  } catch (error) {
    console.error("❌ Error leyendo las carpetas de los meses:", error);
  }
};

// Modificar procesarArchivo para aceptar la clave como parámetro
const procesarArchivo = async (filePath, PASSWORD) => {
    try {
      if (!PASSWORD) {
        PASSWORD = "clave-segura";
        console.log("clave hardcodeada");
      }
  
      const contenido = fs.readFileSync(filePath, "utf8");
      const lineas = contenido
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
  
      let empleados = [];
      let empleadoActual = null;
  
      lineas.forEach((linea) => {
        // Detectar encabezado del empleado
        if (linea.startsWith("ID") && linea.includes("Nombre") && linea.includes("Departamento")) {
          if (empleadoActual) {
            empleados.push(empleadoActual);
          }
  
          const partes = linea.split(",");
          empleadoActual = {
            ID: partes[1]?.trim() || "Desconocido",
            Nombre: partes[4]?.trim() || "Sin Nombre",
            Departamento: partes[8]?.trim() || "No especificado",
            Registros: [],
            Resumen: {}
          };
        }
        // Detectar registros de asistencia
        else if (linea.match(/\d{2}\/\d{2}\/\d{4}/)) {
          const datos = linea.split(",").map(d => d.trim());
          let currentRecord = null;
          let currentDate = null;
          let currentTime = null;
          let currentType = null;
  
          for (let i = 0; i < datos.length; i++) {
            const item = datos[i];
            
            // Detect date with time (format: DD/MM/YYYY HH:MM)
            const dateTimeMatch = item.match(/^(\d{2}\/\d{2}\/\d{4}) (\d{2}:\d{2})$/);
            if (dateTimeMatch) {
              currentDate = dateTimeMatch[1];
              currentTime = dateTimeMatch[2];
              continue;
            }
            
            // Detect standalone date (format: DD/MM/YYYY)
            const dateMatch = item.match(/^\d{2}\/\d{2}\/\d{4}$/);
            if (dateMatch) {
              currentDate = item;
              continue;
            }
            
            // Detect time (format: HH:MM)
            const timeMatch = item.match(/^\d{2}:\d{2}$/);
            if (timeMatch) {
              currentTime = item;
              continue;
            }
  
            // Detect type (Entrada/Salida)
            if (item === "Entrada" || item === "Salida") {
              currentType = item;
              
              // Create new record if we have all components
              if (currentDate && currentTime && currentType) {
                if (currentType === "Entrada") {
                  // If we have an existing incomplete record, push it first
                  if (currentRecord && currentRecord.TurnoMañana.Entrada && !currentRecord.TurnoMañana.Salida) {
                    empleadoActual?.Registros.push(currentRecord);
                  }
                  
                  currentRecord = {
                    Fecha: currentDate,
                    TurnoMañana: {
                      Entrada: currentTime,
                      Salida: null
                    },
                    TurnoTarde: {
                      Entrada: null,
                      Salida: null
                    }
                  };
                } else if (currentType === "Salida") {
                  if (currentRecord) {
                    currentRecord.TurnoMañana.Salida = currentTime;
                    if (empleadoActual) {
                      empleadoActual.Registros.push(currentRecord);
                    }
                    currentRecord = null;
                  } else {
                    // Handle case where exit comes before entry
                    currentRecord = {
                      Fecha: currentDate,
                      TurnoMañana: {
                        Entrada: null,
                        Salida: currentTime
                      },
                      TurnoTarde: {
                        Entrada: null,
                        Salida: null
                      }
                    };
                    if (empleadoActual) {
                      empleadoActual.Registros.push(currentRecord);
                    }
                    currentRecord = null;
                  }
                }
                
                // Reset for next record
                currentTime = null;
                currentType = null;
              }
            }
          }
  
          // Push any remaining incomplete record
          if (currentRecord && empleadoActual) {
            empleadoActual.Registros.push(currentRecord);
          }
        }
        // Detectar el resumen del empleado
        else if (linea.startsWith("Entrada") && linea.includes("Tiempo total")) {
          const partes = linea.split(",");
          if (empleadoActual) {
            empleadoActual.Resumen = {
              TotalEntradas: partes[1]?.trim() || "0",
              TotalSalidas: partes[3]?.trim() || "0",
              TiempoTotal: partes[5]?.trim() || "0:00"
            };
          }
        }
      });
  
      // Guardar el último empleado procesado
      if (empleadoActual) {
        empleados.push(empleadoActual);
      }
  
      // Subir los datos a Firebase
      for (const empleado of empleados) {
        const empleadoRef = db.collection("dario").doc(empleado.ID);
        await empleadoRef.set({
          Nombre: cifrarDatos(empleado.Nombre, PASSWORD),
          Departamento: cifrarDatos(empleado.Departamento, PASSWORD),
          Registros: empleado.Registros.map((registro) => ({
            Fecha: cifrarDatos(registro.Fecha, PASSWORD),
            TurnoMañana: {
              Entrada: registro.TurnoMañana.Entrada
                ? cifrarDatos(registro.TurnoMañana.Entrada, PASSWORD)
                : null,
              Salida: registro.TurnoMañana.Salida
                ? cifrarDatos(registro.TurnoMañana.Salida, PASSWORD)
                : null,
            },
            TurnoTarde: {
              Entrada: null,
              Salida: null
            },
          })),
          Resumen: {
            TotalEntradas: cifrarDatos(empleado.Resumen.TotalEntradas, PASSWORD),
            TotalSalidas: cifrarDatos(empleado.Resumen.TotalSalidas, PASSWORD),
            TiempoTotal: cifrarDatos(empleado.Resumen.TiempoTotal, PASSWORD),
          },
        });
        console.log(`✅ Empleado ${empleado.Nombre} enviado a Firebase`);
      }
  
      console.log(`✅ Archivo procesado correctamente: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error procesando el archivo ${filePath}:`, error);
    }
  };

// Monitorear la carpeta
fs.watch(baseFolderPath, { recursive: true }, (eventType, filename) => {
  if (eventType === "rename" && filename.endsWith(".txt")) {
    const filePath = path.join(baseFolderPath, filename);
    if (fs.existsSync(filePath)) {
      console.log(`📂 Nuevo archivo detectado: ${filename}`);
      setTimeout(() => procesarArchivo(filePath), 1000);
    }
  }
});
