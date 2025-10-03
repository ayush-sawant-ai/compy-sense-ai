import { ArrowRight, BarChart3, Bell, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: 'Track Competitors',
      description: 'Monitor your competitors in real-time with AI-powered web scraping and analysis.'
    },
    {
      icon: Bell,
      title: 'Get Insights',
      description: 'Receive instant notifications about competitor launches, updates, and strategic moves.'
    },
    {
      icon: Calendar,
      title: 'Schedule Reports',
      description: 'Automated daily or weekly competitive intelligence reports delivered to your inbox.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 text-8xl">🔍</div>
            <h1 className="mb-6 text-5xl sm:text-6xl font-bold tracking-tight">
              CompIntel AI
            </h1>
            <p className="mb-8 text-xl sm:text-2xl text-muted-foreground">
              AI Agent for Startup Competitive Intelligence
            </p>
            <p className="mb-10 text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay ahead of the competition with automated tracking, intelligent insights, 
              and real-time notifications about your competitors' moves.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 gradient-primary"
              onClick={() => navigate('/dashboard')}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need for competitive intelligence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features to keep you informed and ahead of the market
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-lg transition-all hover:scale-105 bg-card"
              >
                <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center gradient-hero">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to outsmart your competition?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join startups using CompIntel AI to stay ahead
            </p>
            <Button 
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => navigate('/dashboard')}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 CompIntel AI. Ready for backend integration.</p>
        </div>
      </footer>
    </div>
  );
}
