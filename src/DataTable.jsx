import React from "react";

const DataTable = ({
  empleados,
  empleadoId,
  horaEntradaMañana,
  horaSalidaMañana,
  horaEntradaTarde,
  horaSalidaTarde,
}) => {
  const empleadosFiltrados = empleadoId
    ? empleados.filter((empleado) => empleado.id === empleadoId)
    : empleados;

  return (
    <div className="data-table-container">
      {empleadosFiltrados.length === 0 ? (
        <p className="w-full text-center text-gray-500">
          No hay datos por el momento...
        </p>
      ) : (
        empleadosFiltrados.map((empleado, index) => (
          <div key={index} className="empleado-container">
            <h3 className="empleado-nombre">
              {empleado.nombre} - {empleado.departamento}
            </h3>
            <table className="styled-table">
              <thead>
                <tr>
                  <th rowSpan={2}>Fecha</th>
                  <th colSpan={2}>Turno Mañana</th>
                  <th colSpan={2}>Turno Tarde</th>
                </tr>
                <tr>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                </tr>
              </thead>
              <tbody>
                {empleado.registros.map((registro, i) => (
                  <tr key={i}>
                    <td>{registro.fecha || "N/A"}</td>
                    <td
                      className={`${
                        registro.turnoMañana.entrada !== "N/A"
                          ? registro.turnoMañana.entrada > horaEntradaMañana
                          ? `text-red-400 font-bold`
                          : ``
                          : ``
                      }`}
                    >
                      {registro.turnoMañana?.entrada}
                    </td>
                    <td
                      className={`${
                        registro.turnoMañana.salida !== "N/A"
                          ? registro.turnoMañana.salida < horaSalidaMañana
                          ? `text-red-400 font-bold`
                          : ``
                          : ``
                      }`}
                    >
                      {registro.turnoMañana?.salida}
                    </td>
                    <td
                      className={`${
                        registro.turnoTarde.entrada !== "N/A"
                          ? registro.turnoTarde.entrada > horaEntradaTarde
                          ? `text-red-400 font-bold`
                          : ``
                          : ``
                      }`}
                    >
                      {registro.turnoTarde?.entrada}
                    </td>
                    <td
                      className={`${
                        registro.turnoTarde.salida !== "N/A"
                          ? registro.turnoTarde.salida < horaSalidaTarde
                          ? `text-red-400 font-bold`
                          : ``
                          : ``
                      }`}
                    >
                      {registro.turnoTarde?.salida}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default DataTable;
