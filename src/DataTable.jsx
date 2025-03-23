import React from "react";

const DataTable = ({
  empleados,
  empleadoId, // Agregamos empleadoId como prop
  horaEntradaMañana,
  horaSalidaMañana,
  horaEntradaTarde,
  horaSalidaTarde,
}) => {
  // Filtrar el empleado seleccionado si se proporciona un ID
  const empleadosFiltrados = empleadoId
    ? empleados.filter((empleado) => empleado.id === empleadoId)
    : empleados;

  return (
    <div className="data-table-container">
      {empleadosFiltrados.length === 0 ? ( // Verificar si no hay datos
        <p className="w-full text-center text-gray-500">No hay datos por el momento...</p>
      ) : (
        empleadosFiltrados.map((empleado, index) => (
          <div key={index} className="empleado-container">
            <h3 className="empleado-nombre">
              {empleado.nombre} - {empleado.departamento}
            </h3>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Entradas</th>
                  <th>Salidas</th>
                </tr>
              </thead>
              <tbody>
                {empleado.registros.map((registro, i) => (
                  <tr key={i}>
                    <td>{registro.fecha || "No disponible"}</td>
                    <td
                      className={`${
                        registro.entradas.some(
                          (entrada) => entrada > horaEntradaTarde
                        )
                          ? `text-red-400 font-bold`
                          : registro.entradas.some(
                              (entrada) =>
                                entrada > horaEntradaMañana &&
                                entrada < horaSalidaMañana
                            )
                          ? `text-red-400 font-bold`
                          : ``
                      }`}
                    >
                      {registro.entradas.length > 0
                        ? registro.entradas.join(" ")
                        : "No hay entradas"}
                    </td>
                    <td
                      className={`${
                        registro.salidas.some(
                          (salida) => salida < horaSalidaMañana
                        )
                          ? `text-red-400 font-bold`
                          : registro.salidas.some(
                              (salida) =>
                                salida > horaEntradaTarde &&
                                salida < horaSalidaTarde
                            )
                          ? `text-red-400 font-bold`
                          : ``
                      }`}
                    >
                      {registro.salidas.length > 0
                        ? registro.salidas.join(" ")
                        : "No hay salidas"}
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
