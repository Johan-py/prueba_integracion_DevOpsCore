interface Props {
  aceptado: boolean;
  setAceptado: (value: boolean) => void;
}

export default function AceptacionPublicacion({
  aceptado,
  setAceptado,
}: Props) {
  return (
    <div className="rounded-xl bg-orange-50 px-5 py-4">
      <label className="flex items-start gap-3 text-base text-gray-800">
        <input
          type="checkbox"
          checked={aceptado}
          onChange={(e) => setAceptado(e.target.checked)}
          className="mt-1 h-5 w-5 accent-orange-500"
        />

        <div>
          <p>
            Acepto los{" "}
            <span className="cursor-pointer underline">
              términos y condiciones
            </span>{" "}
            de publicación.
          </p>

          <p className="mt-1 text-sm text-gray-600">
            Por favor revise toda la información antes de proceder.
          </p>
        </div>
      </label>
    </div>
  );
}
