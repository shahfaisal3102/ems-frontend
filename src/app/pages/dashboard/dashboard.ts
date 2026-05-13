import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-dashboard',
  imports: [CardModule, ChartModule, CommonModule, AvatarModule, TagModule, TableModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  private empService = inject(EmployeeService);

  employees = signal<Employee[]>([]);

  totalEmployees = signal(0);
  activeEmployees = signal(0);
  inactiveEmployees = signal(0);
  departmentCount = signal(0);
  totalSalary = signal(0);

  chartData: any;
  chartOptions: any;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.empService.getEmployees().subscribe({
      next: (data) => {
        this.employees.set(data);

        this.totalEmployees.set(data.length);

        this.activeEmployees.set(
          data.filter(emp => emp.status === 'Active').length
        );

        this.inactiveEmployees.set(
          data.filter(emp => emp.status === 'Inactive').length
        );

        const departments = [...new Set(
          data.map(emp => emp.department)
        )];

        this.departmentCount.set(departments.length);

        const salarySum = data.reduce(
          (sum, emp) => sum + emp.salary,
          0
        );

        this.totalSalary.set(salarySum);

        this.buildDepartmentChart(data);
      }
    });
  }

  buildDepartmentChart(data: Employee[]) {
    const departmentMap: Record<string, number> = {};

    data.forEach(emp => {
      departmentMap[emp.department] =
        (departmentMap[emp.department] || 0) + 1;
    });

    this.chartData = {
      labels: Object.keys(departmentMap),
      datasets: [
        {
          data: Object.values(departmentMap)
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
  }

  getSeverity(status: string) {
    return status === 'Active'
      ? 'success'
      : 'danger';
  }
}