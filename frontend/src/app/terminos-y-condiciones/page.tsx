type TermsSection = {
  bullets?: string[]
  paragraphs: string[]
  title: string
}

const termsSections: TermsSection[] = [
  {
    title: '1. Introducción',
    paragraphs: [
      'Los presentes Términos y Condiciones regulan el acceso, navegación y uso del portal inmobiliario PropBol. Al ingresar a la plataforma, el usuario acepta de manera expresa estas disposiciones y se compromete a utilizar el sistema de forma responsable, lícita y acorde a su finalidad.',
      'PropBol opera como una inmobiliaria boliviana orientada a conectar personas con oportunidades de compra, alquiler, anticrético y publicación de inmuebles, priorizando una experiencia clara, confiable y accesible desde cualquier dispositivo.'
    ]
  },
  {
    title: '2. Alcance del servicio',
    paragraphs: [
      'La plataforma pone a disposición información, funcionalidades y canales de contacto relacionados con propiedades e inmuebles disponibles en territorio boliviano.',
      'El contenido publicado tiene carácter informativo y puede incluir descripciones, imágenes, precios referenciales y datos de contacto asociados a cada inmueble.'
    ],
    bullets: [
      'Búsqueda y exploración de inmuebles por tipo de operación.',
      'Consulta de información general de propiedades disponibles.',
      'Acceso a secciones institucionales y canales oficiales de PropBol.',
      'Opciones para publicar inmuebles según los flujos habilitados por el sistema.'
    ]
  },
  {
    title: '3. Obligaciones del usuario',
    paragraphs: [
      'El usuario se compromete a brindar información veraz cuando interactúe con la plataforma y a utilizar el portal sin afectar su funcionamiento, seguridad o disponibilidad para otros usuarios.',
      'Queda prohibido realizar actividades que impliquen suplantación de identidad, uso indebido de datos, publicación de contenido falso o cualquier acción contraria a la normativa vigente en Bolivia.'
    ]
  },
  {
    title: '4. Propiedad intelectual',
    paragraphs: [
      'La identidad visual provisional, los textos, estructuras, componentes y demás contenidos del portal forman parte de los activos de PropBol o de sus respectivos titulares, cuando corresponda.',
      'No está permitido copiar, modificar, distribuir o reutilizar el contenido del portal con fines comerciales sin autorización previa y expresa.'
    ]
  },
  {
    title: '5. Publicación y disponibilidad de información',
    paragraphs: [
      'PropBol procura mantener la información del portal actualizada y presentada con claridad; sin embargo, la disponibilidad, vigencia y condiciones de los inmuebles pueden cambiar sin previo aviso.',
      'La empresa podrá corregir, actualizar o retirar publicaciones cuando sea necesario para resguardar la calidad de la información o el correcto funcionamiento del sistema.'
    ]
  },
  {
    title: '6. Limitación de responsabilidad',
    paragraphs: [
      'PropBol realiza esfuerzos razonables para ofrecer una plataforma estable y útil, pero no garantiza que el servicio se encuentre libre de interrupciones, errores temporales o demoras ocasionadas por factores externos.',
      'La utilización de la información disponible en el portal es responsabilidad del usuario, quien deberá complementar su decisión con la verificación correspondiente antes de concretar cualquier operación inmobiliaria.'
    ]
  },
  {
    title: '7. Enlaces y canales oficiales',
    paragraphs: [
      'La plataforma puede incluir enlaces a redes sociales oficiales y otras secciones institucionales para ampliar la información sobre PropBol.',
      'Cualquier interacción fuera del portal principal deberá realizarse a través de los canales oficiales publicados por la empresa.'
    ]
  },
  {
    title: '8. Modificaciones de los términos',
    paragraphs: [
      'PropBol se reserva el derecho de actualizar estos Términos y Condiciones cuando resulte necesario por cambios operativos, legales o de mejora del servicio.',
      'Las modificaciones serán publicadas en esta misma vista para que los usuarios puedan revisarlas oportunamente antes de continuar utilizando la plataforma.'
    ]
  }
]

export default function TermsAndConditionsPage() {
  return (
    <section className="mx-auto w-full max-w-5xl py-2 sm:py-4">
      <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="rounded-[24px] bg-white p-5 sm:p-8 lg:p-10">
          <header className="space-y-4 border-b border-amber-200 pb-6">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-amber-600">
              PropBol
            </p>
            <div className="space-y-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                TÉRMINOS Y CONDICIONES
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">
                Este documento establece las condiciones generales de uso del portal inmobiliario de
                PropBol. Su lectura permite comprender el alcance del servicio, las
                responsabilidades del usuario y los criterios bajo los cuales se presenta la
                información del sistema.
              </p>
            </div>
          </header>

          <div className="space-y-8 pt-6 sm:space-y-10 sm:pt-8">
            {termsSections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="font-heading text-xl font-bold text-stone-900 sm:text-2xl">
                  {section.title}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-stone-600 sm:text-base">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="space-y-2 pl-5 text-sm leading-7 text-stone-600 sm:text-base">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="list-disc marker:text-amber-600">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
