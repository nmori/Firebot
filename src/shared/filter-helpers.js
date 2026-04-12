"use strict";

const { ComparisonType } = require("./filter-constants");

/**
 * Maps legacy comparison types to their standardized versions.
 * This allows us to maintain backward compatibility while simplifying the code.
 * 
 * @param {string} comparisonType - The comparison type to standardize
 * @returns {string} - The standardized comparison type
 */
function mapLegacyComparisonType(comparisonType) {
    // Map for roles-related comparison types
    const roleComparisonMap = {
        // "Has role" equivalents
        [ComparisonType.INCLUDING]: ComparisonType.HAS_ROLE,
        [ComparisonType.COMPAT_INCLUDING]: ComparisonType.HAS_ROLE,
        [ComparisonType.COMPAT2_INCLUDING]: ComparisonType.HAS_ROLE,
        [ComparisonType.ORG_INCLUDING]: ComparisonType.HAS_ROLE,
        [ComparisonType.ORG_HAS_ROLE]: ComparisonType.HAS_ROLE,
        [ComparisonType.ORG_IS_IN_ROLE]: ComparisonType.HAS_ROLE,
        
        // "Does not have role" equivalents
        [ComparisonType.NOT_INCLUDING]: ComparisonType.HAS_NOT_ROLE,
        [ComparisonType.COMPAT_NOT_INCLUDING]: ComparisonType.HAS_NOT_ROLE,
        [ComparisonType.ORG_NOT_INCLUDING]: ComparisonType.HAS_NOT_ROLE,
        [ComparisonType.ORG_HAS_NOT_ROLE]: ComparisonType.HAS_NOT_ROLE,
        [ComparisonType.ORG_IS_NOT_IN_ROLE]: ComparisonType.HAS_NOT_ROLE
    };

    // General comparison type mapping
    const generalComparisonMap = {
        // "Is" equivalents
        [ComparisonType.COMPAT_IS]: ComparisonType.IS,
        [ComparisonType.COMPAT2_IS]: ComparisonType.IS,
        [ComparisonType.ORG_IS]: ComparisonType.IS,
        
        // "Is not" equivalents
        [ComparisonType.COMPAT_IS_NOT]: ComparisonType.IS_NOT,
        [ComparisonType.COMPAT2_IS_NOT]: ComparisonType.IS_NOT,
        [ComparisonType.ORG_IS_NOT]: ComparisonType.IS_NOT,
        
        // Other numeric comparisons
        [ComparisonType.COMPAT_GREATER_THAN]: ComparisonType.GREATER_THAN,
        [ComparisonType.ORG_GREATER_THAN]: ComparisonType.GREATER_THAN,
        [ComparisonType.ORG_GREATER_THAN_OR_EQUAL_TO]: ComparisonType.GREATER_THAN_OR_EQUAL_TO,
        [ComparisonType.ORG_LESS_THAN]: ComparisonType.LESS_THAN,
        [ComparisonType.ORG_LESS_THAN_OR_EQUAL_TO]: ComparisonType.LESS_THAN_OR_EQUAL_TO,
        
        // String contains
        [ComparisonType.COMPAT_CONTAINS]: ComparisonType.CONTAINS,
        [ComparisonType.ORG_CONTAINS]: ComparisonType.CONTAINS,
        [ComparisonType.COMPAT_DOESNT_CONTAIN]: ComparisonType.DOES_NOT_CONTAIN,
        [ComparisonType.ORG_DOESNT_CONTAIN]: ComparisonType.DOES_NOT_CONTAIN,
        
        // String operations
        [ComparisonType.COMPAT_DOESNT_STARTS_WITH]: ComparisonType.DOESNT_STARTS_WITH,
        [ComparisonType.ORG_DOESNT_STARTS_WITH]: ComparisonType.DOESNT_STARTS_WITH,
        [ComparisonType.ORG_STARTS_WITH]: ComparisonType.STARTS_WITH,
        [ComparisonType.ORG_DOESNT_END_WITH]: ComparisonType.DOESNT_END_WITH,
        [ComparisonType.ORG_ENDS_WITH]: ComparisonType.ENDS_WITH,
        
        // Regex operations
        [ComparisonType.COMPAT_MATCHES_REGEX]: ComparisonType.MATCHES_REGEX,
        [ComparisonType.COMPAT_DOESNT_MATCH_REGEX]: ComparisonType.DOESNT_MATCH_REGEX,
        [ComparisonType.ORG_MATCHES_REGEX_CS]: ComparisonType.MATCHES_REGEX_CS,
        [ComparisonType.ORG_DOESNT_MATCH_REGEX_CS]: ComparisonType.DOESNT_MATCH_REGEX_CS,
        [ComparisonType.ORG_MATCHES_REGEX]: ComparisonType.MATCHES_REGEX,
        [ComparisonType.ORG_DOESNT_MATCH_REGEX]: ComparisonType.DOESNT_MATCH_REGEX,
        
        // Array operations
        [ComparisonType.COMPAT2_CONTAINS]: ComparisonType.CONTAINS,
        [ComparisonType.COMPAT2_DOESNT_CONTAIN]: ComparisonType.DOES_NOT_CONTAIN
    };

    // Combine role-specific and general mappings
    const mappings = { ...roleComparisonMap, ...generalComparisonMap };
    
    // Return the standardized version if it exists, otherwise return the original
    return mappings[comparisonType] || comparisonType;
}

exports.mapLegacyComparisonType = mapLegacyComparisonType;
