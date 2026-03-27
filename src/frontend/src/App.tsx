import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { DollarSign, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import CollectionsPage from "./pages/CollectionsPage";
import DashboardPage from "./pages/DashboardPage";
import MembersPage from "./pages/MembersPage";
import ReportsPage from "./pages/ReportsPage";

export type Page = "dashboard" | "members" | "collections" | "reports";

export default function App() {
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [initialized, setInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  useEffect(() => {
    if (!actor || isFetching || !isLoggedIn) {
      setInitialized(false);
      return;
    }
    actor
      ._initializeAccessControlWithSecret("")
      .catch(() => {})
      .finally(() => setInitialized(true));
  }, [actor, isFetching, isLoggedIn]);

  if (
    isInitializing ||
    (isLoggedIn && isFetching) ||
    (isLoggedIn && !initialized && actor)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-card border border-border p-8 flex flex-col items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Monthly Collection Manager
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Track monthly dues, manage members, and generate collection
                reports.
              </p>
            </div>
            <Button
              data-ocid="login.primary_button"
              onClick={login}
              disabled={isLoggingIn}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In to Continue"
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Secure authentication via Internet Identity
            </p>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline hover:text-foreground transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {currentPage === "dashboard" && <DashboardPage />}
        {currentPage === "members" && <MembersPage />}
        {currentPage === "collections" && <CollectionsPage />}
        {currentPage === "reports" && <ReportsPage />}
      </Layout>
      <Toaster richColors />
    </>
  );
}
