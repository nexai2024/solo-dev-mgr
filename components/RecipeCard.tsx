"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { unlockRecipe } from "@/lib/actions/recipe.actions";
import { redirect } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { DialogHeader } from "./ui/dialog";

interface RecipeCardProps {
  id: string;
  name: string;
  ingredients: number;
  userName: string;
  userImageUrl: string;
  unlocked: boolean;
}

const RecipeCard = ({
  id,
  name,
  ingredients,
  userName,
  userImageUrl,
  unlocked,
}: RecipeCardProps) => {
  const [open, setOpen] = useState(false);
  
  const handleUnlockRecipe = async (id: string) => {
    const { success } = await unlockRecipe(id);

    if (success) {
      redirect(`/recipes/${id}`);
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-6 w-[320px] flex flex-col gap-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-hot-pink-500/10 group">
      <h2 className="text-heading font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">{name}</h2>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{ingredients} ingredients</p>
        <span className="flex items-center gap-2">
          <Image
            src={userImageUrl}
            alt={userName}
            width={24}
            height={24}
            className="rounded-full"
          />
          <p className="text-sm text-muted-foreground">{userName}</p>
        </span>
        {unlocked ? (
          <Link href={`/recipes/${id}`}>
            <Button variant="glass" className="w-full">View Recipe</Button>
          </Link>
        ) : (
          <Button onClick={() => handleUnlockRecipe(id)} className="w-full">
            Unlock Recipe
          </Button>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>You have reached your recipe limit</DialogTitle>
            <DialogDescription className="flex flex-col gap-4 items-center">
              Please upgrade to a paid plan to unlock more recipes.
              <Link href="/subscription">
                <Button>Upgrade</Button>
              </Link>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeCard;
