import { CalendarDays, MessageSquare } from 'lucide-react'

interface Props {
  contacto: {
    nombre: string
    correo: string | null
    telefono: string | null
  }
}

export default function ContactoPropiedad({ contacto }: Props) {
  return (
    <aside className="w-full rounded-2xl border border-[#b8afa4] bg-[#f1f1f1] px-5 py-6">
      <h3 className="text-[18px] font-bold text-[#1f1f1f]">{contacto.nombre}</h3>

      <div className="mt-5 space-y-4 text-sm text-[#5c5650]">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-5 w-5 text-[#6d655d]" />
          <p>Solicitar una visita para mañana</p>
        </div>

        <div className="flex items-start gap-3">
          <MessageSquare className="mt-0.5 h-5 w-5 text-[#6d655d]" />
          <p>
            Para más preguntas, contacta
            <br />
            {contacto.nombre}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          className="w-full rounded-full bg-[#d97f05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c26f02]"
        >
          Solicitar una visita
        </button>

        <button
          type="button"
          className="w-full rounded-full bg-[#d3d1cf] px-4 py-3 text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#c7c4c1]"
        >
          Contactar con agente
        </button>
      </div>
    </aside>
  )
}