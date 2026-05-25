import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { TerminalWindow } from '@/components/landing/TerminalWindow'
import { StaleAlert } from '@/components/landing/StaleAlert'
import { RepoFeed } from '@/components/landing/RepoFeed'
import { FeaturesGrid } from '@/components/landing/FeaturesGrid'

export default function Home(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <Hero />
      <TerminalWindow />
      <StaleAlert />
      <RepoFeed />
      <FeaturesGrid />

      {/* Footer */}
      <footer className="border-t border-border-default px-6 py-6 max-w-6xl mx-auto">
        <p className="font-mono text-xs text-text-disabled">
          DevPulse_Root v1.0.4-stable
        </p>
      </footer>
    </div>
  )
}