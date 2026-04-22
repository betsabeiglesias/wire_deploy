import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Mail,
  Shield,
  UserRound,
} from "lucide-react";
import Sidebar from "../modules/sidebar/Sidebar";
import { useAuthStore } from "../store/useAuthStore";
import Header from "../components/ui/Header";
import { Activity, ChartColumnBig, MapPinned, MonitorCog } from "lucide-react";
import HomeButton from "../components/HomeButton";

const formatJoinDate = (value) =>
  new Date(value).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Madrid",
  });

const statusTone = (active) =>
  active
    ? {
        dot: "bg-emerald-500",
        text: "text-emerald-700",
        chip: "bg-emerald-50 border-emerald-200 text-emerald-700",
        label: "ACTIVA",
      }
    : {
        dot: "bg-rose-500",
        text: "text-rose-700",
        chip: "bg-rose-50 border-rose-200 text-rose-700",
        label: "INACTIVA",
      };

export default function UserPage() {
  const { user, loading, error } = useAuthStore();

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
        <Sidebar />
        <main className="flex-1 bg-[#f7f7f8] p-4 md:p-6">
          <div className="flex h-full items-center justify-center rounded-[30px] border border-[#ececee] bg-[#fbfbfc]">
            <p className="text-sm text-[#8f919a] animate-pulse">
              Cargando datos del perfil...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
        <Sidebar />
        <main className="flex-1 bg-[#f7f7f8] p-4 md:p-6">
          <div className="rounded-[30px] border border-rose-200 bg-white p-6 text-rose-700 shadow-[0_20px_40px_-30px_rgba(190,24,93,0.25)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">
              Error
            </p>
            <p className="mt-3 text-2xl font-semibold">
              No se pudo cargar el perfil
            </p>
            <p className="mt-2 text-sm leading-6">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user || !user.date_joined) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
        <Sidebar />
        <main className="flex-1 bg-[#f7f7f8] p-4 md:p-6">
          <div className="rounded-[30px] border border-amber-200 bg-white p-6 text-amber-800 shadow-[0_20px_40px_-30px_rgba(217,119,6,0.22)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">
              Perfil no disponible
            </p>
            <p className="mt-3 text-2xl font-semibold">
              No se han podido recuperar los detalles del perfil
            </p>
            <p className="mt-2 text-sm leading-6">
              Verifica que la sesion no haya expirado.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const accountStatus = statusTone(user.is_active);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#f7f7f8]">
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div className="relative overflow-hidden rounded-[30px] border border-[#ececee] bg-[#fbfbfc] shadow-[0_24px_70px_-42px_rgba(31,41,55,0.12)]">
            
              {/* <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(52,85,112,0.42)_1px,transparent_1px),linear-gradient(90deg,rgba(52,85,112,0.42)_1px,transparent_1px)] [background-size:64px_64px]" /> */}
              <div>
              <Header
                badgeText="User"
                title="Perfil del"
                highlightText="Usuario"
                icon={Activity}
              />{" "}
              <HomeButton/>
              </div>


            <section className="px-6 py-8 md:px-5 md:py-5">
              <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
                <article className="rounded-[28px] border border-[#f0f0f2] bg-white p-6 shadow-[0_20px_40px_-30px_rgba(31,41,55,0.12)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ededf1] bg-[#fbfbfc] text-[#5b606d]">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-[#8f919a]">Datos personales</p>
                      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#3b3d45]">
                        Informacion de acceso
                      </h2>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#f1f2f4] bg-[#fafafb] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#9aa0ac]">
                        Nombre de usuario
                      </p>
                      <p className="mt-3 text-lg font-semibold text-[#33363f]">
                        {user.username}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#f1f2f4] bg-[#fafafb] p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#8b8f99]" />
                        <p className="text-xs uppercase tracking-[0.18em] text-[#9aa0ac]">
                          Email
                        </p>
                      </div>
                      <p className="mt-3 text-lg font-semibold text-[#33363f] break-all">
                        {user.email || "No proporcionado"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#f1f2f4] bg-[#fafafb] p-4 sm:col-span-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-[#8b8f99]" />
                        <p className="text-xs uppercase tracking-[0.18em] text-[#9aa0ac]">
                          Fecha de registro
                        </p>
                      </div>
                      <p className="mt-3 text-lg font-semibold text-[#33363f]">
                        {formatJoinDate(user.date_joined)}
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-[28px] border border-[#f0f0f2] bg-white p-6 shadow-[0_20px_40px_-30px_rgba(31,41,55,0.12)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ededf1] bg-[#fbfbfc] text-[#5b606d]">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-[#8f919a]">
                        Afiliacion industrial
                      </p>
                      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#3b3d45]">
                        Cliente y permisos
                      </h2>
                    </div>
                  </div>

                  {user.client ? (
                    <div className="mt-6 space-y-4">
                      <div className="rounded-2xl border border-[#f1f2f4] bg-[#fafafb] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#9aa0ac]">
                          Empresa / Cliente
                        </p>
                        <p className="mt-3 text-xl font-semibold text-[#33363f]">
                          {user.client.name}
                        </p>
                        <p className="mt-1 text-sm text-[#8b8f99]">
                          ID: {user.client.id}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#f1f2f4] bg-[#fafafb] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#9aa0ac]">
                          Rol industrial
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#dff1ea] bg-[#effaf6] px-4 py-2 text-sm font-semibold text-[#1f7a62]">
                          <BadgeCheck className="h-4 w-4" />
                          {user.client.role_display}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#f1f2f4] bg-[#fafafb] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#9aa0ac]">
                          Estado de cuenta
                        </p>
                        <div
                          className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${accountStatus.chip}`}
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${accountStatus.dot}`}
                          />
                          {accountStatus.label}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-[#f3e8b3] bg-[#fffbea] p-4 text-sm leading-6 text-[#8a6b1f]">
                      No tienes un cliente asignado.
                    </div>
                  )}
                </article>
              </div>

              {(user.is_staff || user.is_superuser) && (
                <section className="mt-6 rounded-[28px] border border-[#f0f0f2] bg-white p-6 shadow-[0_20px_40px_-30px_rgba(31,41,55,0.12)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ededf1] bg-[#fbfbfc] text-[#5b606d]">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-[#8f919a]">
                        Privilegios tecnicos
                      </p>
                      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#3b3d45]">
                        Roles del sistema
                      </h2>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {user.is_staff && (
                      <span className="rounded-full border border-[#dce9ff] bg-[#f3f8ff] px-4 py-2 text-sm font-semibold text-[#3563b8]">
                        Staff IT
                      </span>
                    )}
                    {user.is_superuser && (
                      <span className="rounded-full border border-[#ece0ff] bg-[#f8f3ff] px-4 py-2 text-sm font-semibold text-[#7b4cc7]">
                        Admin Sistema
                      </span>
                    )}
                  </div>
                </section>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
