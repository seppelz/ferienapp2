export enum GermanState {
  BW = 'BW',  // Baden-Württemberg
  BY = 'BY',  // Bayern
  BE = 'BE',  // Berlin
  BB = 'BB',  // Brandenburg
  HB = 'HB',  // Bremen
  HH = 'HH',  // Hamburg
  HE = 'HE',  // Hessen
  MV = 'MV',  // Mecklenburg-Vorpommern
  NI = 'NI',  // Niedersachsen
  NW = 'NW',  // Nordrhein-Westfalen
  RP = 'RP',  // Rheinland-Pfalz
  SL = 'SL',  // Saarland
  SN = 'SN',  // Sachsen
  ST = 'ST',  // Sachsen-Anhalt
  SH = 'SH',  // Schleswig-Holstein
  TH = 'TH'  // Thüringen
}

export const stateNames: Record<GermanState, string> = {
  [GermanState.BW]: 'Baden-Württemberg',
  [GermanState.BY]: 'Bayern',
  [GermanState.BE]: 'Berlin',
  [GermanState.BB]: 'Brandenburg',
  [GermanState.HB]: 'Bremen',
  [GermanState.HH]: 'Hamburg',
  [GermanState.HE]: 'Hessen',
  [GermanState.MV]: 'Mecklenburg-Vorpommern',
  [GermanState.NI]: 'Niedersachsen',
  [GermanState.NW]: 'Nordrhein-Westfalen',
  [GermanState.RP]: 'Rheinland-Pfalz',
  [GermanState.SL]: 'Saarland',
  [GermanState.SN]: 'Sachsen',
  [GermanState.ST]: 'Sachsen-Anhalt',
  [GermanState.SH]: 'Schleswig-Holstein',
  [GermanState.TH]: 'Thüringen'
}; 