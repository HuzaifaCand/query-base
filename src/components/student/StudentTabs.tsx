import { AllQueriesList } from "../class-page/queries/AllQueriesList";
import { Resources } from "../class-page/resources/Resources";
import { CreateQuery } from "./new-query/CreateQuery";
import { YourQueries } from "./YourQueries";

export default function StudentTabs({
  tab,
  classId,
}: {
  tab: string;
  classId: string;
}) {
  return (
    <>
      {tab === "queries" && <AllQueriesList role="student" classId={classId} />}
      {tab === "your-queries" && <YourQueries classId={classId} />}
      {tab === "new-query" && <CreateQuery classId={classId} />}
      {tab === "browse" && (
        <div className="text-center py-10 text-muted-foreground">
          Browse feature coming soon...
        </div>
      )}
      {tab === "resources" && <Resources />}
    </>
  );
}
