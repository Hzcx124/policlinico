import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Layout, Seccion } from "@/components/Layout";
import { set } from "@/lib/ticketcita";

export const Route = createFileRoute("/ingresar")({
  head: () => ({
    meta: [
      { title: "Acceso del personal | TicketCita" },
      {
        name: "description",
        content: "Acceso interno de Recepción del Policlínico Infantil para gestionar la agenda.",
      },
      { property: "og:title", content: "Acceso del personal | TicketCita" },
      {
        property: "og:description",
        content: "Ingreso del personal de Recepción al panel de citas del policlínico.",
      },
    ],
  }),
  component: Ingresar,
});

function Ingresar() {
  const router = useRouter();

  return (
    <Layout>
      <Seccion className="py-14">
        <div className="card-soft mx-auto max-w-md p-6">
          <h1 className="text-2xl font-extrabold">Acceso del personal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Los pacientes no necesitan cuenta: para reservar solo se pide el DNI.
          </p>
          <button
            onClick={() => {
              set((e) => ({ ...e, sesion: { rol: "recepcion" } }));
              router.navigate({ to: "/panel" });
            }}
            className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground"
          >
            Entrar como Recepción
          </button>
        </div>
      </Seccion>
    </Layout>
  );
}
