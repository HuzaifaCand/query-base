import { AllQueriesList } from "../class-page/queries/AllQueriesList";
import { TeacherStudentsList } from "../class-page/TeacherStudentsList";

export function TeacherTabs({
  activeTab,
  classId,
}: {
  activeTab: string;
  classId: string;
}) {
  return (
    <>
      {activeTab === "queries" && (
        <AllQueriesList role="teacher" classId={classId} />
      )}
      {activeTab === "students" && <TeacherStudentsList />}
    </>
  );
}
