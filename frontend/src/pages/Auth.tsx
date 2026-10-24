import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Q, User, gql } from "../lib/api";
import { useAuth } from "../lib/auth";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});
const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

type Payload = { token: string; user: User };

function Shell({
  title,
  subtitle,
  children,
  cardClassName = "max-w-[22rem] p-6",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  cardClassName?: string;
}) {
  return (
    <div className="auth-page flex min-h-screen flex-col items-center justify-center gap-5 p-4">
      <img src="/logo.png" alt="Financy" className="auth-brand h-8 w-auto" />
      <div className={`auth-card w-full ${cardClassName}`}>
        <h1 className="text-center text-lg font-bold">{title}</h1>
        <p className="mb-6 text-center text-sm text-muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function Login() {
  const { signIn } = useAuth();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (v) => {
    setError("");
    try {
      const d = await gql<{ login: Payload }>(Q.login, v);
      signIn(d.login.token, d.login.user);
    } catch (e) {
      setError((e as Error).message);
    }
  });

  return (
    <Shell title="Fazer login" subtitle="Entre na sua conta para continuar">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label text-xs">E-mail</label>
          <div className="relative">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <input className="input h-10 pl-9 text-xs" type="email" placeholder="mail@exemplo.com" {...register("email")} />
          </div>
          <p className="field-error">{formState.errors.email?.message}</p>
        </div>
        <div>
          <label className="label text-xs">Senha</label>
          <div className="relative">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <input className="input h-10 pl-9 pr-10 text-xs" type={showPassword ? "text" : "password"} placeholder="Digite sua senha" {...register("password")} />
            <button
              type="button"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            </button>
          </div>
          <p className="field-error">{formState.errors.password?.message}</p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <label className="inline-flex items-center gap-1.5 text-muted">
            <input type="checkbox" className="h-3.5 w-3.5 rounded border-line accent-brand-700" />
            Lembrar-me
          </label>
          <button
            type="button"
            onClick={() => setError("A recuperação de senha ainda não está disponível.")}
            className="font-medium text-brand-700 hover:text-brand-600"
          >
            Recuperar senha
          </button>
        </div>
        {error && <p className="field-error">{error}</p>}
        <button className="auth-submit w-full" disabled={formState.isSubmitting}>
          Entrar
        </button>
      </form>
      <div className="auth-divider my-5 flex items-center gap-2 text-xs text-muted">
        <span />
        ou
        <span />
      </div>
      <p className="mb-3 text-center text-xs text-muted">Ainda não tem uma conta?</p>
      <Link to="/register" className="btn-outline w-full">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="10" cy="8" r="4" />
          <path d="M3 21v-2a7 7 0 0 1 11-5.7M19 14v7m-3.5-3.5h7" strokeLinecap="round" />
        </svg>
        Criar conta
      </Link>
    </Shell>
  );
}

export function Register() {
  const { signIn } = useAuth();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async (v) => {
    setError("");
    try {
      const d = await gql<{ register: Payload }>(Q.register, v);
      signIn(d.register.token, d.register.user);
    } catch (e) {
      setError((e as Error).message);
    }
  });

  return (
    <Shell
      title="Criar conta"
      subtitle="Comece a controlar suas finanças ainda hoje"
      cardClassName="max-w-[26rem] p-7"
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label text-sm">Nome completo</label>
          <div className="relative">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
            </svg>
            <input className="input h-11 pl-9 text-sm" placeholder="Seu nome completo" {...register("name")} />
          </div>
          <p className="field-error">{formState.errors.name?.message}</p>
        </div>
        <div>
          <label className="label text-sm">E-mail</label>
          <div className="relative">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <input className="input h-11 pl-9 text-sm" type="email" placeholder="mail@exemplo.com" {...register("email")} />
          </div>
          <p className="field-error">{formState.errors.email?.message}</p>
        </div>
        <div>
          <label className="label text-sm">Senha</label>
          <div className="relative">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <input className="input h-11 pl-9 pr-10 text-sm" type={showPassword ? "text" : "password"} placeholder="Digite sua senha" {...register("password")} />
            <button
              type="button"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">A senha deve ter no mínimo 8 caracteres</p>
          <p className="field-error">{formState.errors.password?.message}</p>
        </div>
        {error && <p className="field-error">{error}</p>}
        <button className="auth-submit mt-1 w-full" disabled={formState.isSubmitting}>
          Cadastrar
        </button>
      </form>
      <div className="auth-divider my-5 flex items-center gap-2 text-xs text-muted">
        <span />
        ou
        <span />
      </div>
      <p className="mb-3 text-center text-sm text-muted">Já tem uma conta?</p>
      <Link to="/" className="btn-outline w-full">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 17l5-5-5-5m5 5H3" />
          <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
        </svg>
        Fazer login
      </Link>
    </Shell>
  );
}
