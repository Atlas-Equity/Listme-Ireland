export interface CountyLocations {
  county: string;
  areas: string[];
}

export const IRELAND_LOCATIONS: Record<string, string[]> = {
  'Dublin': [
    'Dublin City Centre',
    'Dublin 1 (North City / Docklands)',
    'Dublin 2 (South City / Grand Canal)',
    'Dublin 3 (Clontarf / Fairview)',
    'Dublin 4 (Ballsbridge / Donnybrook)',
    'Dublin 5 (Raheny / Artane)',
    'Dublin 6 (Ranelagh / Rathmines)',
    'Dublin 6W (Harold\'s Cross / Terenure)',
    'Dublin 7 (Smithfield / Phibsborough)',
    'Dublin 8 (Portobello / The Coombe)',
    'Dublin 9 (Drumcondra / Glasnevin)',
    'Dublin 10 (Ballyfermot)',
    'Dublin 11 (Finglas / Ballymun)',
    'Dublin 12 (Crumlin / Walkinstown)',
    'Dublin 13 (Howth / Sutton / Baldoyle)',
    'Dublin 14 (Dundrum / Churchtown)',
    'Dublin 15 (Blanchardstown / Castleknock)',
    'Dublin 16 (Rathfarnham / Ballinteer)',
    'Dublin 17 (Balgriffin)',
    'Dublin 18 (Sandyford / Cabinteely / Stepaside)',
    'Dublin 20 (Palmerstown)',
    'Dublin 22 (Clondalkin)',
    'Dublin 24 (Tallaght / Firhouse)',
    'Blackrock',
    'Dún Laoghaire',
    'Dalkey / Killiney',
    'Swords',
    'Malahide',
    'Lucan',
    'Balbriggan',
    'Skerries',
    'Other / All Dublin',
  ],
  'Cork': [
    'Cork City Centre',
    'Ballincollig',
    'Carrigaline',
    'Cobh',
    'Midleton',
    'Mallow',
    'Youghal',
    'Bandon',
    'Kinsale',
    'Fermoy',
    'Clonakilty',
    'Skibbereen',
    'Macroom',
    'Bantry',
    'Other / All Cork',
  ],
  'Galway': [
    'Galway City Centre',
    'Salthill',
    'Oranmore',
    'Tuam',
    'Ballinasloe',
    'Loughrea',
    'Athenry',
    'Clifden (Connemara)',
    'Gort',
    'Kinvara',
    'Other / All Galway',
  ],
  'Limerick': [
    'Limerick City Centre',
    'Castletroy',
    'Dooradoyle',
    'Raheen',
    'Annacotty',
    'Newcastle West',
    'Abbeyfeale',
    'Other / All Limerick',
  ],
  'Waterford': [
    'Waterford City',
    'Tramore',
    'Dungarvan',
    'Dunmore East',
    'Other / All Waterford',
  ],
  'Kildare': [
    'Naas',
    'Newbridge',
    'Maynooth',
    'Leixlip',
    'Celbridge',
    'Kildare Town',
    'Athy',
    'Clane',
    'Kilcock',
    'Other / All Kildare',
  ],
  'Meath': [
    'Navan',
    'Ashbourne',
    'Dunboyne',
    'Trim',
    'Kells',
    'Ratoath',
    'Dunshaughlin',
    'Other / All Meath',
  ],
  'Wicklow': [
    'Bray',
    'Greystones',
    'Wicklow Town',
    'Arklow',
    'Blessington',
    'Enniskerry',
    'Other / All Wicklow',
  ],
  'Louth': [
    'Dundalk',
    'Drogheda',
    'Ardee',
    'Blackrock (Louth)',
    'Other / All Louth',
  ],
  'Donegal': [
    'Letterkenny',
    'Buncrana',
    'Donegal Town',
    'Ballybofey / Stranorlar',
    'Bundoran',
    'Other / All Donegal',
  ],
  'Kerry': [
    'Tralee',
    'Killarney',
    'Listowel',
    'Dingle',
    'Kenmare',
    'Killorglin',
    'Other / All Kerry',
  ],
  'Wexford': [
    'Wexford Town',
    'Enniscorthy',
    'Gorey',
    'New Ross',
    'Other / All Wexford',
  ],
  'Kilkenny': [
    'Kilkenny City',
    'Callan',
    'Thomastown',
    'Other / All Kilkenny',
  ],
  'Clare': [
    'Ennis',
    'Shannon',
    'Kilrush',
    'Lahinch / Ennistymon',
    'Other / All Clare',
  ],
  'Mayo': [
    'Castlebar',
    'Westport',
    'Ballina',
    'Claremorris',
    'Other / All Mayo',
  ],
  'Tipperary': [
    'Clonmel',
    'Nenagh',
    'Thurles',
    'Tipperary Town',
    'Cashel',
    'Cahir',
    'Roscrea',
    'Other / All Tipperary',
  ],
  'Westmeath': [
    'Athlone',
    'Mullingar',
    'Moate',
    'Other / All Westmeath',
  ],
  'Sligo': [
    'Sligo Town',
    'Strandhill',
    'Tubbercurry',
    'Other / All Sligo',
  ],
  'Cavan': [
    'Cavan Town',
    'Bailieborough',
    'Virginia',
    'Kingscourt',
    'Other / All Cavan',
  ],
  'Laois': [
    'Portlaoise',
    'Portarlington',
    'Mountmellick',
    'Abbeyleix',
    'Other / All Laois',
  ],
  'Offaly': [
    'Tullamore',
    'Birr',
    'Edenderry',
    'Other / All Offaly',
  ],
  'Roscommon': [
    'Roscommon Town',
    'Boyle',
    'Castlerea',
    'Other / All Roscommon',
  ],
  'Monaghan': [
    'Monaghan Town',
    'Carrickmacross',
    'Castleblayney',
    'Other / All Monaghan',
  ],
  'Carlow': [
    'Carlow Town',
    'Tullow',
    'Bagenalstown',
    'Other / All Carlow',
  ],
  'Longford': [
    'Longford Town',
    'Ballymahon',
    'Edgeworthstown',
    'Other / All Longford',
  ],
  'Leitrim': [
    'Carrick-on-Shannon',
    'Manorhamilton',
    'Other / All Leitrim',
  ],
  'Antrim': [
    'Belfast (North / West)',
    'Lisburn',
    'Ballymena',
    'Antrim Town',
    'Carrickfergus',
    'Larne',
    'Other / All Antrim',
  ],
  'Armagh': [
    'Armagh City',
    'Craigavon',
    'Lurgan',
    'Portadown',
    'Other / All Armagh',
  ],
  'Derry / Londonderry': [
    'Derry City',
    'Coleraine',
    'Limavady',
    'Magherafelt',
    'Other / All Derry',
  ],
  'Down': [
    'Belfast (East / South)',
    'Bangor',
    'Newtownards',
    'Newry',
    'Downpatrick',
    'Banbridge',
    'Other / All Down',
  ],
  'Fermanagh': [
    'Enniskillen',
    'Lisnaskea',
    'Irvinestown',
    'Other / All Fermanagh',
  ],
  'Tyrone': [
    'Omagh',
    'Strabane',
    'Dungannon',
    'Cookstown',
    'Other / All Tyrone',
  ],
};

export const COUNTIES = Object.keys(IRELAND_LOCATIONS);

export function getCoreLocation(locationStr?: string | null): string {
  if (!locationStr || typeof locationStr !== 'string') return 'Dublin';
  const trimmed = locationStr.trim();
  if (!trimmed) return 'Dublin';

  const lower = trimmed.toLowerCase();

  for (const county of COUNTIES) {
    if (new RegExp(`\\b${county}\\b`, 'i').test(lower)) {
      return county;
    }
  }

  // 2. Match sub-area from Ireland locations mapping
  for (const [county, areas] of Object.entries(IRELAND_LOCATIONS)) {
    for (const area of areas) {
      const parts = area.split(/[\(\)\/\,]/).map((p) => p.trim().toLowerCase()).filter(Boolean);
      for (const part of parts) {
        if (part.length > 3 && lower.includes(part)) {
          return county;
        }
      }
    }
  }

  // 3. If standard single-location entered
  const primary = trimmed.split(',')[0].trim();
  return primary.charAt(0).toUpperCase() + primary.slice(1) || 'Dublin';
}

/**
 * Deterministically generates a TradeMe-style 7-digit member number from a user UUID.
 * Example: "6154291"
 */
export function getMemberNumber(userId?: string | null): number {
  if (!userId) return 6154291;
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return 6000000 + Math.abs(hash % 3999999);
}

