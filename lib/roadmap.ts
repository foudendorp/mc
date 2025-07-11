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

// For now, let's return some sample roadmap data to test the functionality
export async function fetchRoadmapData(): Promise<RoadmapItem[]> {
  // Sample roadmap data for testing
  const sampleData: RoadmapItem[] = [
    {
      id: "ROADMAP_SAMPLE_1",
      title: "Microsoft Teams: New Meeting Features",
      description: "Enhanced meeting capabilities coming to Microsoft Teams",
      link: "https://www.microsoft.com/roadmap/sample1",
      pubDate: "2025-07-10T10:00:00Z",
      category: ["Microsoft Teams", "Meetings"],
      guid: "sample-1"
    },
    {
      id: "ROADMAP_SAMPLE_2", 
      title: "SharePoint: Advanced Search",
      description: "Improved search functionality in SharePoint Online",
      link: "https://www.microsoft.com/roadmap/sample2",
      pubDate: "2025-07-09T15:30:00Z",
      category: ["SharePoint", "Search"],
      guid: "sample-2"
    }
  ];

  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      resolve(sampleData);
    }, 1000);
  });
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
