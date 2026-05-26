import { signIn } from "@/lib/auth";

export default function AuthPage(): React.JSX.Element {
    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-10">
                    <span className="inline-block w-2 h-2 rounded-full bg-accent-green animate-blink-dot" />
                    <span className="font-mono text-sm font-semibold text-text-primary">
                        DevPulse
                    </span>
                </div>

                {/* Card */}
                <div className="border border-border-default bg-bg-secondary rounded-md p-8">
                    <h1 className="font-mono text-xl font-bold text-text-primary mb-2">
                        connect your github
                    </h1>
                    <p className="font-sans text-sm text-text-muted mb-8">
                        DevPulse needs read-only access to your repositories to
                        monitor their health.
                    </p>

                    {/* Terminal scope block */}
                    <div className="bg-bg-terminal border border-border-default rounded-sm p-4 mb-8">
                        <p className="font-mono text-xs text-text-muted mb-2">
                            // requested permissions
                        </p>
                        <p className="font-mono text-xs text-status-active-text">
                            ✓ read:user
                        </p>
                        <p className="font-mono text-xs text-status-active-text">
                            ✓ repo (read-only)
                        </p>
                        <p className="font-mono text-xs text-status-active-text">
                            ✓ read:org
                        </p>
                    </div>

                    {/* Sign in form */}
                    <form
                        action={async () => {
                            "use server";
                            await signIn("github");
                        }}
                    >
                        <button
                            type="submit"
                            className="w-full font-mono text-sm text-bg-primary bg-accent-green hover:bg-accent-green-light transition-colors py-3 rounded-sm font-semibold"
                        >
                            $ authenticate with github
                        </button>
                    </form>

                    {/* Fine print */}
                    <p className="font-mono text-xs text-text-disabled text-center mt-4">
                        only reads data. never writes. never stores code.
                    </p>
                </div>
            </div>
        </div>
    );
}
