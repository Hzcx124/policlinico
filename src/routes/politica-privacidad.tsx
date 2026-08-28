import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Mail, Phone, ShieldCheck } from "lucide-react";
import { Layout, Seccion } from "@/components/Layout";
import { DIRECCION, FACEBOOK_URL, POLIFONO, POLIFONO_ANEXO } from "@/lib/ticketcita";

export const Route = createFileRoute("/politica-privacidad")({
  head: () => ({
    meta: [
      { title: "Política de privacidad | Policlínico Infantil — TicketCita" },
      {
        name: "description",
        content:
          "Cómo el Policlínico Infantil Nuestra Señora del Sagrado Corazón trata los datos personales que recoge TicketCita para la reserva de citas médicas.",
      },
      { property: "og:title", content: "Política de privacidad | TicketCita" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/politica-privacidad" },
    ],
    links: [{ rel: "canonical", href: "/politica-privacidad" }],
  }),
  component: PoliticaPrivacidad,
});

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="card-soft p-5 sm:p-6">
      <h2 className="text-lg font-extrabold tracking-tight">{titulo}</h2>
      <div className="mt-2 grid gap-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

function PoliticaPrivacidad() {
  return (
    <Layout>
      <Seccion className="py-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-7 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight">Política de privacidad</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Última actualización: {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}.
          Esta política explica qué datos personales recoge TicketCita, para qué se usan y qué
          derechos tienes, conforme a la Ley N.º 29733, Ley de Protección de Datos Personales, y
          su reglamento (D.S. N.º 003-2013-JUS).
        </p>

        <div className="mt-6 grid gap-4">
          <Bloque titulo="1. Responsable del tratamiento">
            <p>
              El responsable de los datos recogidos a través de TicketCita es el{" "}
              <strong className="text-foreground">
                Policlínico Infantil Nuestra Señora del Sagrado Corazón
              </strong>{" "}
              (Categoría I-3, MINSA / DISA Lima Este), con domicilio en {DIRECCION}.
            </p>
          </Bloque>

          <Bloque titulo="2. Qué datos recogemos">
            <p>Cuando reservas una cita o inicias sesión como personal, podemos pedirte:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong className="text-foreground">Datos de identificación:</strong> DNI y
                nombre completo del paciente (o de su padre/madre/apoderado si el paciente es
                menor de edad).
              </li>
              <li>
                <strong className="text-foreground">Datos de contacto:</strong> celular y correo
                electrónico (opcionales), usados para confirmar o recordar la cita.
              </li>
              <li>
                <strong className="text-foreground">Datos de la cita:</strong> especialidad
                médica, médico, fecha y hora seleccionadas. La especialidad elegida puede revelar
                información relacionada a la salud (por ejemplo, Psicología, Psiquiatría o
                Ginecología), por lo que la tratamos como dato sensible.
              </li>
              <li>
                <strong className="text-foreground">Datos de pago:</strong> el método elegido
                (Yape, tarjeta o efectivo). TicketCita no almacena números de tarjeta ni claves;
                el pago se coordina directamente en recepción.
              </li>
            </ul>
          </Bloque>

          <Bloque titulo="3. Dónde se guardan tus datos">
            <p>
              TicketCita es, por ahora, una aplicación sin servidor ni base de datos propia: la
              información que ingresas se guarda únicamente en el{" "}
              <strong className="text-foreground">
                almacenamiento local (localStorage) de tu propio navegador
              </strong>{" "}
              y en los registros internos de recepción del policlínico. No transmitimos estos
              datos a servidores externos ni a otras empresas. Si en el futuro incorporamos una
              base de datos o una pasarela de pago en línea, actualizaremos esta política antes de
              hacerlo.
            </p>
          </Bloque>

          <Bloque titulo="4. Para qué usamos tus datos">
            <ul className="ml-4 list-disc space-y-1">
              <li>Gestionar la reserva, confirmación, reprogramación o cancelación de tu cita.</li>
              <li>Identificarte al momento de la atención en recepción.</li>
              <li>Elaborar reportes internos de agenda y control de pagos del policlínico.</li>
              <li>Comunicarnos contigo por celular o correo sobre tu cita, si los proporcionas.</li>
            </ul>
            <p>No usamos tus datos con fines publicitarios ni los vendemos a terceros.</p>
          </Bloque>

          <Bloque titulo="5. Base legal y consentimiento">
            <p>
              Al registrar tus datos para reservar una cita, das tu consentimiento libre, expreso
              e informado para su tratamiento con la finalidad descrita en esta política, conforme
              al artículo 5 de la Ley N.º 29733. Si el paciente es menor de edad, el registro debe
              ser realizado por su padre, madre o apoderado legal.
            </p>
          </Bloque>

          <Bloque titulo="6. Con quién compartimos tus datos">
            <p>
              Tus datos son de uso interno del policlínico (recepción y personal médico
              involucrado en tu atención). No compartimos tu información con anunciantes ni con
              terceros ajenos al policlínico, salvo que la ley nos obligue a entregarla a una
              autoridad competente (por ejemplo, MINSA o una autoridad judicial).
            </p>
          </Bloque>

          <Bloque titulo="7. Tus derechos (ARCO)">
            <p>
              Como titular de tus datos, tienes derecho a acceder, rectificar, cancelar u
              oponerte al tratamiento de tu información (derechos ARCO), así como a revocar tu
              consentimiento en cualquier momento. Puedes ejercerlos acercándote a recepción o
              escribiéndonos con los datos de contacto de la sección 9.
            </p>
          </Bloque>

          <Bloque titulo="8. Seguridad y conservación">
            <p>
              Conservamos tus datos solo el tiempo necesario para las finalidades descritas o el
              que exija la normativa de salud aplicable. Aplicamos medidas razonables para
              proteger tu información contra acceso no autorizado, pérdida o uso indebido; sin
              embargo, ningún sistema es 100% infalible.
            </p>
          </Bloque>

          <Bloque titulo="9. Contacto">
            <p>Para consultas o para ejercer tus derechos sobre tus datos personales:</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground">
                <Phone className="size-4" />
                Polífono {POLIFONO.join(" / ")} — anexo {POLIFONO_ANEXO}
              </span>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold transition-colors hover:bg-secondary"
              >
                <Facebook className="size-4" />
                Facebook oficial
              </a>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground">
                <Mail className="size-4" />
                [correo de contacto pendiente de agregar]
              </span>
            </div>
          </Bloque>

          <Bloque titulo="10. Cambios a esta política">
            <p>
              Podemos actualizar esta política para reflejar cambios en la aplicación o en la
              normativa vigente. La fecha de la última actualización aparece al inicio de esta
              página.
            </p>
          </Bloque>
        </div>
      </Seccion>
    </Layout>
  );
}
