export interface EnvironmentPreset {
  id: string;
  name: string;
  bgUrl: string;
}

export const ENVIRONMENT_PRESETS: EnvironmentPreset[] = [
  { id: 'coffee_shop', name: '☕ Coffee Shop (কফি শপ)', bgUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80' },
  { id: 'airport', name: '✈️ Airport (এয়ারপোর্ট)', bgUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80' },
  { id: 'office', name: '💼 Office (অফিস)', bgUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80' },
  { id: 'restaurant', name: '🍜 Restaurant (রেস্তোরাঁ)', bgUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80' },
  { id: 'street', name: '🏙️ City Street (শহরের রাস্তা)', bgUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=80' },
  { id: 'library', name: '📚 Library (লাইব্রেরি)', bgUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1920&q=80' },
  { id: 'park', name: '🌳 Park & Nature (পার্ক ও প্রকৃতি)', bgUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1920&q=80' },
  { id: 'hospital', name: '🏥 Hospital (হাসপাতাল)', bgUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80' },
  { id: 'supermarket', name: '🛒 Supermarket (সুপারমার্কেট)', bgUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1920&q=80' },
  { id: 'home', name: '🏠 Home (বাসা)', bgUrl: 'https://images.unsplash.com/photo-1502005229762-cf1b4da7c5d6?auto=format&fit=crop&w=1920&q=80' },
  { id: 'gym', name: '🏋️ Gym (জিম)', bgUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80' },
  { id: 'hotel', name: '🏨 Hotel (হোটেল)', bgUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80' },
  { id: 'meeting', name: '📊 Meeting Room (মিটিং রুম)', bgUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1920&q=80' },
  { id: 'classroom', name: '🏫 Classroom (ক্লাসরুম)', bgUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80' },
];

export function getEnvironmentBg(envId?: string): string {
  if (!envId) return ENVIRONMENT_PRESETS[0].bgUrl;
  const found = ENVIRONMENT_PRESETS.find(e => e.id === envId || e.name.toLowerCase().includes(envId.toLowerCase()));
  return found ? found.bgUrl : ENVIRONMENT_PRESETS[0].bgUrl;
}
