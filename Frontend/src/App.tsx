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

  // Helper to pull the latest state from the backend
  // and then bump syncVersion so all pages re-read
  // from localStorage.
  const refreshFromServer = async () => {
    await syncFromServer();
    setSyncVersion((v) => v + 1);
  };

  // On initial load (including a full tab reload),
  // always fetch the latest state from the API and
  // overwrite localStorage with the DB snapshot.
  useEffect(() => {
    void refreshFromServer();
  }, []);

  // Keep multiple tabs/windows in sync by listening for
  // localStorage changes written by other tabs. When any
  // key changes, bump syncVersion so pages re-read state
  // from localStorage (which has already been pushed to
  // the server by the writing tab).
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      setSyncVersion((v) => v + 1);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Also refresh from the server whenever the tab gains
  // focus again, so manual DB edits or changes from other
  // devices are reflected when the user returns.
  useEffect(() => {
    const handleFocus = () => {
      void refreshFromServer();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
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
