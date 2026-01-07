import { createBrowserRouter } from "react-router-dom";
import StudentResultLookup from "../components/StudentResultLookup";
import UsersDataFetcher from "../components/UsersDataFetcher";
import TestDetailsFetcher from "../components/TestDetailsFetcher";
// import Bracket from "../components/CompetitionTable/bracket/BracketMain";

const router = createBrowserRouter([
  {
    path: "/",
    element: <StudentResultLookup></StudentResultLookup>,
  },
  {
    path: "teacherData",
    element: <UsersDataFetcher></UsersDataFetcher>,
  },
  {
    path: "studentResultLookup",
    element: <TestDetailsFetcher></TestDetailsFetcher>,
  },
]);

export default router;
