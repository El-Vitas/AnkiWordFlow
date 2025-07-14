interface SelectionTooltipProps {
  selectedText: string;
}

export function SelectionTooltip({ selectedText }: SelectionTooltipProps) {
  return (
    // Estilos para el contenedor del tooltip
    <div className="p-4 bg-white rounded-xl shadow-2xl border border-gray-200 text-black max-w-sm">
      <p className="font-semibold text-gray-900 mb-1">
        Texto Seleccionado:
      </p>
      <p className="text-base italic text-blue-700">
        "{selectedText}"
      </p>
      {/* Más adelante aquí irán los botones y las definiciones */}
    </div>
  );
}