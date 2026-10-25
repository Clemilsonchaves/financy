import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[26rem] rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">{title}</h2>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-ink hover:bg-gray-50"
          >
            <X size={15} />
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
