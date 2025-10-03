import { useState } from 'react';
import { Plus, ExternalLink, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { mockCompetitors, mockInsights } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function Dashboard() {
  const [competitors] = useState(mockCompetitors);
  const [insights] = useState(mockInsights);

  const handleAddCompetitor = () => {
    toast.info('API Placeholder: /api/addCompetitor');
  };

  const handleRefresh = () => {
    toast.success('Refreshing insights...');
    // Placeholder: /api/getInsights
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      product: 'bg-blue-500/10 text-blue-500',
      funding: 'bg-green-500/10 text-green-500',
      partnership: 'bg-purple-500/10 text-purple-500',
      launch: 'bg-orange-500/10 text-orange-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/10 text-gray-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your competitive landscape in real-time</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tracked Competitors</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{competitors.length}</div>
              <p className="text-xs text-muted-foreground">Active monitoring</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New Insights</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.filter(i => !i.isRead).length}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Competitors Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Competitors</h2>
            <Button onClick={handleAddCompetitor}>
              <Plus className="h-4 w-4 mr-2" />
              Add Competitor
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.map(competitor => (
              <Card key={competitor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{competitor.logo}</div>
                      <div>
                        <CardTitle className="text-lg">{competitor.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Updated {formatDistanceToNow(new Date(competitor.lastChecked), { addSuffix: true })}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{competitor.description}</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={competitor.website} target="_blank" rel="noopener noreferrer">
                      Visit Website
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Insights Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Insights</h2>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {insights.map(insight => (
              <Card key={insight.id} className={insight.isRead ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{insight.competitorLogo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <Badge className={getCategoryColor(insight.category)}>
                          {insight.category}
                        </Badge>
                        {!insight.isRead && (
                          <Badge variant="destructive">New</Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm mb-2">
                        {insight.competitorName} · {formatDistanceToNow(new Date(insight.timestamp), { addSuffix: true })}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
