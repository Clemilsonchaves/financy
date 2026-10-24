import type { ReactNode } from "react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="card w-full max-w-md p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-muted hover:text-ink">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Confirm({
  message,
  onConfirm,
  onClose,
  loading,
}: {
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}) {
  return (
    <Modal title="Confirmar exclusão" onClose={onClose}>
      <p className="mb-6 text-sm text-muted">{message}</p>
      <div className="flex justify-end gap-2">
        <button className="btn-outline" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="btn bg-red-600 text-white hover:bg-red-700"
          onClick={onConfirm}
          disabled={loading}
        >
          Excluir
        </button>
      </div>
    </Modal>
  );
}
