import { createFileRoute } from "@tanstack/react-router";
import { Clock, Facebook, MapPin, Navigation, Phone, Eye } from "lucide-react";
import { Layout, Seccion } from "@/components/Layout";
import {
  COORDS,
  DIRECCION,
  FACEBOOK_URL,
  MAPS_COMO_LLEGAR,
  MAPS_EMBED_URL,
  MAPS_URL,
  POLIFONO,
  POLIFONO_ANEXO,
  STREET_VIEW_URL,
} from "@/lib/ticketcita";

export const Route = createFileRoute("/ubicacion")({
  head: () => ({
    meta: [
      { title: "Ubicación y horarios | Policlínico Infantil — TicketCita" },
      {
        name: "description",
        content:
          "Av. Alfonso Ugarte con Av. Esperanza, San Gregorio, Ate, Lima. Atención de 8:00 a. m. a 8:00 p. m. Cómo llegar al Policlínico Infantil Nuestra Señora del Sagrado Corazón.",
      },
      { property: "og:title", content: "Ubicación y horarios | Policlínico Infantil" },
      {
        property: "og:description",
        content: "Encuéntranos en San Gregorio, Ate — Lima. Atención 8:00 a. m. a 8:00 p. m.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/ubicacion" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/ubicacion" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalClinic",
          name: "Policlínico Infantil Nuestra Señora del Sagrado Corazón",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Av. Alfonso Ugarte con Av. Esperanza, San Gregorio",
            addressLocality: "Ate",
            addressRegion: "Lima",
            addressCountry: "PE",
          },
          geo: { "@type": "GeoCoordinates", latitude: COORDS.lat, longitude: COORDS.lng },
          telephone: POLIFONO.map((t) => `+51-1-${t}`),
          sameAs: [FACEBOOK_URL],
          openingHours: "Mo-Sa 08:00-20:00",
        }),
      },
    ],
  }),
  component: Ubicacion,
});

function Ubicacion() {
  return (
    <Layout>
      <Seccion className="py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Ubicación y horarios</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Estamos en {DIRECCION}. Puedes abrir la ruta en Google Maps o mirar la fachada en Street
          View antes de venir.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="grid gap-4">
            <div className="card-soft p-5">
              <MapPin className="size-6 text-primary" />
              <p className="mt-2 font-extrabold">Dirección</p>
              <p className="text-sm text-muted-foreground">{DIRECCION}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={MAPS_COMO_LLEGAR}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
                >
                  <Navigation className="size-4" />
                  Cómo llegar
                </a>
                <a
                  href={STREET_VIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold transition-colors hover:bg-secondary"
                >
                  <Eye className="size-4" />
                  Ver en Street View
                </a>
              </div>
            </div>

            <div className="card-soft p-5">
              <Clock className="size-6 text-primary" />
              <p className="mt-2 font-extrabold">Horario de atención</p>
              <p className="text-sm text-muted-foreground">
                Lunes a sábado, 8:00 a. m. – 8:00 p. m.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tolerancia de llegada: 15 minutos.
              </p>
            </div>

            <div className="card-soft p-5">
              <Phone className="size-6 text-primary" />
              <p className="mt-2 font-extrabold">Contacto</p>
              <p className="text-sm text-muted-foreground">
                Polífono {POLIFONO.join(" / ")} — anexo {POLIFONO_ANEXO}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Recepción del policlínico · Categoría I-3 (MINSA / DISA Lima Este)
              </p>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold transition-colors hover:bg-secondary"
              >
                <Facebook className="size-4" />
                Facebook oficial
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="card-soft overflow-hidden">
              <iframe
                title="Mapa del Policlínico Infantil en San Gregorio, Ate"
                className="h-[420px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={MAPS_EMBED_URL}
              />
            </div>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Abrir ubicación exacta en Google Maps ({COORDS.lat}, {COORDS.lng})
            </a>
          </div>
        </div>
      </Seccion>
    </Layout>
  );
}
