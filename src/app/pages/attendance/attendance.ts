import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { AttendanceService } from '../../services/attendance';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Attendance } from '../../models/attendance';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-attendance',
  imports: [CardModule, ToastModule,ConfirmDialogModule, TagModule, ReactiveFormsModule, CommonModule,ButtonModule,SelectModule,TableModule, InputTextModule],
  providers: [
    MessageService,
    ConfirmationService
  ],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendancelist {

  private fb = inject(FormBuilder);
  private attendanceService = inject(AttendanceService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  attendanceRecords = signal<Attendance[]>([]);
  selectedAttendanceId = signal<number | null>(null);

  totalRecords = signal(0);
  presentCount = signal(0);
  absentCount = signal(0);
  lateCount = signal(0);

  statusOptions = [
    { label: 'Present', value: 'Present' },
    { label: 'Absent', value: 'Absent' },
    { label: 'Late', value: 'Late' },
    { label: 'Leave', value: 'Leave' }
  ];

  attendanceForm = this.fb.group({
    employeeId: [0, Validators.required],
    employeeName: ['', Validators.required],
    department: ['', Validators.required],
    date: ['', Validators.required],
    checkIn: ['', Validators.required],
    checkOut: ['', Validators.required],
    status: ['Present', Validators.required]
  });

  ngOnInit(): void {
    this.loadAttendance();
  }

  loadAttendance() {
    this.attendanceService.getAttendance().subscribe({
      next: (data) => {
        this.attendanceRecords.set(data);
        this.calculateStats(data);
      },
      error: (err) => {
        console.error(err)
      }
    });
  }

  calculateStats(data: Attendance[]) {
    this.totalRecords.set(data.length);

    this.presentCount.set(
      data.filter(item => item.status === 'Present').length
    )
    this.absentCount.set(
      data.filter(item => item.status === 'Absent').length
    )
    this.lateCount.set(
      data.filter(item => item.status === 'Late').length
    )
  }

  saveAttendance() {
    if (this.attendanceForm.invalid) return;

    const attendanceData = this.attendanceForm.getRawValue() as Attendance;

    if (this.selectedAttendanceId() === null) {
      this.attendanceService.addAttendance(attendanceData).subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Attendance Done'
        });
        this.resetForm();
        this.loadAttendance();
      });
    } else {
      this.attendanceService.updateAttendance(this.selectedAttendanceId()!, attendanceData).subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Attendance Updated'
        });
        this.resetForm();
        this.loadAttendance();
      });
    }
  }

  editAttendance(record: Attendance) {
    this.selectedAttendanceId.set(record.id!);

    this.attendanceForm.patchValue({
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      department: record.department,
      date: record.date,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status
    });
  }

  deleteAttendance(record: Attendance) {
    this.confirmationService.confirm({
      message: `Delete Attendance for ${record.employeeName}`,
      header: `Delete Confirmation`,
      icon: `pi pi-exclaimatio-triangle`,

      accept: () => {
        this.attendanceService.deleteAttendance(record.id!).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Attendance remove'
          });

          this.loadAttendance();
        });
      }
    });
  }

  resetForm() {
    this.selectedAttendanceId.set(null);

    this.attendanceForm.reset({
      employeeId: 0,
      employeeName: '',
      department: '',
      date: '',
      checkIn: '',
      checkOut: '',
      status: 'Present'
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case 'Present':
        return 'success';

      case 'Absent':
        return 'danger';

      case 'Late':
        return 'warn';

      case 'Leave':
        return 'info';

      default:
        return 'secondary';
    }
  }
}

