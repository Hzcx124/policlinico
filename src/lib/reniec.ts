import { createServerFn } from "@tanstack/react-start";

// Base de la API de consulta RENIEC (Graph Perú - daustinn.com). Se llama
// desde el servidor (server function) para evitar problemas de CORS en el
// navegador. Esta API es gratuita, sin token y sin límite de uso (salvo un
// límite anti-DDOS de 50 consultas/min por IP), por eso no se envía Authorization.
const RENIEC_API_BASE = "https://graphperu.daustinn.com";

export type ResultadoConsultaDni =
  | { ok: true; nombreCompleto: string }
  | { ok: false; mensaje: string };

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/** La API de Graph Perú devuelve el objeto de la persona en la raíz, con
 * campos en PascalCase (FullName, Names, PaternalLastName, MaternalLastName,
 * Surnames). Se arma el nombre completo priorizando "FullName" si viene, y
 * si no, combinando nombres + apellidos. */
function extraerNombreCompleto(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  const j = json as Record<string, unknown>;
  const raiz = (j["data"] ?? j["person"] ?? j) as Record<string, unknown>;

  const directo = texto(raiz["FullName"] ?? raiz["fullName"] ?? raiz["nombre_completo"]);
  if (directo) return directo.replace(/\s+/g, " ").trim();

  const nombres = texto(raiz["Names"] ?? raiz["names"]);
  const apellidos = texto(raiz["Surnames"] ?? raiz["surnames"]);
  if (nombres && apellidos) {
    return `${nombres} ${apellidos}`.replace(/\s+/g, " ").trim();
  }

  const apPaterno = texto(raiz["PaternalLastName"] ?? raiz["paternalLastName"]);
  const apMaterno = texto(raiz["MaternalLastName"] ?? raiz["maternalLastName"]);

  const partes = [nombres, apPaterno, apMaterno].filter(Boolean);
  return partes.join(" ").replace(/\s+/g, " ").trim();
}

/** Consulta el nombre completo de una persona a partir de su DNI (8 dígitos)
 * usando la API de RENIEC. Se usa al reservar una cita para completar
 * automáticamente el nombre del paciente en el comprobante/boleta. */
export const consultarDni = createServerFn({ method: "GET" })
  .validator((dni: unknown) => {
    if (typeof dni !== "string" || !/^\d{8}$/.test(dni)) {
      throw new Error("El DNI debe tener 8 dígitos.");
    }
    return dni;
  })
  .handler(async ({ data: dni }): Promise<ResultadoConsultaDni> => {
    try {
      const respuesta = await fetch(`${RENIEC_API_BASE}/api/query/${dni}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!respuesta.ok) {
        // Log temporal para depurar en la terminal del servidor (bun/npm run dev)
        // por qué falla la consulta. Se puede quitar una vez confirmado que funciona.
        console.error(`[reniec] respuesta no OK: status=${respuesta.status} dni=${dni}`);
        return {
          ok: false,
          mensaje:
            respuesta.status === 404
              ? "No encontramos ese DNI en RENIEC."
              : "No se pudo verificar el DNI en este momento.",
        };
      }

      const json = await respuesta.json();
      const nombreCompleto = extraerNombreCompleto(json);

      if (!nombreCompleto) {
        console.error(`[reniec] no se pudo extraer nombre. json recibido:`, json);
        return { ok: false, mensaje: "No encontramos ese DNI en RENIEC." };
      }

      return { ok: true, nombreCompleto };
    } catch (error) {
      console.error(`[reniec] excepción al consultar DNI ${dni}:`, error);
      return { ok: false, mensaje: "No se pudo verificar el DNI en este momento." };
    }
  });
