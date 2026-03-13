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
import { useThemeStore } from "../store/useThemeStore";

const formatJoinDate = (value) =>
  new Date(value).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const statusTone = (active) =>
  active
    ? {
        dot: "bg-emerald-500",
        text: "text-emerald-700",
        chip: "bg-[#eef8f3] border-[#cfe8dd] text-[#1f7a62]",
        label: "ACTIVA",
      }
    : {
        dot: "bg-rose-500",
        text: "text-rose-700",
        chip: "bg-[#fff3f5] border-[#f0c8d1] text-[#af4761]",
        label: "INACTIVA",
      };

export default function UserPage() {
  const { user, loading, error } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === "dark";

  if (loading) {
    return (
      <div className={`flex h-screen w-full overflow-hidden ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
        <Sidebar />
        <main className={`flex-1 p-4 md:p-6 ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
          <div className={`flex h-full items-center justify-center rounded-[30px] ${isDark ? "border border-white/10 bg-[linear-gradient(160deg,#09152f_0%,#0d1d40_42%,#132857_100%)]" : "border border-[#ececee] bg-[#fbfbfc] shadow-[0_24px_70px_-42px_rgba(31,41,55,0.12)]"}`}>
            <p className={`animate-pulse text-sm ${isDark ? "text-[#9fb4d8]" : "text-[#8f919a]"}`}>
              Cargando datos del perfil...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-screen w-full overflow-hidden ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
        <Sidebar />
        <main className={`flex-1 p-4 md:p-6 ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
          <div className="rounded-[30px] border border-[#f0c8d1] bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(235,241,250,0.92)_100%)] p-6 text-[#af4761] shadow-[0_20px_40px_-30px_rgba(14,31,61,0.35)]">
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
      <div className={`flex h-screen w-full overflow-hidden ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
        <Sidebar />
        <main className={`flex-1 p-4 md:p-6 ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
          <div className="rounded-[30px] border border-[#dde4ee] bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(235,241,250,0.92)_100%)] p-6 text-[#4a617f] shadow-[0_20px_40px_-30px_rgba(14,31,61,0.35)]">
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
    <div className={`flex h-screen w-full overflow-hidden ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
      <Sidebar />

      <main className={`flex-1 overflow-y-auto ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div className={`overflow-hidden rounded-[30px] ${isDark ? "border border-white/10 bg-[linear-gradient(160deg,#09152f_0%,#0d1d40_42%,#132857_100%)] shadow-[0_24px_70px_-42px_rgba(0,0,0,0.35)]" : "border border-[#ececee] bg-[#fbfbfc] shadow-[0_24px_70px_-42px_rgba(31,41,55,0.12)]"}`}>
            <section className={`relative px-6 pb-10 pt-8 md:px-10 md:pb-12 ${isDark ? "border-b border-white/10" : "border-b border-[#ececee]"}`}>
              <div className="absolute inset-x-0 top-0 h-[220px]">
                <div className={`absolute left-1/2 top-[12%] h-[260px] w-[560px] -translate-x-1/2 rounded-full ${isDark ? "bg-[radial-gradient(circle,rgba(114,176,255,0.18),transparent_65%)]" : "bg-[radial-gradient(circle,rgba(196,181,253,0.16),transparent_70%)]"}`} />
                <div className={`absolute inset-0 ${isDark ? "opacity-40 [background-image:radial-gradient(#7ec8ff_1px,transparent_1px)] [background-size:8px_8px]" : "opacity-70 [background-image:radial-gradient(#d9cdf7_1px,transparent_1px)] [background-size:8px_8px]"}`} />
              </div>

              <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <h1 className={`mt-7 text-5xl font-semibold leading-[0.96] tracking-[-0.05em] md:text-6xl ${isDark ? "text-white" : "text-[#464851]"}`}>
                    Perfil del
                    <br />
                    <span className={isDark ? "text-[#7ec8ff]" : "text-[#79c8f1]"}>Usuario.</span>
                  </h1>
                </div>
              </div>
            </section>

            <section className="px-6 py-8 md:px-5 md:py-5">
              <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
                <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(235,241,250,0.92)_100%)] p-6 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#dde4ee] bg-white text-[#1d3f72]">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-[#7f90a5]">Datos personales</p>
                      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#12284a]">
                        Informacion de acceso
                      </h2>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#e5ebf3] bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#8da0ba]">
                        Nombre de usuario
                      </p>
                      <p className="mt-3 text-lg font-semibold text-[#163150]">
                        {user.username}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#e5ebf3] bg-white p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#6a7e98]" />
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8da0ba]">
                          Email
                        </p>
                      </div>
                      <p className="mt-3 text-lg font-semibold text-[#163150] break-all">
                        {user.email || "No proporcionado"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#e5ebf3] bg-white p-4 sm:col-span-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-[#6a7e98]" />
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8da0ba]">
                          Fecha de registro
                        </p>
                      </div>
                      <p className="mt-3 text-lg font-semibold text-[#163150]">
                        {formatJoinDate(user.date_joined)}
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(235,241,250,0.92)_100%)] p-6 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#dde4ee] bg-white text-[#1d3f72]">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-[#7f90a5]">
                        Afiliacion industrial
                      </p>
                      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#12284a]">
                        Cliente y permisos
                      </h2>
                    </div>
                  </div>

                  {user.client ? (
                    <div className="mt-6 space-y-4">
                      <div className="rounded-2xl border border-[#e5ebf3] bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8da0ba]">
                          Empresa / Cliente
                        </p>
                        <p className="mt-3 text-xl font-semibold text-[#163150]">
                          {user.client.name}
                        </p>
                        <p className="mt-1 text-sm text-[#6a7e98]">
                          ID: {user.client.id}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#e5ebf3] bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8da0ba]">
                          Rol industrial
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#d9e3f0] bg-[#eef3fa] px-4 py-2 text-sm font-semibold text-[#1d3f72]">
                          <BadgeCheck className="h-4 w-4" />
                          {user.client.role_display}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#e5ebf3] bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8da0ba]">
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
                    <div className="mt-6 rounded-2xl border border-[#dde4ee] bg-[#eef3fa] p-4 text-sm leading-6 text-[#4a617f]">
                      No tienes un cliente asignado.
                    </div>
                  )}
                </article>
              </div>

              {(user.is_staff || user.is_superuser) && (
                <section className="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(235,241,250,0.92)_100%)] p-6 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#dde4ee] bg-white text-[#1d3f72]">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-[#7f90a5]">
                        Privilegios tecnicos
                      </p>
                      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#12284a]">
                        Roles del sistema
                      </h2>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {user.is_staff && (
                      <span className="rounded-full border border-[#d9e3f0] bg-[#eef3fa] px-4 py-2 text-sm font-semibold text-[#1d3f72]">
                        Staff IT
                      </span>
                    )}
                    {user.is_superuser && (
                      <span className="rounded-full border border-[#d9e3f0] bg-[#eef3fa] px-4 py-2 text-sm font-semibold text-[#4054e8]">
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
