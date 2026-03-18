import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { syncFromServer } from "@/lib/store";
import TodayPage from "./pages/TodayPage";
import PlanPage from "./pages/PlanPage";
import AnalysisPage from "./pages/AnalysisPage";
import NotFound from "./pages/NotFound";
import BottomDock from "./components/BottomDock";

const queryClient = new QueryClient();

const App = () => {
  const [syncVersion, setSyncVersion] = useState(0);

  useEffect(() => {
    void (async () => {
      await syncFromServer();
      setSyncVersion((v) => v + 1);
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <div className="max-w-md mx-auto relative min-h-screen">
            <Routes>
              <Route path="/" element={<TodayPage syncVersion={syncVersion} />} />
              <Route path="/plan" element={<PlanPage syncVersion={syncVersion} />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomDock />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
