import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  Baby,
  Banknote,
  CalendarDays,
  Check,
  ChevronLeft,
  CreditCard,
  Download,
  Ear,
  Eye,
  Heart,
  Info,
  Loader2,
  Phone,
  Search,
  Smartphone,
  Smile,
  Brain,
  Stethoscope,
  Syringe,
  UserRound,
  Wind,
} from "lucide-react";
import { Layout, Seccion } from "@/components/Layout";
import logoYape from "@/assets/pago-yape.png";
import { generarComprobantePDF } from "@/lib/comprobante";
import { consultarDni } from "@/lib/reniec";
import {
  agruparPorTurno,
  crearCita,
  DIAS_NOMBRE,
  diasDeMedico,
  fechaLarga,
  fechasProximas,
  horaLegible,
  horasDeMedico,
  horasOcupadas,
  nombreFecha,
  NOTA_GENERAL,
  POLIFONO,
  POLIFONO_ANEXO,
  set,
  soles,
  TOLERANCIA_MIN,
  useEstado,
  type Cita,
  type Medico,
  type MetodoPago,
  type Paciente,
} from "@/lib/ticketcita";

export const Route = createFileRoute("/horarios")({
  validateSearch: (s: Record<string, unknown>) => ({
    esp: typeof s["esp"] === "string" ? (s["esp"] as string) : undefined,
    med: typeof s["med"] === "string" ? (s["med"] as string) : undefined,
    fecha: typeof s["fecha"] === "string" ? (s["fecha"] as string) : undefined,
    hora: typeof s["hora"] === "string" ? (s["hora"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Ver horarios y reservar cita | TicketCita" },
      {
        name: "description",
        content:
          "Consulte los días y horas disponibles de cada especialista del Policlínico Infantil y reserve su cita en el momento, sin necesidad de registrarse antes.",
      },
      { property: "og:title", content: "Ver horarios y reservar cita | TicketCita" },
      {
        property: "og:description",
        content: "Revise la disponibilidad de médicos y reserve su turno al instante.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/horarios" },
    ],
    links: [{ rel: "canonical", href: "/horarios" }],
  }),
  component: Horarios,
});

const fechas = fechasProximas(14);

// Lunes a domingo, como se muestra en el cuadro de horarios semanales.
const DIAS_ORDEN = [1, 2, 3, 4, 5, 6, 0];

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

function normalizar(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function iniciales(nombre: string) {
  const partes = nombre.replace(/^(Dr\.|Dra\.)\s*/i, "").split(" ");
  return partes
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function Horarios() {
  const { esp, med, fecha: fechaUrl, hora: horaUrl } = Route.useSearch();
  const estado = useEstado();
  const [especialidadId, setEspecialidadId] = useState<string | undefined>(esp);
  const [medicoId, setMedicoId] = useState<string | undefined>(med);
  const [fecha, setFecha] = useState<string>(fechaUrl ?? fechas[0] ?? "");
  const [busqueda, setBusqueda] = useState("");

  // Reserva: al tocar una hora libre se pasa a pedir datos y pago, sin salir de esta página.
  const [hora, setHora] = useState<string | undefined>(horaUrl);
  const [reservando, setReservando] = useState(false);
  const [metodo, setMetodo] = useState<MetodoPago>("yape");
  const [dni, setDni] = useState("");
  const [consultandoDni, setConsultandoDni] = useState(false);
  const [nombreDetectado, setNombreDetectado] = useState<string | null>(null);
  const [dniError, setDniError] = useState("");
  const [nombreManual, setNombreManual] = useState("");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [nombreTarjeta, setNombreTarjeta] = useState("");
  const [vencimientoTarjeta, setVencimientoTarjeta] = useState("");
  const [cvv, setCvv] = useState("");
  const [celularYape, setCelularYape] = useState("");
  const [codigoYape, setCodigoYape] = useState("");
  const [error, setError] = useState("");
  const [confirmada, setConfirmada] = useState<Cita | null>(null);
  const [descargando, setDescargando] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);

  const especialidad = estado.especialidades.find((e) => e.id === especialidadId);
  const especialidadesFiltradas = estado.especialidades.filter((e) =>
    normalizar(e.nombre).includes(normalizar(busqueda)),
  );
  const medicosEsp = estado.medicos.filter((m) => m.especialidadId === especialidadId);
  const medico = estado.medicos.find((m) => m.id === medicoId);

  const fechasDisponibles = useMemo(
    () => (medico ? fechas.filter((f) => horasDeMedico(medico, f).length > 0) : []),
    [medico],
  );
  const horasMedico = useMemo(() => horasDeMedico(medico, fecha), [medico, fecha]);
  const ocupadas = useMemo(
    () => (medicoId ? horasOcupadas(estado.citas, medicoId, fecha) : []),
    [estado.citas, medicoId, fecha],
  );

  // Al completar los 8 dígitos del DNI, se busca el nombre del paciente:
  // primero entre los ya registrados en la app y, si no existe, consultando
  // la API de RENIEC para completar el nombre automáticamente en la boleta.
  useEffect(() => {
    setNombreDetectado(null);
    setDniError("");
    setNombreManual("");

    if (!/^\d{8}$/.test(dni)) return;

    const existente = estado.pacientes.find((p) => p.dni === dni);
    if (existente) {
      setNombreDetectado(existente.nombre);
      return;
    }

    let cancelado = false;
    setConsultandoDni(true);
    consultarDni({ data: dni })
      .then((resultado) => {
        if (cancelado) return;
        if (resultado.ok) {
          setNombreDetectado(resultado.nombreCompleto);
        } else {
          setDniError(resultado.mensaje);
        }
      })
      .catch(() => {
        if (!cancelado) setDniError("No se pudo verificar el DNI en este momento.");
      })
      .finally(() => {
        if (!cancelado) setConsultandoDni(false);
      });

    return () => {
      cancelado = true;
    };
  }, [dni, estado.pacientes]);

  function elegirEspecialidad(id: string) {
    setEspecialidadId(id);
    const doctores = estado.medicos.filter((m) => m.especialidadId === id);
    elegirMedico(doctores[0]);
  }

  function elegirMedico(m: Medico | undefined) {
    setMedicoId(m?.id);
    if (m) {
      const disponibles = fechas.filter((f) => horasDeMedico(m, f).length > 0);
      setFecha(disponibles[0] ?? fechas[0] ?? "");
    }
  }

  function elegirHora(h: string) {
    setHora(h);
    setError("");
    setReservando(true);
  }

  function confirmar() {
    setError("");
    if (!especialidad || !medico || !hora) return;

    if (metodo === "tarjeta") {
      const numeroLimpio = numeroTarjeta.replace(/\s+/g, "");
      if (!/^\d{16}$/.test(numeroLimpio))
        return setError("El número de tarjeta debe tener 16 dígitos.");
      if (!nombreTarjeta.trim())
        return setError("Escriba el nombre tal como figura en la tarjeta.");
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(vencimientoTarjeta))
        return setError("La fecha de vencimiento debe tener el formato MM/AA.");
      if (!/^\d{3,4}$/.test(cvv)) return setError("El CVV debe tener 3 o 4 dígitos.");
    }

    if (metodo === "yape") {
      if (!/^9\d{8}$/.test(celularYape))
        return setError("Ingrese un número de celular Yape válido (9 dígitos, empieza con 9).");
      if (!/^\d{6}$/.test(codigoYape))
        return setError(
          "Ingrese el código de 6 dígitos para compras por internet que le muestra la app Yape.",
        );
    }

    if (!/^\d{8}$/.test(dni)) return setError("El DNI debe tener 8 dígitos.");
    if (consultandoDni) return setError("Espere un momento, estamos verificando su DNI.");

    const nombreFinal = (nombreDetectado ?? nombreManual).trim();
    if (!nombreFinal)
      return setError("No pudimos obtener su nombre. Escríbalo para continuar.");

    if (metodo === "tarjeta" || metodo === "yape") {
      // Simula el tiempo de procesamiento del pago (tarjeta o Yape) antes de confirmar.
      setProcesandoPago(true);
      setTimeout(() => {
        setProcesandoPago(false);
        finalizarReserva(nombreFinal);
      }, 1600);
      return;
    }

    finalizarReserva(nombreFinal);
  }

  function finalizarReserva(nombreCompleto: string) {
    if (!especialidad || !medico || !hora) return;

    const existente = estado.pacientes.find((p) => p.dni === dni);
    let paciente: Paciente;
    if (existente) {
      paciente = existente;
    } else {
      paciente = { dni, nombre: nombreCompleto };
      const nuevo = paciente;
      set((e) => ({ ...e, pacientes: [...e.pacientes, nuevo] }));
    }

    const cita = crearCita({
      paciente,
      medicoId: medico.id,
      especialidadId: especialidad.id,
      fecha,
      hora,
      metodoPago: metodo,
    });
    setConfirmada(cita);
  }

  // ---------- Vista: procesando el pago con tarjeta ----------
  if (procesandoPago) {
    return (
      <Layout>
        <Seccion className="py-24">
          <div className="card-soft mx-auto max-w-md p-10 text-center">
            <Loader2 className="mx-auto size-12 animate-spin text-primary" />
            <h1 className="mt-5 text-2xl font-extrabold">Procesando su pago…</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Estamos confirmando el pago con {metodo === "yape" ? "Yape" : "su tarjeta"}. No
              cierre ni recargue esta página.
            </p>
          </div>
        </Seccion>
      </Layout>
    );
  }

  // ---------- Vista: cita confirmada ----------
  if (confirmada) {
    return (
      <Layout>
        <Seccion className="py-14">
          <div className="card-soft mx-auto max-w-xl p-7 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success text-success-foreground">
              <Check className="size-9" />
            </span>
            <h1 className="mt-4 text-3xl font-extrabold">
              {confirmada.metodoPago === "efectivo" ? "Horario reservado" : "Cita pagada"}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Su código de reserva es{" "}
              <span className="font-extrabold text-foreground">{confirmada.codigo}</span>
            </p>
            <dl className="mt-6 grid gap-3 rounded-xl bg-secondary/70 p-5 text-left text-lg">
              <Fila k="Paciente" v={confirmada.pacienteNombre} />
              <Fila k="Especialidad" v={especialidad!.nombre} />
              <Fila k="Médico" v={medico!.nombre} />
              <Fila k="Fecha" v={fechaLarga(confirmada.fecha)} />
              <Fila k="Hora" v={horaLegible(confirmada.hora)} />
              <Fila k="Monto" v={soles(especialidad!.precio)} />
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Pago</dt>
                <dd className="flex items-center gap-2 text-right font-bold">
                  {confirmada.metodoPago === "yape" && (
                    <img src={logoYape} alt="Yape" className="size-6 rounded-full object-contain" />
                  )}
                  {confirmada.metodoPago === "efectivo"
                    ? "En caja al llegar"
                    : confirmada.metodoPago === "yape"
                      ? "Yape (pagado)"
                      : "Tarjeta (pagado)"}
                </dd>
              </div>
            </dl>
            {confirmada.metodoPago === "efectivo" && (
              <p className="mt-4 rounded-xl bg-warning/25 p-4 text-base font-semibold text-warning-foreground">
                Llegue puntual: tiene 15 minutos de tolerancia. Pasado ese tiempo el cupo se libera
                automáticamente.
              </p>
            )}
            <p className="mt-4 text-base text-muted-foreground">
              Le enviaremos recordatorios por correo 24 horas y 2 horas antes de su cita.
            </p>
            <div className="mt-7 grid gap-3 sm:flex sm:justify-center">
              <button
                disabled={descargando}
                onClick={async () => {
                  if (!especialidad || !medico) return;
                  setDescargando(true);
                  try {
                    await generarComprobantePDF(confirmada, especialidad, medico);
                  } finally {
                    setDescargando(false);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-lg font-extrabold text-primary-foreground disabled:opacity-60"
              >
                {descargando ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Download className="size-5" />
                )}
                Descargar comprobante (PDF)
              </button>
              <Link
                to="/mis-citas"
                className="rounded-xl border-2 border-border px-6 py-4 text-lg font-bold"
              >
                Ver mis citas
              </Link>
              <Link
                to="/"
                className="rounded-xl border-2 border-border px-6 py-4 text-lg font-bold"
              >
                Ir al inicio
              </Link>
            </div>
          </div>
        </Seccion>
      </Layout>
    );
  }

  // ---------- Vista: datos y pago (tras elegir una hora libre) ----------
  if (reservando && especialidad && medico && hora) {
    return (
      <Layout>
        <Seccion className="py-10">
          <button
            onClick={() => {
              setReservando(false);
              setError("");
            }}
            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            <ChevronLeft className="size-4" /> Volver a horarios
          </button>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Sus datos y forma de pago
          </h1>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="card-soft p-4 sm:p-6">
              <div className="grid gap-6">
                <div>
                  <p className="text-base font-bold text-muted-foreground">
                    Solo necesitamos su DNI para reservar.
                  </p>
                  <div className="mt-3 max-w-xs">
                    <Campo
                      label="DNI *"
                      ayuda="Sus 8 números del documento"
                      value={dni}
                      onChange={(v) => setDni(v.replace(/\D/g, ""))}
                      inputMode="numeric"
                      maxLength={8}
                      placeholder="12345678"
                    />
                    <div className="mt-2 min-h-[1.5rem] text-sm">
                      {consultandoDni && (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" /> Verificando DNI...
                        </span>
                      )}
                      {!consultandoDni && nombreDetectado && (
                        <span className="inline-flex items-center gap-1.5 font-bold text-primary">
                          <Check className="size-4" /> {nombreDetectado}
                        </span>
                      )}
                      {!consultandoDni && dniError && (
                        <p className="font-semibold text-destructive">{dniError}</p>
                      )}
                    </div>
                    {!consultandoDni && dniError && (
                      <Campo
                        label="Nombre completo *"
                        ayuda="No pudimos verificarlo automáticamente, escríbalo tal como figura en su DNI"
                        value={nombreManual}
                        onChange={setNombreManual}
                        placeholder="Nombres y apellidos"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-base font-bold text-muted-foreground">
                    ¿Cómo desea pagar {soles(especialidad.precio)}?
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        {
                          id: "yape",
                          label: "Con Yape",
                          desc: "Desde su celular, al instante",
                          icon: Smartphone,
                          logo: logoYape,
                        },
                        {
                          id: "tarjeta",
                          label: "Con tarjeta",
                          desc: "Débito o crédito",
                          icon: CreditCard,
                        },
                        {
                          id: "efectivo",
                          label: "En efectivo",
                          desc: "Paga en caja al llegar",
                          icon: Banknote,
                        },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMetodo(m.id)}
                        aria-pressed={metodo === m.id}
                        className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                          metodo === m.id
                            ? "border-primary bg-secondary"
                            : "border-border hover:bg-secondary/60"
                        }`}
                      >
                        {"logo" in m && m.logo ? (
                          <img
                            src={m.logo}
                            alt="Logo de Yape"
                            className="mt-0.5 size-7 shrink-0 rounded-full object-contain"
                          />
                        ) : (
                          <m.icon className="mt-0.5 size-7 shrink-0 text-primary" />
                        )}
                        <span>
                          <span className="block text-lg font-extrabold">{m.label}</span>
                          <span className="block text-base text-muted-foreground">{m.desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  {metodo === "efectivo" && (
                    <p className="mt-3 rounded-xl bg-warning/25 p-4 text-base font-semibold text-warning-foreground">
                      Recuerde: tiene 15 minutos de tolerancia. Después de ese tiempo el cupo se
                      libera.
                    </p>
                  )}
                  {metodo === "yape" && (
                    <div className="mt-4 grid gap-4 rounded-xl border-2 border-border p-4 sm:grid-cols-2">
                      <p className="flex items-center gap-2 text-sm font-bold text-muted-foreground sm:col-span-2">
                        <img
                          src={logoYape}
                          alt="Logo de Yape"
                          className="size-4 rounded-full object-contain"
                        />
                        Datos de Yape
                      </p>
                      <p className="text-base text-muted-foreground sm:col-span-2">
                        Para pagar con Yape necesitamos su número de celular y el código de 6
                        dígitos para "compras por internet" que le muestra la app Yape (dentro de
                        su tarjeta virtual, botón "Ver código"). Es la única forma de cobrar por
                        Yape sin usar un código QR con otro celular.
                      </p>
                      <Campo
                        label="Celular Yape *"
                        value={celularYape}
                        onChange={(v) => setCelularYape(v.replace(/\D/g, "").slice(0, 9))}
                        inputMode="numeric"
                        maxLength={9}
                        placeholder="9XXXXXXXX"
                      />
                      <Campo
                        label="Código de compras por internet *"
                        ayuda="Los 6 dígitos que muestra la app Yape, válidos por unos minutos"
                        value={codigoYape}
                        onChange={(v) => setCodigoYape(v.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                      />
                    </div>
                  )}
                  {metodo === "tarjeta" && (
                    <div className="mt-4 grid gap-4 rounded-xl border-2 border-border p-4 sm:grid-cols-2">
                      <p className="flex items-center gap-2 text-sm font-bold text-muted-foreground sm:col-span-2">
                        <CreditCard className="size-4" />
                        Datos de la tarjeta
                      </p>
                      <Campo
                        label="Número de tarjeta *"
                        value={numeroTarjeta}
                        onChange={(v) =>
                          setNumeroTarjeta(
                            v
                              .replace(/\D/g, "")
                              .slice(0, 16)
                              .replace(/(.{4})/g, "$1 ")
                              .trim(),
                          )
                        }
                        inputMode="numeric"
                        placeholder="1234 5678 9012 3456"
                      />
                      <Campo
                        label="Nombre en la tarjeta *"
                        value={nombreTarjeta}
                        onChange={setNombreTarjeta}
                        placeholder="Como figura en la tarjeta"
                      />
                      <Campo
                        label="Vencimiento (MM/AA) *"
                        value={vencimientoTarjeta}
                        onChange={(v) => {
                          const limpio = v.replace(/[^\d]/g, "").slice(0, 4);
                          setVencimientoTarjeta(
                            limpio.length > 2 ? `${limpio.slice(0, 2)}/${limpio.slice(2)}` : limpio,
                          );
                        }}
                        inputMode="numeric"
                        maxLength={5}
                        placeholder="12/28"
                      />
                      <Campo
                        label="CVV *"
                        value={cvv}
                        onChange={(v) => setCvv(v.replace(/\D/g, "").slice(0, 4))}
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="123"
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl bg-destructive/15 px-4 py-3 text-lg font-bold text-destructive"
                  >
                    {error}
                  </p>
                )}
              </div>

              <div className="mt-8 grid gap-3 sm:flex sm:items-center">
                <button
                  onClick={() => {
                    setReservando(false);
                    setError("");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border px-6 py-4 text-lg font-bold transition-colors hover:bg-secondary"
                >
                  <ChevronLeft className="size-5" />
                  Volver
                </button>
                <button
                  onClick={confirmar}
                  className="rounded-xl bg-primary px-7 py-4 text-lg font-extrabold text-primary-foreground shadow-soft transition-transform hover:scale-[1.01] sm:ml-auto"
                >
                  {metodo === "efectivo"
                    ? "Reservar y pagar en caja"
                    : `Pagar ${soles(especialidad.precio)} y confirmar`}
                </button>
              </div>
            </div>

            <aside className="card-soft h-fit p-6">
              <p className="text-lg font-extrabold">Resumen de su cita</p>
              <dl className="mt-4 grid gap-3 text-lg">
                <Fila k="Especialidad" v={especialidad.nombre} />
                <Fila k="Médico" v={medico.nombre} />
                <Fila k="Fecha" v={fechaLarga(fecha)} />
                <Fila k="Hora" v={horaLegible(hora)} />
                <Fila k="Total a pagar" v={soles(especialidad.precio)} />
              </dl>
              <p className="mt-5 text-base text-muted-foreground">
                Atendemos de 8:00 a. m. a 8:00 p. m. Si necesita ayuda, llámenos o acérquese a
                recepción.
              </p>
            </aside>
          </div>
        </Seccion>
      </Layout>
    );
  }

  // ---------- Vista: ver horarios (y elegir hora para reservar) ----------
  return (
    <Layout>
      <Seccion className="py-10">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ver horarios y reservar cita
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Consulte los días y horarios de atención de nuestros especialistas y reserve al instante.
          No necesita registrarse para consultar.
        </p>

        <div className="mb-2 mt-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-border bg-secondary/50 p-4 sm:flex-row sm:items-center">
          <p className="text-base text-foreground">
            <strong className="font-extrabold">¿Prefiere que lo ayudemos?</strong> Puede llamarnos y
            le reservamos la cita por teléfono.
          </p>
          <a
            href={`tel:${POLIFONO[0]}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-extrabold text-primary shadow-soft"
          >
            <Phone className="size-4" /> {POLIFONO.join(" / ")} (anexo {POLIFONO_ANEXO})
          </a>
        </div>

        {/* Buscador */}
        <label className="mt-6 grid gap-2">
          <span className="text-base font-bold">Buscar especialidad</span>
          <span className="relative block max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Por ejemplo: pediatría, dental..."
              className="w-full rounded-xl border-2 border-input bg-card py-4 pl-12 pr-4 text-lg outline-none focus:border-ring focus:ring-4 focus:ring-ring/25"
            />
          </span>
        </label>

        {/* Chips de especialidad, siempre visibles para cambiar rápido */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-bold text-muted-foreground">Especialidades</p>
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {especialidadesFiltradas.map((e) => {
              const Icono = iconos[e.icono] ?? Stethoscope;
              const total = estado.medicos.filter((m) => m.especialidadId === e.id).length;
              const activo = e.id === especialidadId;
              return (
                <button
                  key={e.id}
                  onClick={() => elegirEspecialidad(e.id)}
                  className={`card-soft flex shrink-0 items-center gap-3 border-2 p-3 text-left transition-colors ${
                    activo ? "border-primary bg-secondary/60" : "border-transparent"
                  }`}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icono className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block whitespace-nowrap text-sm font-extrabold leading-tight">
                      {e.nombre}
                    </span>
                    <span className="block whitespace-nowrap text-xs text-muted-foreground">
                      {total} {total === 1 ? "profesional" : "profesionales"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {!especialidad ? (
          <div className="card-soft mt-6 flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
            <Stethoscope className="size-8 text-primary" />
            <p className="text-lg font-bold text-foreground">
              Elija una especialidad para ver los médicos disponibles
            </p>
            <p className="max-w-md text-sm">
              Toque una de las especialidades de arriba y le mostraremos a los profesionales que
              atienden, sus días y sus horarios.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            {/* Columna izquierda: lista de médicos */}
            <div className={`card-soft min-w-0 p-4 sm:p-5 ${medico ? "hidden lg:block" : ""}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-extrabold">{especialidad.nombre}</h2>
                <span className="text-sm font-bold text-muted-foreground">
                  {soles(especialidad.precio)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {medicosEsp.length} {medicosEsp.length === 1 ? "profesional" : "profesionales"}{" "}
                disponible{medicosEsp.length === 1 ? "" : "s"}
              </p>
              {especialidad.nota && (
                <p className="mt-2 inline-block rounded-xl bg-warning/25 px-3 py-1.5 text-sm font-bold text-warning-foreground">
                  {especialidad.nota}
                </p>
              )}

              <div className="mt-4 grid gap-3">
                {medicosEsp.length === 0 && (
                  <p className="rounded-xl bg-secondary/70 p-4 text-base">
                    Por ahora no hay profesionales registrados en esta especialidad.
                  </p>
                )}
                {medicosEsp.map((m) => {
                  const activo = m.id === medicoId;
                  return (
                    <button
                      key={m.id}
                      onClick={() => elegirMedico(m)}
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                        activo
                          ? "border-primary bg-secondary/50"
                          : "border-border hover:bg-secondary/40"
                      }`}
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-extrabold text-primary">
                        {iniciales(m.nombre)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-extrabold leading-tight">
                          {m.nombre}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          Atiende: {diasDeMedico(m)}
                        </span>
                        {m.nota && (
                          <span className="mt-0.5 block text-sm font-bold text-primary">
                            {m.nota}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Columna derecha: detalle del médico seleccionado */}
            <div className={`min-w-0 ${medico ? "" : "hidden lg:block"}`}>
              {!medico ? (
                <div className="card-soft flex h-full min-h-[240px] flex-col items-center justify-center gap-2 p-10 text-center text-muted-foreground">
                  <UserRound className="size-8 text-primary" />
                  <p className="text-lg font-bold text-foreground">
                    Elija un médico para ver su horario
                  </p>
                </div>
              ) : (
                <div className="card-soft p-4 sm:p-5 lg:p-6">
                  <button
                    onClick={() => elegirMedico(undefined)}
                    className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline lg:hidden"
                  >
                    <ChevronLeft className="size-4" /> Volver a médicos
                  </button>

                  <div className="mt-2 flex items-center gap-3 sm:gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-extrabold text-primary sm:size-16 sm:text-xl">
                      {iniciales(medico.nombre)}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-xl font-extrabold leading-tight sm:text-2xl">
                        {medico.nombre}
                      </h2>
                      <p className="text-base text-muted-foreground">{especialidad.nombre}</p>
                    </div>
                  </div>

                  <p className="mt-4 flex items-start gap-2 rounded-xl bg-secondary/70 px-3 py-2 text-sm font-bold">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>Atiende: {diasDeMedico(medico)}</span>
                  </p>

                  {/* Horarios semanales */}
                  <h3 className="mt-6 text-lg font-extrabold">Horarios semanales</h3>
                  <div className="mt-2 divide-y divide-border rounded-xl border border-border text-sm">
                    {DIAS_ORDEN.map((dia) => {
                      const horas = [...(medico.agenda?.[dia] ?? [])].sort();
                      return (
                        <div
                          key={dia}
                          className="flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                        >
                          <span className="font-bold">{DIAS_NOMBRE[dia]}</span>
                          {horas.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className="flex flex-wrap gap-x-3 gap-y-1 sm:justify-end">
                              {horas.map((h) => (
                                <span key={h}>{horaLegible(h)}</span>
                              ))}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Selector de fecha */}
                  {fechasDisponibles.length === 0 ? (
                    <p className="mt-6 rounded-xl bg-secondary/70 p-4 text-base">
                      Por ahora no tiene fechas disponibles en los próximos 14 días.
                    </p>
                  ) : (
                    <>
                      <h3 className="mt-6 text-lg font-extrabold">
                        Consultar disponibilidad por fecha
                      </h3>
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {fechasDisponibles.map((f) => {
                          const i = fechas.indexOf(f);
                          const activo = f === fecha;
                          return (
                            <button
                              key={f}
                              onClick={() => setFecha(f)}
                              className={`shrink-0 rounded-xl border-2 px-3 py-2.5 text-center text-sm font-extrabold capitalize transition-colors ${
                                activo
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border hover:bg-secondary"
                              }`}
                            >
                              {i === 0 ? "Hoy" : i === 1 ? "Mañana" : nombreFecha(f)}
                            </button>
                          );
                        })}
                      </div>

                      {horasMedico.length > 0 && (
                        <div className="mt-5">
                          <p className="text-sm font-bold text-muted-foreground">
                            Toque una hora libre para reservarla ·{" "}
                            <span className="capitalize text-foreground">{fechaLarga(fecha)}</span>
                          </p>
                          <div className="mt-3 grid gap-4">
                            <BloqueHoras
                              titulo="Por la mañana"
                              horas={agruparPorTurno(horasMedico).manana}
                              ocupadas={ocupadas}
                              onElegir={elegirHora}
                            />
                            <BloqueHoras
                              titulo="Por la tarde"
                              horas={agruparPorTurno(horasMedico).tarde}
                              ocupadas={ocupadas}
                              onElegir={elegirHora}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <p className="mt-6 flex items-start gap-2 rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                    <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                    {NOTA_GENERAL} Le recomendamos llegar {TOLERANCIA_MIN} minutos antes de su cita.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Seccion>
    </Layout>
  );
}

function BloqueHoras({
  titulo,
  horas,
  ocupadas,
  onElegir,
}: {
  titulo: string;
  horas: string[];
  ocupadas: string[];
  onElegir: (h: string) => void;
}) {
  if (horas.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-extrabold">{titulo}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {horas.map((h) => {
          const tomada = ocupadas.includes(h);
          if (tomada) {
            return (
              <span
                key={h}
                className="flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-border bg-muted px-3 py-2.5 text-muted-foreground"
              >
                <span className="text-base font-extrabold line-through">{horaLegible(h)}</span>
                <span className="text-xs font-bold">No disponible</span>
              </span>
            );
          }
          return (
            <button
              key={h}
              onClick={() => onElegir(h)}
              className="flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-success px-3 py-2.5 transition-colors hover:bg-success/10"
            >
              <span className="text-base font-extrabold">{horaLegible(h)}</span>
              <span className="text-xs font-bold text-success">Disponible</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Fila({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-bold">{v}</dd>
    </div>
  );
}

function Campo({
  label,
  ayuda,
  value,
  onChange,
  ...rest
}: {
  label: string;
  ayuda?: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="grid gap-1.5 text-lg">
      <span className="font-bold">{label}</span>
      {ayuda && <span className="text-base text-muted-foreground">{ayuda}</span>}
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border-2 border-input bg-card px-4 py-4 text-lg outline-none focus:border-ring focus:ring-4 focus:ring-ring/25"
      />
    </label>
  );
}
