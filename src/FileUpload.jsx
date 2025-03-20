import React, { useState } from "react";
import { database, ref, push } from "./firebaseConfig";

const FileUpload = () => {
  const [files, setFiles] = useState([]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Selecciona al menos un archivo");

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target.result;
        const registros = procesarArchivo(content);

        if (registros.length > 0) {
          const dataRef = ref(database, "asistencia");
          registros.forEach((registro) => push(dataRef, registro));
        }
      };
      reader.readAsText(file);
    }
    alert("Todos los archivos han sido procesados y enviados a Firebase");
  };

  const procesarArchivo = (contenido) => {
    const lineas = contenido.split("\n").map((line) => line.trim());
    const registros = [];
    let empleado = {};

    lineas.forEach((linea) => {
      if (linea.startsWith("ID")) {
        // Nueva persona detectada
        const partes = linea.split(",");
        empleado = {
          ID: partes[0].split(":")[1].trim(),
          Nombre: partes[1].split(":")[1].trim(),
          Departamento: partes[2]?.split(":")[1]?.trim() || "Desconocido",
          Registros: [],
        };
      } else if (linea.match(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)) {
        // Línea con registros de asistencia
        const datos = linea.split(",");
        let entradas = [];
        let salidas = [];

        for (let i = 0; i < datos.length; i++) {
          const dato = datos[i].trim();
          if (dato.includes("Entrada")) entradas.push(datos[i - 1].trim());
          if (dato.includes("Salida")) salidas.push(datos[i - 1].trim());
        }

        empleado.Registros.push({ Fecha: datos[0].trim(), Entradas: entradas, Salidas: salidas });
      }
    });

    if (empleado.ID) registros.push(empleado);
    return registros;
  };

  return (
    <div>
      <h2>Subir Archivos de Asistencia</h2>
      <input type="file" multiple accept=".txt" onChange={(e) => setFiles([...e.target.files])} />
      <button onClick={handleFileUpload}>Subir</button>
    </div>
  );
};

export default FileUpload;