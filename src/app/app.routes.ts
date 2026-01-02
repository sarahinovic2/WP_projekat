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
import { MyTrackersComponent } from './pages/trackers/my-trackers/my-trackers';

export const routes: Routes = [
  { path: '', redirectTo: 'about', pathMatch: 'full' },
  { path: 'about', component: About },
  { path: 'list', component: List },
  { path: 'schedule', component: Schedule },
  { path: 'student-fun-zone', component: StudentFunZone, children: [
    { path: '', redirectTo: 'bingo', pathMatch: 'full' },
    { path: 'bingo', component: BingoGameComponent },
    { path: 'kanban', component: KanbanBoardComponent },
    { path: 'quiz', component: QuizGameComponent },
    { path: 'vision', component: VisionBoardComponent },
    { path: 'whiteboard', component: WhiteboardComponent }

  ] },
  { path: 'trackers', component: MyTrackersComponent },
  { path: 'trackers/movie', component: MovieTrackerComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }

];
