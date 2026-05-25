import { Route, Routes } from "react-router-dom";
import { PublicAuthThemeLayout } from "@/components/auth/PublicAuthThemeLayout";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ResetPassword from "@/pages/auth/ResetPassword";
import NotFound from "@/pages/not-found";
import CourseCatalog from "@/pages/public/CourseCatalog";
import CourseDetail from "@/pages/public/CourseDetail";
import GastrocentroHome from "@/pages/public/GastrocentroHome";
import StudentCourses from "@/pages/student/Courses";
import StudentDashboard from "@/pages/student/Dashboard";
import LessonViewer from "@/pages/student/LessonViewer";
import StudentProfile from "@/pages/student/Profile";
import CourseEditor from "@/pages/teacher/CourseEditor";
import CoursesList from "@/pages/teacher/CoursesList";
import TeacherDashboard from "@/pages/teacher/Dashboard";
import TeacherProfile from "@/pages/teacher/Profile";
import UserManagement from "@/pages/teacher/UserManagement";
import { PrivateRoute } from "./privateRoute";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<GastrocentroHome />} />
      <Route path="/gastrocentro" element={<GastrocentroHome />} />
      <Route element={<PublicAuthThemeLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Student */}
      <Route element={<PrivateRoute allowedRoles={["STUDENT"]} />}>
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/courses/:courseId/lessons/:lessonId" element={<LessonViewer />} />
      </Route>

      {/* Teacher / Admin (área de gestão de cursos) */}
      <Route element={<PrivateRoute allowedRoles={["TEACHER", "ADMIN"]} />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/courses" element={<CoursesList />} />
        <Route path="/teacher/courses/:id/edit" element={<CourseEditor />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />
      </Route>

      {/* Gestão de usuários — somente ADMIN */}
      <Route element={<PrivateRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/teacher/users" element={<UserManagement />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export { AuthenticatedFloatingChat } from "./floatingChatGuard";
