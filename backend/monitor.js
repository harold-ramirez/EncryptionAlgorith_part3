const fs = require("fs");
const path = require("path");
const db = require("./firebaseConfig");
const CryptoJS = require("crypto-js");
const readline = require("readline");
const baseFolderPath = "C:/Users/LENOVO/Downloads/Practica 2_03_Enero"; // Ruta de la carpeta a monitorear
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
      PASSWORD = "clave-segura"; // clave por defecto
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
      if (linea.startsWith("ID")) {
        if (empleadoActual) {
          empleados.push(empleadoActual); // Guardar el empleado anterior
        }

        const partes = linea.split(",");
        empleadoActual = {
          ID: partes[1]?.trim() || "Desconocido",
          Nombre: partes[4]?.trim() || "Sin Nombre",
          Departamento: partes[8]?.trim() || "No especificado",
          Registros: [],
          Resumen: {}, // Inicializar el resumen
        };
      }

      // Detectar registros de asistencia
      else if (linea.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)) {
        const datos = linea.split(",");
        const fecha = datos[0]?.trim().split(" ")[0]; // Extraer solo la fecha
        const horarios = [
          { tipo: "Entrada", hora: datos[0]?.trim().split(" ")[1] || null },
          { tipo: "Salida", hora: datos[3]?.trim().split(" ")[1] || null },
          { tipo: "Entrada", hora: datos[5]?.trim().split(" ")[1] || null },
          { tipo: "Salida", hora: datos[7]?.trim().split(" ")[1] || null },
        ];

        // Clasificar horarios en turnos
        const turnos = {
          TurnoMañana: { Entrada: null, Salida: null },
          TurnoTarde: { Entrada: null, Salida: null },
        };

        horarios.forEach((horario) => {
          if (horario.hora) {
            const [hora, minuto] = horario.hora.split(":").map(Number);
            const tiempo = hora + minuto / 60; // Convertir a formato decimal

            if (tiempo >= 6 && tiempo <= 12) {
              if (!turnos.TurnoMañana.Entrada)
                turnos.TurnoMañana.Entrada = horario.hora;
            } else if (tiempo > 12 && tiempo <= 14) {
              if (!turnos.TurnoMañana.Salida)
                turnos.TurnoMañana.Salida = horario.hora;
            } else if (tiempo > 14 && tiempo <= 18) {
              if (!turnos.TurnoTarde.Entrada)
                turnos.TurnoTarde.Entrada = horario.hora;
            } else if (tiempo > 18 && tiempo <= 22) {
              if (!turnos.TurnoTarde.Salida)
                turnos.TurnoTarde.Salida = horario.hora;
            }
          }
        });

        if (empleadoActual) {
          empleadoActual.Registros.push({
            Fecha: fecha,
            TurnoMañana: turnos.TurnoMañana,
            TurnoTarde: turnos.TurnoTarde,
          });
        }
      }

      // Detectar el resumen del empleado
      else if (linea.startsWith("Entrada")) {
        const partes = linea.split(",");
        empleadoActual.Resumen = {
          TotalEntradas: partes[1]?.trim() || "0",
          TotalSalidas: partes[3]?.trim() || "0",
          TiempoTotal: partes[5]?.trim() || "0:00",
        };
      }
    });

    // Guardar el último empleado procesado
    if (empleadoActual) {
      empleados.push(empleadoActual);
    }

    // Subir los datos a Firebase
    for (const empleado of empleados) {
      const empleadoRef = db.collection("asistencia").doc(empleado.ID);
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
            Entrada: registro.TurnoTarde.Entrada
              ? cifrarDatos(registro.TurnoTarde.Entrada, PASSWORD)
              : null,
            Salida: registro.TurnoTarde.Salida
              ? cifrarDatos(registro.TurnoTarde.Salida, PASSWORD)
              : null,
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
