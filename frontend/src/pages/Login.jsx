import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ChartColumn,
  FileBarChart2,
  LockKeyhole,
  Mail,
  MonitorUp,
  PencilLine,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import rdtLogo from "../assets/icons/rdt.svg";
import { useAuthStore } from "../store/useAuthStore";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef(null);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let mouseX = -1000;
    let mouseY = -1000;
    let smoothMouseX = -1000;
    let smoothMouseY = -1000;
    let time = 0;

    const spacing = 60;
    const baseRadius = 1.1;
    const pulseRadius = 2.2;
    const maxRadius = 13.5;
    const hoverRadius = 140;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      smoothMouseX += (mouseX - smoothMouseX) * 0.08;
      smoothMouseY += (mouseY - smoothMouseY) * 0.08;

      const gradient = ctx.createRadialGradient(
        canvas.width * 0.18,
        canvas.height * 0.12,
        0,
        canvas.width * 0.18,
        canvas.height * 0.12,
        canvas.width * 0.7,
      );
      gradient.addColorStop(0, "rgba(126, 200, 255, 0.08)");
      gradient.addColorStop(1, "rgba(126, 200, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          const dx = smoothMouseX - x;
          const dy = smoothMouseY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const wave =
            (Math.sin(time * 0.0018 + x * 0.012 + y * 0.008) + 1) / 2;
          let radius = baseRadius + wave * pulseRadius;
          let alpha = 0.24 + wave * 0.28;

          if (distance < hoverRadius) {
            const falloff = 1 - distance / hoverRadius;
            const eased = falloff * falloff * (3 - 2 * falloff);
            radius = radius + (maxRadius - radius) * eased;
            alpha = alpha + 0.42 * eased;
          }

          ctx.fillStyle = `rgba(126, 200, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      time += 1;
      animationFrameId = window.requestAnimationFrame(render);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0b1631] p-4 md:p-6">
      <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,#09152f_0%,#0d1d40_42%,#132857_100%)] shadow-[0_40px_90px_-50px_rgba(0,0,0,0.7)] md:min-h-[calc(100vh-3rem)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(114,176,255,0.22),transparent_32%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_24%)]" />
        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-[rgba(65,108,255,0.18)] blur-3xl" />
        <div className="absolute right-[-80px] bottom-[-120px] h-[300px] w-[300px] rounded-full bg-[rgba(88,166,255,0.14)] blur-3xl" />
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl items-center px-4 py-8 md:min-h-[calc(100vh-3rem)] md:px-8">
          <section className="grid w-full gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="flex max-w-[560px] flex-col gap-8">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-[#c7d8ff]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#76b7ff]" />
                  Secure access
                </div>
              </div>

              <div className="space-y-5">
                <h1 className="text-5xl font-semibold leading-[0.92] tracking-[-0.06em] text-white md:text-6xl">
                  Acceso central
                  <br />
                  <span className="text-[#7ec8ff]">
                    a tu entorno operativo.
                  </span>
                </h1>

                <p className="max-w-xl text-base leading-7 text-[#9fb4d8]">
                  Inicia sesion para acceder a analitica, layouts, HMI y paneles
                  de control desde una entrada mas limpia y profesional.
                </p>
              </div>

              <div className="relative ml-16 w-full max-w-[420px] rounded-[22px] border border-[#d9e0e5] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8f9_100%)] px-6 py-5 text-[#2f3942] shadow-[0_30px_60px_-30px_rgba(31,41,55,0.18)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#255f82]" />
                    <span className="h-2 w-2 rounded-full bg-[#d9e0e5]" />
                    <span className="h-2 w-2 rounded-full bg-[#d9e0e5]" />
                  </div>
                  <div className="flex items-center gap-3 text-[#6f7d89]">
                    <PencilLine className="h-3.5 w-3.5" />
                    <UserRound className="h-4 w-4" />
                  </div>
                </div>

                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#2f3942]">
                  Checklist
                </h2>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#dce3e8] bg-white p-4 text-center shadow-[0_16px_24px_-24px_rgba(31,41,55,0.14)]">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5f8] text-[#255f82]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#2f3942]">
                      Control
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#dce3e8] bg-white p-4 text-center shadow-[0_16px_24px_-24px_rgba(31,41,55,0.14)]">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff8e8] text-[#8f6a18]">
                      <ChartColumn className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#2f3942]">
                      Analitica
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#dce3e8] bg-white p-4 text-center shadow-[0_16px_24px_-24px_rgba(31,41,55,0.14)]">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f2f4f7] text-[#49566f]">
                      <FileBarChart2 className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#2f3942]">
                      Reportes
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#dce3e8] bg-white p-4 text-center shadow-[0_16px_24px_-24px_rgba(31,41,55,0.14)]">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5f8] text-[#255f82]">
                      <MonitorUp className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#2f3942]">
                      HMI
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-6 left-5 flex items-end gap-3 rounded-[20px] border border-[#d9e0e5] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-4 py-3 shadow-[0_20px_40px_-25px_rgba(31,41,55,0.16)]">
                  <div className="h-16 w-16 rounded-full bg-[conic-gradient(#255f82_0_35%,#e9c46a_35%_62%,#b8c7d3_62%_100%)]" />
                  <div className="text-xs text-[#667380]">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#255f82]" />
                      Product BI
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#e9c46a]" />
                      Product HMI
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#b8c7d3]" />
                      Product IIoT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute left-[25%] bottom-[65%] hidden h-40 w-44 rounded-[26px] border border-white/10 bg-white/5 backdrop-blur-sm lg:block" />
              <div className="relative flex w-full max-w-[430px] flex-col items-center">
                <img
                  src={rdtLogo}
                  alt="RDT"
                  className="mb-5 h-14 w-auto brightness-0 invert"
                />
                <article className="relative w-full overflow-hidden rounded-[30px] border border-white/14 bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(235,241,250,0.92)_100%)] p-8 shadow-[0_35px_75px_-35px_rgba(4,10,24,0.7)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),transparent_42%)]" />
                  <div className="absolute inset-y-6 left-0 w-px bg-[#dfe7f2]" />
                  <div className="absolute inset-y-6 right-0 w-px bg-[#dfe7f2]" />
                  <div className="relative z-10">
                    <div className="mx-auto w-fit rounded-full border border-[#d9e0e5] bg-white px-4 py-1 text-xs font-medium uppercase tracking-[0.22em] text-[#5f7487]">
                      Login portal
                    </div>
                    <h2 className="mt-6 text-center text-4xl font-semibold tracking-[-0.05em] text-[#2f3942]">
                      Bienvenido
                    </h2>
                    <p className="mt-3 text-center text-sm leading-6 text-[#667380]">
                      Introduce tus credenciales para continuar.
                    </p>
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-[#4a617f]">
                          Usuario
                        </span>
                        <div className="flex items-center gap-3 rounded-2xl border border-[#d9e0e5] bg-white px-4 py-3 shadow-[0_18px_30px_-28px_rgba(31,41,55,0.16)]">
                          <UserRound className="h-4.5 w-4.5 text-[#6b7681]" />
                          <input
                            type="text"
                            className="w-full bg-transparent text-sm text-[#2f3942] outline-none placeholder:text-[#8f98a3]"
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
                        <div className="flex items-center gap-3 rounded-2xl border border-[#d9e0e5] bg-white px-4 py-3 shadow-[0_18px_30px_-28px_rgba(31,41,55,0.16)]">
                          <LockKeyhole className="h-4.5 w-4.5 text-[#6b7681]" />
                          <input
                            type="password"
                            className="w-full bg-transparent text-sm text-[#2f3942] outline-none placeholder:text-[#8f98a3]"
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
                        className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#194b68] px-5 py-3 text-sm font-medium text-white shadow-[0_18px_30px_-18px_rgba(25,75,104,0.45)] transition-all duration-200 hover:bg-[#215f82] hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#93a6bf] disabled:hover:scale-100"
                      >
                        {isSubmitting ? "Entrando..." : "Entrar"}
                        {!isSubmitting && (
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        )}
                    </button>

                      <p className="pt-2 text-center text-sm text-[#7f90a5]">
                        Necesitas ayuda con tu acceso?
                      </p>
                    </form>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
