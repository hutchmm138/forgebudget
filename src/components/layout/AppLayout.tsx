import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from '@/components/ui/Toast';
import { AllocModal } from '@/components/income/AllocModal';
import { PlaidModal } from '@/components/plaid/PlaidModal';
import { BucketModal } from '@/components/savings/BucketModal';
import { ContribModal } from '@/components/savings/ContribModal';
import { GoalModal } from '@/components/goals/GoalModal';
import { GoalContribModal } from '@/components/goals/GoalContribModal';
import { AddCardModal } from '@/components/credit/AddCardModal';
import { CCPayModal } from '@/components/credit/CCPayModal';

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-7 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* All global modals */}
      <AllocModal />
      <PlaidModal />
      <BucketModal />
      <ContribModal />
      <GoalModal />
      <GoalContribModal />
      <AddCardModal />
      <CCPayModal />

      <ToastContainer />
    </div>
  );
}
