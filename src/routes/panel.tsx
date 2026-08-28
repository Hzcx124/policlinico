import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Layout, Seccion } from "@/components/Layout";
import {
  DIAS_NOMBRE,
  HORARIO,
  diasDeMedico,
  etiquetaEstado,
  fechaLarga,
  fechasProximas,
  liberarVencidas,
  nombreFecha,
  set,
  soles,
  useEstado,
  type Agenda,
  type EstadoCita,
  type Medico,
} from "@/lib/ticketcita";

// Lunes a domingo, más fácil de leer para recepción que domingo-primero.
const DIAS_ORDEN = [1, 2, 3, 4, 5, 6, 0];

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Panel de recepción | TicketCita" },
      {
        name: "description",
        content:
          "Agenda completa del policlínico: confirma pagos en caja, reprograma, cancela y administra especialidades y médicos.",
      },
      { property: "og:title", content: "Panel de recepción | TicketCita" },
      {
        property: "og:description",
        content: "Control total de la agenda, pagos y cupos del policlínico.",
      },
    ],
  }),
  component: Panel,
});

const colorEstado: Record<EstadoCita, string> = {
  pendiente_pago: "bg-warning/25 text-warning-foreground",
  pagada: "bg-success/20 text-success",
  atendida: "bg-secondary text-secondary-foreground",
  cancelada: "bg-destructive/15 text-destructive",
  liberada: "bg-destructive/15 text-destructive",
};

const fechas = fechasProximas(14);

function Panel() {
  const estado = useEstado();
  const [fecha, setFecha] = useState(fechas[0] ?? "");
  const [espFiltro, setEspFiltro] = useState("todas");
  const [nuevaEsp, setNuevaEsp] = useState({ nombre: "", precio: "30" });
  const [nuevoMed, setNuevoMed] = useState({ nombre: "", especialidadId: "", cmp: "" });
  const [medExpandido, setMedExpandido] = useState<string | null>(null);

  useEffect(() => {
    liberarVencidas();
    const t = setInterval(liberarVencidas, 30_000);
    return () => clearInterval(t);
  }, []);

  if (estado.sesion?.rol !== "recepcion") {
    return (
      <Layout>
        <Seccion className="py-16 text-center">
          <h1 className="text-2xl font-extrabold">Panel de recepción</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Necesitas acceso de recepción para entrar.
          </p>
          <Link
            to="/ingresar"
            className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground"
          >
            Ir al acceso del personal
          </Link>
        </Seccion>
      </Layout>
    );
  }

  const citas = estado.citas
    .filter((c) => c.fecha === fecha)
    .filter((c) => espFiltro === "todas" || c.especialidadId === espFiltro)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const ingresos = citas
    .filter((c) => c.estado === "pagada" || c.estado === "atendida")
    .reduce(
      (s, c) => s + (estado.especialidades.find((e) => e.id === c.especialidadId)?.precio ?? 0),
      0,
    );

  function actualizar(id: string, cambios: Partial<{ estado: EstadoCita; hora: string }>) {
    set((e) => ({ ...e, citas: e.citas.map((c) => (c.id === id ? { ...c, ...cambios } : c)) }));
  }

  /** Marca/desmarca una hora en un día específico dentro de la agenda de un médico. */
  function toggleHoraMedico(medicoId: string, dia: number, hora: string) {
    set((s) => ({
      ...s,
      medicos: s.medicos.map((m) => {
        if (m.id !== medicoId) return m;
        const agendaActual: Agenda = m.agenda ?? {};
        const horasDia = agendaActual[dia] ?? [];
        const tiene = horasDia.includes(hora);
        const nuevasHoras = tiene
          ? horasDia.filter((h) => h !== hora)
          : [...horasDia, hora].sort();
        return { ...m, agenda: { ...agendaActual, [dia]: nuevasHoras } };
      }),
    }));
  }

  /** Marca/desmarca todas las horas de un día de una sola vez. */
  function toggleDiaCompleto(medicoId: string, dia: number) {
    set((s) => ({
      ...s,
      medicos: s.medicos.map((m) => {
        if (m.id !== medicoId) return m;
        const agendaActual: Agenda = m.agenda ?? {};
        const horasDia = agendaActual[dia] ?? [];
        const completo = horasDia.length === HORARIO.length;
        return { ...m, agenda: { ...agendaActual, [dia]: completo ? [] : [...HORARIO] } };
      }),
    }));
  }

  return (
    <Layout>
      <Seccion className="py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Panel de recepción</h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{fechaLarga(fecha)}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Kpi t="Citas del día" v={String(citas.length)} />
          <Kpi
            t="Pago pendiente"
            v={String(citas.filter((c) => c.estado === "pendiente_pago").length)}
          />
          <Kpi
            t="Cupos liberados"
            v={String(citas.filter((c) => c.estado === "liberada").length)}
          />
          <Kpi t="Cobrado" v={soles(ingresos)} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 pb-1">
            {fechas.map((f) => (
              <button
                key={f}
                onClick={() => setFecha(f)}
                className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold capitalize ${
                  f === fecha
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {nombreFecha(f)}
              </button>
            ))}
          </div>
          <select
            value={espFiltro}
            onChange={(e) => setEspFiltro(e.target.value)}
            className="rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold"
          >
            <option value="todas">Todas las especialidades</option>
            {estado.especialidades.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="card-soft mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Hora</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Especialidad / Médico</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No hay citas para esta fecha.
                  </td>
                </tr>
              )}
              {citas.map((c) => {
                const esp = estado.especialidades.find((e) => e.id === c.especialidadId);
                const med = estado.medicos.find((m) => m.id === c.medicoId);
                return (
                  <tr key={c.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-extrabold">{c.hora}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold">{c.pacienteNombre}</p>
                      <p className="text-xs text-muted-foreground">
                        DNI {c.pacienteDni} · {c.codigo}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{esp?.nombre}</p>
                      <p className="text-xs text-muted-foreground">{med?.nombre}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="capitalize">{c.metodoPago}</p>
                      <p className="text-xs text-muted-foreground">{soles(esp?.precio ?? 0)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${colorEstado[c.estado]}`}
                      >
                        {etiquetaEstado(c.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {c.estado === "pendiente_pago" && (
                          <Accion onClick={() => actualizar(c.id, { estado: "pagada" })}>
                            Confirmar pago
                          </Accion>
                        )}
                        {c.estado === "pagada" && (
                          <Accion onClick={() => actualizar(c.id, { estado: "atendida" })}>
                            Marcar atendida
                          </Accion>
                        )}
                        {!["cancelada", "liberada", "atendida"].includes(c.estado) && (
                          <>
                            <select
                              value={c.hora}
                              onChange={(e) => actualizar(c.id, { hora: e.target.value })}
                              className="rounded-lg border border-input bg-card px-2 py-1 text-xs font-semibold"
                            >
                              {HORARIO.map((h) => (
                                <option key={h} value={h}>
                                  Reprogramar {h}
                                </option>
                              ))}
                            </select>
                            <Accion onClick={() => actualizar(c.id, { estado: "cancelada" })}>
                              Cancelar
                            </Accion>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="card-soft p-5">
            <h2 className="text-lg font-extrabold">Especialidades</h2>
            <ul className="mt-3 grid gap-2">
              {estado.especialidades.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2 text-sm"
                >
                  <span className="font-semibold">{e.nombre}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{soles(e.precio)}</span>
                    <button
                      aria-label={`Eliminar ${e.nombre}`}
                      onClick={() =>
                        set((s) => ({
                          ...s,
                          especialidades: s.especialidades.filter((x) => x.id !== e.id),
                          medicos: s.medicos.filter((m) => m.especialidadId !== e.id),
                        }))
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                placeholder="Nueva especialidad"
                value={nuevaEsp.nombre}
                onChange={(e) => setNuevaEsp({ ...nuevaEsp, nombre: e.target.value })}
                className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm"
              />
              <input
                placeholder="Precio"
                inputMode="numeric"
                value={nuevaEsp.precio}
                onChange={(e) => setNuevaEsp({ ...nuevaEsp, precio: e.target.value })}
                className="w-24 rounded-lg border border-input bg-card px-3 py-2 text-sm"
              />
              <button
                onClick={() => {
                  if (!nuevaEsp.nombre.trim()) return;
                  set((s) => ({
                    ...s,
                    especialidades: [
                      ...s.especialidades,
                      {
                        id: crypto.randomUUID(),
                        nombre: nuevaEsp.nombre.trim(),
                        descripcion: "Servicio del policlínico.",
                        atiende: "Consulte en recepción los detalles de esta especialidad.",
                        icono: "stethoscope",
                        precio: Number(nuevaEsp.precio) || 0,
                        categoria: "Apoyo y Bienestar",
                      },
                    ],
                  }));
                  setNuevaEsp({ nombre: "", precio: "30" });
                }}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"
              >
                <Plus className="size-4" /> Añadir
              </button>
            </div>
          </div>

          <div className="card-soft p-5">
            <h2 className="text-lg font-extrabold">Médicos y profesionales</h2>
            <ul className="mt-3 grid max-h-[28rem] gap-2 overflow-y-auto">
              {estado.medicos.map((m) => {
                const abierto = medExpandido === m.id;
                return (
                  <li key={m.id} className="rounded-lg bg-secondary/60 text-sm">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span>
                        <span className="font-semibold">{m.nombre}</span>
                        <span className="block text-xs text-muted-foreground">
                          {estado.especialidades.find((e) => e.id === m.especialidadId)?.nombre} ·{" "}
                          {m.cmp}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {diasDeMedico(m)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <button
                          aria-label={`Editar horario de ${m.nombre}`}
                          onClick={() => setMedExpandido(abierto ? null : m.id)}
                          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-bold hover:bg-secondary"
                        >
                          Horario {abierto ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </button>
                        <button
                          aria-label={`Eliminar ${m.nombre}`}
                          onClick={() =>
                            set((s) => ({ ...s, medicos: s.medicos.filter((x) => x.id !== m.id) }))
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </span>
                    </div>
                    {abierto && (
                      <EditorHorario
                        medico={m}
                        onToggleHora={toggleHoraMedico}
                        onToggleDia={toggleDiaCompleto}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                placeholder="Nombre del profesional"
                value={nuevoMed.nombre}
                onChange={(e) => setNuevoMed({ ...nuevoMed, nombre: e.target.value })}
                className="rounded-lg border border-input bg-card px-3 py-2 text-sm"
              />
              <input
                placeholder="Colegiatura (CMP)"
                value={nuevoMed.cmp}
                onChange={(e) => setNuevoMed({ ...nuevoMed, cmp: e.target.value })}
                className="rounded-lg border border-input bg-card px-3 py-2 text-sm"
              />
              <select
                value={nuevoMed.especialidadId}
                onChange={(e) => setNuevoMed({ ...nuevoMed, especialidadId: e.target.value })}
                className="rounded-lg border border-input bg-card px-3 py-2 text-sm"
              >
                <option value="">Especialidad…</option>
                {estado.especialidades.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (!nuevoMed.nombre.trim() || !nuevoMed.especialidadId) return;
                  set((s) => ({
                    ...s,
                    medicos: [
                      ...s.medicos,
                      {
                        id: crypto.randomUUID(),
                        nombre: nuevoMed.nombre.trim(),
                        especialidadId: nuevoMed.especialidadId,
                        cmp: nuevoMed.cmp || "—",
                      },
                    ],
                  }));
                  setNuevoMed({ nombre: "", especialidadId: "", cmp: "" });
                }}
                className="flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"
              >
                <Plus className="size-4" /> Añadir médico
              </button>
            </div>
          </div>
        </div>
      </Seccion>
    </Layout>
  );
}

function Kpi({ t, v }: { t: string; v: string }) {
  return (
    <div className="card-soft p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t}</p>
      <p className="mt-1 text-2xl font-extrabold">{v}</p>
    </div>
  );
}

function EditorHorario({
  medico,
  onToggleHora,
  onToggleDia,
}: {
  medico: Medico;
  onToggleHora: (medicoId: string, dia: number, hora: string) => void;
  onToggleDia: (medicoId: string, dia: number) => void;
}) {
  const agenda = medico.agenda ?? {};

  return (
    <div className="border-t border-border/70 px-3 py-3">
      <p className="mb-2 text-xs text-muted-foreground">
        Marca las horas en las que {medico.nombre} atiende cada día.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {DIAS_ORDEN.map((dia) => {
          const horasDia = agenda[dia] ?? [];
          const completo = horasDia.length === HORARIO.length;
          return (
            <div key={dia} className="rounded-lg border border-border bg-card p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold">{DIAS_NOMBRE[dia]}</span>
                <button
                  onClick={() => onToggleDia(medico.id, dia)}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  {completo ? "Quitar todo" : "Marcar todo"}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {HORARIO.map((h) => {
                  const activa = horasDia.includes(h);
                  return (
                    <button
                      key={h}
                      onClick={() => onToggleHora(medico.id, dia, h)}
                      className={`rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${
                        activa
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Accion({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold hover:bg-secondary"
    >
      {children}
    </button>
  );
}
