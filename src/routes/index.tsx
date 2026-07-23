import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { PublicAuthThemeLayout } from "@/components/auth/PublicAuthThemeLayout";
import { PrivateRoute } from "./privateRoute";

// Páginas públicas / auth — carregadas imediatamente (são pequenas e necessárias no primeiro acesso)
import GastrocentroHome from "@/pages/public/GastrocentroHome";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import NotFound from "@/pages/not-found";

// Páginas de catálogo — lazy (não são a página inicial após login)
const CourseCatalog = lazy(() => import("@/pages/public/CourseCatalog"));
const CourseDetail = lazy(() => import("@/pages/public/CourseDetail"));

// Páginas do aluno — lazy (carregadas apenas após autenticação)
const StudentDashboard = lazy(() => import("@/pages/student/Dashboard"));
const StudentCourses = lazy(() => import("@/pages/student/Courses"));
const LessonViewer = lazy(() => import("@/pages/student/LessonViewer"));
const StudentProfile = lazy(() => import("@/pages/student/Profile"));

// Páginas do professor — lazy (nunca usadas por alunos)
const TeacherDashboard = lazy(() => import("@/pages/teacher/Dashboard"));
const CoursesList = lazy(() => import("@/pages/teacher/CoursesList"));
const CourseEditor = lazy(() => import("@/pages/teacher/CourseEditor"));
const TeacherProfile = lazy(() => import("@/pages/teacher/Profile"));
const UserManagement = lazy(() => import("@/pages/teacher/UserManagement"));
const CommentModeration = lazy(() => import("@/pages/teacher/CommentModeration"));

export function AppRoutes() {
  return (
    <Suspense fallback={null}>
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

      {/* Gestão de usuários e moderação — somente ADMIN */}
      <Route element={<PrivateRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/teacher/users" element={<UserManagement />} />
        <Route path="/teacher/comments" element={<CommentModeration />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}

export { AuthenticatedFloatingChat } from "./floatingChatGuard";
