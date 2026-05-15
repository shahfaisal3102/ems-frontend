import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Employees } from './pages/employees/employees';
import { Attendancelist } from './pages/attendance/attendance';
import { LeaveManagement } from './pages/leave-management/leave-management';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                component: Dashboard
            },
            {
                path: 'employees',
                component: Employees
            },
            {
                path: 'attendance',
                component: Attendancelist
            },
            {
                path: 'leave',
                component: LeaveManagement
            }
        ]
    },

];
