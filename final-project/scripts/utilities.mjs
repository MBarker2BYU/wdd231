// Fetch Data
export async function fetchData(filename) 
{
  const file = `${filename}`;

  try 
  {
    const response = await fetch(file);
  
    if (!response.ok) 
    {
      throw new Error(`Failed to fetch ${file}`);
    }
    
    const data = await response.json();
    
    return data;
  } 
  catch (error) 
  {
    console.error(`Error fetching ${file}:`, error);
    
    return [];
  }
}