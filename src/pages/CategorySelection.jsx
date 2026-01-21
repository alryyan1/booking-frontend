import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import { getMonthName } from '../utils/dateHelpers';
import { Layers, ChevronRight, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CategorySelection = () => {
  const { monthId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/month/${monthId}/category/${categoryId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <Button variant="ghost" onClick={() => navigate('/month')} className="mb-4 -ml-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Month Selection
           </Button>
           <h1 className="text-3xl font-bold tracking-tight">Select Classification</h1>
           <p className="text-muted-foreground mt-1">Filtering inventory sectors for {getMonthName(monthId)}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           [1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)
        ) : categories.map((category) => (
          <Card 
            key={category.id} 
            className="cursor-pointer hover:border-primary transition-colors group"
            onClick={() => handleCategoryClick(category.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider">{category.name_en}</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{category.name_ar}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                <span>Access Tactical Matrix</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategorySelection;
