import { Routes } from '@angular/router';
import { ProgramFormComponent } from './components/program-form/program-form.component';
import { ProgramListComponent } from './components/program-list/program-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/form', pathMatch: 'full' },
  { path: 'form', component: ProgramFormComponent },
  { path: 'list', component: ProgramListComponent }
];
