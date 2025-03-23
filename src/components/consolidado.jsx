export default function Consolidado({ onClose }) {
  const empleados = [
    {
      id: 1,
      nombre: "Juan Perez",
      retrasos: "3:26",
      diasTrabajados: 20,
    },
    {
      id: 2,
      nombre: "Pedro Perez",
      retrasos: "2:30",
      diasTrabajados: 20,
    },
    {
      id: 3,
      nombre: "Maria Perez",
      retrasos: "1:00",
      diasTrabajados: 20,
    },
  ];

  return (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      className="absolute w-full h-full top-0 left-0 flex items-center justify-center"
      onClick={onClose} // Cerrar modal al hacer clic en el fondo
    >
      <div
        className="bg-white p-5 rounded-lg text-black text-center"
        onClick={(e) => e.stopPropagation()} // Evitar que el clic en el contenido cierre el modal
      >
        <h2 className="text-2xl font-bold mb-3">Consolidado de Asistencia</h2>
        <table>
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
                  {empleado.retrasos}
                </td>
                <td className="border border-black px-2">
                  {empleado.diasTrabajados}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
