import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Apple,
  ArrowRight,
  Baby,
  Brain,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Ear,
  Eye,
  Facebook,
  Heart,
  HeartHandshake,
  MapPin,
  Phone,
  ShieldCheck,
  Smile,
  Stethoscope,
  Syringe,
  Users,
  Wind,
} from "lucide-react";
import { useState } from "react";
import heroPediatra from "@/assets/hero-pediatra.jpg";
import misionFamilia from "@/assets/mision-familia.png";
import ilustracionHorario from "@/assets/ilustracion-horario.png";
import ilustracionContacto from "@/assets/ilustracion-contacto.png";
import logoPoli from "@/assets/logo-policlinico.png";
import logoYape from "@/assets/pago-yape.png";

import { Layout, Seccion } from "@/components/Layout";
import {
  DIRECCION,
  FACEBOOK_URL,
  MAPS_COMO_LLEGAR,
  MAPS_EMBED_URL,
  POLIFONO,
  POLIFONO_ANEXO,
  useEstado,
} from "@/lib/ticketcita";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TicketCita — Reserva tu cita médica en línea | Policlínico Infantil" },
      {
        name: "description",
        content:
          "Reserva citas médicas online en el Policlínico Infantil Nuestra Señora del Sagrado Corazón (Ate, Lima). Todas las especialidades, horarios en tiempo real y pago con Yape, tarjeta o efectivo.",
      },
      { property: "og:title", content: "TicketCita — Reserva tu cita médica en línea" },
      {
        property: "og:description",
        content: "Elige especialidad, médico y horario en minutos. Sin colas ni llamadas.",
      },
    ],
  }),
  component: Index,
});

const iconos: Record<string, typeof Stethoscope> = {
  stethoscope: Stethoscope,
  baby: Baby,
  heart: Heart,
  smile: Smile,
  brain: Brain,
  apple: Apple,
  syringe: Syringe,
  eye: Eye,
  ear: Ear,
  wind: Wind,
};

const ESPECIALIDADES_VISIBLES_INICIAL = 6;

// Imagen de cada especialidad servida desde /public/especialidades.
// Se normaliza el id para evitar caracteres como "ñ" en la URL (e-dniños -> e-dninos).
const imagenEspecialidad = (id: string) =>
  `/especialidades/${id.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.jpg`;

// Convierte el texto "atiende" en viñetas cortas para el detalle de la especialidad.
const puntosEspecialidad = (atiende: string) =>
  atiende
    .replace(/\.$/, "")
    .split(/,\s*|\s+y\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1));

function Index() {
  const { especialidades } = useEstado();
  const [verTodas, setVerTodas] = useState(false);
  const [espActivaId, setEspActivaId] = useState<string | null>(null);

  const especialidadesAMostrar = verTodas
    ? especialidades
    : especialidades.slice(0, ESPECIALIDADES_VISIBLES_INICIAL);

  const espActiva =
    especialidades.find((e) => e.id === espActivaId) ??
    especialidadesAMostrar[0] ??
    especialidades[0];

  return (
    <Layout>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-secondary/50">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-primary/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-24 size-72 rounded-full bg-accent/15 blur-2xl"
        />

        <Seccion className="relative grid gap-10 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-20 lg:grid-cols-[1fr_0.95fr_0.85fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-bold text-primary shadow-soft">
              <MapPin className="size-3.5" /> San Gregorio, Ate — Lima
            </span>

            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-primary md:text-5xl">
              Cuidamos hoy
              <span className="mt-1 block font-script text-4xl font-semibold md:text-6xl">
                su salud y su futuro
                <Heart className="ml-2 inline size-6 text-primary md:size-8" />
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base/relaxed text-muted-foreground">
              Atención médica especializada y humanizada para el bienestar integral de niños y
              adolescentes.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
              {[
                {
                  icon: ShieldCheck,
                  t: "Atención segura",
                  d: "Protocolos de bioseguridad",
                },
                {
                  icon: Users,
                  t: "Especialistas",
                  d: "Con amplia experiencia",
                },
                {
                  icon: Clock,
                  t: "Citas rápidas",
                  d: "Agenda fácil y sin complicaciones",
                },
                {
                  icon: Heart,
                  t: "Trato humano",
                  d: "Cuidado con empatía y respeto",
                },
              ].map((f) => (
                <div key={f.t} className="flex min-w-0 flex-col items-center gap-2 text-center">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary/70 text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <p className="text-sm font-extrabold leading-tight text-foreground">{f.t}</p>
                  <p className="text-xs leading-snug text-muted-foreground">{f.d}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/horarios"
                search={{ esp: undefined, med: undefined, fecha: undefined, hora: undefined }}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-lift transition-transform hover:scale-[1.03]"
              >
                <CalendarCheck className="size-4" /> Ver horarios y reservar
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <img
              src={heroPediatra}
              alt="Pediatra sonriendo junto a una niña con su osito de peluche en el consultorio"
              width={1280}
              height={864}
              className="h-[26rem] w-full rounded-3xl object-cover shadow-lift"
            />
          </div>

          <div className="card-soft relative rounded-2xl bg-card p-6 shadow-lift">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <CalendarCheck className="size-5" />
              </span>
              <div>
                <p className="text-lg font-extrabold leading-tight">Reserva tu cita</p>
                <p className="text-xs font-semibold text-muted-foreground">En 4 simples pasos</p>
              </div>
            </div>

            <ol className="mt-5 grid gap-4">
              {[
                { t: "Elige tu especialidad", d: "Selecciona el área médica" },
                { t: "Elige tu médico", d: "Revisa los especialistas disponibles" },
                { t: "Selecciona fecha y hora", d: "Elige el día y horario que prefieras" },
                { t: "Confirma y paga", d: "Completa tus datos y realiza el pago" },
              ].map((p, i) => (
                <li key={p.t} className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold">{p.t}</p>
                    <p className="text-xs text-muted-foreground">{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Link
              to="/horarios"
              search={{ esp: undefined, med: undefined, fecha: undefined, hora: undefined }}
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
            >
              Comenzar reserva
            </Link>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <img src={logoYape} alt="Yape" className="size-4 rounded-full object-contain" />
              Aceptamos pagos con Yape, tarjeta o efectivo
            </p>
          </div>
        </Seccion>
      </section>

      {/* ---------- Especialidades ---------- */}
      <Seccion id="especialidades" className="py-14">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Nuestras especialidades
          </h2>
          <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">
            Contamos con diversas especialidades organizadas por área para el cuidado integral de tu
            familia.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,17rem)_1fr] md:items-start">
          {/* Lista de especialidades */}
          <div className="card-soft overflow-hidden rounded-2xl bg-card p-2">
            <ul className="grid gap-1">
              {especialidadesAMostrar.map((esp) => {
                const Icono = iconos[esp.icono] ?? Stethoscope;
                const activa = espActiva?.id === esp.id;
                return (
                  <li key={esp.id}>
                    <button
                      type="button"
                      onClick={() => setEspActivaId(esp.id)}
                      aria-current={activa ? "true" : undefined}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition-colors ${
                        activa
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <Icono className={`size-4.5 shrink-0 ${activa ? "" : "text-primary"}`} />
                      <span className="min-w-0 flex-1 truncate">{esp.nombre}</span>
                      <ChevronRight className="size-4 shrink-0 opacity-70" />
                    </button>
                  </li>
                );
              })}
            </ul>

            {especialidades.length > ESPECIALIDADES_VISIBLES_INICIAL && (
              <button
                type="button"
                onClick={() => setVerTodas((v) => !v)}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-t border-border px-3 py-3 text-sm font-extrabold text-primary transition-colors hover:bg-secondary"
              >
                {verTodas ? "Ver menos" : `Ver todas (${especialidades.length})`}
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>

          {/* Detalle de la especialidad seleccionada */}
          {espActiva && (
            <div className="grid gap-6 rounded-2xl bg-secondary/40 p-6 md:grid-cols-2 md:items-center md:p-8">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-primary">
                  {espActiva.nombre}
                </h3>
                <p className="mt-3 text-sm/relaxed text-muted-foreground">
                  {espActiva.descripcion}
                </p>

                <ul className="mt-5 grid gap-2.5">
                  {puntosEspecialidad(espActiva.atiende).map((punto) => (
                    <li key={punto} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-primary" />
                      <span>{punto}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/horarios"
                  search={{ esp: espActiva.id, med: undefined, fecha: undefined, hora: undefined }}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-soft transition-transform hover:scale-[1.03]"
                >
                  Conocer más <ArrowRight className="size-4" />
                </Link>
              </div>

              <img
                src={imagenEspecialidad(espActiva.id)}
                alt={`Imagen de la especialidad ${espActiva.nombre}`}
                loading="lazy"
                width={768}
                height={512}
                className="h-56 w-full rounded-2xl object-cover shadow-lift md:h-72"
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/horarios"
            search={{ esp: undefined, med: undefined, fecha: undefined, hora: undefined }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-soft"
          >
            Reservar cita
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Nota: algún turno puede variar por alguna emergencia. Polifono {POLIFONO.join(" / ")},
          anexo {POLIFONO_ANEXO}.
        </p>
      </Seccion>

      {/* ---------- Barra de accesos rápidos ---------- */}
      <section className="border-y border-border bg-card">
        <Seccion className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-2">
            <img
              src={logoPoli}
              alt="Logo del Policlínico Infantil Nuestra Señora del Sagrado Corazón"
              width={40}
              height={40}
              loading="lazy"
              className="size-10 object-contain"
            />
            <span className="leading-tight">
              <span className="block text-sm font-extrabold">Policlínico Infantil</span>
              <span className="block text-[11px] text-muted-foreground">
                Nuestra Señora del Sagrado Corazón
              </span>
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Link
              to="/horarios"
              search={{ esp: undefined, med: undefined, fecha: undefined, hora: undefined }}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold transition-colors hover:bg-secondary"
            >
              <CalendarCheck className="size-4 text-primary" /> Ver horarios
            </Link>
            <Link
              to="/mis-citas"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:bg-secondary"
            >
              <Clock className="size-4 text-primary" /> Mis citas
            </Link>
            <Link
              to="/ubicacion"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:bg-secondary"
            >
              <MapPin className="size-4 text-primary" /> Ubicación
            </Link>
            <Link
              to="/panel"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
            >
              <ShieldCheck className="size-4" /> Recepción
            </Link>
          </nav>
        </Seccion>
      </section>

      {/* ---------- Ubicación / horario / contacto / misión ---------- */}
      <section className="bg-secondary/40 py-14">
        <Seccion className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr_1.1fr]">
          <div className="card-soft p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
              <MapPin className="size-4.5" />
            </span>
            <p className="mt-3 text-sm font-extrabold">¿Dónde estamos?</p>
            <p className="mt-1 text-sm text-muted-foreground">{DIRECCION}</p>
            <a
              href={MAPS_COMO_LLEGAR}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-bold text-primary underline underline-offset-2"
            >
              Ver en Google Maps
            </a>
            <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-border">
              <iframe
                title="Ubicación del Policlínico Infantil"
                src={MAPS_EMBED_URL}
                loading="lazy"
                className="size-full"
              />
            </div>
          </div>

          <div className="card-soft p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
              <Clock className="size-4.5" />
            </span>
            <p className="mt-3 text-sm font-extrabold">Horario de atención</p>
            <p className="mt-2 text-sm text-muted-foreground">Lunes a sábado</p>
            <p className="text-sm font-bold text-foreground">8:00 a. m. – 8:00 p. m.</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Tolerancia de llegada: 15 minutos para citas pagadas en caja.
            </p>
            <img
              src={ilustracionHorario}
              alt="Ilustración de la sala de espera del policlínico"
              loading="lazy"
              width={768}
              height={512}
              className="mt-4 w-full object-contain"
            />
          </div>

          <div className="card-soft p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
              <Phone className="size-4.5" />
            </span>
            <p className="mt-3 text-sm font-extrabold">Contáctanos</p>
            <p className="mt-2 text-sm text-muted-foreground">Polífono</p>
            <p className="text-sm font-bold text-foreground">{POLIFONO.join(" / ")}</p>
            <p className="mt-1 text-xs text-muted-foreground">Anexo {POLIFONO_ANEXO}</p>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold transition-colors hover:bg-secondary"
            >
              <Facebook className="size-4" /> Facebook oficial
            </a>
            <img
              src={ilustracionContacto}
              alt="Ilustración de una pediatra conversando con un niño"
              loading="lazy"
              width={768}
              height={512}
              className="mt-4 w-full object-contain"
            />
          </div>

          <div className="hero-gradient flex flex-col justify-center rounded-2xl p-6 text-primary-foreground">
            <HeartHandshake className="size-8" />
            <p className="mt-3 text-lg font-extrabold leading-tight">
              Tu tranquilidad, nuestra misión
            </p>
            <p className="mt-2 text-sm opacity-90">
              Comprometidos con la salud y el bienestar de tu familia, con atención humanizada en
              cada visita.
            </p>
            <img
              src={misionFamilia}
              alt="Ilustración de una madre cargando a su bebé"
              loading="lazy"
              width={640}
              height={640}
              className="mt-4 h-32 w-auto self-end"
            />
          </div>
        </Seccion>
      </section>
    </Layout>
  );
}
