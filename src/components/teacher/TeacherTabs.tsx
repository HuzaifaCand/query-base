import { AllQueriesList } from "../class-page/queries/AllQueriesList";
import { Resources } from "../class-page/resources/Resources";
import { TeacherStudentsList } from "../class-page/TeacherStudentsList";

export function TeacherTabs({
  tab,
  classId,
}: {
  tab: string;
  classId: string;
}) {
  return (
    <>
      {tab === "queries" && <AllQueriesList role="teacher" classId={classId} />}
      {tab === "students" && <TeacherStudentsList />}
      {tab === "answers"}
      {tab === "resources" && <Resources />}
    </>
  );
}
