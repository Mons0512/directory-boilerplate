import { Agent } from '../types/agent';

export interface NavigationData {
  items: Agent[];
  lastUpdated: string;
}

export class DataLoader {
  private static readonly DATA_URL = '/data/navigation.json';
  private static readonly LOCAL_STORAGE_KEY = 'navigation_data';

  /**
   * Load navigation data from local storage if available, otherwise from JSON file
   */
  public static async loadNavigationData(): Promise<NavigationData> {
    // First check local storage
    try {
      const localData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (localData) {
        const parsedData = JSON.parse(localData);
        if (this.isValidNavigationData(parsedData)) {
          return parsedData;
        }
      }
    } catch (error) {
      console.error('Error loading data from local storage:', error);
      // Continue to fetch from server if local storage fails
    }

    // If no valid local data, fetch from server
    try {
      const response = await fetch(this.DATA_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch navigation data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate the data structure
      if (!this.isValidNavigationData(data)) {
        throw new Error('Invalid navigation data structure');
      }

      return data;
    } catch (error) {
      console.error('Error loading navigation data:', error);
      throw error;
    }
  }

  /**
   * Load only the navigation items (agents)
   */
  public static async loadNavigationItems(): Promise<Agent[]> {
    const data = await this.loadNavigationData();
    return data.items;
  }

  /**
   * Validate the navigation data structure
   */
  private static isValidNavigationData(data: any): data is NavigationData {
    return (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray(data.items) &&
      typeof data.lastUpdated === 'string'
    );
  }

  /**
   * Get unique categories from navigation items
   */
  public static getUniqueCategories(items: Agent[]): string[] {
    const categoriesSet = new Set<string>();
    
    items.forEach(item => {
      item.category.forEach(category => {
        categoriesSet.add(category);
      });
    });
    
    return Array.from(categoriesSet).sort();
  }
}
