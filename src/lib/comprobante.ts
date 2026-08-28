import { jsPDF } from "jspdf";
import logoPoli from "@/assets/logo-policlinico.png";
import {
  DIRECCION,
  POLIFONO,
  POLIFONO_ANEXO,
  TOLERANCIA_MIN,
  fechaLarga,
  horaLegible,
  soles,
  type Cita,
  type Especialidad,
  type Medico,
} from "@/lib/ticketcita";

/** Convierte la imagen importada (URL de Vite) a un data URL para poder
 * incrustarla en el PDF con jsPDF. */
async function imagenADataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = reject;
    lector.readAsDataURL(blob);
  });
}

const ETIQUETA_METODO: Record<Cita["metodoPago"], string> = {
  yape: "Yape (pagado)",
  tarjeta: "Tarjeta (pagado)",
  efectivo: "En caja al llegar",
};

const ETIQUETA_ESTADO: Record<Cita["estado"], string> = {
  pendiente_pago: "Pago pendiente en caja",
  pagada: "Pagada",
  atendida: "Atendida",
  cancelada: "Cancelada",
  liberada: "Cupo liberado (no se llegó a tiempo)",
};

/** Genera el comprobante (bauche) de una cita en PDF y dispara su descarga. */
export async function generarComprobantePDF(
  cita: Cita,
  especialidad: Especialidad,
  medico: Medico,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margenX = 18;
  let y = 20;

  // ---------- Encabezado ----------
  try {
    const logoDataUrl = await imagenADataUrl(logoPoli);
    doc.addImage(logoDataUrl, "PNG", margenX, y - 6, 18, 18);
  } catch {
    // Si el logo no carga (p.ej. sin conexión), el comprobante se genera igual.
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Policlínico Infantil Nuestra Señora del Sagrado Corazón", margenX + 22, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(DIRECCION, margenX + 22, y + 5);
  doc.text(`Polífono ${POLIFONO.join(" / ")} — anexo ${POLIFONO_ANEXO}`, margenX + 22, y + 9.5);
  doc.setTextColor(0);

  y += 20;
  doc.setDrawColor(210);
  doc.line(margenX, y, 210 - margenX, y);
  y += 10;

  // ---------- Título ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    cita.metodoPago === "efectivo" ? "Comprobante de horario reservado" : "Comprobante de pago",
    margenX,
    y,
  );
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Código de reserva: ${cita.codigo}`, margenX, y);
  doc.setTextColor(0);
  y += 12;

  // ---------- Datos de la cita ----------
  const filas: [string, string][] = [
    ["Paciente", cita.pacienteNombre],
    ["DNI", cita.pacienteDni],
    ["Especialidad", especialidad.nombre],
    ["Médico", medico.nombre],
    ["Fecha", fechaLarga(cita.fecha)],
    ["Hora", horaLegible(cita.hora)],
    ["Monto", soles(especialidad.precio)],
    ["Forma de pago", ETIQUETA_METODO[cita.metodoPago]],
    ["Estado", ETIQUETA_ESTADO[cita.estado]],
  ];

  doc.setFontSize(11);
  for (const [etiqueta, valor] of filas) {
    doc.setFont("helvetica", "bold");
    doc.text(`${etiqueta}:`, margenX, y);
    doc.setFont("helvetica", "normal");
    doc.text(valor, margenX + 45, y);
    y += 8;
  }

  y += 4;
  doc.setDrawColor(210);
  doc.line(margenX, y, 210 - margenX, y);
  y += 10;

  // ---------- Notas ----------
  doc.setFontSize(9);
  doc.setTextColor(90);
  const notas =
    cita.metodoPago === "efectivo"
      ? `Llegue puntual: tiene ${TOLERANCIA_MIN} minutos de tolerancia desde la hora de su cita. Pasado ese tiempo el cupo se libera automáticamente y debe reservar de nuevo.`
      : `Le recomendamos llegar ${TOLERANCIA_MIN} minutos antes de su cita. Presente este comprobante (impreso o en su celular) al llegar al policlínico.`;
  const notasLineas = doc.splitTextToSize(notas, 210 - margenX * 2);
  doc.text(notasLineas, margenX, y);

  doc.save(`comprobante-${cita.codigo}.pdf`);
}
