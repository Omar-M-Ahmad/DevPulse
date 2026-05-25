import { Hero } from '@/components/landing/Hero';
import { Navbar } from '@/components/landing/Navbar';
import { TerminalWindow } from '@/components/landing/TerminalWindow';

export default function Home(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <Hero />
      <TerminalWindow />

      {/* Footer */}
      <footer className="border-t border-border-default px-6 py-6 max-w-6xl mx-auto">
        <p className="font-mono text-xs text-text-disabled">
          DevPulse_Root v1.0.4-stable
        </p>
      </footer>
    </div>
  );
}
