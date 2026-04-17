$app = "C:\Users\Firas\Pidev\esm-front\src\app"

# Student Layout HTML
$studentLayout = @'
<div class="student-shell">
  <aside class="sidebar">
    <div class="logo">&#127891; Student</div>
    <nav>
      <a routerLink="/student/home" routerLinkActive="active">&#127968; Dashboard</a>
      <a routerLink="/student/courses" routerLinkActive="active">&#128218; My Courses</a>
      <a routerLink="/student/attendance" routerLinkActive="active">&#9989; Attendance</a>
      <a routerLink="/student/grades" routerLinkActive="active">&#127942; My Grades</a>
      <a routerLink="/student/assessments" routerLinkActive="active">&#128221; Assessments</a>
      <a routerLink="/student/leaderboard" routerLinkActive="active">&#129351; Leaderboard</a>
      <a routerLink="/student/schedule" routerLinkActive="active">&#128197; Schedule</a>
    </nav>
    <a routerLink="/" class="back-link">&#8592; Home</a>
  </aside>
  <div class="main">
    <header class="header">
      <span>Student Portal</span>
      <span>&#128100; Student</span>
    </header>
    <main class="content">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>
'@
[System.IO.File]::WriteAllText("$app\layout\student-layout\student-layout.html", $studentLayout, [System.Text.Encoding]::UTF8)
Write-Host "Student Layout corrige" -ForegroundColor Green

# Parent Layout HTML
$parentLayout = @'
<div class="parent-shell">
  <aside class="sidebar">
    <div class="logo">&#128106; Parent</div>
    <nav>
      <a routerLink="/parent/dashboard" routerLinkActive="active">&#127968; Dashboard</a>
      <a routerLink="/parent/grades" routerLinkActive="active">&#127942; Child Grades</a>
      <a routerLink="/parent/planning" routerLinkActive="active">&#128197; Planning</a>
      <a routerLink="/parent/payments" routerLinkActive="active">&#128179; Payments</a>
    </nav>
    <a routerLink="/" class="back-link">&#8592; Home</a>
  </aside>
  <div class="main">
    <header class="header">
      <span>Parent Portal</span>
      <span>&#128100; Parent</span>
    </header>
    <main class="content">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>
'@
[System.IO.File]::WriteAllText("$app\layout\parent-layout\parent-layout.html", $parentLayout, [System.Text.Encoding]::UTF8)
Write-Host "Parent Layout corrige" -ForegroundColor Green

Write-Host "Done! Lance ng serve" -ForegroundColor Green
