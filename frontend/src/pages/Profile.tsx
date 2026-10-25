import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut, Mail, User as UserIcon } from "lucide-react";
import { Q, User, gql } from "../lib/api";
import { useAuth } from "../lib/auth";

const schema = z.object({ name: z.string().trim().min(2, "Informe seu nome") });
type Form = z.infer<typeof schema>;

export function Profile() {
  const { user, updateUser, signOut } = useAuth();
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const { register, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? "" },
  });

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onSubmit = handleSubmit(async (v) => {
    setMessage(null);
    try {
      const d = await gql<{ updateProfile: User }>(Q.updateProfile, v);
      updateUser(d.updateProfile);
      setMessage({ text: "Alterações salvas com sucesso." });
    } catch (e) {
      setMessage({ text: (e as Error).message, error: true });
    }
  });

  return (
    <div className="auth-card mx-auto mt-2 w-full max-w-[24.75rem] p-7">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-300 text-xl font-medium text-ink">
          {initials}
        </span>
        <h1 className="mt-4 text-lg font-bold">{user?.name}</h1>
        <p className="text-sm text-muted">{user?.email}</p>
      </div>
      <hr className="my-6 border-line" />
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label text-xs">Nome completo</label>
          <div className="relative">
            <UserIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink" />
            <input className="input h-10 pl-9 text-sm" {...register("name")} />
          </div>
          <p className="field-error">{formState.errors.name?.message}</p>
        </div>
        <div>
          <label className="label text-xs">E-mail</label>
          <div className="relative">
            <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input h-10 cursor-not-allowed bg-gray-50 pl-9 text-sm text-muted"
              value={user?.email ?? ""}
              readOnly
              disabled
            />
          </div>
          <p className="mt-1 text-[11px] text-muted">O e-mail não pode ser alterado</p>
        </div>
        {message && <p className={message.error ? "field-error" : "text-xs text-brand-700"}>{message.text}</p>}
        <button className="auth-submit mt-2 w-full" disabled={formState.isSubmitting}>
          Salvar alterações
        </button>
        <button type="button" className="btn-outline h-10 w-full" onClick={signOut}>
          <LogOut size={15} className="text-red-500" />
          Sair da conta
        </button>
      </form>
    </div>
  );
}
