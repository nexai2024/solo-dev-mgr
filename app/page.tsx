import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden p-0 m-0 max-w-none">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-hero">
        {/* Ambient glow orbs */}
        <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-baby-blue-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-hot-pink-500/15 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Hero content */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">

          {/* Badge */}
          <div className="glass-light px-4 py-2 rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-600">
            <span className="w-2 h-2 rounded-full bg-hot-pink-500 animate-pulse" />
            <span className="text-sm font-semibold text-baby-blue-400">Built for Indie Developers</span>
          </div>

          {/* Main heading */}
          <h1 className="text-display text-white animate-in fade-in slide-in-from-top-6 duration-700 delay-100">
            Modular SaaS Platform <br />
            <span className="bg-gradient-to-r from-baby-blue-400 via-hot-pink-500 to-baby-blue-400 bg-clip-text text-transparent">
              For Indie Devs
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-body-lg text-white/70 max-w-2xl animate-in fade-in slide-in-from-top-8 duration-700 delay-200">
            Streamline your development workflow with powerful modules designed to make your life easier. Manage deployments, environments, repositories, and more—all in one place.
          </p>

          {/* CTA buttons */}
          <div className="flex gap-4 animate-in fade-in slide-in-from-top-10 duration-700 delay-300">
            <Link href="/apps">
              <Button size="lg" className="text-base px-8">
                Explore Modules
              </Button>
            </Link>
            <Link href="/apps">
              <Button size="lg" variant="glass" className="text-base px-8 text-white border-white/20">
                My Dashboard
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-8 text-sm text-white/60 animate-in fade-in duration-700 delay-500">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">15+</span>
              <span>Modules</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">5K+</span>
              <span>Developers</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-hot-pink-400">4.8</span>
              <span>Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured cards preview */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">

          {/* Card 1 */}
          <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-gradient-accent mb-4 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-heading text-white mb-2">Deployment Management</h3>
            <p className="text-small text-white/60">Track and manage all your app deployments</p>
          </div>

          {/* Card 2 */}
          <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-baby-blue-500 to-baby-blue-400 mb-4 flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <h3 className="text-heading text-white mb-2">Environment Variables</h3>
            <p className="text-small text-white/60">Secure and organize your config settings</p>
          </div>

          {/* Card 3 */}
          <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-gradient-accent mb-4 flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-heading text-white mb-2">Repository Tracking</h3>
            <p className="text-small text-white/60">Keep tabs on all your code repositories</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-hero text-white mb-4">All the Modules You Need</h2>
          <p className="text-body-lg text-white/70 max-w-2xl mx-auto">
            Everything you need to manage your indie dev projects, all in one place
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-gradient-accent mb-4 flex items-center justify-center">
              <span className="text-xl">🔌</span>
            </div>
            <h3 className="text-heading text-white mb-2">API Management</h3>
            <p className="text-small text-white/60">Monitor and manage all your API endpoints</p>
          </div>
          <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-baby-blue-500 to-baby-blue-400 mb-4 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <h3 className="text-heading text-white mb-2">Log Monitoring</h3>
            <p className="text-small text-white/60">Real-time logs and error tracking</p>
          </div>
          <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-gradient-accent mb-4 flex items-center justify-center">
              <span className="text-xl">🗄️</span>
            </div>
            <h3 className="text-heading text-white mb-2">Database Management</h3>
            <p className="text-small text-white/60">Connect and manage your databases</p>
          </div>
          <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-baby-blue-500 to-baby-blue-400 mb-4 flex items-center justify-center">
              <span className="text-xl">🔐</span>
            </div>
            <h3 className="text-heading text-white mb-2">Security & Secrets</h3>
            <p className="text-small text-white/60">Secure key and credential management</p>
          </div>
          <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-gradient-accent mb-4 flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
            <h3 className="text-heading text-white mb-2">Analytics & Metrics</h3>
            <p className="text-small text-white/60">Track performance and user metrics</p>
          </div>
          <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-baby-blue-500 to-baby-blue-400 mb-4 flex items-center justify-center">
              <span className="text-xl">💳</span>
            </div>
            <h3 className="text-heading text-white mb-2">Billing Management</h3>
            <p className="text-small text-white/60">Track subscriptions and payments</p>
          </div>
          <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-gradient-accent mb-4 flex items-center justify-center">
              <span className="text-xl">🔔</span>
            </div>
            <h3 className="text-heading text-white mb-2">Notifications</h3>
            <p className="text-small text-white/60">Stay informed with smart alerts</p>
          </div>
          <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-baby-blue-500 to-baby-blue-400 mb-4 flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <h3 className="text-heading text-white mb-2">Automation</h3>
            <p className="text-small text-white/60">Automate repetitive dev tasks</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-hero text-white mb-4">How It Works</h2>
          <p className="text-body-lg text-white/70 max-w-2xl mx-auto">
            Simple, modular architecture designed for flexibility
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-accent mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white">
              1
            </div>
            <h3 className="text-heading text-white mb-3">Choose Your Modules</h3>
            <p className="text-body text-white/60">
              Pick and choose only the modules you need. Mix and match based on your project requirements.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-baby-blue-500 to-baby-blue-400 mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white">
              2
            </div>
            <h3 className="text-heading text-white mb-3">Connect Your Services</h3>
            <p className="text-body text-white/60">
              Easily integrate with your existing tools and platforms. One-click connections to popular services.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-accent mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white">
              3
            </div>
            <h3 className="text-heading text-white mb-3">Start Building</h3>
            <p className="text-body text-white/60">
              Everything works together seamlessly. Focus on building while we handle the infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* Integration Badges */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-hero text-white mb-4">Works With Your Stack</h2>
          <p className="text-body-lg text-white/70 max-w-2xl mx-auto">
            Seamlessly integrate with the tools you already use
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-6">
          {[
            { name: "Vercel", icon: "▲" },
            { name: "Netlify", icon: "●" },
            { name: "GitHub", icon: "📘" },
            { name: "GitLab", icon: "🦊" },
            { name: "AWS", icon: "☁️" },
            { name: "Supabase", icon: "⚡" },
            { name: "MongoDB", icon: "🍃" },
            { name: "Stripe", icon: "💳" },
          ].map((platform, idx) => (
            <div
              key={idx}
              className="glass-light px-6 py-4 rounded-xl flex items-center gap-3 hover:scale-105 transition-all duration-300"
            >
              <span className="text-2xl">{platform.icon}</span>
              <span className="text-body font-semibold text-white">{platform.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-hero text-white mb-4">Loved by Indie Developers</h2>
          <p className="text-body-lg text-white/70 max-w-2xl mx-auto">
            See what other developers are saying about Vantage
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <h4 className="text-body font-semibold text-white">Alex Chen</h4>
                <p className="text-small text-white/60">Full-Stack Developer</p>
              </div>
            </div>
            <p className="text-body text-white/80 mb-4">
              "This platform has completely transformed how I manage my indie projects. The modular approach means I only pay for what I use, and everything just works."
            </p>
            <div className="flex text-hot-pink-400">
              {"★★★★★".split("").map((star, i) => (
                <span key={i}>{star}</span>
              ))}
            </div>
          </div>
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-baby-blue-500 to-baby-blue-400 flex items-center justify-center text-white font-bold">
                S
              </div>
              <div>
                <h4 className="text-body font-semibold text-white">Sarah Martinez</h4>
                <p className="text-small text-white/60">SaaS Founder</p>
              </div>
            </div>
            <p className="text-body text-white/80 mb-4">
              "As a solo developer, managing deployments and env variables used to be a nightmare. Vantage made it so simple - I can focus on building instead of configuration."
            </p>
            <div className="flex text-hot-pink-400">
              {"★★★★★".split("").map((star, i) => (
                <span key={i}>{star}</span>
              ))}
            </div>
          </div>
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-white font-bold">
                M
              </div>
              <div>
                <h4 className="text-body font-semibold text-white">Mike Johnson</h4>
                <p className="text-small text-white/60">Indie Hacker</p>
              </div>
            </div>
            <p className="text-body text-white/80 mb-4">
              "The best part is how everything integrates. My repos, deployments, and env vars are all connected. It's like having a dev ops team without the cost."
            </p>
            <div className="flex text-hot-pink-400">
              {"★★★★★".split("").map((star, i) => (
                <span key={i}>{star}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-hero text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-body-lg text-white/70 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Mix and match modules as you grow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter Plan */}
          <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-heading-lg text-white mb-2">Starter</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-display text-white">$0</span>
                <span className="text-body text-white/60">/month</span>
              </div>
              <p className="text-small text-white/60 mt-2">Perfect for getting started</p>
            </div>
            <ul className="space-y-3 mb-8">
              {["3 Apps", "Basic Modules", "Community Support", "5 Deployments/month"].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-body text-white/80">
                  <span className="text-hot-pink-400">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/apps" className="block w-full">
              <Button variant="glass" className="w-full text-white border-white/20">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all duration-300 border-2 border-hot-pink-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="glass-light px-3 py-1 rounded-full text-small font-semibold text-hot-pink-400">
                Most Popular
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-heading-lg text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-display text-white">$29</span>
                <span className="text-body text-white/60">/month</span>
              </div>
              <p className="text-small text-white/60 mt-2">For serious indie developers</p>
            </div>
            <ul className="space-y-3 mb-8">
              {["Unlimited Apps", "All Modules", "Priority Support", "Unlimited Deployments", "Advanced Analytics"].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-body text-white/80">
                  <span className="text-hot-pink-400">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/subscription" className="block w-full">
              <Button className="w-full">
                Upgrade to Pro
              </Button>
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-heading-lg text-white mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-display text-white">Custom</span>
              </div>
              <p className="text-small text-white/60 mt-2">For teams and agencies</p>
            </div>
            <ul className="space-y-3 mb-8">
              {["Everything in Pro", "Team Collaboration", "Dedicated Support", "Custom Integrations", "SLA Guarantee"].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-body text-white/80">
                  <span className="text-hot-pink-400">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/subscription" className="block w-full">
              <Button variant="glass" className="w-full text-white border-white/20">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="glass-strong rounded-3xl p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-hero text-white mb-4">
            Ready to Simplify Your Dev Workflow?
          </h2>
          <p className="text-body-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of indie developers who are already using Vantage to streamline their projects.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/apps">
              <Button size="lg" className="text-base px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/apps">
              <Button size="lg" variant="glass" className="text-base px-8 text-white border-white/20">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
