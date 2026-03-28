type Props = {
  selected: string;
  onChange: (modo: "venta" | "alquiler" | "anticretico") => void;
};

export default function TransactionModeFilter({ selected, onChange }: Props) {
  const options = ["venta", "alquiler", "anticretico"] as const;

  return (
    <div className="flex gap-4">
      {options.map((modo) => (
        <button
          key={modo}
          onClick={() => onChange(modo)}
          className={`px-4 py-2 rounded ${
            selected === modo ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          {modo}
        </button>
      ))}
    </div>
  );
}