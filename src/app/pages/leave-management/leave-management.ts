import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { LeaveService } from '../../services/leave-service';
import { Leave } from '../../models/leave';

@Component({
  selector: 'app-leave-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [
    MessageService,
    ConfirmationService
  ],
  templateUrl: './leave-management.html',
  styleUrl: './leave-management.css',
})
export class LeaveManagement {
  private fb = inject(FormBuilder);
  private leaveService = inject(LeaveService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  leaveRecord = signal<Leave[]>([]);
  selectedLeaveId = signal<number | null>(null);

  totalLeaves = signal(0);
  pendingLeaves = signal(0);
  approvedLeaves = signal(0);
  rejectedLeaves = signal(0);

  leaveTypeOptions = [
    { label: "Sick Leave", value: "Sick Leave" },
    { label: "Casual Leave", value: "Casual Leave" },
    { label: "Earned Leave", value: "Earned Leave" },
    { label: "Maternity Leave", value: "Maternity Leave" },
    { label: "Unpaid Leave", value: "Unpaid Leave" },
    { label: "Work From Home", value: "Work From Home" }
  ];

  statusOption = [
    { label: "Pending", value: "Pending" },
    { label: "Approved", value: "Approved" },
    { label: "Rejected", value: "Rejected" }
  ];

  leaveForm = this.fb.group({
    employeeId: [0, Validators.required],
    employeeName: ['', Validators.required],
    department: ['', Validators.required],
    leaveType: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: ['', Validators.required],
    status: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadLeaves();
  }

  loadLeaves() {
    this.leaveService.getLeaves().subscribe({
      next: (data) => {
        this.leaveRecord.set(data);
        this.calculateStats(data);
      },
      error: (err) => {
        console.error(err)
      }
    });
  }

  calculateStats(data: Leave[]) {
    this.totalLeaves.set(data.length);

    this.pendingLeaves.set(
      data.filter(item => item.status === "Pending").length
    );

    this.approvedLeaves.set(
      data.filter(item => item.status == "Approved").length
    );

    this.rejectedLeaves.set(
      data.filter(item => item.status === "Rejected").length
    );
  }

  saveLeave() {

    if (this.leaveForm.invalid) return;

    const leaveData = this.leaveForm.getRawValue() as Leave;

    if (this.selectedLeaveId() === null) {

      this.leaveService.addLeaves(leaveData).subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Leave request added Successfully'
        });

        this.resetForm();
        this.loadLeaves();
      });
    } else {
      this.leaveService.updateLeave(
        this.selectedLeaveId()!,
        leaveData
      ).subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Leave request updated'
        });
        this.resetForm();
        this.loadLeaves();
      });
    }
  }
  editLeave(record: Leave) {
    this.selectedLeaveId.set(record.id!);

    this.leaveForm.patchValue({
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      department: record.department,
      leaveType: record.leaveType,
      startDate: record.startDate,
      endDate: record.endDate,
      reason: record.reason,
      status: record.status
    });
  }

  approveLeave(record: Leave) {
    const updatedRecord = {
      ...record,
      status: 'Approved'
    };
    this.leaveService.updateLeave(record.id!, updatedRecord).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Approved',
        detail: 'Leave Approved'
      });
      this.loadLeaves();
    });
  }

  rejectLeave(record: Leave) {
    const updatedRecord = {
      ...record,
      status: 'Rejected'
    };
    this.leaveService.updateLeave(record.id!, updatedRecord).subscribe(() => {
      this.messageService.add({
        severity: 'warn',
        summary: 'Rejected',
        detail: 'Leave Rejected'
      });
      this.loadLeaves();
    });
  }

  deleteLeave(record: Leave) {
    this.confirmationService.confirm({
      message: `Delete leave request for ${record.employeeName}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclaimation-triangle',

      accept: () => {
        this.leaveService.deleteLeave(record.id!).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Leave Deleted Successfully'
          });
          this.loadLeaves();
        });
      }
    });

  }

  resetForm() {
    this.selectedLeaveId.set(null);

    this.leaveForm.reset({
      employeeId: 0,
      employeeName: '',
      department: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      status: 'Pending'
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case 'Approved':
        return 'success';

      case 'Rejected':
        return 'danger';

      case 'Pending':
        return 'warn';

      default:
        return 'secondary';
    }
  }
}