export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category: string[];
  guid: string;
}

export interface CombinedItem {
  id: string;
  title: string;
  service: string[] | undefined;
  lastUpdated: string | undefined;
  isMajor: boolean;
  type: 'message-center' | 'roadmap';
  link?: string;
  description?: string;
  category?: string[];
}

let cachedRoadmapData: RoadmapItem[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function parseXML(xmlText: string): RoadmapItem[] {
  if (typeof window === 'undefined') {
    // Server-side: return empty array for now, we'll handle this in a client component
    return [];
  }
  
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const items = xmlDoc.querySelectorAll('item');
    const roadmapItems: RoadmapItem[] = [];
    
    items.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const guid = item.querySelector('guid')?.textContent || link || `roadmap-${index}`;
      
      // Get categories
      const categoryElements = item.querySelectorAll('category');
      const categories: string[] = [];
      categoryElements.forEach(cat => {
        const catText = cat.textContent;
        if (catText) categories.push(catText);
      });
      
      roadmapItems.push({
        id: `ROADMAP_${guid}`,
        title,
        description,
        link,
        pubDate,
        category: categories,
        guid
      });
    });
    
    return roadmapItems;
  } catch (error) {
    console.error('Error parsing XML:', error);
    return [];
  }
}

export async function fetchRoadmapData(): Promise<RoadmapItem[]> {
  // Check if we have cached data that's still fresh
  if (cachedRoadmapData && Date.now() - lastFetchTime < CACHE_DURATION) {
    return cachedRoadmapData;
  }

  try {
    const response = await fetch('https://www.microsoft.com/releasecommunications/api/v2/m365/rss', {
      cache: 'force-cache' // Cache the response
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const processedItems = parseXML(xmlText);

    cachedRoadmapData = processedItems;
    lastFetchTime = Date.now();
    
    return processedItems;
  } catch (error) {
    console.error('Error fetching roadmap data:', error);
    return cachedRoadmapData || []; // Return cached data if available, otherwise empty array
  }
}

export function getRoadmapServices(categories: string[]): string[] {
  // Map roadmap categories to services that match your message center services
  const serviceMapping: { [key: string]: string } = {
    'teams': 'Microsoft Teams',
    'sharepoint': 'SharePoint Online',
    'exchange': 'Exchange Online',
    'onedrive': 'OneDrive for Business',
    'office': 'Microsoft 365 Apps',
    'outlook': 'Outlook',
    'power platform': 'Power Platform',
    'viva': 'Microsoft Viva',
    'copilot': 'Microsoft Copilot'
  };

  const services: string[] = [];
  categories.forEach(category => {
    const lowerCategory = category.toLowerCase();
    Object.keys(serviceMapping).forEach(key => {
      if (lowerCategory.includes(key)) {
        services.push(serviceMapping[key]);
      }
    });
  });

  return services.length > 0 ? services : ['Microsoft 365 Roadmap'];
}
