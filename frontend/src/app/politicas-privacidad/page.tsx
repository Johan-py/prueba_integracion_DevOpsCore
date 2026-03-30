export default function Terminos() {
  return (
    <div
      className="min-h-screen py-10"
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        backgroundImage: "url('/icons/fondoTerminos.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        overflowX: 'hidden'
      }}
    >
      <div
        className="max-w-4xl mx-auto p-10 shadow-md rounded-md"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Título */}
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#120C0C' }}>
          POLÍTICA DE PRIVACIDAD
        </h1>

        {/* Línea decorativa */}
        <div
          style={{
            height: '3px',
            width: '100%',
            backgroundColor: '#BEAF87',
            marginBottom: '20px'
          }}
        />

        {/* Sección 1 */}
        <section className="mb-6">
          <h2 className="font-semibold" style={{ color: '#120C0C' }}>
            1. Introducción
          </h2>
          <p className="text-sm leading-7 mt-2 text-justify" style={{ color: '#303030' }}>
            La presente Política de Privacidad tiene por objeto informar a los usuarios sobre la
            recopilación, uso, tratamiento y protección de sus datos personales en el marco del uso
            de la plataforma. El acceso y utilización del sistema implican la aceptación expresa de
            las condiciones establecidas en este documento. En cumplimiento de la normativa vigente
            en el Estado Plurinacional de Bolivia, así como de los principios de confidencialidad,
            seguridad y responsabilidad en el manejo de la información, nos comprometemos a proteger
            los datos personales de los usuarios, evitando su uso indebido, acceso no autorizado,
            alteración o divulgación. La presente política es aplicable a todos los usuarios que
            interactúan con la plataforma, ya sea mediante el registro, uso de servicios o cualquier
            otro medio de interacción, garantizando en todo momento el respeto a sus derechos y la
            transparencia en el tratamiento de su información personal.
          </p>
        </section>

        {/* Sección 2 */}
        <section className="mb-6">
          <h2 className="font-semibold" style={{ color: '#120C0C' }}>
            2. Información recopilada
          </h2>

          <p className="text-sm leading-7 mt-2 text-justify" style={{ color: '#303030' }}>
            El usuario podrá proporcionar información personal de manera voluntaria al momento de
            registrarse o utilizar los servicios, incluyendo, entre otros:
          </p>

          <ul className="list-disc ml-5 mt-3 text-sm" style={{ color: '#303030' }}>
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Información de navegación</li>
          </ul>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            Esta información es utilizada exclusivamente para la correcta identificación del usuario
            y la prestación de los servicios ofrecidos.
          </p>
        </section>

        {/* Sección 3 */}
        <section className="mb-6">
          <h2 className="font-semibold" style={{ color: '#120C0C' }}>
            3. Uso de la información
          </h2>

          <p className="text-sm leading-7 mt-2 text-justify" style={{ color: '#303030' }}>
            La información personal recopilada a través de la plataforma es utilizada con el
            propósito de garantizar el correcto funcionamiento del sistema, así como para mejorar la
            calidad de los servicios ofrecidos a los usuarios.
          </p>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            En particular, los datos podrán ser utilizados para las siguientes finalidades:
          </p>

          <ul className="list-disc ml-5 mt-3 text-sm" style={{ color: '#303030' }}>
            <li>
              <strong>Gestión de cuentas de usuario:</strong> Permitir la creación, administración y
              autenticación de cuentas, así como la identificación segura del usuario dentro de la
              plataforma.
            </li>

            <li>
              <strong>Mejora de la experiencia del sistema:</strong> Analizar el comportamiento de
              uso con el fin de optimizar la interfaz, funcionalidades y rendimiento del sistema,
              adaptándolo a las necesidades y preferencias de los usuarios.
            </li>

            <li>
              <strong>Atención y soporte al usuario:</strong> Brindar asistencia técnica, responder
              consultas, gestionar reclamos y ofrecer soluciones ante posibles inconvenientes en el
              uso de la plataforma.
            </li>

            <li>
              <strong>Comunicación con el usuario:</strong> Enviar notificaciones relacionadas con
              el funcionamiento del sistema, actualizaciones, cambios en la política o información
              relevante sobre los servicios.
            </li>

            <li>
              <strong>Seguridad y prevención de fraudes:</strong> Detectar, prevenir y mitigar
              actividades sospechosas o no autorizadas que puedan comprometer la seguridad de la
              plataforma o de los usuarios.
            </li>

            <li>
              <strong>Cumplimiento de obligaciones legales:</strong> Utilizar la información cuando
              sea necesario para cumplir con disposiciones legales aplicables en el Estado
              Plurinacional de Bolivia.
            </li>
          </ul>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            En ningún caso la información personal será utilizada para fines distintos a los aquí
            establecidos sin el consentimiento previo del usuario.
          </p>
        </section>

        {/* Sección 4 */}
        <section className="mb-6">
          <h2 className="font-semibold" style={{ color: '#120C0C' }}>
            4. Seguridad
          </h2>
          <p className="text-sm leading-7 mt-2 text-justify" style={{ color: '#303030' }}>
            La plataforma implementa medidas técnicas y organizativas adecuadas con el fin de
            garantizar la seguridad, confidencialidad e integridad de los datos personales de los
            usuarios, evitando su pérdida, alteración, acceso no autorizado o uso indebido. Entre
            las medidas aplicadas se incluyen controles de acceso, almacenamiento seguro de la
            información, uso de protocolos de comunicación seguros y monitoreo de actividades dentro
            del sistema. Asimismo, el acceso a los datos personales se encuentra restringido
            únicamente al personal autorizado, quien está sujeto a obligaciones de confidencialidad.
            Sin perjuicio de lo anterior, el usuario reconoce que ningún sistema es completamente
            seguro, por lo que, aunque se adoptan todas las medidas razonables, no se puede
            garantizar la seguridad absoluta de la información.
          </p>
        </section>

        {/* Sección 5 */}
        <section className="mb-6">
          <h2 className="font-semibold" style={{ color: '#120C0C' }}>
            5. Uso de cookies y tecnologías similares
          </h2>

          <p className="text-sm leading-7 mt-2 text-justify" style={{ color: '#303030' }}>
            La plataforma utiliza cookies y tecnologías similares con el fin de mejorar la
            experiencia del usuario, optimizar el funcionamiento del sistema y ofrecer servicios
            personalizados.
          </p>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            Las cookies son pequeños archivos de texto que se almacenan en el dispositivo del
            usuario cuando accede a la plataforma, permitiendo reconocer sus preferencias y
            facilitar futuras interacciones.
          </p>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            A través del uso de cookies, la plataforma puede:
          </p>

          <ul className="list-disc ml-5 mt-3 text-sm" style={{ color: '#303030' }}>
            <li>Recordar las preferencias del usuario</li>
            <li>Facilitar la navegación dentro del sistema</li>
            <li>Analizar el uso de la plataforma para mejorar su funcionamiento</li>
            <li>Ofrecer contenido más relevante según la interacción del usuario</li>
          </ul>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            El usuario puede configurar su navegador para aceptar, rechazar o eliminar las cookies
            en cualquier momento; sin embargo, la desactivación de estas puede afectar el correcto
            funcionamiento de algunas funcionalidades de la plataforma.
          </p>
        </section>

        {/* Sección 6 */}
        <section className="mb-6">
          <h2 className="font-semibold" style={{ color: '#120C0C' }}>
            6. Compartición de la información
          </h2>

          <p className="text-sm leading-7 mt-2 text-justify" style={{ color: '#303030' }}>
            La plataforma no comercializa ni comparte los datos personales de los usuarios con
            terceros sin su consentimiento, salvo en los casos establecidos en la presente política
            o cuando sea requerido por la normativa vigente.
          </p>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            La información personal podrá ser compartida en los siguientes casos:
          </p>

          <ul className="list-disc ml-5 mt-3 text-sm" style={{ color: '#303030' }}>
            <li>
              <strong>Con consentimiento del usuario:</strong> Cuando el usuario autorice de manera
              expresa la transferencia de sus datos para fines específicos.
            </li>
            <li>
              <strong>Cumplimiento de obligaciones legales:</strong> Cuando sea necesario para
              cumplir con disposiciones legales, requerimientos de autoridades competentes o
              procesos judiciales en el Estado Plurinacional de Bolivia.
            </li>
            <li>
              <strong>Proveedores de servicios:</strong> Con terceros que presten servicios
              necesarios para el funcionamiento de la plataforma, quienes estarán obligados a
              mantener la confidencialidad de la información.
            </li>
            <li>
              <strong>Protección de derechos:</strong> Cuando sea necesario para proteger la
              seguridad, integridad y derechos de la plataforma o de sus usuarios.
            </li>
          </ul>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            En todos los casos, se adoptarán las medidas necesarias para garantizar que el
            tratamiento de los datos personales se realice conforme a los principios de seguridad y
            confidencialidad.
          </p>
        </section>

        {/* Sección 7 */}
        <section className="mb-6">
          <h2 className="font-semibold" style={{ color: '#120C0C' }}>
            7. Derechos del usuario
          </h2>

          <p className="text-sm leading-7 mt-2 text-justify" style={{ color: '#303030' }}>
            El usuario tiene derecho a conocer, acceder, actualizar y rectificar sus datos
            personales almacenados en la plataforma, conforme a los principios de transparencia y
            control sobre su información.
          </p>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            Asimismo, el usuario podrá solicitar la eliminación de sus datos personales cuando
            considere que no están siendo tratados conforme a los fines establecidos o cuando ya no
            sean necesarios para dichos fines.
          </p>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            El usuario también tiene derecho a oponerse al tratamiento de sus datos personales en
            determinadas circunstancias, así como a solicitar la limitación de su uso.
          </p>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            Para el ejercicio de estos derechos, el usuario podrá realizar la solicitud
            correspondiente a través de los canales habilitados por la plataforma, los cuales serán
            atendidos en un plazo razonable conforme a la normativa vigente en el Estado
            Plurinacional de Bolivia.
          </p>
        </section>

        {/* Sección 8 */}
        <section>
          <h2 className="font-semibold" style={{ color: '#120C0C' }}>
            8. Cambios en la política
          </h2>

          <p className="text-sm leading-7 mt-2 text-justify" style={{ color: '#303030' }}>
            La plataforma se reserva el derecho de modificar, actualizar o complementar la presente
            Política de Privacidad en cualquier momento, con el fin de adaptarla a cambios
            normativos, mejoras en los servicios o nuevas funcionalidades implementadas.
          </p>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            Cualquier modificación será publicada oportunamente en esta misma sección, indicando la
            fecha de la última actualización, con el objetivo de mantener informados a los usuarios.
          </p>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            En caso de realizarse cambios significativos que afecten el tratamiento de los datos
            personales, se podrán emplear medios adicionales de comunicación, tales como
            notificaciones dentro de la plataforma o correos electrónicos, cuando corresponda.
          </p>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            Se recomienda a los usuarios revisar periódicamente esta política para mantenerse
            informados sobre cómo se protege su información.
          </p>
        </section>

        {/* Sección 9 */}
        <section className="mt-8">
          <h2 className="font-semibold" style={{ color: '#120C0C' }}>
            9. Contacto
          </h2>

          <p className="text-sm leading-7 mt-2 text-justify" style={{ color: '#303030' }}>
            Si tienes dudas, consultas o solicitudes relacionadas con la presente Política de
            Privacidad o el tratamiento de tus datos personales, puedes comunicarte con nosotros a
            través de los siguientes medios:
          </p>

          <ul className="mt-3 text-sm" style={{ color: '#303030' }}>
            <li>
              Facebook:{' '}
              <a
                href="https://www.facebook.com/people/PropBol/61577818616490/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#BEAF87' }}
                className="hover:underline"
              >
                PropBol
              </a>
            </li>

            <li className="mt-2">
              Instagram:{' '}
              <a
                href="https://www.instagram.com/prop.bol"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#BEAF87' }}
                className="hover:underline"
              >
                @prop.bol
              </a>
            </li>
          </ul>

          <p className="text-sm leading-7 mt-3 text-justify" style={{ color: '#303030' }}>
            Las solicitudes serán atendidas en un plazo razonable conforme a la normativa vigente en
            el Estado Plurinacional de Bolivia.
          </p>
        </section>
      </div>
    </div>
  )
}
