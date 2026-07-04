import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { IncomePage } from '@/components/income/IncomePage';
import { SavingsPage } from '@/components/savings/SavingsPage';
import { InvestmentsPage } from '@/components/investments/InvestmentsPage';
import { RetirementPage } from '@/components/retirement/RetirementPage';
import { GoalsPage } from '@/components/goals/GoalsPage';
import { CreditPage } from '@/components/credit/CreditPage';
import { CreditScorePage } from '@/components/credit-score/CreditScorePage';
import { PlaidPage } from '@/components/plaid/PlaidPage';
import { TransactionsPage } from '@/components/transactions/TransactionsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/"              element={<Dashboard />} />
          <Route path="/income"        element={<IncomePage />} />
          <Route path="/transactions"  element={<TransactionsPage />} />
          <Route path="/savings"       element={<SavingsPage />} />
          <Route path="/investments"   element={<InvestmentsPage />} />
          <Route path="/retirement"    element={<RetirementPage />} />
          <Route path="/goals"         element={<GoalsPage />} />
          <Route path="/credit"        element={<CreditPage />} />
          <Route path="/credit-score"  element={<CreditScorePage />} />
          <Route path="/plaid"         element={<PlaidPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
