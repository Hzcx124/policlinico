import { promises as fs } from "fs";
import path from "path";

/**
 * Persistencia en el propio proyecto.
 *
 * Los cambios que hace recepción (horarios de los médicos, especialidades,
 * pacientes y citas) se guardan en `data/ticketcita.json`, dentro de la
 * carpeta del proyecto. Así siguen ahí aunque cierres el proyecto, cambies
 * de navegador o borres el caché.
 */

const CARPETA = path.join(process.cwd(), "data");
const ARCHIVO = path.join(CARPETA, "ticketcita.json");

export type DatosGuardados = {
  version: number;
  actualizadoEn: number;
  /** Estado serializado en JSON (especialidades, medicos, pacientes, citas). */
  datos: string;
};

export async function leerDatos(): Promise<DatosGuardados | null> {
  try {
    const raw = await fs.readFile(ARCHIVO, "utf8");
    const parsed = JSON.parse(raw) as { version?: number; actualizadoEn?: number; datos?: unknown };
    if (!parsed || typeof parsed !== "object" || parsed.datos === undefined) return null;
    return {
      version: parsed.version ?? 1,
      actualizadoEn: parsed.actualizadoEn ?? 0,
      datos: typeof parsed.datos === "string" ? parsed.datos : JSON.stringify(parsed.datos),
    };
  } catch {
    // Todavía no existe el archivo (primera vez) o está dañado.
    return null;
  }
}

export async function escribirDatos(datos: string): Promise<DatosGuardados> {
  const contenido: DatosGuardados = {
    version: 1,
    actualizadoEn: Date.now(),
    datos,
  };
  await fs.mkdir(CARPETA, { recursive: true });
  // Se guarda legible: el JSON del estado va expandido dentro del archivo.
  await fs.writeFile(
    ARCHIVO,
    JSON.stringify(
      { version: contenido.version, actualizadoEn: contenido.actualizadoEn, datos: JSON.parse(datos) },
      null,
      2,
    ),
    "utf8",
  );
  return contenido;
}
