import { format, startOfWeek, endOfWeek, eachDayOfInterval, getWeek } from 'date-fns';

export const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || '';
};

export const getWeeksInMonth = (month, year) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  
  const weeks = [];
  let currentDate = startOfWeek(firstDay, { weekStartsOn: 0 }); // Sunday
  
  while (currentDate <= lastDay || weeks.length < 4) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    
    // Only include if week overlaps with the month
    if (weekEnd >= firstDay && weekStart <= lastDay) {
      weeks.push({
        weekNumber: weeks.length + 1,
        startDate: format(weekStart, 'yyyy-MM-dd'),
        endDate: format(weekEnd, 'yyyy-MM-dd'),
        startDateFormatted: format(weekStart, 'MMM d'),
        endDateFormatted: format(weekEnd, 'MMM d'),
      });
    }
    
    currentDate = new Date(weekEnd);
    currentDate.setDate(currentDate.getDate() + 1);
    
    if (weeks.length >= 6) break; // Safety check
  }
  
  return weeks.slice(0, 4); // Return only first 4 weeks
};

export const getDaysInWeek = (weekStart, weekEnd) => {
  return eachDayOfInterval({
    start: new Date(weekStart),
    end: new Date(weekEnd),
  });
};

export const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd');
};

export const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

