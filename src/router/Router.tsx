import { createBrowserRouter } from "react-router-dom";
import StudentResultLookup from "../components/StudentResultLookup";
import UsersDataFetcher from "../components/UsersDataFetcher";
import TestDetailsFetcher from "../components/TestDetailsFetcher";
import Quizz from "../components/Quizz";
// import Bracket from "../components/CompetitionTable/bracket/BracketMain";

const router = createBrowserRouter([
  {
    path: "/",
    element: <TestDetailsFetcher></TestDetailsFetcher>,
  },
  {
    path: "teacherData",
    element: <UsersDataFetcher></UsersDataFetcher>,
  },
  {
    path: "studentResultLookup",
    element: <StudentResultLookup></StudentResultLookup>,
  },
  {
    path: "quizz",
    element: <Quizz></Quizz>,
  },
]);

export default router;
