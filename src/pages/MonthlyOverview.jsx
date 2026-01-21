import { useNavigate } from 'react-router-dom';
import { getMonthName } from '../utils/dateHelpers';
import { Calendar, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MonthlyOverview = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleMonthClick = (monthId) => {
    navigate(`/month/${monthId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timeline Selection</h1>
        <p className="text-muted-foreground mt-1">Select a temporal sector to manage asset reservations for {currentYear}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {months.map((month) => (
          <Card 
            key={month} 
            className="cursor-pointer hover:border-primary transition-colors group"
            onClick={() => handleMonthClick(month)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sector {month.toString().padStart(2, '0')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getMonthName(month)}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                <span>View Monthly Matrix</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MonthlyOverview;
