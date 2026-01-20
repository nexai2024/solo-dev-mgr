import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
<<<<<<< HEAD
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold">
        DevManager
      </Link>
      <div className="flex gap-4 items-center">
        <Link href="/apps">My Apps</Link>
        <Link href="/subscription">Subscriptions</Link>
=======
    <header className="glass fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl mx-auto px-6 py-4 rounded-2xl z-50 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-600 delay-75">
      <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-baby-blue-500 to-hot-pink-500 bg-clip-text text-transparent">
        Recipe Emporium
      </Link>
      <nav className="flex gap-8 items-center">
        <Link
          href="/recipes"
          className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-accent after:transition-all after:duration-300 hover:after:w-full"
        >
          Browse Recipes
        </Link>
        <Link
          href="/subscription"
          className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-accent after:transition-all after:duration-300 hover:after:w-full"
        >
          Subscriptions
        </Link>
        <Link
          href="/my-cookbook"
          className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-accent after:transition-all after:duration-300 hover:after:w-full"
        >
          My Cookbook
        </Link>
>>>>>>> main
        <SignedOut>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
};

export default Navbar;
