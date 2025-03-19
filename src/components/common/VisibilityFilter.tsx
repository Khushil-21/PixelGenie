"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formUrlQuery } from "@/lib/utils";

interface VisibilityFilterProps {
  currentVisibility: string;
}

const VisibilityFilter = ({ currentVisibility }: VisibilityFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (visibility: string) => {
    const newUrl = formUrlQuery({
      searchParams: searchParams.toString(),
      key: "visibility",
      value: visibility
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <p className="text-dark-600 p-16-medium self-center">Filter by:</p>
      <Button
        size="sm"
        variant={currentVisibility === "all" ? "default" : "outline"}
        onClick={() => handleFilterChange("all")}
        className={`w-20 rounded-full ${currentVisibility === "all" ? "bg-purple-gradient text-white" : ""}`}
      >
        All
      </Button>
      <Button
        size="sm"
        variant={currentVisibility === "public" ? "default" : "outline"}
        onClick={() => handleFilterChange("public")}
        className={`w-20 rounded-full ${currentVisibility === "public" ? "bg-purple-gradient text-white" : ""}`}
      >
        Public
      </Button>
      <Button
        size="sm"
        variant={currentVisibility === "private" ? "default" : "outline"}
        onClick={() => handleFilterChange("private")}
        className={`w-20 rounded-full ${currentVisibility === "private" ? "bg-purple-gradient text-white" : ""}`}
      >
        Private
      </Button>
    </div>
  );
};

export default VisibilityFilter; 