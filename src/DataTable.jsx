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
                  <th>Fecha</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Horas Trabajadas</th>
                </tr>
              </thead>
              <tbody>
                {empleado.registros.map((registro, i) => {
                  // Calculate worked hours
                  const entrada = registro.turnoMañana?.entrada !== "N/A" ? registro.turnoMañana.entrada : null;
                  const salida = registro.turnoMañana?.salida !== "N/A" ? registro.turnoMañana.salida : null;
                  
                  let horasTrabajadas = "N/A";
                  if (entrada && salida) {
                    const [hEntrada, mEntrada] = entrada.split(':').map(Number);
                    const [hSalida, mSalida] = salida.split(':').map(Number);
                    
                    const minutosEntrada = hEntrada * 60 + mEntrada;
                    const minutosSalida = hSalida * 60 + mSalida;
                    const diferencia = minutosSalida - minutosEntrada;
                    
                    if (diferencia > 0) {
                      const horas = Math.floor(diferencia / 60);
                      const minutos = diferencia % 60;
                      horasTrabajadas = `${horas}:${minutos.toString().padStart(2, '0')}`;
                    }
                  }

                  return (
                    <tr key={i}>
                      <td>{registro.fecha || "N/A"}</td>
                      <td
                        className={`${
                          entrada && entrada > horaEntradaMañana
                            ? "text-red-400 font-bold"
                            : ""
                        }`}
                      >
                        {entrada || "N/A"}
                      </td>
                      <td
                        className={`${
                          salida && salida < horaSalidaMañana
                            ? "text-red-400 font-bold"
                            : ""
                        }`}
                      >
                        {salida || "N/A"}
                      </td>
                      <td>{horasTrabajadas}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default DataTable;