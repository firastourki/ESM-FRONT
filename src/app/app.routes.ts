import { Routes } from '@angular/router';
import { Content } from './content/content';
import { Signin } from './pages/signin/signin';
import { Signup } from './pages/signup/signup';
import { VerifyEmail } from './pages/verify-email/verify-email';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';
import { Profile } from './pages/profile/profile';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { StudentLayout } from './layout/student-layout/student-layout';
import { ParentLayout } from './layout/parent-layout/parent-layout';
import { TutorLayout } from './layout/tutor-layout/tutor-layout';
import { Backoffice } from './pages/backoffice/backoffice';
import { Dashboard } from './pages/dashboard/dashboard';
import { Resources } from './pages/resources/resources';
import { AssessmentDetails } from './pages/assessment-details/assessment-details';
import { Planning } from './pages/planning/planning';
import { GradesComponent } from './pages/grades/grades';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard';
import { StudentHome } from './pages/student/student-home/student-home';
import { CourseDetailComponent } from './pages/course-detail/course-detail.component';

// ── frontRayen ────────────────────────────────────────────────────────────────
import { AttendanceListComponent } from './pages/attendance/attendance-list/attendance-list.component';
import { AttendanceFormComponent } from './pages/attendance/attendance-form/attendance-form.component';
import { ScheduleListComponent } from './pages/schedule/schedule-list/schedule-list.component';
import { ScheduleFormComponent } from './pages/schedule/schedule-form/schedule-form.component';

// ── YOUSSEF ───────────────────────────────────────────────────────────────────
import { CoursesComponent } from './pages/courses/courses.component';
import { EnrollmentComponent } from './pages/enrollment/enrollment.component';

// ── kamel ─────────────────────────────────────────────────────────────────────
import { Reports } from './pages/reports/reports';
import { Payments } from './pages/payments/payments';

// ── Guards ────────────────────────────────────────────────────────────────────
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// ── AKREM ─────────────────────────────────────────────────────────────────────
import { AdminUsers } from './pages/users/users';
import { AdminClasses } from './pages/admin-classes/admin-classes';
import { AdminParents } from './pages/admin-parents/admin-parents';
import { TutorDashboard } from './pages/tutor-dashboard/tutor-dashboard';
import { TutorAssessments } from './pages/tutor-assessments/tutor-assessments';

// ── Student pages ─────────────────────────────────────────────────────────────
import { StudentCoursesPage } from './pages/student/student-courses/student-courses';
import { StudentAttendancePage } from './pages/student/student-attendance/student-attendance';
import { StudentAssessmentsPage } from './pages/student/student-assessments/student-assessments';
import { StudentSchedulePage } from './pages/student/student-schedule/student-schedule';
import { StudentCertificatesPage } from './pages/student/student-certificates/student-certificates';

// ── Parent pages ──────────────────────────────────────────────────────────────
import { ParentDashboard } from './pages/parent/parent-dashboard/parent-dashboard';
import { ParentGradesPage } from './pages/parent/parent-grades/parent-grades';
import { ParentPlanningPage } from './pages/parent/parent-planning/parent-planning';
import { ParentPaymentsPage } from './pages/parent/parent-payments/parent-payments';

export const routes: Routes = [
  { path: '', component: Content },
  { path: 'signin', component: Signin },
  { path: 'signup', component: Signup },
  { path: 'verify-email', component: VerifyEmail },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'course/:id', component: CourseDetailComponent },
  

  // ── Admin ──────────────────────────────────────────────────────────────────
  {
    path: 'backoffice',
    component: AdminLayout,
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['ADMIN'] },
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'assessments', component: Backoffice },
      { path: 'resources', component: Resources },
      { path: 'assessment/:id', component: AssessmentDetails },
      { path: 'planning', component: Planning },
      { path: 'grades', component: GradesComponent },
      { path: 'leaderboard', component: LeaderboardComponent },
      { path: 'attendance', component: AttendanceListComponent },
      { path: 'attendance/new', component: AttendanceFormComponent },
      { path: 'attendance/edit/:id', component: AttendanceFormComponent },
      { path: 'schedule', component: ScheduleListComponent },
      { path: 'schedule/new', component: ScheduleFormComponent },
      { path: 'schedule/edit/:id', component: ScheduleFormComponent },
      { path: 'courses', component: CoursesComponent },
      { path: 'enrollment', component: EnrollmentComponent },
      { path: 'reports', component: Reports },
      { path: 'payments', component: Payments },
      { path: 'users', component: AdminUsers },
      { path: 'classes', component: AdminClasses },
      { path: 'parents', component: AdminParents },
      { path: 'profile', component: Profile },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ── Tutor ──────────────────────────────────────────────────────────────────
  {
    path: 'tutor',
    component: TutorLayout,
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['TUTOR'] },
    children: [
      { path: 'dashboard', component: TutorDashboard },
      { path: 'assessments', component: TutorAssessments },
      { path: 'assessment/:id', component: AssessmentDetails },
      { path: 'planning', component: Planning },
      { path: 'grades', component: GradesComponent },
      { path: 'resources', component: Resources },
      { path: 'reports', component: Reports },
      { path: 'profile', component: Profile },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ── Student ────────────────────────────────────────────────────────────────
  {
    path: 'student',
    component: StudentLayout,
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['STUDENT'] },
    children: [
      { path: 'home', component: StudentHome },
      { path: 'courses', component: StudentCoursesPage },
      { path: 'attendance', component: StudentAttendancePage },
      { path: 'grades', component: GradesComponent },
      { path: 'assessments', component: StudentAssessmentsPage },
      { path: 'leaderboard', component: LeaderboardComponent },
      { path: 'schedule', component: StudentSchedulePage },
      { path: 'certificates', component: StudentCertificatesPage },
      { path: 'profile', component: Profile },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  // ── Parent ─────────────────────────────────────────────────────────────────
  {
    path: 'parent',
    component: ParentLayout,
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['PARENT'] },
    children: [
      { path: 'dashboard', component: ParentDashboard },
      { path: 'grades', component: ParentGradesPage },
      { path: 'planning', component: ParentPlanningPage },
      { path: 'payments', component: ParentPaymentsPage },
      { path: 'profile', component: Profile },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];
