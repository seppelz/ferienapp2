import { VacationPlan, BridgeDayRecommendation } from '../types/vacationPlan';
import { Holiday, SingleDayHoliday, MultiDayHoliday } from '../types/holiday';
import { 
  addDays, 
  differenceInBusinessDays,
  differenceInDays,
  eachDayOfInterval, 
  isWeekend,
  isSameDay,
  subDays,
  isWithinInterval,
  format
} from 'date-fns';

export interface VacationAnalysis {
  bridgeDayOpportunities: BridgeDayRecommendation[];
  schoolHolidayOverlaps: {
    total: number;
    percentage: number;
    recommendations: string[];
  };
  efficiency: {
    score: number;
    recommendations: string[];
  };
}

// Helper function to safely get date from a Holiday
const getHolidayDate = (holiday: Holiday): Date => {
  if ('date' in holiday && holiday.date) {
    return new Date(holiday.date);
  } else if ('start' in holiday && holiday.start) {
    return new Date(holiday.start);
  }
  throw new Error('Invalid holiday date');
};

// Helper function to get end date from a Holiday
const getHolidayEndDate = (holiday: Holiday): Date => {
  if ('date' in holiday && holiday.date) {
    return new Date(holiday.date);
  } else if ('end' in holiday && holiday.end) {
    return new Date(holiday.end);
  }
  return getHolidayDate(holiday); // Default to start date if no end date
};

// Helper function to check if a holiday is on a specific date
const isHolidayOnDate = (holiday: Holiday, date: Date): boolean => {
  try {
    if ('date' in holiday && holiday.date) {
      return isSameDay(new Date(holiday.date), date);
    } else if ('start' in holiday && holiday.start && holiday.end) {
      const start = new Date(holiday.start);
      const end = new Date(holiday.end);
      return date >= start && date <= end;
    }
    return false;
  } catch {
    return false;
  }
};

export function findBridgeDayOpportunities(
  holidays: Holiday[],
  existingVacations: VacationPlan[],
  startDate: Date = new Date(2025, 0, 1),
  endDate: Date = new Date(2025, 11, 31)
): BridgeDayRecommendation[] {
  const opportunities: BridgeDayRecommendation[] = [];
  
  // Filter out school holidays
  const publicHolidays = holidays.filter(h => h.type === 'public' && !h.name.toLowerCase().includes('ferien'));
  const schoolHolidays = holidays.filter(h => h.name.toLowerCase().includes('ferien'));

  // Create intervals for school holidays to check overlaps
  const schoolHolidayIntervals = schoolHolidays.map(h => ({
    start: getHolidayDate(h),
    end: getHolidayEndDate(h)
  }));

  // Helper function to check if a date falls during school holidays
  const isDuringSchoolHoliday = (date: Date) => {
    return schoolHolidayIntervals.some(interval => 
      date >= interval.start && date <= interval.end
    );
  };

  // Helper to check if date is a public holiday
  const isPublicHoliday = (date: Date) => {
    return publicHolidays.some(h => isSameDay(getHolidayDate(h), date));
  };

  // Generate simple 1-2 day bridge opportunities for each holiday
  for (const holiday of publicHolidays) {
    const holidayDate = getHolidayDate(holiday);
    
    // Skip holidays outside date range
    if (holidayDate < startDate || holidayDate > endDate) continue;
    
    // Skip holidays that fall on weekends
    const dayOfWeek = holidayDate.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // THURSDAY HOLIDAY (e.g., Christi Himmelfahrt)
    // Recommendation: Take Friday off for 4-day weekend
    if (dayOfWeek === 4) {
      const friday = addDays(holidayDate, 1);
      
      // Don't recommend if Friday is during school holidays
      if (!isDuringSchoolHoliday(friday) && !isPublicHoliday(friday)) {
        const start = holidayDate;
        const end = addDays(holidayDate, 3); // Through Sunday
        
        opportunities.push({
          dates: [friday],
          requiredVacationDays: 1,
          gainedFreeDays: 4,
          efficiency: 300, // (4-1)/1 * 100
          description: `${format(start, 'dd.MM.')} - ${format(end, 'dd.MM.yy')} (1d = 4d, +300%)`,
          isOptimal: true
        });
      }
    }

    // TUESDAY HOLIDAY
    // Recommendation: Take Monday off for 4-day weekend
    if (dayOfWeek === 2) {
      const monday = subDays(holidayDate, 1);
      
      if (!isDuringSchoolHoliday(monday) && !isPublicHoliday(monday)) {
        const start = subDays(holidayDate, 3); // From Saturday
        const end = holidayDate;
        
        opportunities.push({
          dates: [monday],
          requiredVacationDays: 1,
          gainedFreeDays: 4,
          efficiency: 300,
          description: `${format(start, 'dd.MM.')} - ${format(end, 'dd.MM.yy')} (1d = 4d, +300%)`,
          isOptimal: true
        });
      }
    }

    // WEDNESDAY HOLIDAY
    // Option 1: Take Monday + Tuesday for 5-day weekend
    // Option 2: Take Thursday + Friday for 5-day weekend
    if (dayOfWeek === 3) {
      const monday = subDays(holidayDate, 2);
      const tuesday = subDays(holidayDate, 1);
      
      if (!isDuringSchoolHoliday(monday) && !isDuringSchoolHoliday(tuesday) &&
          !isPublicHoliday(monday) && !isPublicHoliday(tuesday)) {
        const start = subDays(holidayDate, 4); // From Saturday
        const end = holidayDate;
        
        opportunities.push({
          dates: [monday, tuesday],
          requiredVacationDays: 2,
          gainedFreeDays: 5,
          efficiency: 150,
          description: `${format(start, 'dd.MM.')} - ${format(end, 'dd.MM.yy')} (2d = 5d, +150%)`,
          isOptimal: true
        });
      }

      const thursday = addDays(holidayDate, 1);
      const friday = addDays(holidayDate, 2);
      
      if (!isDuringSchoolHoliday(thursday) && !isDuringSchoolHoliday(friday) &&
          !isPublicHoliday(thursday) && !isPublicHoliday(friday)) {
        const start = holidayDate;
        const end = addDays(holidayDate, 4); // Through Sunday
        
        opportunities.push({
          dates: [thursday, friday],
          requiredVacationDays: 2,
          gainedFreeDays: 5,
          efficiency: 150,
          description: `${format(start, 'dd.MM.')} - ${format(end, 'dd.MM.yy')} (2d = 5d, +150%)`,
          isOptimal: true
        });
      }
    }

    // FRIDAY HOLIDAY
    // Recommendation: Take Thursday off for 4-day weekend
    if (dayOfWeek === 5) {
      const thursday = subDays(holidayDate, 1);
      
      if (!isDuringSchoolHoliday(thursday) && !isPublicHoliday(thursday)) {
        const start = thursday;
        const end = addDays(holidayDate, 2); // Through Sunday
        
        opportunities.push({
          dates: [thursday],
          requiredVacationDays: 1,
          gainedFreeDays: 4,
          efficiency: 300,
          description: `${format(start, 'dd.MM.')} - ${format(end, 'dd.MM.yy')} (1d = 4d, +300%)`,
          isOptimal: true
        });
      }
    }

    // MONDAY HOLIDAY
    // Recommendation: Take Friday before for 4-day weekend
    if (dayOfWeek === 1) {
      const friday = subDays(holidayDate, 3);
      
      if (!isDuringSchoolHoliday(friday) && !isPublicHoliday(friday)) {
        const start = friday;
        const end = holidayDate;
        
        opportunities.push({
          dates: [friday],
          requiredVacationDays: 1,
          gainedFreeDays: 4,
          efficiency: 300,
          description: `${format(start, 'dd.MM.')} - ${format(end, 'dd.MM.yy')} (1d = 4d, +300%)`,
          isOptimal: true
        });
      }
    }
  }

  // Sort by efficiency (highest first), then by required days (fewest first)
  return opportunities
    .sort((a, b) => {
      if (b.efficiency !== a.efficiency) {
        return b.efficiency - a.efficiency;
      }
      return a.requiredVacationDays - b.requiredVacationDays;
    })
    .filter((opp, index, self) => 
      // Remove duplicates
      index === self.findIndex(o => 
        o.dates.length === opp.dates.length &&
        o.dates.every((d, i) => isSameDay(d, opp.dates[i]))
      )
    )
    .slice(0, 10); // Limit to top 10 recommendations
}

export function analyzeSchoolHolidayOverlap(
  vacations: VacationPlan[],
  schoolHolidays: Holiday[]
): { overlappingDays: number; percentage: number } {
  let totalVacationDays = 0;
  let overlappingDays = 0;

  vacations.forEach(vacation => {
    const vacationDays = eachDayOfInterval({ start: new Date(vacation.start), end: new Date(vacation.end) });
    totalVacationDays += vacationDays.length;

    vacationDays.forEach(day => {
      if (schoolHolidays.some(holiday => isHolidayOnDate(holiday, day))) {
        overlappingDays++;
      }
    });
  });

  return {
    overlappingDays,
    percentage: totalVacationDays > 0 ? (overlappingDays / totalVacationDays) * 100 : 0
  };
}

export function analyzeVacationEfficiency(
  vacations: VacationPlan[],
  holidays: Holiday[],
  schoolHolidays: Holiday[]
): VacationAnalysis {
  const bridgeDayOpportunities = findBridgeDayOpportunities(holidays, vacations);
  const schoolOverlap = analyzeSchoolHolidayOverlap(vacations, schoolHolidays);
  
  // Calculate overall efficiency
  let totalRequiredDays = 0;
  let totalGainedDays = 0;
  
  vacations.forEach(vacation => {
    const days = eachDayOfInterval({ start: vacation.start, end: vacation.end });
    const requiredDays = days.filter(d => !isWeekend(d)).length;
    const gainedDays = days.length;
    
    totalRequiredDays += requiredDays;
    totalGainedDays += gainedDays;
  });

  const efficiencyScore = totalRequiredDays > 0 ? 
    (totalGainedDays - totalRequiredDays) / totalRequiredDays : 0;

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (bridgeDayOpportunities.length > 0) {
    const optimalOpportunities = bridgeDayOpportunities.filter(o => o.isOptimal);
    if (optimalOpportunities.length > 0) {
      recommendations.push(`${optimalOpportunities.length} besonders effiziente Brückentag-Möglichkeiten gefunden`);
    } else {
      recommendations.push(`${bridgeDayOpportunities.length} Brückentag-Möglichkeiten gefunden`);
    }
  }
  
  if (efficiencyScore < 1) {
    recommendations.push('Versuche mehr Feiertage und Wochenenden in deine Urlaubsplanung einzubeziehen');
  }

  if (schoolOverlap.percentage < 30 && schoolHolidays.length > 0) {
    recommendations.push('Prüfe Schulferien für familienfreundliche Urlaubszeiten');
  }

  return {
    bridgeDayOpportunities,
    schoolHolidayOverlaps: {
      total: schoolOverlap.overlappingDays,
      percentage: schoolOverlap.percentage,
      recommendations: []
    },
    efficiency: {
      score: efficiencyScore,
      recommendations
    }
  };
} 