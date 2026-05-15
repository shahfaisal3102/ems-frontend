export interface Leave {
    id?:number;
    employeeId: number;
    employeeName: string;
    department: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
}