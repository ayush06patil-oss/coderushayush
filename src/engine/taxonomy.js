/**
 * Medical Capability Taxonomy & Specialty Normalizer
 * Standardizes emergency requirements and hospital capabilities across the system.
 */

export const MEDICAL_TAXONOMY = {
  ORTHOPEDICS: "ORTHOPEDICS",
  CARDIOLOGY: "CARDIOLOGY",
  TRAUMA: "TRAUMA",
  NEUROLOGY: "NEUROLOGY",
  MATERNITY: "MATERNITY",
  PEDIATRICS: "PEDIATRICS",
  GENERAL_EMERGENCY: "GENERAL_EMERGENCY",
  BURN_CARE: "BURN_CARE",
  RESPIRATORY: "RESPIRATORY",
  SURGERY: "SURGERY"
};

/**
 * Normalizes input specialty string into canonical MEDICAL_TAXONOMY value.
 * Handles capitalization, whitespace, spelling variations, and aliases.
 */
export function normalizeSpecialty(input) {
  if (!input || typeof input !== 'string') {
    return MEDICAL_TAXONOMY.GENERAL_EMERGENCY;
  }

  const clean = input.trim().toUpperCase();

  if (clean.includes("ORTHO")) return MEDICAL_TAXONOMY.ORTHOPEDICS;
  if (clean.includes("CARDIO") || clean.includes("HEART")) return MEDICAL_TAXONOMY.CARDIOLOGY;
  if (clean.includes("TRAUMA") || clean.includes("ACCIDENT")) return MEDICAL_TAXONOMY.TRAUMA;
  if (clean.includes("NEURO") || clean.includes("STROKE")) return MEDICAL_TAXONOMY.NEUROLOGY;
  if (clean.includes("MATERNITY") || clean.includes("PREGNANCY") || clean.includes("OBSTETRIC") || clean.includes("GYNEC")) return MEDICAL_TAXONOMY.MATERNITY;
  if (clean.includes("PEDIATRIC") || clean.includes("PAEDIATRIC") || clean.includes("CHILD")) return MEDICAL_TAXONOMY.PEDIATRICS;
  if (clean.includes("BURN")) return MEDICAL_TAXONOMY.BURN_CARE;
  if (clean.includes("RESPIRAT") || clean.includes("PULMONARY") || clean.includes("FEVER") || clean.includes("LUNG")) return MEDICAL_TAXONOMY.RESPIRATORY;
  if (clean.includes("SURGERY") || clean.includes("SURGICAL")) return MEDICAL_TAXONOMY.SURGERY;

  return MEDICAL_TAXONOMY.GENERAL_EMERGENCY;
}

/**
 * Returns user-friendly formatted title for canonical taxonomy token.
 */
export function formatSpecialtyName(taxonomyKey) {
  const normalized = normalizeSpecialty(taxonomyKey);
  switch (normalized) {
    case MEDICAL_TAXONOMY.ORTHOPEDICS: return "Orthopedics";
    case MEDICAL_TAXONOMY.CARDIOLOGY: return "Cardiology";
    case MEDICAL_TAXONOMY.TRAUMA: return "Trauma & Emergency";
    case MEDICAL_TAXONOMY.NEUROLOGY: return "Neurology & Stroke";
    case MEDICAL_TAXONOMY.MATERNITY: return "Maternity & Obstetric";
    case MEDICAL_TAXONOMY.PEDIATRICS: return "Pediatrics";
    case MEDICAL_TAXONOMY.BURN_CARE: return "Burn Care";
    case MEDICAL_TAXONOMY.RESPIRATORY: return "Respiratory & Critical Care";
    case MEDICAL_TAXONOMY.SURGERY: return "General Surgery";
    default: return "General Emergency";
  }
}
