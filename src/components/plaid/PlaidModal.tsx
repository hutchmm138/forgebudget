import { useStore, useModal } from '@/store/useForgeBudget';
import { PLAID_INSTITUTIONS } from '@/types';
import { Modal } from '@/components/ui/Modal';

export function PlaidModal() {
  const { modal, closeModal } = useModal();
  const connectAccount = useStore((s) => s.connectAccount);
  const isOpen = modal.open === 'plaid';

  function handleConnect(inst: typeof PLAID_INSTITUTIONS[number]) {
    connectAccount(inst);
    closeModal();
  }

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      title="🔗 Connect with Plaid"
      subtitle="Securely link your bank or credit union. Your credentials are never stored by ForgeBudget."
    >
      <div className="space-y-3">
        {PLAID_INSTITUTIONS.map((inst) => (
          <button
            key={inst.id}
            onClick={() => handleConnect(inst)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-150 text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0f1e2e] flex items-center justify-center text-white font-extrabold text-sm shrink-0">
              {inst.abbr}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm group-hover:text-orange-700">{inst.name}</p>
              <p className="text-xs text-slate-400">{inst.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-lg bg-blue-50 ring-1 ring-blue-100 p-3 text-xs text-blue-600">
        This is a fully functional prototype simulation. Real Plaid integration requires API keys and
        a secure server-side token exchange.
      </div>
    </Modal>
  );
}
