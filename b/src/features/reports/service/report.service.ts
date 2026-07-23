import path from 'path';
import { Student } from '../../students/model/student.model';
import { Driver } from '../../drivers/model/driver.model';
import { Bus } from '../../buses/model/bus.model';
import { Trip } from '../../trips/model/trip.model';
import { Attendance } from '../../attendance/model/attendance.model';
import { StudentSubscription } from '../../subscriptions/model/subscription.model';
import { Maintenance } from '../../maintenance/model/maintenance.model';
import { FuelLog } from '../../fuel/model/fuel.model';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

const FONT_DIR = path.join(__dirname, '..', 'fonts');
const FONT_REGULAR = path.join(FONT_DIR, 'Cairo-Regular.ttf');
const FONT_BOLD = path.join(FONT_DIR, 'Cairo-Bold.ttf');

const reportLabels: Record<string, string> = {
  students: 'تقرير الطلاب',
  drivers: 'تقرير السائقين',
  buses: 'تقرير الحافلات',
  attendance: 'تقرير الحضور',
  subscriptions: 'تقرير الاشتراكات',
  maintenance: 'تقرير الصيانة',
  fuel: 'تقرير الوقود',
  financial: 'التقرير المالي',
};

export class ReportService {
  async getStudentReport(filters: any = {}) {
    const query: any = { isDeleted: { $ne: true } };
    if (filters.college) query.college = filters.college;
    if (filters.status) query.status = filters.status;
    if (filters.gender) query.gender = filters.gender;

    const students = await Student.find(query).populate(['busId', 'routeId', 'subscriptionId']);
    const total = students.length;
    const active = students.filter(s => s.status === 'active').length;
    const male = students.filter(s => s.gender === 'male').length;
    const female = students.filter(s => s.gender === 'female').length;

    return { data: students, summary: { total, active, male, female } };
  }

  async getDriverReport() {
    const drivers = await Driver.find({ isDeleted: { $ne: true } }).populate('busId');
    return {
      data: drivers,
      summary: { total: drivers.length, active: drivers.filter(d => d.status === 'active').length, assigned: drivers.filter(d => d.busId).length },
    };
  }

  async getBusReport() {
    const buses = await Bus.find({ isDeleted: { $ne: true } }).populate(['driverId', 'routeId']);
    return {
      data: buses,
      summary: {
        total: buses.length, active: buses.filter(b => b.status === 'active').length,
        maintenance: buses.filter(b => b.status === 'maintenance').length,
        totalCapacity: buses.reduce((sum, b) => sum + b.capacity, 0),
        totalStudents: buses.reduce((sum, b) => sum + b.currentStudents, 0),
      },
    };
  }

  async getAttendanceReport(startDate?: Date, endDate?: Date, filters: any = {}) {
    const query: any = {};
    if (startDate) query.tripDate = { $gte: startDate };
    if (endDate) query.tripDate = { ...query.tripDate, $lte: endDate };
    if (filters.status) query.status = filters.status;

    const records = await Attendance.find(query)
      .populate({ path: 'studentId', select: 'fullName studentNumber' })
      .populate({ path: 'tripId', select: 'tripNumber driverId', populate: { path: 'driverId', select: 'fullName' } });
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;

    return { data: records, summary: { total: records.length, present, absent, late } };
  }

  async getSubscriptionReport() {
    const subs = await StudentSubscription.find({}).populate(['studentId', 'busId']);
    return {
      data: subs,
      summary: {
        total: subs.length, active: subs.filter(s => s.status === 'active').length,
        expired: subs.filter(s => s.status === 'expired').length,
        totalRevenue: subs.reduce((sum, s) => sum + s.totalAmount, 0),
      },
    };
  }

  async getMaintenanceReport() {
    const records = await Maintenance.find({}).populate(['busId', 'maintenanceType']);
    return {
      data: records,
      summary: {
        total: records.length, pending: records.filter(r => r.status === 'pending').length,
        completed: records.filter(r => r.status === 'completed').length,
        totalCost: records.reduce((sum, r) => sum + r.cost, 0),
      },
    };
  }

  async getFuelReport() {
    const records = await FuelLog.find({}).populate(['busId', 'driverId']);
    return {
      data: records,
      summary: {
        totalLiters: records.reduce((sum, r) => sum + r.liters, 0),
        totalCost: records.reduce((sum, r) => sum + r.totalCost, 0),
        count: records.length,
      },
    };
  }

  async getFinancialReport(startDate?: Date, endDate?: Date) {
    const query: any = {};
    if (startDate) query.createdAt = { $gte: startDate };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: endDate };

    const subscriptions = await StudentSubscription.find(query);
    const maintenance = await Maintenance.find(query);
    const fuel = await FuelLog.find(query);

    const revenue = subscriptions.reduce((sum, s) => sum + s.totalAmount, 0);
    const maintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
    const fuelCost = fuel.reduce((sum, f) => sum + f.totalCost, 0);

    return {
      revenue, expenses: { maintenance: maintenanceCost, fuel: fuelCost, total: maintenanceCost + fuelCost },
      net: revenue - (maintenanceCost + fuelCost),
    };
  }

  async exportPDF(reportType: string, filters: any = {}): Promise<Buffer> {
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      bufferPages: true,
      info: {
        Title: reportLabels[reportType] || 'تقرير',
        Author: 'SUTMS',
        Subject: reportLabels[reportType] || 'تقرير',
        CreationDate: new Date(),
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    try { doc.registerFont('Cairo', FONT_REGULAR); } catch { }
    try { doc.registerFont('CairoBold', FONT_BOLD); } catch { }

    const fontName = 'Cairo';
    const fontBold = 'CairoBold';

    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    const title = reportLabels[reportType] || 'تقرير';

    doc.font(fontBold).fontSize(18).text('Smart University Transportation System', { align: 'center' });
    doc.moveDown(0.3);
    doc.font(fontName).fontSize(12).text('نظام إدارة النقل الجامعي الذكي', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#2563EB').lineWidth(2).stroke();
    doc.moveDown(0.5);
    doc.font(fontBold).fontSize(16).text(title, { align: 'center' });
    doc.moveDown(0.3);
    doc.font(fontName).fontSize(10).fillColor('#64748B').text(`${dateStr} | ${timeStr}`, { align: 'center' });
    doc.moveDown(1);
    doc.fillColor('#000000');

    let reportData: any[] = [];
    let summary: any = {};

    switch (reportType) {
      case 'students': {
        const r = await this.getStudentReport(filters);
        reportData = r.data;
        summary = r.summary;
        const headers = ['الاسم', 'الرقم', 'الجامعة', 'الكلية', 'المستوى', 'الحافلة', 'الحالة'];
        const rows = reportData.map((s: any) => [
          s.fullName || `${s.firstName} ${s.lastName}`,
          s.studentNumber,
          s.universityId,
          s.college,
          s.academicLevel,
          s.busId?.busNumber || '--',
          s.status === 'active' ? 'نشط' : s.status,
        ]);
        this.drawTable(doc, fontName, fontBold, headers, rows);
        break;
      }
      case 'drivers': {
        const r = await this.getDriverReport();
        reportData = r.data;
        summary = r.summary;
        const headers = ['الاسم', 'الرقم', 'الهاتف', 'الهوية', 'الحافلة', 'الحالة'];
        const rows = reportData.map((d: any) => [
          d.fullName,
          d.driverNumber,
          d.phone,
          d.nationalId,
          d.busId?.busNumber || '--',
          d.status === 'active' ? 'نشط' : d.status,
        ]);
        this.drawTable(doc, fontName, fontBold, headers, rows);
        break;
      }
      case 'buses': {
        const r = await this.getBusReport();
        reportData = r.data;
        summary = r.summary;
        const headers = ['الرقم', 'اللوحة', 'الماركة', 'الموديل', 'السعة', 'السائق', 'الحالة'];
        const rows = reportData.map((b: any) => [
          b.busNumber,
          b.plateNumber,
          b.brand,
          b.modelName,
          String(b.capacity),
          b.driverId?.fullName || '--',
          b.status === 'active' ? 'نشط' : b.status === 'maintenance' ? 'صيانة' : b.status,
        ]);
        this.drawTable(doc, fontName, fontBold, headers, rows);
        break;
      }
      case 'attendance': {
        const r = await this.getAttendanceReport(
          filters.startDate ? new Date(filters.startDate) : undefined,
          filters.endDate ? new Date(filters.endDate) : undefined,
        );
        reportData = r.data;
        summary = r.summary;
        const headers = ['الطالب', 'التاريخ', 'الحالة', 'الرحلة', 'وقت الدخول'];
        const rows = reportData.map((a: any) => [
          a.studentId?.fullName || a.studentId?.studentNumber || '--',
          a.tripDate ? new Date(a.tripDate).toLocaleDateString('ar-SA') : '--',
          a.status === 'present' ? 'حاضر' : a.status === 'absent' ? 'غائب' : a.status === 'late' ? 'متأخر' : a.status,
          a.tripId?.tripNumber || '--',
          a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('ar-SA') : '--',
        ]);
        this.drawTable(doc, fontName, fontBold, headers, rows);
        break;
      }
      case 'subscriptions': {
        const r = await this.getSubscriptionReport();
        reportData = r.data;
        summary = r.summary;
        const headers = ['الطالب', 'الحافلة', 'المبلغ', 'الخصم', 'الإجمالي', 'تاريخ البداية', 'تاريخ الانتهاء', 'الحالة'];
        const rows = reportData.map((s: any) => [
          s.studentId?.fullName || s.studentId?.studentNumber || '--',
          s.busId?.busNumber || '--',
          String(s.amount),
          String(s.discount),
          String(s.totalAmount),
          s.startDate ? new Date(s.startDate).toLocaleDateString('ar-SA') : '--',
          s.endDate ? new Date(s.endDate).toLocaleDateString('ar-SA') : '--',
          s.status === 'active' ? 'نشط' : s.status === 'expired' ? 'منتهي' : s.status,
        ]);
        this.drawTable(doc, fontName, fontBold, headers, rows);
        break;
      }
      case 'maintenance': {
        const r = await this.getMaintenanceReport();
        reportData = r.data;
        summary = r.summary;
        const headers = ['الحافلة', 'النوع', 'الوصف', 'التاريخ', 'التكلفة', 'الحالة'];
        const rows = reportData.map((m: any) => [
          m.busId?.busNumber || '--',
          m.maintenanceType?.nameAr || m.maintenanceType?.name || '--',
          m.description,
          m.maintenanceDate ? new Date(m.maintenanceDate).toLocaleDateString('ar-SA') : '--',
          String(m.cost),
          m.status === 'pending' ? 'قيد الانتظار' : m.status === 'completed' ? 'مكتمل' : m.status,
        ]);
        this.drawTable(doc, fontName, fontBold, headers, rows);
        break;
      }
      case 'fuel': {
        const r = await this.getFuelReport();
        reportData = r.data;
        summary = r.summary;
        const headers = ['الحافلة', 'السائق', 'الكمية', 'السعر', 'التكلفة', 'التاريخ', 'العداد'];
        const rows = reportData.map((f: any) => [
          f.busId?.busNumber || '--',
          f.driverId?.fullName || '--',
          `${f.liters} لتر`,
          String(f.price),
          String(f.totalCost),
          f.date ? new Date(f.date).toLocaleDateString('ar-SA') : '--',
          String(f.odometer),
        ]);
        this.drawTable(doc, fontName, fontBold, headers, rows);
        break;
      }
      case 'financial': {
        const r = await this.getFinancialReport(
          filters.startDate ? new Date(filters.startDate) : undefined,
          filters.endDate ? new Date(filters.endDate) : undefined,
        );
        summary = r;
        doc.font(fontBold).fontSize(14).text('ملخص مالي', { align: 'right' });
        doc.moveDown(0.5);
        const finHeaders = ['البيان', 'المبلغ (ر.س)'];
        const finRows = [
          ['إجمالي الاشتراكات (الإيرادات)', String(r.revenue)],
          ['إجمالي تكاليف الصيانة', String(r.expenses.maintenance)],
          ['إجمالي تكاليف الوقود', String(r.expenses.fuel)],
          ['إجمالي المصروفات', String(r.expenses.total)],
          ['صافي الإيرادات', String(r.net)],
        ];
        this.drawTable(doc, fontName, fontBold, finHeaders, finRows);
        break;
      }
    }

    if (reportType !== 'financial' && Object.keys(summary).length > 0) {
      doc.moveDown(1);
      doc.font(fontBold).fontSize(12).text('ملخص', { align: 'right' });
      doc.moveDown(0.3);
      doc.font(fontName).fontSize(10);
      for (const [key, val] of Object.entries(summary)) {
        const label = this.getSummaryLabel(key);
        doc.text(`${label}: ${val}`, { align: 'right' });
      }
    }

    const pageCount = doc.bufferedPageRange();
    for (let i = 0; i < pageCount.count; i++) {
      doc.switchToPage(i);
      doc.font(fontName).fontSize(8).fillColor('#94A3B8');
      doc.text(
        `صفحة ${i + 1} من ${pageCount.count} | SUTMS | ${dateStr}`,
        40, doc.page.height - 30, { align: 'center', width: doc.page.width - 80 }
      );
    }

    doc.end();

    return new Promise((resolve, reject) => {
      const chunksOut: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunksOut.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunksOut)));
      doc.on('error', reject);
    });
  }

  private drawTable(doc: PDFKit.PDFDocument, fontName: string, fontBold: string, headers: string[], rows: string[][]) {
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colCount = headers.length;
    const colWidth = pageWidth / colCount;
    const rowHeight = 22;
    const startX = doc.page.margins.left;
    let y = doc.y;

    const drawHeader = () => {
      doc.font(fontBold).fontSize(9).fillColor('#FFFFFF');
      doc.rect(startX, y, pageWidth, rowHeight).fill('#2563EB');
      doc.fillColor('#FFFFFF');
      for (let i = 0; i < colCount; i++) {
        doc.font(fontBold).fontSize(9).fillColor('#FFFFFF');
        doc.text(headers[i], startX + i * colWidth + 4, y + 5, { width: colWidth - 8, align: 'center', lineBreak: false });
      }
      y += rowHeight;
    };

    drawHeader();

    for (let r = 0; r < rows.length; r++) {
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom - 30) {
        doc.addPage();
        y = doc.page.margins.top;
        drawHeader();
      }

      const bgColor = r % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
      doc.rect(startX, y, pageWidth, rowHeight).fill(bgColor).fillColor('#000000');

      for (let c = 0; c < colCount; c++) {
        const cellText = rows[r][c] || '--';
        doc.font(fontName).fontSize(8).fillColor('#0F172A');
        doc.text(cellText, startX + c * colWidth + 4, y + 5, { width: colWidth - 8, align: 'center', lineBreak: false });
      }

      doc.moveTo(startX, y + rowHeight).lineTo(startX + pageWidth, y + rowHeight).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
      y += rowHeight;
    }

    doc.y = y + 10;
    doc.fillColor('#000000');
  }

  private getSummaryLabel(key: string): string {
    const labels: Record<string, string> = {
      total: 'الإجمالي', active: 'نشط', male: 'ذكور', female: 'إناث',
      assigned: 'معين', maintenance: 'صيانة', totalCapacity: 'السعة الكلية',
      totalStudents: 'عدد الطلاب', present: 'حاضر', absent: 'غائب', late: 'متأخر',
      expired: 'منتهي', totalRevenue: 'إجمالي الإيرادات', pending: 'قيد الانتظار',
      completed: 'مكتمل', totalCost: 'إجمالي التكلفة', totalLiters: 'إجمالي اللترات',
      count: 'عدد السجلات', revenue: 'الإيرادات', expenses: 'المصروفات',
    };
    return labels[key] || key;
  }

  async exportExcel(reportType: string, data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(reportLabels[reportType] || reportType);

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      sheet.addRow(headers);
      data.forEach(item => {
        sheet.addRow(headers.map(h => item[h]?.toString() || ''));
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

export const reportService = new ReportService();
