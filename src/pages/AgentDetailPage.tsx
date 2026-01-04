import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Globe, Github, Twitter, Calendar } from 'lucide-react';
import { Agent } from '../types/agent';
import { DataLoader } from '../utils/dataLoader';
import { Header } from '../components/Header';

export function AgentDetailPage() {
  const { id } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgentData() {
      try {
        setIsLoading(true);
        const items = await DataLoader.loadNavigationItems();
        const foundAgent = items.find((a) => a.id === id);
        setAgent(foundAgent || null);
        setError(null);
      } catch (err) {
        setError('Failed to load agent data. Please try again later.');
        console.error('Error loading agent:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAgentData();
  }, [id]);

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Agent not found</h1>
          <Link to="/" className="text-blue-500 dark:text-blue-400 hover:underline">
            Return to directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header onSearch={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to directory
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center text-2xl font-bold text-white"
                style={{ backgroundColor: agent.logo.bgColor || '#4B5563' }}
              >
                {agent.logo.text || agent.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{agent.name}</h1>
                <div className="flex flex-wrap gap-2">
                  {agent.category.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
              {agent.website && (
                <a
                  href={agent.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span>Website</span>
                </a>
              )}
              {agent.github && (
                <a
                  href={agent.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Github className="h-4 w-4" />
                  <span>Source</span>
                </a>
              )}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base">{agent.description}</p>

          <div className="flex flex-wrap gap-4 mb-8">
            {agent.twitter && (
              <a
                href={`https://twitter.com/${agent.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <Twitter className="h-4 w-4" />
                @{agent.twitter}
              </a>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Last updated: {new Date(agent.lastUpdated).toLocaleDateString()}
            </div>
            <span>•</span>
            <div className={`${agent.isOpenSource ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full' : ''}`}>
              {agent.isOpenSource ? 'Open Source' : 'Closed Source'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}