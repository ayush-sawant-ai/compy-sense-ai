export interface Competitor {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  lastChecked: string;
}

export interface Insight {
  id: string;
  competitorId: string;
  competitorName: string;
  competitorLogo: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'product' | 'funding' | 'partnership' | 'launch';
  isRead: boolean;
}

export const mockCompetitors: Competitor[] = [
  {
    id: '1',
    name: 'OpenAI',
    logo: '🤖',
    website: 'https://openai.com',
    description: 'Leading AI research and deployment company',
    lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Google DeepMind',
    logo: '🧠',
    website: 'https://deepmind.google',
    description: 'AI research lab focused on solving intelligence',
    lastChecked: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Anthropic',
    logo: '⚡',
    website: 'https://anthropic.com',
    description: 'AI safety and research company',
    lastChecked: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  }
];

export const mockInsights: Insight[] = [
  {
    id: '1',
    competitorId: '1',
    competitorName: 'OpenAI',
    competitorLogo: '🤖',
    title: 'OpenAI launched GPT upgrade',
    description: 'Major upgrade to GPT-4 with improved reasoning capabilities and faster response times. New features include enhanced code generation and multimodal support.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'launch',
    isRead: false
  },
  {
    id: '2',
    competitorId: '2',
    competitorName: 'Google DeepMind',
    competitorLogo: '🧠',
    title: 'DeepMind announced new healthcare AI',
    description: 'Revolutionary AI system for early disease detection. The model can analyze medical imaging with unprecedented accuracy, potentially transforming diagnostics.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    category: 'product',
    isRead: false
  },
  {
    id: '3',
    competitorId: '3',
    competitorName: 'Anthropic',
    competitorLogo: '⚡',
    title: 'Anthropic released Claude feature',
    description: 'New Claude 3 Opus with extended context window of 200K tokens. Includes improved safety features and better alignment with human values.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    category: 'launch',
    isRead: false
  },
  {
    id: '4',
    competitorId: '1',
    competitorName: 'OpenAI',
    competitorLogo: '🤖',
    title: 'OpenAI secures $500M funding',
    description: 'Series D funding round led by major tech investors. Funds will be used to expand compute infrastructure and accelerate AGI research.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    category: 'funding',
    isRead: true
  },
  {
    id: '5',
    competitorId: '3',
    competitorName: 'Anthropic',
    competitorLogo: '⚡',
    title: 'Anthropic partners with enterprise clients',
    description: 'Strategic partnership with Fortune 500 companies to deploy Claude in enterprise environments. Focus on secure, scalable AI solutions.',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    category: 'partnership',
    isRead: true
  }
];
