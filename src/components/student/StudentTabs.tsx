import { AllQueriesList } from "../class-page/queries/AllQueriesList";
import { CreateQuery } from "./new-query/CreateQuery";

export default function StudentTabs({
  activeTab,
  classId,
}: {
  activeTab: string;
  classId: string;
}) {
  return (
    <>
      {activeTab === "new-query" && <CreateQuery classId={classId} />}
      {activeTab === "queries" && <AllQueriesList />}
      {activeTab === "browse" && (
        <div className="text-center py-10 text-muted-foreground">
          Browse feature coming soon...
        </div>
      )}
    </>
  );
}
