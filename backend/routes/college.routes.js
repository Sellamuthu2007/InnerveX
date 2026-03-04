import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { 
    fetchAllColleges, 
    searchColleges, 
    validateCollege,
    getCollegesByState,
    getCollegesByCity
} from '../services/college.service.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET /api/v1/colleges - Get all colleges (with optional limit)
router.get('/', asyncHandler(async (req, res) => {
    const { limit = 100 } = req.query;
    
    const colleges = await fetchAllColleges();
    const limitedColleges = colleges.slice(0, parseInt(limit));
    
    res.json({
        success: true,
        count: limitedColleges.length,
        total: colleges.length,
        colleges: limitedColleges
    });
}));

// GET /api/v1/colleges/search?q=query - Search colleges
router.get('/search', asyncHandler(async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Search query must be at least 2 characters'
        });
    }
    
    const colleges = await searchColleges(q);
    
    logger.info('College search', { query: q, results: colleges.length });
    
    res.json({
        success: true,
        query: q,
        count: colleges.length,
        colleges
    });
}));

// POST /api/v1/colleges/validate - Validate college name
router.post('/validate', asyncHandler(async (req, res) => {
    const { name } = req.body;
    
    if (!name || name.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: 'College name must be at least 3 characters'
        });
    }
    
    const result = await validateCollege(name);
    
    logger.info('College validation', { 
        name, 
        valid: result.valid,
        suggestions: result.suggestions?.length || 0
    });
    
    if (result.valid) {
        res.json({
            success: true,
            valid: true,
            college: result.college,
            message: 'College found'
        });
    } else {
        res.json({
            success: true,
            valid: false,
            suggestions: result.suggestions,
            message: 'College not found. Did you mean one of these?'
        });
    }
}));

// GET /api/v1/colleges/state/:state - Get colleges by state
router.get('/state/:state', asyncHandler(async (req, res) => {
    const { state } = req.params;
    
    const colleges = await getCollegesByState(state);
    
    res.json({
        success: true,
        state,
        count: colleges.length,
        colleges
    });
}));

// GET /api/v1/colleges/city/:city - Get colleges by city
router.get('/city/:city', asyncHandler(async (req, res) => {
    const { city } = req.params;
    
    const colleges = await getCollegesByCity(city);
    
    res.json({
        success: true,
        city,
        count: colleges.length,
        colleges
    });
}));

export default router;
