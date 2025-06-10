// Fetch Data
async function fetchData(filename) 
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

function saveDataToLocalStorage(key, data, debug = false) 
{
  if (typeof key !== 'string' || !key.trim()) 
  {
    console.error('Invalid key provided for localStorage.');
    return;
  }

  if (data === null || data === undefined) 
  {
     throw new error('Invalid data provided for localStorage.');    
  }

  try 
  {
    localStorage.setItem(key, JSON.stringify(data));

    if(debug)
    {
      console.log(`Data saved to localStorage with key: ${key}`);
    }
  }
  catch (error) 
  {
    if(debug)
    {
      console.error(`Error saving data to localStorage with key ${key}:`, error);
    }

    return false;
  }  
}

function getDataFromLocalStorage(key, out, debug = false) 
{
  if (typeof out !== 'object' || out === null)
  {
    throw new error('Invalid output object provided for localStorage retrieval.');    
  }


  if (typeof key !== 'string' || !key.trim()) 
  {
    throw new error('Invalid key provided for localStorage.');    
  }

  try 
  {
    const data = localStorage.getItem(key);
    
    if (data === null) 
    {
      if(debug)
      {
        console.warn(`No data found in localStorage for key: ${key}`);
      }
      return null;
    }
    
    localStorage.getItem(key, data);
    out.data = JSON.parse(data);

    if(debug)
    {
      console.log(`Data retrieved from localStorage with key: ${key}`);
    }

    return true;
  } 
  catch (error) 
  {
    if(debug)
    {
      console.error(`Error retrieving data from localStorage with key ${key}:`, error);
    }
    
    return false;
  }
}

function roundTo(number, precision = 2) 
{
  if (typeof number !== 'number' || isNaN(number)) 
  {
    throw new Error('Invalid number provided for rounding.');
  }

  if (typeof precision !== 'number' || precision < 0) 
  {
    throw new Error('Invalid precision provided for rounding.');
  }

  const factor = Math.pow(10, precision);
  
  return Math.round(number * factor) / factor;
}

export { fetchData, saveDataToLocalStorage, getDataFromLocalStorage, roundTo };