import { AllQueriesList } from "../class-page/queries/AllQueriesList";
import { CreateQuery } from "./new-query/CreateQuery";
import { YourQueries } from "./YourQueries";

export default function StudentTabs({
  activeTab,
  classId,
}: {
  activeTab: string;
  classId: string;
}) {
  return (
    <>
      {activeTab === "queries" && (
        <AllQueriesList role="student" classId={classId} />
      )}
      {activeTab === "your-queries" && <YourQueries classId={classId} />}
      {activeTab === "new-query" && <CreateQuery classId={classId} />}
      {activeTab === "browse" && (
        <div className="text-center py-10 text-muted-foreground">
          Browse feature coming soon...
        </div>
      )}
    </>
  );
}
