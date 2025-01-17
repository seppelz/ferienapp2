import { VacationPlan } from '../types/vacationPlan';
import { Holiday } from '../types/holiday';
import { format, differenceInDays, eachDayOfInterval, isWeekend, isSameDay, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { GermanState, stateNames } from '../types/GermanState';

interface ICSEvent {
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  categories?: string[];
}

// Helper functions
const getHolidayDate = (holiday: Holiday): Date => {
  if ('date' in holiday && holiday.date) {
    return new Date(holiday.date);
  } else if ('start' in holiday && holiday.start) {
    return new Date(holiday.start);
  }
  throw new Error('Invalid holiday date');
};

const getHolidayEndDate = (holiday: Holiday): Date => {
  if ('date' in holiday && holiday.date) {
    return new Date(holiday.date);
  } else if ('end' in holiday && holiday.end) {
    return new Date(holiday.end);
  }
  return getHolidayDate(holiday);
};

const isHolidayOnDate = (holiday: Holiday, date: Date): boolean => {
  try {
    if ('date' in holiday && holiday.date) {
      return isSameDay(new Date(holiday.date), date);
    } else if ('start' in holiday && holiday.start && holiday.end) {
      const start = new Date(holiday.start);
      const end = new Date(holiday.end);
      return isWithinInterval(date, { start, end });
    }
    return false;
  } catch {
    return false;
  }
};

export const exportService = {
  calculateVacationStats(vacationPlans: VacationPlan[], holidays: Holiday[]) {
    let totalDays = 0;
    let workDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;

    vacationPlans.forEach(vacation => {
      if (!vacation.isVisible) return;

      const days = eachDayOfInterval({ start: vacation.start, end: vacation.end });
      totalDays += days.length;

      days.forEach(date => {
        if (isWeekend(date)) {
          weekendDays++;
        } else if (holidays.some(h => h.type === 'public' && isHolidayOnDate(h, date))) {
          holidayDays++;
        } else {
          workDays++;
        }
      });
    });

    return {
      totalDays,
      workDays,
      weekendDays,
      holidayDays,
      efficiency: totalDays / workDays
    };
  },

  createHRDocument(
    vacationPlans: VacationPlan[],
    personId: 1 | 2,
    holidays: Holiday[]
  ): jsPDF {
    const pdf = new jsPDF();
    const stats = this.calculateVacationStats(vacationPlans, holidays);

    pdf.setFontSize(20);
    pdf.text('Urlaubsantrag', 105, 20, { align: 'center' });

    pdf.setFontSize(12);
    pdf.text(`Person: ${personId}`, 20, 40);
    pdf.text(`Verfügbare Urlaubstage: ${stats.workDays}`, 20, 50);

    const tableData = vacationPlans
      .filter(v => v.isVisible)
      .map(vacation => [
        format(vacation.start, 'dd.MM.yyyy', { locale: de }),
        format(vacation.end, 'dd.MM.yyyy', { locale: de }),
        `${differenceInDays(vacation.end, vacation.start) + 1} Tage`
      ]);

    (pdf as any).autoTable({
      startY: 60,
      head: [['Von', 'Bis', 'Dauer']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] }
    });

    const finalY = (pdf as any).lastAutoTable.finalY + 20;
    pdf.text('Unterschrift Mitarbeiter:', 20, finalY);
    pdf.text('_____________________', 20, finalY + 10);
    pdf.text('Unterschrift Vorgesetzter:', 120, finalY);
    pdf.text('_____________________', 120, finalY + 10);

    return pdf;
  },

  createCelebrationDocument(
    vacationPlans: VacationPlan[],
    personId: 1 | 2,
    holidays: Holiday[],
    otherPersonVacations: VacationPlan[],
    otherPersonHolidays: Holiday[],
    options: {
      person1State: GermanState;
      person2State?: GermanState;
      showSharedAnalysis: boolean;
    }
  ): jsPDF {
    const pdf = new jsPDF();
    let currentY = 20;

    pdf.setFontSize(24);
    pdf.text('Urlaubsplanung 2025', 105, currentY, { align: 'center' });
    currentY += 20;

    pdf.setFontSize(12);
    pdf.text(`Person 1: ${stateNames[options.person1State]}`, 20, currentY);
    if (options.showSharedAnalysis && options.person2State) {
      pdf.text(`Person 2: ${stateNames[options.person2State]}`, 120, currentY);
    }
    currentY += 15;

    const renderVacationTable = (
      title: string,
      vacations: VacationPlan[],
      fillColor: number[],
      y: number
    ) => {
      pdf.setFontSize(14);
      pdf.text(title, 105, y, { align: 'center' });

      const filteredVacations = vacations
        .filter(v => v.isVisible)
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      if (filteredVacations.length > 0) {
        (pdf as any).autoTable({
          startY: y + 10,
          head: [['Von', 'Bis', 'Dauer']],
          body: filteredVacations.map(vacation => [
            format(vacation.start, 'dd.MM.yyyy', { locale: de }),
            format(vacation.end, 'dd.MM.yyyy', { locale: de }),
            `${differenceInDays(vacation.end, vacation.start) + 1} Tage`
          ]),
          theme: 'grid',
          headStyles: { fillColor },
          styles: { fontSize: 10 }
        });
        return (pdf as any).lastAutoTable.finalY + 15;
      }
      
      pdf.setFontSize(10);
      pdf.text('Keine Urlaubstage geplant', 20, y + 10);
      return y + 25;
    };

    currentY = renderVacationTable('Urlaub Person 1', vacationPlans, [46, 204, 113], currentY);

    if (options.showSharedAnalysis && otherPersonVacations.length > 0) {
      currentY = renderVacationTable('Urlaub Person 2', otherPersonVacations, [52, 152, 219], currentY);
    }

    if (options.showSharedAnalysis) {
      pdf.setFontSize(14);
      pdf.text('Gemeinsame Urlaubszeiten', 105, currentY, { align: 'center' });

      const sharedPeriods = vacationPlans.reduce((periods: { start: Date; end: Date }[], vacation) => {
        if (!vacation.isVisible) return periods;
        
        otherPersonVacations.forEach(otherVacation => {
          if (!otherVacation.isVisible) return;
          
          const start = new Date(Math.max(vacation.start.getTime(), otherVacation.start.getTime()));
          const end = new Date(Math.min(vacation.end.getTime(), otherVacation.end.getTime()));
          
          if (start <= end) {
            periods.push({ start, end });
          }
        });
        
        return periods;
      }, []).sort((a, b) => a.start.getTime() - b.start.getTime());

      if (sharedPeriods.length > 0) {
        (pdf as any).autoTable({
          startY: currentY + 10,
          head: [['Von', 'Bis', 'Dauer']],
          body: sharedPeriods.map(period => [
            format(period.start, 'dd.MM.yyyy', { locale: de }),
            format(period.end, 'dd.MM.yyyy', { locale: de }),
            `${differenceInDays(period.end, period.start) + 1} Tage`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [255, 99, 132] },
          styles: { fontSize: 10 }
        });
        currentY = (pdf as any).lastAutoTable.finalY + 15;
      }
    }

    return pdf;
  },

  exportToICS(vacations: VacationPlan[], holidays: Holiday[], state: GermanState): string {
    const events: string[] = [];
    const now = new Date();

    events.push(
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Urlaubsplaner//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    );

    // Add vacation events
    vacations.forEach(vacation => {
      events.push(
        'BEGIN:VEVENT',
        `DTSTAMP:${format(now, "yyyyMMdd'T'HHmmss'Z'")}`,
        `DTSTART;VALUE=DATE:${format(vacation.start, 'yyyyMMdd')}`,
        `DTEND;VALUE=DATE:${format(vacation.end, 'yyyyMMdd')}`,
        `SUMMARY:Urlaub ${state}`,
        `DESCRIPTION:Geplanter Urlaub in ${state}`,
        'END:VEVENT'
      );
    });

    // Add holiday events
    holidays.forEach(holiday => {
      const start = getHolidayDate(holiday);
      const end = getHolidayEndDate(holiday);

      events.push(
        'BEGIN:VEVENT',
        `DTSTAMP:${format(now, "yyyyMMdd'T'HHmmss'Z'")}`,
        `DTSTART;VALUE=DATE:${format(start, 'yyyyMMdd')}`,
        `DTEND;VALUE=DATE:${format(end, 'yyyyMMdd')}`,
        `SUMMARY:${holiday.name} (${holiday.type === 'public' ? 'Feiertag' : 'Schulferien'})`,
        `DESCRIPTION:${holiday.details?.description || ''}`,
        'END:VEVENT'
      );
    });

    events.push('END:VCALENDAR');
    return events.join('\r\n');
  },

  async exportVacationPlan(
    vacations: VacationPlan[],
    holidays: Holiday[],
    personId: 1 | 2,
    type: 'ics' | 'hr' | 'celebration',
    otherPersonVacations: VacationPlan[] = [],
    options?: {
      person1State?: GermanState;
      person2State?: GermanState;
    }
  ) {
    const downloadFile = (content: string, filename: string, type: string) => {
      const blob = new Blob([content], { type });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    switch (type) {
      case 'ics':
        const icsContent = this.exportToICS(vacations, holidays, options?.person1State || GermanState.BE);
        downloadFile(icsContent, 'urlaub.ics', 'text/calendar');
        break;
      case 'hr':
        const hrPdf = this.createHRDocument(vacations, personId, holidays);
        hrPdf.save('urlaubsantrag.pdf');
        break;
      case 'celebration':
        const celebrationPdf = this.createCelebrationDocument(
          vacations,
          personId,
          holidays,
          otherPersonVacations,
          [],
          {
            person1State: options?.person1State || GermanState.BE,
            person2State: options?.person2State,
            showSharedAnalysis: !!options?.person2State
          }
        );
        celebrationPdf.save('urlaubsplanung.pdf');
        break;
    }
  }
}; 