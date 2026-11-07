/**
 * Frozen v3 shares (AES-256-GCM), produced once (2026-11-06) with a
 * deterministic random source. Like the v2 vector, they stand for shares
 * kept offline: never regenerate or edit them.
 */
export const SHAMIR_V3_VECTOR = {
  secret: 'correct horse battery staple',
  threshold: 3,
  totalShares: 5,
  setId: 'A9F2-3B84',
  shares: [
    'AAMDBQGp8juExpFktwrdaMOeebwPwmXAm3ZBdMeazZhzTmnMn9KVcEs9hs8YYarzPIXOF2AALKyiUJi7DhlkYrHruYdCq9H7UUKux32rgabZKw0ED_xSpmNWyYr_jbM2cuiglR3unQ',
    'AAMDBQKp8juExE6--Agyn8Fxi-sNTYradLQFbkhYz2-xOltbXbB6qj89hs8YYarzPIXOF2AALKyiUJi7DhlkYrHruYdCq9H7UUKux32rgabZKw0ED_xSpmNWyYr_jbM2cuigGl0FBQ',
    'AAMDBQOp8juEH7l1t0NlJB6KXKBCBj0Bi2-yJQcTGJRugQwQEnuNcYA9hs8YYarzPIXOF2AALKyiUJi7DhlkYrHruYdCq9H7UUKux32rgabZKw0ED_xSpmNWyYr_jbM2cuigl4HA6g',
    'AAMDBQSp8juEf2_LtoK5z0aEktG7SdYpvXklrHCkMNJAzvUXncDLL_c9hs8YYarzPIXOF2AALKyiUJi7DhlkYrHruYdCq9H7UUKux32rgabZKw0ED_xSpmNWyYr_jbM2cuigGLwY_w',
    'AAMDBQWp8juEpJgA-cnudJl_RZr0AmHyQqKS5z_v5ymfdaJc0gs89Eg9hs8YYarzPIXOF2AALKyiUJi7DhlkYrHruYdCq9H7UUKux32rgabZKw0ED_xSpmNWyYr_jbM2cuigWJcRYw',
  ],
} as const;
