"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toggleImageVisibility } from "@/lib/Database/actions/image.action";
import { useRouter } from "next/navigation";

interface VisibilityToggleProps {
  imageId: string;
  userId: string;
  isPublic: boolean;
}

const VisibilityToggle = ({ imageId, userId, isPublic }: VisibilityToggleProps) => {
  const [isChecked, setIsChecked] = useState(isPublic);
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();

  const handleToggle = async (checked: boolean) => {
    try {
      setIsToggling(true);
      setIsChecked(checked);
      
      await toggleImageVisibility(imageId, userId);
      
      router.refresh();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      // Revert the UI state if there was an error
      setIsChecked(!checked);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch 
        id={`visibility-${imageId}`}
        checked={isChecked}
        onCheckedChange={handleToggle}
        disabled={isToggling}
        className={isToggling ? "opacity-50" : ""}
      />
      <Label htmlFor={`visibility-${imageId}`} className="capitalize text-purple-400">
        {isChecked ? "Public" : "Private"}
      </Label>
    </div>
  );
};

export default VisibilityToggle; 