import { Routes } from '@angular/router';
import { Content } from './content/content';
import { Signin } from './pages/signin/signin';
import { Signup } from './pages/signup/signup';
import { VerifyEmail } from './pages/verify-email/verify-email';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { StudentLayout } from './layout/student-layout/student-layout';
import { ParentLayout } from './layout/parent-layout/parent-layout';
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

// ── AKREM ─────────────────────────────────────────────────────────────────────
import { AdminUsers } from './pages/users/users';

// ── Student pages ─────────────────────────────────────────────────────────────
import { StudentCoursesPage } from './pages/student/student-courses/student-courses';
import { StudentAttendancePage } from './pages/student/student-attendance/student-attendance';
import { StudentAssessmentsPage } from './pages/student/student-assessments/student-assessments';
import { StudentSchedulePage } from './pages/student/student-schedule/student-schedule';

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
  { path: 'course/:id', component: CourseDetailComponent },

  // ── Admin ──────────────────────────────────────────────────────────────────
  {
    path: 'backoffice',
    component: AdminLayout,
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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ── Student ────────────────────────────────────────────────────────────────
  {
    path: 'student',
    component: StudentLayout,
    children: [
      { path: 'home', component: StudentHome },
      { path: 'courses', component: StudentCoursesPage },
      { path: 'attendance', component: StudentAttendancePage },
      { path: 'grades', component: GradesComponent },
      { path: 'assessments', component: StudentAssessmentsPage },
      { path: 'leaderboard', component: LeaderboardComponent },
      { path: 'schedule', component: StudentSchedulePage },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  // ── Parent ─────────────────────────────────────────────────────────────────
  {
    path: 'parent',
    component: ParentLayout,
    children: [
      { path: 'dashboard', component: ParentDashboard },
      { path: 'grades', component: ParentGradesPage },
      { path: 'planning', component: ParentPlanningPage },
      { path: 'payments', component: ParentPaymentsPage },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];
