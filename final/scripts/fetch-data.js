export async function fetchAmmunitionData() {
  try {
    const response = await fetch('data/ammunition.json');
    if (!response.ok) {
      throw new Error('Failed to fetch ammunition data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching ammunition data:', error);
    return [];
  }
}