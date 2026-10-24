import { useAuth } from "../lib/auth";
import { PageHeader } from "../components/Layout";

export function Profile() {
  const { user, signOut } = useAuth();
  return (
    <>
      <PageHeader title="Perfil" subtitle="Dados da sua conta" />
      <div className="card max-w-md space-y-4 p-6">
        <div>
          <p className="text-sm text-muted">Nome</p>
          <p className="font-medium">{user?.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted">E-mail</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <button className="btn-outline w-full text-red-600" onClick={signOut}>
          Sair da conta
        </button>
      </div>
    </>
  );
}
