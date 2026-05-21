interface Props {
  progreso: number; // 0 a 100
}

export default function ProgressBar({ progreso }: Props) {
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs text-gray-400">
        <span>Publicando inmueble...</span>
        <span>{progreso}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-300"
          style={{ width: `${progreso}%` }}
        />
      </div>
    </div>
  );
}