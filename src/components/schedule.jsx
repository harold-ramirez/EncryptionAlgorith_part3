import { useState } from "react";
import Consolidado from "./consolidado";

export default function Schedule({
  editarHorario,
  setEditarHorario,
  horaEntradaMañana,
  setHoraEntradaMañana,
  horaSalidaMañana,
  setHoraSalidaMañana,
  horaEntradaTarde,
  setHoraEntradaTarde,
  horaSalidaTarde,
  setHoraSalidaTarde,
  empleados
}) {
  const handleEditarHorario = () => {
    setEditarHorario(!editarHorario);
  };
    const [mostrarConsolidado, setMostrarConsolidado] = useState(false); // Estado para el modal
  

  return (
    <div
      className={`flex flex-col border ${
        editarHorario ? `border-red-500` : `border-blue-500`
      } w-1/2 rounded-lg text-left p-3 justify-center my-2`}
    >
      <b>Turno Mañana:</b>
      <div className="flex flex-row justify-around">
        Entrada:
        <input
          type="time"
          readOnly={!editarHorario}
          name=""
          id=""
          value={horaEntradaMañana}
          onChange={(e) => setHoraEntradaMañana(e.target.value)}
          className="border border-white px-2"
        />
        Salida:
        <input
          type="time"
          readOnly={!editarHorario}
          name=""
          id=""
          value={horaSalidaMañana}
          onChange={(e) => setHoraSalidaMañana(e.target.value)}
          className="border border-white px-2"
        />
      </div>
      <b>Turno Tarde:</b>
      <div className="flex flex-row justify-around mb-5">
        Entrada:
        <input
          type="time"
          readOnly={!editarHorario}
          name=""
          id=""
          value={horaEntradaTarde}
          onChange={(e) => setHoraEntradaTarde(e.target.value)}
          className="border border-white px-2"
        />
        Salida:
        <input
          type="time"
          readOnly={!editarHorario}
          name=""
          id=""
          value={horaSalidaTarde}
          onChange={(e) => setHoraSalidaTarde(e.target.value)}
          className="border border-white px-2"
        />
      </div>
      <span className="flex justify-around">
        <input
          type="button"
          value="📑Generar Consolidado"
          onClick={() => setMostrarConsolidado(true)}
          className="bg-green-900 w-1/3 p-1 border border-white rounded-md"
        />
        <input
          type="button"
          value={`${editarHorario ? `💾Guardar` : `✏️Editar Turnos`}`}
          onClick={handleEditarHorario}
          className="bg-gray-800 w-1/3 p-1 border border-white rounded-md"
        />
      </span>
      {mostrarConsolidado && (
        <Consolidado
          onClose={() => setMostrarConsolidado(false)}
          empleados={empleados}
          horaEntradaMañana={horaEntradaMañana}
          horaEntradaTarde={horaEntradaTarde}
        />
      )}
    </div>
  );
}
