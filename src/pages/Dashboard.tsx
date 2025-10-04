import { useState, useEffect } from 'react';
import { Plus, ExternalLink, RefreshCw, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { competitorService } from '@/services/competitorService';
import type { Competitor, Insight } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Dashboard() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [insights, setInsights] = useState<(Insight & { competitor: Competitor })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    logo: '🏢',
    website: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [competitorsData, insightsData] = await Promise.all([
        competitorService.getCompetitors(),
        competitorService.getInsights(),
      ]);
      setCompetitors(competitorsData);
      setInsights(insightsData);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetitor = async () => {
    if (!newCompetitor.name || !newCompetitor.website) {
      toast.error('Name and website are required');
      return;
    }

    try {
      toast.loading('Adding competitor...');
      const added = await competitorService.addCompetitor(newCompetitor);
      setCompetitors([added, ...competitors]);
      setIsDialogOpen(false);
      setNewCompetitor({ name: '', logo: '🏢', website: '', description: '' });
      toast.dismiss();
      toast.success('Competitor added successfully');

      toast.loading('Analyzing competitor website...');
      await competitorService.scrapeAndAnalyze(added.id, added.website, added.name);
      toast.dismiss();
      toast.success('Analysis complete');
      await loadData();
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to add competitor');
      console.error(error);
    }
  };

  const handleRefresh = async () => {
    try {
      toast.loading('Refreshing insights...');
      await loadData();
      toast.dismiss();
      toast.success('Insights refreshed');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to refresh');
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

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
              <div className="text-2xl font-bold">{insights.filter(i => !i.is_read).length}</div>
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Competitor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Competitor</DialogTitle>
                  <DialogDescription>
                    Enter details about the competitor you want to track
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      value={newCompetitor.name}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                      placeholder="e.g., OpenAI"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo">Logo Emoji</Label>
                    <Input
                      id="logo"
                      value={newCompetitor.logo}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, logo: e.target.value })}
                      placeholder="🤖"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      value={newCompetitor.website}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, website: e.target.value })}
                      placeholder="https://openai.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newCompetitor.description}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, description: e.target.value })}
                      placeholder="Brief description"
                    />
                  </div>
                  <Button onClick={handleAddCompetitor} className="w-full">
                    Add Competitor
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                          Updated {formatDistanceToNow(new Date(competitor.last_checked), { addSuffix: true })}
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
            {insights.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No insights yet. Add competitors to start tracking.</p>
                </CardContent>
              </Card>
            ) : (
              insights.map(insight => (
                <Card key={insight.id} className={insight.is_read ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{insight.competitor?.logo || '🏢'}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <Badge className={getCategoryColor(insight.category)}>
                            {insight.category}
                          </Badge>
                          {!insight.is_read && (
                            <Badge variant="destructive">New</Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm mb-2">
                          {insight.competitor?.name || 'Unknown'} · {formatDistanceToNow(new Date(insight.timestamp), { addSuffix: true })}
                        </CardDescription>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
