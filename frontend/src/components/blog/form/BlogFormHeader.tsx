"use client";

interface BlogFormHeaderProps {
  mode: "create" | "edit";
}

export default function BlogFormHeader({ mode }: BlogFormHeaderProps) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B45309] dark:text-[#FCD34D]">
        {mode === "edit" ? "Editar blog" : "Nuevo aporte al blog"}
      </p>
      <h1 className="font-heading mt-2 sm:mt-4 text-3xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight text-[#1C1917] dark:text-white">
        {mode === "edit" ? (
          "Ajusta tu artículo antes de volver a enviarlo."
        ) : (
          <>
            Comparte tu conocimiento <br />
            <span className="italic text-[#B45309]">con la comunidad.</span>
          </>
        )}
      </h1>
    </div>
  );
}
