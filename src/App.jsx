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
                turnoMañana: {
                  entrada: registro.TurnoMañana?.Entrada
                    ? desencriptarDatos(registro.TurnoMañana.Entrada, keyUser)
                    : "N/A",
                  salida: registro.TurnoMañana?.Salida
                    ? desencriptarDatos(registro.TurnoMañana.Salida, keyUser)
                    : "N/A",
                },
                turnoTarde: {
                  entrada: registro.TurnoTarde?.Entrada
                    ? desencriptarDatos(registro.TurnoTarde.Entrada, keyUser)
                    : "N/A",
                  salida: registro.TurnoTarde?.Salida
                    ? desencriptarDatos(registro.TurnoTarde.Salida, keyUser)
                    : "N/A",
                },
              })),
              resumen: {
                totalEntradas: datos.Resumen.TotalEntradas
                  ? desencriptarDatos(datos.Resumen.TotalEntradas, keyUser)
                  : "0",
                totalSalidas: datos.Resumen.TotalSalidas
                  ? desencriptarDatos(datos.Resumen.TotalSalidas, keyUser)
                  : "0",
                tiempoTotal: datos.Resumen.TiempoTotal
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
    <div className="app-container flex flex-col items-center">
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
        empleados={empleados}
      />
      <span className="w-3/4 p-1 flex flex-col gap-1">
        <span className="flex justify-center gap-3">
          <label>🗝️Key User:</label>
          <input
            type="text"
            className="bg-gray-600 border border-white text-center"
            onChange={(e) => setKeyUser(e.target.value)}
            value={keyUser}
            placeholder="Ingrese la clave de usuario"
          />🗝️
        </span>
        <span className="flex justify-center gap-3">
          <label>📃Selecciona un empleado:</label>
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
          </select>📃
        </span>
      </span>

      <DataTable
        empleados={empleados}
        empleadoId={empleadoSeleccionado}
        horaEntradaMañana={horaEntradaMañana}
        horaEntradaTarde={horaEntradaTarde}
        horaSalidaMañana={horaSalidaMañana}
        horaSalidaTarde={horaSalidaTarde}
      />
    </div>
  );
}

export default App;
