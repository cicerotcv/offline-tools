/**
 * Frozen v2 shares, produced once (2026-11-06) by the v2 implementation with
 * a deterministic random source. They stand for shares people already keep
 * offline: any change that stops them from recovering the secret breaks
 * those copies. Never regenerate or edit them.
 */
export const SHAMIR_V2_VECTOR = {
  secret: 'correct horse battery staple',
  threshold: 3,
  totalShares: 5,
  shares: [
    'AAIDBQHgV45VpOOC8Vh_Ro0ci_ppcKf-JZTzEmGozzadzBtKWavQ9Ro_ZImu0_gdQgAdXIV1NseDsm_-pwaxo_PXnE-2sp4c1BonGe83SBk',
    'AAIDBQLDPDhDfLiUqhvCME1ynaHy5eGlM_qoKYzGxEDrTyCnAqvQ9Ro_ZImu0_gdQgAdXIV1NseDsm_-pwaxo_PXnE-2sp4c1BonGe83SBk',
    'AAIDBQMoW-NsR5__VXDlC2Kp-kqtzsb-3IFPArPto7uElAeM3avQ9Ro_ZImu0_gdQgAdXIV1NseDsm_-pwaxo_PXnE-2sp4c1BonGe83SBk',
    'AAIDBQSUDaKPIPSJQrYKC5XWxIVWsf5L02TIGmdFzlfxXleAEavQ9Ro_ZImu0_gdQgAdXIV1NseDsm_-pwaxo_PXnE-2sp4c1BonGe83SBk',
    'AAIDBQV_anmgG9Pivd0tMLoNo24JmtkQPB8vMVhuqayehXCrzqvQ9Ro_ZImu0_gdQgAdXIV1NseDsm_-pwaxo_PXnE-2sp4c1BonGe83SBk',
  ],
} as const;
