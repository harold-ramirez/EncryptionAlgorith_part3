import React, { useState, useEffect } from "react";
import DataTable from "./DataTable";
import Schedule from "./components/Schedule";
import "./App.css";
import { database, desencriptarDatos } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

function App() {
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const [keyUser, setKeyUser] = useState("");

  const [editarHorario, setEditarHorario] = useState(false);
  const [horaEntradaMañana, setHoraEntradaMañana] = useState("07:30");
  const [horaSalidaMañana, setHoraSalidaMañana] = useState("12:30");
  const [horaEntradaTarde, setHoraEntradaTarde] = useState("13:30");
  const [horaSalidaTarde, setHoraSalidaTarde] = useState("17:00");

  useEffect(() => {
    const obtenerEmpleados = async () => {
      try {
        const empleadosRef = collection(database, "asistencia");
        const snapshot = await getDocs(empleadosRef);

        if (!snapshot.empty) {
          const listaEmpleados = snapshot.docs.map((doc) => {
            const datos = doc.data();
            return {
              id: doc.id,
              nombre: desencriptarDatos(datos.Nombre, keyUser),
              departamento: desencriptarDatos(datos.Departamento, keyUser),
              registros: (datos.Registros || []).map((registro) => ({
                fecha: desencriptarDatos(registro.Fecha, keyUser),
                entradas: (registro.Entradas || []).map((entrada) =>
                  desencriptarDatos(entrada, keyUser)
                ),
                salidas: (registro.Salidas || []).map((salida) =>
                  desencriptarDatos(salida, keyUser)
                ),
              })),
              resumen: {
                totalEntradas: datos.Resumen
                  ? desencriptarDatos(datos.Resumen.TotalEntradas, keyUser)
                  : "0",
                totalSalidas: datos.Resumen
                  ? desencriptarDatos(datos.Resumen.TotalSalidas, keyUser)
                  : "0",
                tiempoTotal: datos.Resumen
                  ? desencriptarDatos(datos.Resumen.TiempoTotal, keyUser)
                  : "0:00",
              },
            };
          });

          console.log("✅ Lista de empleados obtenida:", listaEmpleados);
          setEmpleados(listaEmpleados);
        } else {
          console.warn("⚠️ No se encontraron empleados en Firestore");
          setEmpleados([]);
        }
      } catch (error) {
        console.error("❌ Error obteniendo empleados desde Firestore:", error);
      }
    };

    if (keyUser !== "") obtenerEmpleados();
  }, [keyUser]);

  return (
    <div className="app-container">
      <h1>Control de Asistencia</h1>
      <Schedule
        editarHorario={editarHorario}
        setEditarHorario={setEditarHorario}
        horaEntradaMañana={horaEntradaMañana}
        setHoraEntradaMañana={setHoraEntradaMañana}
        horaSalidaMañana={horaSalidaMañana}
        setHoraSalidaMañana={setHoraSalidaMañana}
        horaEntradaTarde={horaEntradaTarde}
        setHoraEntradaTarde={setHoraEntradaTarde}
        horaSalidaTarde={horaSalidaTarde}
        setHoraSalidaTarde={setHoraSalidaTarde}
      />
      <label>Key User:</label>
      <input
        type="text"
        className="bg-gray-600 border border-white text-center"
        onChange={(e) => setKeyUser(e.target.value)}
        value={keyUser}
        placeholder="Ingrese la clave de usuario"
      />
      <br />
      <label>Selecciona un empleado:</label>
      <select
        onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
        className="custom-select bg-gray-600 border border-white text-center"
      >
        <option value="">Todos</option>
        {empleados.length > 0 ? (
          empleados.map((empleado) => (
            <option key={empleado.id} value={empleado.id}>
              {empleado.nombre} - {empleado.departamento}
            </option>
          ))
        ) : (
          <option disabled>Cargando empleados...</option>
        )}
      </select>

      <DataTable
        empleadoId={empleadoSeleccionado}
        empleados={empleados}
        horaEntradaMañana={horaEntradaMañana}
        horaSalidaMañana={horaSalidaMañana}
        horaEntradaTarde={horaEntradaTarde}
        horaSalidaTarde={horaSalidaTarde}
      />
    </div>
  );
}

export default App;
