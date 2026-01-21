import { useNavigate, useParams } from 'react-router-dom';
import { getMonthName, getMonthWeeks } from '../utils/dateHelpers';
import { Calendar as CalendarIcon, ChevronRight, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const WeekSelection = () => {
  const { monthId, categoryId } = useParams();
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const weeks = getMonthWeeks(year, parseInt(monthId));

  const handleWeekClick = (week) => {
    navigate(`/month/${monthId}/category/${categoryId}/week/${week.id}`);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <Button variant="ghost" onClick={() => navigate(`/month/${monthId}`)} className="mb-4 -ml-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Categories
           </Button>
           <h1 className="text-3xl font-bold tracking-tight">Select Deployment Week</h1>
           <p className="text-muted-foreground mt-1">Timeline segments for {getMonthName(monthId)} Logistics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weeks.map((week) => (
          <Card 
            key={week.id} 
            className="cursor-pointer hover:border-primary transition-colors group"
            onClick={() => handleWeekClick(week)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider">Week {week.id}</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{week.label}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                <span>Access Operational Grid</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WeekSelection;
