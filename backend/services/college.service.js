// College API Service
// Uses local JSON file as fallback for Indian colleges data

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COLLEGE_API_BASE = 'https://collegeapi.cyclic.app';

// Load local colleges data
let localColleges = [];
try {
    const filePath = join(__dirname, '../data/indian-colleges.json');
    const fileData = readFileSync(filePath, 'utf-8');
    localColleges = JSON.parse(fileData);
    console.log(`✅ Loaded ${localColleges.length} colleges from local database`);
} catch (error) {
    console.error('❌ Failed to load local colleges:', error.message);
}

// In-memory cache for colleges (refresh every 24 hours)
let collegesCache = {
    data: localColleges, // Start with local data
    lastFetch: Date.now(),
    expiryTime: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Fetch all colleges from API or local database
 */
export const fetchAllColleges = async () => {
    try {
        // Check cache first
        if (collegesCache.data.length > 0 && 
            collegesCache.lastFetch && 
            (Date.now() - collegesCache.lastFetch) < collegesCache.expiryTime) {
            return collegesCache.data;
        }

        // Try to fetch from API
        try {
            const response = await fetch(`${COLLEGE_API_BASE}/all`, {
                timeout: 5000 // 5 second timeout
            });
            
            if (response.ok) {
                const colleges = await response.json();
                
                // Normalize college data
                const normalizedColleges = colleges.map(college => ({
                    name: college.college_name || college.name,
                    state: college.state,
                    city: college.city,
                    type: college.type || 'college',
                    nirf_rank: college.nirf_rank || null
                }));

                // Update cache
                collegesCache.data = normalizedColleges;
                collegesCache.lastFetch = Date.now();

                console.log(`✅ Fetched ${normalizedColleges.length} colleges from API`);
                return normalizedColleges;
            }
        } catch (apiError) {
            console.warn('⚠️ API fetch failed, using local database:', apiError.message);
        }

        // Fallback to local data
        if (localColleges.length > 0) {
            collegesCache.data = localColleges;
            collegesCache.lastFetch = Date.now();
            return localColleges;
        }

        // Return cached data if available
        if (collegesCache.data.length > 0) {
            return collegesCache.data;
        }
        
        // Return empty array if nothing available
        return [];
    } catch (error) {
        console.error('Error fetching colleges:', error);
        
        // Return local or cached data as last resort
        return collegesCache.data.length > 0 ? collegesCache.data : localColleges;
    }
};

/**
 * Search colleges by name
 */
export const searchColleges = async (query) => {
    const colleges = await fetchAllColleges();
    
    if (!query || query.trim().length < 2) {
        return colleges.slice(0, 50); // Return first 50 if no query
    }

    const searchTerm = query.toLowerCase().trim();
    
    return colleges.filter(college => 
        college.name.toLowerCase().includes(searchTerm)
    ).slice(0, 50); // Limit to 50 results
};

/**
 * Validate if college exists
 */
export const validateCollege = async (collegeName) => {
    const colleges = await fetchAllColleges();
    
    const normalizedName = collegeName.toLowerCase().trim();
    
    const exactMatch = colleges.find(college => 
        college.name.toLowerCase() === normalizedName
    );
    
    if (exactMatch) {
        return {
            valid: true,
            college: exactMatch
        };
    }

    // Check for close matches
    const closeMatches = colleges.filter(college => 
        college.name.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(college.name.toLowerCase())
    ).slice(0, 5);

    return {
        valid: false,
        suggestions: closeMatches
    };
};

/**
 * Get colleges by state
 */
export const getCollegesByState = async (state) => {
    const colleges = await fetchAllColleges();
    
    return colleges.filter(college => 
        college.state && college.state.toLowerCase() === state.toLowerCase()
    );
};

/**
 * Get colleges by city
 */
export const getCollegesByCity = async (city) => {
    const colleges = await fetchAllColleges();
    
    return colleges.filter(college => 
        college.city && college.city.toLowerCase() === city.toLowerCase()
    );
};

/**
 * Clear cache (for testing or manual refresh)
 */
export const clearCollegeCache = () => {
    collegesCache.data = [];
    collegesCache.lastFetch = null;
};
