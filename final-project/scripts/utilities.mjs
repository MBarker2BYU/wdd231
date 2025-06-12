/**
 * Fetch JSON data with error handling
 * @param {string} filename - Path to JSON file
 * @returns {Promise<object[]>} - Parsed JSON data or empty array on error
 */
async function fetchData(filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error(`Failed to fetch ${filename}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${filename}:`, error);
        return [];
    }
}

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 * @param {boolean} [debug=false] - Log debug info
 * @returns {boolean} - Success status
 */
function saveDataToLocalStorage(key, data, debug = false) {
    if (typeof key !== 'string' || !key.trim()) {
        console.error('Invalid key for localStorage');
        return false;
    }
    if (data == null) {
        console.error('Invalid data for localStorage');
        return false;
    }
    try {
        localStorage.setItem(key, JSON.stringify(data));
        if (debug) console.log(`Data saved to localStorage: ${key}`);
        return true;
    } catch (error) {
        if (debug) console.error(`Error saving to localStorage: ${key}`, error);
        return false;
    }
}

/**
 * Retrieve data from localStorage
 * @param {string} key - Storage key
 * @param {boolean} [debug=false] - Log debug info
 * @returns {any|null} - Parsed data or null if not found
 */
function getDataFromLocalStorage(key, debug = false) {
    if (typeof key !== 'string' || !key.trim()) {
        console.error('Invalid key for localStorage');
        return null;
    }
    try {
        const data = localStorage.getItem(key);
        if (data === null) {
            if (debug) console.warn(`No data found in localStorage: ${key}`);
            return null;
        }
        return JSON.parse(data);
    } catch (error) {
        if (debug) console.error(`Error retrieving from localStorage: ${key}`, error);
        return null;
    }
}

/**
 * Round number to specified precision
 * @param {number} number - Number to round
 * @param {number} [precision=2] - Decimal places
 * @returns {number} - Rounded number
 */
function roundTo(number, precision = 2) {
    if (typeof number !== 'number' || isNaN(number)) {
        throw new Error('Invalid number for rounding');
    }
    if (typeof precision !== 'number' || precision < 0) {
        throw new Error('Invalid precision for rounding');
    }

    try {
        const factor = 10 ** precision;
        return Math.round(number * factor) / factor;
    }
    catch (error) {
        console.error('Error rounding number:', error);
        return number; // Return original number on error
    }
}

export { fetchData, saveDataToLocalStorage, getDataFromLocalStorage, roundTo };