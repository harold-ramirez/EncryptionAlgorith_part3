export default function Consolidado({
  onClose,
  empleados,
  horaEntradaMañana,
  horaEntradaTarde,
}) {
  const calcularRetrasos = (registros) => {
    let totalRetrasosMinutos = 0;

    registros.forEach((registro) => {
      if (registro.turnoMañana?.entrada) {
        const [horaReal, minutoReal] = registro.turnoMañana.entrada
          .split(":")
          .map(Number);
        const [horaEsperada, minutoEsperado] = horaEntradaMañana
          .split(":")
          .map(Number);

        const minutosReal = horaReal * 60 + minutoReal;
        const minutosEsperado = horaEsperada * 60 + minutoEsperado;

        if (minutosReal > minutosEsperado) {
          totalRetrasosMinutos += minutosReal - minutosEsperado;
        }
      }

      if (registro.turnoTarde?.entrada) {
        const [horaReal, minutoReal] = registro.turnoTarde.entrada
          .split(":")
          .map(Number);
        const [horaEsperada, minutoEsperado] = horaEntradaTarde
          .split(":")
          .map(Number);

        const minutosReal = horaReal * 60 + minutoReal;
        const minutosEsperado = horaEsperada * 60 + minutoEsperado;

        if (minutosReal > minutosEsperado) {
          totalRetrasosMinutos += minutosReal - minutosEsperado;
        }
      }
    });

    const horas = Math.floor(totalRetrasosMinutos / 60);
    const minutos = totalRetrasosMinutos % 60;

    return `${horas < 10 ? `0${horas}` : horas}:${
      minutos < 10 ? `0${minutos}` : minutos
    }`;
  };

  return (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      className="fixed w-full h-full top-0 left-0 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-5 text-black text-center overflow-y-auto max-h-8/10 w-1/2 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-3">Consolidado de Asistencia</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-black px-2">ID</th>
              <th className="border border-black px-2">Nombre</th>
              <th className="border border-black px-2">Retrasos</th>
              <th className="border border-black px-2">Días trabajados</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((empleado, i) => (
              <tr key={i}>
                <td className="border border-black px-2">{empleado.id}</td>
                <td className="border border-black px-2">{empleado.nombre}</td>
                <td className="border border-black px-2">
                  {calcularRetrasos(empleado.registros)}
                </td>
                <td className="border border-black px-2">
                  {empleado.registros.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
