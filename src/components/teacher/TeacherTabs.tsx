import { AllQueriesList } from "../class-page/queries/AllQueriesList";
import { Resources } from "../class-page/resources/Resources";
import { TeacherStudentsList } from "../class-page/TeacherStudentsList";
import { YourAnswers } from "./YourAnswers";

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
      {tab === "answers" && <YourAnswers classId={classId} />}
      {tab === "resources" && <Resources role="teacher" />}
    </>
  );
}
