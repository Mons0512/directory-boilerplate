import { Agent } from '../types/agent';
import { NavigationData } from './dataLoader';
import { DataLoader } from './dataLoader';

export class DataWriter {
  private static readonly LOCAL_STORAGE_KEY = 'navigation_data';
  private static readonly DATA_FILE_NAME = 'navigation.json';

  /**
   * Save navigation data to local storage
   */
  public static saveToLocalStorage(data: NavigationData): void {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));
      console.log('Navigation data saved to local storage');
    } catch (error) {
      console.error('Error saving navigation data to local storage:', error);
      throw error;
    }
  }

  /**
   * Load navigation data from local storage
   */
  public static loadFromLocalStorage(): NavigationData | null {
    try {
      const data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (data) {
        const parsedData = JSON.parse(data);
        if (this.isValidNavigationData(parsedData)) {
          return parsedData;
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading navigation data from local storage:', error);
      return null;
    }
  }

  /**
   * Load navigation data from local storage or fetch from server
   */
  private static async loadData(): Promise<NavigationData> {
    // First try to get data from local storage
    const localData = this.loadFromLocalStorage();
    if (localData) {
      return localData;
    }

    // If no local data, fetch from server
    try {
      return await DataLoader.loadNavigationData();
    } catch (error) {
      console.error('Error loading navigation data:', error);
      // Return default data if fetch fails
      return {
        items: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Download navigation data as JSON file
   */
  public static downloadAsJsonFile(data: NavigationData): void {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.DATA_FILE_NAME;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Navigation data downloaded as JSON file');
    } catch (error) {
      console.error('Error downloading navigation data as JSON file:', error);
      throw error;
    }
  }

  /**
   * Upload navigation data from JSON file
   */
  public static uploadFromJsonFile(file: File): Promise<NavigationData> {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (this.isValidNavigationData(data)) {
              resolve(data);
            } else {
              reject(new Error('Invalid navigation data structure in uploaded file'));
            }
          } catch (error) {
            reject(new Error('Error parsing uploaded JSON file'));
          }
        };
        reader.onerror = () => {
          reject(new Error('Error reading uploaded file'));
        };
        reader.readAsText(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate a unique ID for a new item
   */
  private static generateId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
  }

  /**
   * Generate color from string for default logo
   */
  private static stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }

  /**
   * Get initials from name
   */
  private static getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  /**
   * Generate default logo for an item
   */
  private static generateDefaultLogo(name: string): { bgColor: string; text: string } {
    return {
      bgColor: this.stringToColor(name),
      text: this.getInitials(name)
    };
  }

  /**
   * Add a new navigation item
   */
  public static async addItem(itemData: Omit<Agent, 'id' | 'logo' | 'lastUpdated'>): Promise<Agent[]> {
    try {
      // Load current data
      const currentData = await this.loadData();
      
      // Generate unique ID
      const id = this.generateId(itemData.name);
      
      // Generate default logo
      const logo = this.generateDefaultLogo(itemData.name);
      
      // Create new item
      const newItem: Agent = {
        ...itemData,
        id,
        logo,
        lastUpdated: new Date().toISOString()
      };

      // Check if item with same id already exists
      if (currentData.items.some(existingItem => existingItem.id === id)) {
        throw new Error(`Item with id "${id}" already exists`);
      }

      // Create updated data
      const updatedData: NavigationData = {
        ...currentData,
        items: [...currentData.items, newItem],
        lastUpdated: new Date().toISOString()
      };

      // Save to local storage
      this.saveToLocalStorage(updatedData);

      return updatedData.items;
    } catch (error) {
      console.error('Error adding navigation item:', error);
      throw error;
    }
  }

  /**
   * Update an existing navigation item
   */
  public static async updateItem(itemId: string, updatedItemData: Omit<Agent, 'id' | 'logo' | 'lastUpdated'>): Promise<Agent[]> {
    try {
      // Load current data
      const currentData = await this.loadData();
      
      // Find item index
      const itemIndex = currentData.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        throw new Error(`Item with id "${itemId}" not found`);
      }

      // Create updated item with existing id and logo
      const existingItem = currentData.items[itemIndex];
      const updatedItem: Agent = {
        ...existingItem,
        ...updatedItemData,
        lastUpdated: new Date().toISOString()
      };

      // Create updated items array
      const updatedItems = [...currentData.items];
      updatedItems[itemIndex] = updatedItem;

      // Create updated data
      const updatedData: NavigationData = {
        ...currentData,
        items: updatedItems,
        lastUpdated: new Date().toISOString()
      };

      // Save to local storage
      this.saveToLocalStorage(updatedData);

      return updatedData.items;
    } catch (error) {
      console.error('Error updating navigation item:', error);
      throw error;
    }
  }

  /**
   * Delete a navigation item
   */
  public static async deleteItem(itemId: string): Promise<Agent[]> {
    try {
      // Load current data
      const currentData = await this.loadData();
      
      // Create updated items array without the deleted item
      const updatedItems = currentData.items.filter(item => item.id !== itemId);
      
      // Check if item was found and deleted
      if (updatedItems.length === currentData.items.length) {
        throw new Error(`Item with id "${itemId}" not found`);
      }

      // Create updated data
      const updatedData: NavigationData = {
        ...currentData,
        items: updatedItems,
        lastUpdated: new Date().toISOString()
      };

      // Save to local storage
      this.saveToLocalStorage(updatedData);

      return updatedData.items;
    } catch (error) {
      console.error('Error deleting navigation item:', error);
      throw error;
    }
  }

  /**
   * Validate navigation data structure
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
   * Validate a single navigation item
   */
  public static isValidItem(item: any): item is Agent {
    return (
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.website === 'string' &&
      typeof item.description === 'string' &&
      Array.isArray(item.category) &&
      item.category.every((cat: any) => typeof cat === 'string') &&
      typeof item.isOpenSource === 'boolean' &&
      typeof item.lastUpdated === 'string'
    );
  }
}
