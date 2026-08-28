import { Link, useRouter } from "@tanstack/react-router";
import { CalendarPlus, Facebook, LogIn, LogOut, MapPin, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import logoPoli from "@/assets/logo-policlinico.png";
import {
  DIRECCION,
  FACEBOOK_URL,
  MAPS_COMO_LLEGAR,
  POLIFONO,
  POLIFONO_ANEXO,
  set,
  useEstado,
  WHATSAPP_URL,
} from "@/lib/ticketcita";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24Zm-4.53 4.6c-.16 0-.42.06-.64.31-.22.24-.85.83-.85 2.03 0 1.2.87 2.35.99 2.51.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.09.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42h-.47Z" />
    </svg>
  );
}

const navBase = [
  { to: "/", label: "Inicio" },
  { to: "/horarios", label: "Ver horarios" },
  { to: "/ubicacion", label: "Ubicación" },
  { to: "/panel", label: "Recepción" },
] as const;
export function Layout({ children }: { children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const { sesion } = useEstado();
  const router = useRouter();

  const nav = navBase;

  function salir() {
    set((e) => ({ ...e, sesion: null }));
    router.navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoPoli}
              alt="Logo del Policlínico Infantil Nuestra Señora del Sagrado Corazón"
              width={40}
              height={40}
              className="size-10 shrink-0 object-contain"
            />
            <span className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight">TicketCita</span>
              <span className="block text-[11px] text-muted-foreground">
                Policlínico Infantil N. S. del Sagrado Corazón
              </span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-2">
            {sesion ? (
              <button
                onClick={salir}
                className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-secondary sm:flex"
              >
                <LogOut className="size-4" />
                Salir de Recepción
              </button>
            ) : (
              <Link
                to="/ingresar"
                className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-secondary sm:flex"
              >
                <LogIn className="size-4" />
                Personal
              </Link>
            )}
            <Link
              to="/horarios"
              search={{ esp: undefined, med: undefined, fecha: undefined, hora: undefined }}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
            >
              <CalendarPlus className="size-4" />
              <span className="hidden xs:inline sm:inline">Reservar</span>
            </Link>
            <button
              className="rounded-lg border border-border p-2 md:hidden"
              onClick={() => setAbierto((v) => !v)}
              aria-label="Menú"
            >
              {abierto ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {abierto && (
          <nav className="grid gap-1 border-t border-border px-4 py-3 md:hidden">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setAbierto(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            {sesion ? (
              <button
                onClick={() => {
                  setAbierto(false);
                  salir();
                }}
                className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-muted-foreground hover:bg-secondary"
              >
                Salir de Recepción
              </button>
            ) : (
              <Link
                to="/ingresar"
                onClick={() => setAbierto(false)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
              >
                <LogIn className="size-4" />
                Personal
              </Link>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <img
                src={logoPoli}
                alt="Logo del Policlínico Infantil Nuestra Señora del Sagrado Corazón"
                width={36}
                height={36}
                loading="lazy"
                className="size-9 object-contain"
              />
              <p className="text-sm font-extrabold">Policlínico Infantil</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Nuestra Señora del Sagrado Corazón</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Categoría I-3 · MINSA / DISA Lima Este
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
          <div className="text-sm text-muted-foreground">
            <p className="font-bold text-foreground">Dirección</p>
            <p>{DIRECCION}</p>
            <a
              href={MAPS_COMO_LLEGAR}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-secondary"
            >
              <MapPin className="size-4" />
              Cómo llegar
            </a>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-bold text-foreground">Atención</p>
            <p>Lunes a sábado, 8:00 a. m. – 8:00 p. m.</p>
            <p className="mt-1 text-xs">Tolerancia de llegada: 15 minutos</p>
            <p className="mt-2">
              Polífono {POLIFONO.join(" / ")} — anexo {POLIFONO_ANEXO}
            </p>
          </div>
        </div>
        <div className="bg-primary py-3 text-center text-xs font-semibold text-primary-foreground">
          © {new Date().getFullYear()} Policlínico Infantil Nuestra Señora del Sagrado Corazón.
          Todos los derechos reservados.
          {" · "}
          <Link to="/politica-privacidad" className="underline underline-offset-2 hover:opacity-90">
            Política de privacidad
          </Link>
        </div>
      </footer>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        title="Escríbenos por WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <WhatsAppIcon className="size-7" />
      </a>
    </div>
  );
}

export function Seccion({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-4 ${className}`}>
      {children}
    </section>
  );
}
