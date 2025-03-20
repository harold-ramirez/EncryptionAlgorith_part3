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
        };
      }

      // Detectar registros de asistencia
      else if (linea.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)) {
        const datos = linea.split(",");
        let entradas = [];
        let salidas = [];

        for (let i = 0; i < datos.length; i++) {
          const dato = datos[i]?.trim();
          if (dato.includes("Entrada")) {
            entradas.push(datos[i - 1]?.trim().split(" ")[1]); // Extraer solo la hora
          }
          if (dato.includes("Salida")) {
            salidas.push(datos[i - 1]?.trim().split(" ")[1]); // Extraer solo la hora
          }
        }

        if (empleadoActual) {
          empleadoActual.Registros.push({
            Fecha: datos[0]?.trim().split(" ")[0], // Extraer solo la fecha
            Entradas: entradas,
            Salidas: salidas,
          });
        }
      }

      // Detectar resumen del empleado
      else if (linea.startsWith("Entrada") && empleadoActual) {
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

    // Mostrar los datos que se enviarán a Firestore
    console.log(
      "Datos a enviar a Firestore:",
      JSON.stringify(empleados, null, 2)
    );

    // Enviar los datos a Firestore
    for (const empleado of empleados) {
      const empleadoRef = db.collection("asistencia").doc(empleado.ID); // Usar el ID como identificador del documento
      await empleadoRef.set({
        Nombre: cifrarDatos(empleado.Nombre, PASSWORD),
        Departamento: cifrarDatos(empleado.Departamento, PASSWORD),
        Registros: empleado.Registros.map((registro) => ({
          Fecha: cifrarDatos(registro.Fecha, PASSWORD),
          Entradas: registro.Entradas.map((entrada) =>
            cifrarDatos(entrada, PASSWORD)
          ),
          Salidas: registro.Salidas.map((salida) =>
            cifrarDatos(salida, PASSWORD)
          ),
        })),
        Resumen: {
          TotalEntradas: cifrarDatos(empleado.Resumen.TotalEntradas, PASSWORD),
          TotalSalidas: cifrarDatos(empleado.Resumen.TotalSalidas, PASSWORD),
          TiempoTotal: cifrarDatos(empleado.Resumen.TiempoTotal, PASSWORD),
        },
      });
      console.log(`✅ Empleado ${empleado.Nombre} enviado a Firestore`);
    }

    console.log(`✅ Archivo procesado correctamente: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error procesando el archivo ${filePath}:`, error);
  }
};

// leerArchivosDeCarpetas();

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

console.log(`👀 Monitoreando la carpeta: ${baseFolderPath}`);
