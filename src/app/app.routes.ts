import { Routes } from '@angular/router';
import { About } from './pages/about/about';
import { Schedule } from './pages/schedule/schedule';
import { List } from './pages/list/list';
import { Contact } from './pages/contact/contact';
import { StudentFunZone } from './pages/student-fun-zone/student-fun-zone/student-fun-zone';
import { BingoGameComponent } from './pages/student-fun-zone/bingo-game/bingo-game';
import { KanbanBoardComponent } from './pages/student-fun-zone/kanban-board/kanban-board';
import { QuizGameComponent } from './pages/student-fun-zone/quiz-game/quiz-game';
import { VisionBoardComponent } from './pages/student-fun-zone/vision-board/vision-board';
import { WhiteboardComponent } from './pages/student-fun-zone/whiteboard/whiteboard';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { MovieTrackerComponent } from './pages/trackers/movie-tracker/movie-tracker';
import { WaterTrackerComponent } from './pages/trackers/water-tracker/water-tracker';
import { SleepTrackerComponent } from './pages/trackers/sleep-tracker/sleep-tracker';
import { MoodTrackerComponent } from './pages/trackers/mood-tracker/mood-tracker';
import { FinanceTrackerComponent } from './pages/trackers/finance-tracker/finance-tracker';
import { DailyPlannerComponent } from './pages/trackers/daily-planner/daily-planner';
import { Contact as ContactComponent } from './pages/contact/contact';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'about', pathMatch: 'full' },

  { path: 'about', component: About },
  { path: 'list', component: List },
  { path: 'schedule', component: Schedule },
  { path: 'contact', component: ContactComponent },

  {
    path: 'student-fun-zone',
    canActivate: [authGuard],
    component: StudentFunZone,
    children: [
      { path: '', redirectTo: 'bingo', pathMatch: 'full' },
      { path: 'bingo', component: BingoGameComponent },
      { path: 'kanban', component: KanbanBoardComponent },
      { path: 'quiz', component: QuizGameComponent },
      { path: 'vision', component: VisionBoardComponent },
      { path: 'whiteboard', component: WhiteboardComponent },
    ],
  },

  {
    path: 'trackers',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/trackers/my-trackers/my-trackers').then(
        (m) => m.MyTrackersComponent
      ),
  },
  { path: 'trackers/movie', canActivate: [authGuard], component: MovieTrackerComponent },
  { path: 'trackers/water', canActivate: [authGuard], component: WaterTrackerComponent },
  { path: 'trackers/sleep', canActivate: [authGuard], component: SleepTrackerComponent },
  { path: 'trackers/mood', canActivate: [authGuard], component: MoodTrackerComponent },
  { path: 'trackers/finance', canActivate: [authGuard], component: FinanceTrackerComponent },
  { path: 'trackers/planner', canActivate: [authGuard], component: DailyPlannerComponent },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: '**', redirectTo: 'about' },
];
