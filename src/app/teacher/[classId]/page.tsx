"use client";

import { useEffect, useState } from "react";
import ClassTabs from "@/components/class-page/ClassTabs";
import SectionHeader from "@/components/ui/SectionHeader";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AllQueriesList } from "@/components/class-page/AllQueriesList";

export default function ClassPage() {
  const [activeTab, setActiveTab] = useState("queries");
  const [className, setClassName] = useState("");

  const pathname = usePathname();
  const classId = pathname.split("/")[2];

  useEffect(() => {
    const fetchClass = async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .single();

      if (error) {
        console.error("Error fetching class:", error);
        return;
      }

      if (data) {
        setClassName(data.name);
      }
    };

    fetchClass();
  }, [classId]);
  return (
    <div className="flex flex-col">
      <ClassTabs role="teacher" onTabChange={setActiveTab} />

      <div className="py-4 lg:py-6 px-4">
        {activeTab === "queries" && <AllQueriesList />}
      </div>
    </div>
  );
}
