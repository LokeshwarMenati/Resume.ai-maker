import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import PublicShell from "./components/PublicShell.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateProject from "./pages/CreateProject.jsx";
import ResumeForm from "./pages/ResumeForm.jsx";
import UploadResume from "./pages/UploadResume.jsx";
import JobDescription from "./pages/JobDescription.jsx";
import PreviewResume from "./pages/PreviewResume.jsx";
import ResumeScore from "./pages/ResumeScore.jsx";
import CoverLetter from "./pages/CoverLetter.jsx";

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedLayout />}>
        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/score" element={<ResumeScore />} />
        <Route path="/app/projects/create" element={<CreateProject />} />
        <Route path="/app/projects/:id/form" element={<ResumeForm />} />
        <Route path="/app/projects/:id/upload" element={<UploadResume />} />
        <Route path="/app/projects/:id/job" element={<JobDescription />} />
        <Route path="/app/projects/:id/preview" element={<PreviewResume />} />
        <Route path="/app/projects/:id/cover-letter" element={<CoverLetter />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
