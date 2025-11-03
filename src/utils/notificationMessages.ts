// Vague notification messages
export const vagueMessages = {
  updates: [
    'Update available',
    'System update ready',
    'Maintenance pending',
    'Version check complete',
    'Update required',
    'Refresh ready',
    'Sync complete',
    'Cache updated'
  ],
  
  calculations: [
    'Calc ready',
    'Processing complete',
    'Analysis ready',
    'Computation finished',
    'Math processed',
    'Result available',
    'Calculation done',
    'Formula applied'
  ],
  
  upgrades: [
    'Upgrade ready',
    'Feature available',
    'Enhancement loaded',
    'Improvement active',
    'Update deployed',
    'Optimize ready',
    'Performance boost',
    'Upgrade complete'
  ],
  
  sync: [
    'Sync active',
    'Data synchronized',
    'Connection stable',
    'Refresh complete',
    'Status updated',
    'Process finished',
    'Background complete',
    'Task resolved'
  ],
  
  maintenance: [
    'System optimize',
    'Maintenance mode',
    'Clean up ready',
    'Optimization active',
    'Performance check',
    'System refresh',
    'Background task',
    'Maintenance complete'
  ],

  general: [
    'Ready',
    'Complete',
    'Active',
    'Updated',
    'Refreshed',
    'Optimized',
    'Synced',
    'Processed',
    'Finished',
    'Loaded',
    'Available',
    'Ready'
  ]
};

// Get random vague message
export const getRandomVagueMessage = (category: keyof typeof vagueMessages = 'general'): string => {
  const messages = vagueMessages[category];
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

// Get random message from any category
export const getAnyRandomMessage = (): string => {
  const categories = Object.keys(vagueMessages) as (keyof typeof vagueMessages)[];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  return getRandomVagueMessage(randomCategory);
};