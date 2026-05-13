export interface Attendance {
    id?:number;
    employeeId:number;
    employeeName:string;
    department:string;
    date:string;
    checkIn:string;
    checkOut:string;
    status:string;
}