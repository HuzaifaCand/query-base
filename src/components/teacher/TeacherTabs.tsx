import { AllQueriesList } from "../class-page/queries/AllQueriesList";
import { TeacherStudentsList } from "./TeacherStudentsList";

export function TeacherTabs({ activeTab }: { activeTab: string }) {
  return (
    <>
      {activeTab === "queries" && <AllQueriesList />}
      {activeTab === "students" && <TeacherStudentsList />}
    </>
  );
}
