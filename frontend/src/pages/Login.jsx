import React, { useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ChartColumn,
  FileBarChart2,
  LockKeyhole,
  Mail,
  MonitorUp,
  Moon,
  PencilLine,
  ShieldCheck,
  SunMedium,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === "dark";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.post("api/auth/token/", {
        username,
        password,
      });

      setAuth(response.data);
      await fetchCurrentUser();
      navigate("/");
    } catch (err) {
      console.error("Error en login:", err);
      setError("Credenciales invalidas o error de servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen p-4 md:p-6 ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}
    >
      <div
        className={`relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-[28px] md:min-h-[calc(100vh-3rem)] ${
          isDark
            ? "bg-[linear-gradient(160deg,#09152f_0%,#0d1d40_42%,#132857_100%)] shadow-[0_40px_90px_-50px_rgba(0,0,0,0.7)]"
            : "border border-[#ececee] bg-[#fbfbfc] shadow-[0_24px_70px_-42px_rgba(31,41,55,0.12)]"
        }`}
      >
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(circle_at_top_left,rgba(114,176,255,0.22),transparent_32%)]"
              : "bg-[radial-gradient(circle_at_top_left,rgba(196,181,253,0.18),transparent_32%)]"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_24%)]"
              : "bg-[radial-gradient(circle_at_bottom_right,rgba(121,200,241,0.12),transparent_24%)]"
          }`}
        />
        {isDark ? (
          <>
            <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-[rgba(65,108,255,0.18)] blur-3xl" />
            <div className="absolute right-[-80px] bottom-[-120px] h-[300px] w-[300px] rounded-full bg-[rgba(88,166,255,0.14)] blur-3xl" />
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.65)_1px,transparent_1px)] [background-size:72px_72px]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(70,98,128,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(70,98,128,0.8)_1px,transparent_1px)] [background-size:72px_72px]" />
          </>
        )}

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl items-center px-4 py-8 md:min-h-[calc(100vh-3rem)] md:px-8">
          <section className="grid w-full gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="flex max-w-[560px] flex-col gap-8">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] ${
                  isDark
                    ? "border border-white/12 bg-white/6 text-[#c7d8ff]"
                    : "border border-[#e8e9ee] bg-white text-[#7a7e88]"
                }`}
              >
                <ShieldCheck
                  className={`h-3.5 w-3.5 ${isDark ? "text-[#76b7ff]" : "text-[#79c8f1]"}`}
                />
                Secure access
              </div>

              <div className="space-y-5">
                <h1
                  className={`text-5xl font-semibold leading-[0.92] tracking-[-0.06em] md:text-6xl ${
                    isDark ? "text-white" : "text-[#464851]"
                  }`}
                >
                  Acceso central
                  <br />
                  <span
                    className={isDark ? "text-[#7ec8ff]" : "text-[#79c8f1]"}
                  >
                    a tu entorno operativo.
                  </span>
                </h1>

                <p
                  className={`max-w-xl text-base leading-7 ${
                    isDark ? "text-[#9fb4d8]" : "text-[#858b97]"
                  }`}
                >
                  Inicia sesión para acceder a analítica, layouts, HMI y paneles
                  de control desde una entrada más limpia y profesional.
                </p>
              </div>

              <div className="relative w-full max-w-[420px] rounded-[22px] border border-[#dde4ee] bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(235,241,250,0.92)_100%)] px-6 py-5 text-[#16134f] shadow-[0_30px_60px_-30px_rgba(14,31,61,0.38)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#1d3f72]" />
                    <span className="h-2 w-2 rounded-full bg-[#d9e3f0]" />
                    <span className="h-2 w-2 rounded-full bg-[#d9e3f0]" />
                  </div>
                  <div className="flex items-center gap-3 text-[#7b8ea8]">
                    <PencilLine className="h-3.5 w-3.5" />
                    <UserRound className="h-4 w-4" />
                  </div>
                </div>

                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#12284a]">
                  Checklist
                </h2>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#e5ebf3] bg-white p-4 text-center shadow-[0_16px_24px_-24px_rgba(14,31,61,0.18)]">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9f0fa] text-[#365173]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#365173]">
                      Control
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#e5ebf3] bg-white p-4 text-center shadow-[0_16px_24px_-24px_rgba(14,31,61,0.18)]">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef3fb] text-[#365173]">
                      <ChartColumn className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#365173]">
                      Analitica
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#e5ebf3] bg-white p-4 text-center shadow-[0_16px_24px_-24px_rgba(14,31,61,0.18)]">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9f0fa] text-[#365173]">
                      <FileBarChart2 className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#365173]">
                      Reportes
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#e5ebf3] bg-white p-4 text-center shadow-[0_16px_24px_-24px_rgba(14,31,61,0.18)]">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef3fb] text-[#365173]">
                      <MonitorUp className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#365173]">
                      HMI
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-6 left-5 flex items-end gap-3 rounded-[20px] border border-[#dde4ee] bg-[linear-gradient(180deg,#ffffff_0%,#eef3fa_100%)] px-4 py-3 shadow-[0_20px_40px_-25px_rgba(14,31,61,0.28)]">
                  <div className="h-16 w-16 rounded-full bg-[conic-gradient(#1d3f72_0_35%,#76b7ff_35%_62%,#cfe1f5_62%_100%)]" />
                  <div className="text-xs text-[#647892]">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#1d3f72]" />
                      Product BI
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#76b7ff]" />
                      Product HMI
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#cfe1f5]" />
                      Product IIoT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <button
                type="button"
                onClick={toggleTheme}
                className={`absolute right-0 top-0 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isDark
                    ? "border border-white/10 bg-white/6 text-[#d7e4f8] hover:bg-white/10"
                    : "border border-[#ececee] bg-white text-[#555962] hover:bg-[#fafafb]"
                }`}
              >
                {isDark ? (
                  <>
                    <SunMedium className="h-4 w-4" />
                    Modo claro
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    Modo oscuro
                  </>
                )}
              </button>

              <>
                <div
                  className={`absolute right-[4%] top-[10%] hidden h-52 w-52 rounded-[32px] lg:block [animation:floatPanel_8s_ease-in-out_infinite] ${
                    isDark
                      ? "border border-white/10 bg-white/6 backdrop-blur-sm"
                      : "border border-white/70 bg-white/45 shadow-[0_24px_50px_-34px_rgba(31,41,55,0.22)] backdrop-blur-md"
                  }`}
                />
                <div
                  className={`absolute right-[18%] top-[26%] hidden h-36 w-72 rounded-[28px] lg:block [animation:floatPanel_10s_ease-in-out_infinite] ${
                    isDark
                      ? "border border-white/10 bg-white/5 backdrop-blur-sm"
                      : "border border-white/75 bg-[rgba(255,255,255,0.38)] shadow-[0_24px_50px_-34px_rgba(31,41,55,0.18)] backdrop-blur-md"
                  }`}
                />
                <div
                  className={`absolute left-[8%] bottom-[12%] hidden h-40 w-44 rounded-[26px] lg:block [animation:floatPanel_9s_ease-in-out_infinite] ${
                    isDark
                      ? "border border-white/10 bg-white/5 backdrop-blur-sm"
                      : "border border-white/70 bg-[rgba(255,255,255,0.42)] shadow-[0_24px_50px_-34px_rgba(31,41,55,0.2)] backdrop-blur-md"
                  }`}
                />
              </>

              <article
                className={`relative w-full max-w-[430px] overflow-hidden rounded-[30px] p-8 ${
                  isDark
                    ? "border border-white/14 bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(235,241,250,0.92)_100%)] shadow-[0_35px_75px_-35px_rgba(4,10,24,0.7)]"
                    : "border border-[#ececee] bg-white shadow-[0_24px_50px_-34px_rgba(31,41,55,0.15)]"
                }`}
              >
                <div
                  className={`absolute inset-0 ${
                    isDark
                      ? "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),transparent_42%)]"
                      : "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_42%)]"
                  }`}
                />
                <div className="absolute inset-y-6 left-0 w-px bg-[#dfe7f2]" />
                <div className="absolute inset-y-6 right-0 w-px bg-[#dfe7f2]" />

                <div className="relative z-10">
                  <div className="mx-auto w-fit rounded-full border border-[#d9e3f0] bg-white px-4 py-1 text-xs font-medium uppercase tracking-[0.22em] text-[#466280]">
                    Login portal
                  </div>

                  <h2 className="mt-6 text-center text-4xl font-semibold tracking-[-0.05em] text-[#12284a]">
                    Bienvenido
                  </h2>

                  <p className="mt-3 text-center text-sm leading-6 text-[#667b96]">
                    Introduce tus credenciales para continuar.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#4a617f]">
                        Usuario
                      </span>
                      <div className="flex items-center gap-3 rounded-2xl border border-[#dde4ee] bg-white px-4 py-3 shadow-[0_18px_30px_-28px_rgba(14,31,61,0.22)]">
                        <UserRound className="h-4.5 w-4.5 text-[#6a7e98]" />
                        <input
                          type="text"
                          className="w-full bg-transparent text-sm text-[#163150] outline-none placeholder:text-[#97a7bb]"
                          placeholder="Introduce tu usuario"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#4a617f]">
                        Contrasena
                      </span>
                      <div className="flex items-center gap-3 rounded-2xl border border-[#dde4ee] bg-white px-4 py-3 shadow-[0_18px_30px_-28px_rgba(14,31,61,0.22)]">
                        <LockKeyhole className="h-4.5 w-4.5 text-[#6a7e98]" />
                        <input
                          type="password"
                          className="w-full bg-transparent text-sm text-[#163150] outline-none placeholder:text-[#97a7bb]"
                          placeholder="Introduce tu contrasena"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </label>

                    {error && (
                      <div className="rounded-2xl border border-[#f0c8d1] bg-[#fff4f6] px-4 py-3 text-sm text-[#af4761]">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1d3f72] px-5 py-3 text-sm font-medium text-white shadow-[0_18px_30px_-18px_rgba(29,63,114,0.45)] transition hover:bg-[#17345d] disabled:cursor-not-allowed disabled:bg-[#93a6bf]"
                    >
                      {isSubmitting ? "Entrando..." : "Entrar"}
                      {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                    </button>

                    <p className="pt-2 text-center text-sm text-[#7f90a5]">
                      ¿Necesitas ayuda con tu acceso?
                    </p>
                  </form>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
