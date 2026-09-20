import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/layout/Hero';
import { Challenge } from '@/components/layout/Challenge';
import { Footer } from '@/components/layout/Footer';
import { JudgePanel } from '@/components/layout/JudgePanel';
import { TransparencyDialog } from '@/components/layout/TransparencyDialog';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { MapExplorer } from '@/components/map/MapExplorer';
import { ProblemExplorer } from '@/components/action-planner/ProblemExplorer';
import { ActionPlanner } from '@/components/action-planner/ActionPlanner';
import { PortfolioOptimizer } from '@/components/action-planner/PortfolioOptimizer';
import { PlanModal } from '@/components/action-planner/PlanModal';
import { ImpactSimulator } from '@/components/impact-simulator/ImpactSimulator';
import { CommunityBoard } from '@/components/community/CommunityBoard';
import { Evidence } from '@/components/evidence/Evidence';

export default function Page() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Challenge />
        <Dashboard />
        <MapExplorer />
        <ProblemExplorer />
        <ActionPlanner />
        <PortfolioOptimizer />
        <ImpactSimulator />
        <CommunityBoard />
        <Evidence />
      </main>
      <Footer />
      <PlanModal />
      <TransparencyDialog />
      <JudgePanel />
    </>
  );
}
