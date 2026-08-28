import { createServerFn } from "@tanstack/react-start";

import { escribirDatos, leerDatos } from "./datos-persistentes.server";

/** Devuelve los datos guardados en el proyecto (o null si aún no hay). */
export const obtenerDatos = createServerFn({ method: "GET" }).handler(async () => {
  const guardado = await leerDatos();
  return guardado ?? null;
});

/** Guarda el estado completo en el archivo del proyecto. */
export const guardarDatos = createServerFn({ method: "POST" })
  .inputValidator((data: { datos: string }) => {
    if (!data || typeof data !== "object" || typeof data.datos !== "string") {
      throw new Error("Datos inválidos");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const guardado = await escribirDatos(data.datos);
    return { ok: true, actualizadoEn: guardado.actualizadoEn };
  });
