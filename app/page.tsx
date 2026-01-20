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
            <span className="text-sm font-semibold text-baby-blue-400">Your Kitchen, Reimagined</span>
          </div>

          {/* Main heading */}
          <h1 className="text-display text-white animate-in fade-in slide-in-from-top-6 duration-700 delay-100">
            Discover Recipes <br />
            <span className="bg-gradient-to-r from-baby-blue-400 via-hot-pink-500 to-baby-blue-400 bg-clip-text text-transparent">
              That Inspire
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-body-lg text-white/70 max-w-2xl animate-in fade-in slide-in-from-top-8 duration-700 delay-200">
            Join thousands of home cooks discovering chef-tested recipes, organizing their favorites, and cooking with confidence every single day.
          </p>

          {/* CTA buttons */}
          <div className="flex gap-4 animate-in fade-in slide-in-from-top-10 duration-700 delay-300">
            <Link href="/recipes">
              <Button size="lg" className="text-base px-8">
                Explore Recipes
              </Button>
            </Link>
            <Link href="/my-cookbook">
              <Button size="lg" variant="glass" className="text-base px-8 text-white border-white/20">
                My Cookbook
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-8 text-sm text-white/60 animate-in fade-in duration-700 delay-500">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">10K+</span>
              <span>Recipes</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">50K+</span>
              <span>Users</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-hot-pink-400">4.9</span>
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
              <span className="text-2xl">🍳</span>
            </div>
            <h3 className="text-heading text-white mb-2">Quick & Easy</h3>
            <p className="text-small text-white/60">30-minute meals for busy weeknights</p>
          </div>

          {/* Card 2 */}
          <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-baby-blue-500 to-baby-blue-400 mb-4 flex items-center justify-center">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="text-heading text-white mb-2">Seasonal Picks</h3>
            <p className="text-small text-white/60">Fresh ingredients, perfect timing</p>
          </div>

          {/* Card 3 */}
          <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-gradient-accent mb-4 flex items-center justify-center">
              <span className="text-2xl">👨‍🍳</span>
            </div>
            <h3 className="text-heading text-white mb-2">Chef Favorites</h3>
            <p className="text-small text-white/60">Restaurant-quality at home</p>
          </div>
        </div>
      </section>
    </main>
  );
}
