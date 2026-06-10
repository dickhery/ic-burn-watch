import { Zap } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card border-b border-border/60 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-accent/15 border border-accent/30">
              <Zap className="w-4 h-4 text-accent" fill="currentColor" />
            </span>
            <span className="font-display font-semibold text-foreground tracking-tight text-sm">
              IC Burn Rate
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border border-accent/30 text-accent bg-accent/5">
              Live
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono hidden sm:block">
            Internet Computer Network
          </span>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-card border-t border-border/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-colors duration-200"
            >
              caffeine.ai
            </a>
          </span>
          <span className="font-mono">
            Data sourced from IC Management Canister
          </span>
        </div>
      </footer>
    </div>
  );
}
