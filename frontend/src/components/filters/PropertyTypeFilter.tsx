type Tipo =
  | "casa"
  | "departamento"
  | "terreno"
  | "habitacion"
  | "local";

type Props = {
  selected: Tipo[];
  onToggle: (tipo: Tipo) => void;
};

export default function PropertyTypeFilter({ selected, onToggle }: Props) {
  const options: Tipo[] = [
    "casa",
    "departamento",
    "terreno",
    "habitacion",
    "local",
  ];

  return (
    <div className="flex gap-4">
      {options.map((tipo) => (
        <button
          key={tipo}
          onClick={() => onToggle(tipo)}
          className={`px-4 py-2 rounded ${
            selected.includes(tipo)
              ? "bg-green-500 text-white"
              : "bg-gray-200"
          }`}
        >
          {tipo}
        </button>
      ))}
    </div>
  );
}