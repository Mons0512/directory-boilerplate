import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { AgentCard } from "../components/AgentCard";
import { Agent } from "../types/agent";
import { DataLoader } from "../utils/dataLoader";

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const items = await DataLoader.loadNavigationItems();
        // Sort items by lastUpdated in descending order (newest first)
        const sortedItems = items.sort((a, b) => {
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        });
        setAgents(sortedItems);
        const uniqueCategories = DataLoader.getUniqueCategories(sortedItems);
        setCategories(uniqueCategories);
        setError(null);
      } catch (err) {
        setError("Failed to load navigation data. Please try again later.");
        console.error("Error loading agents:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredAgents = agents.filter((agent) => {
    const matchesCategory = !selectedCategory || agent.category.includes(selectedCategory);
    const matchesSearch = !searchTerm || agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || agent.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header onSearch={setSearchTerm} />

      <main className="max-w-7xl mx-auto py-8">
        <div className="text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Discover Amazing
            <span className="inline-block bg-blue-600 text-white dark:bg-blue-500 dark:text-white px-2 py-1 rounded transform rotate-2">
              AI Agents
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our curated collection of AI agents and tools to enhance
            your workflow.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading agents...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center max-w-md">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Data</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Category Filter - Changed to wrap on mobile */}
            <div className="flex flex-wrap gap-2 py-4 px-4 sm:px-6 lg:px-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(
                      category === selectedCategory ? null : category
                    )
                  }
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                    ${
                      selectedCategory === category
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-6 px-4 sm:px-6 lg:px-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
              {filteredAgents.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="text-gray-400 text-4xl mb-4">🔍</div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Agents Found</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search term or category filter.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
