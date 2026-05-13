import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { EmployeeService } from '../../services/employee';
import { Employee } from '../../models/employee';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';


@Component({
  selector: 'app-employees',
  imports: [
    CommonModule, 
    FormsModule, 
    TableModule,
    InputTextModule,
    TagModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    ButtonModule,
    SelectModule
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
  providers: [
    MessageService,
    ConfirmationService
  ]
})
export class Employees {

  private fb = inject(FormBuilder);
  private empService = inject(EmployeeService);
  private messasgeService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  employees = signal<Employee[]>([]);
  selectedEmployeeId = signal<number | null>(null);

   statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  employeeForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    designation: ['', Validators.required],
    department: ['', Validators.required],
    salary: [0, Validators.required],
    status: ['Active']
  });

  ngOnInit():void {
    this.loadEmployees();
  }

  loadEmployees(){
    this.empService.getEmployees().subscribe({
      next:(data) => {
        this.employees.set(data);
      },
      error:(err) => {
        console.error(err);
      }
    });
  }

  saveEmployee() {
    if (this.employeeForm.invalid) return;

    const employeeData = this.employeeForm.getRawValue() as Employee;

    if (this.selectedEmployeeId() === null){
      this.empService.addEmployee(employeeData).subscribe(() => {
        this.messasgeService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Employee added Successfully'
        });

        this.resetForm();
        this.loadEmployees();
      });
    }else{
      this.empService.updateEmployee(
        this.selectedEmployeeId()!,
        employeeData
      ).subscribe(() => {
        this.messasgeService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Employee Updated Successfully'
        });

        this.resetForm();
        this.loadEmployees();
      })
    }
  }

   editEmployee(emp: Employee) {
    this.selectedEmployeeId.set(emp.id!);

    this.employeeForm.patchValue({
      name: emp.name,
      email: emp.email,
      designation: emp.designation,
      department: emp.department,
      salary: emp.salary,
      status: emp.status
    });
  }

  deleteEmployee(emp: Employee) {
    this.confirmationService.confirm({
      message: `Delete ${emp.name}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',

      accept: () => {
        this.empService.deleteEmployee(emp.id!).subscribe(() => {
          this.messasgeService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Employee removed successfully'
          });

          this.loadEmployees();
        });
      }
    });
  }

  resetForm() {
    this.selectedEmployeeId.set(null);

    this.employeeForm.reset({
      salary: 0,
      status: 'Active'
    });
  }

  getSeverity(status: string) {
    return status === 'Active'
      ? 'success'
      : 'danger';
  }
}
