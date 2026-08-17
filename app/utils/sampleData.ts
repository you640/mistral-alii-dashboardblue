/**
 * Ukážkový forenzný prípad pre testovanie platformy Alibi.
 * Kauza: Incident v logistickom sklade Ružinov
 */

export const SAMPLE_CASE = {
  documents: [
    {
      id: 'doc_vypoved_1',
      title: 'Výpoveď svedka - Peter Kováč (Vrátnik)',
      status: 'done',
      summary: 'Vrátnik uvádza, že o 21:30 videl odchádzať čierne BMW s vypnutými svetlami smerom na diaľnicu.',
      person_count: 2,
      relationship_count: 1,
      red_flag_count: 1,
      processing_finished_at: new Date(Date.now() - 3600000).toISOString(),
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'doc_vypoved_2',
      title: 'Výpoveď podozrivého - Milan Horváth',
      status: 'done',
      summary: 'Podozrivý tvrdí, že medzi 21:00 a 22:30 bol doma v Petržalke a pozeral televíziu s manželkou.',
      person_count: 2,
      relationship_count: 1,
      red_flag_count: 2,
      processing_finished_at: new Date(Date.now() - 3000000).toISOString(),
      created_at: new Date(Date.now() - 6000000).toISOString()
    },
    {
      id: 'doc_vypoved_3',
      title: 'Výpoveď svedkyne - Elena Horváthová (Manželka)',
      status: 'done',
      summary: 'Manželka uviedla, že manžel prišiel domov až okolo 22:15 a bol rozrušený.',
      person_count: 2,
      relationship_count: 1,
      red_flag_count: 1,
      processing_finished_at: new Date(Date.now() - 1800000).toISOString(),
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  persons: [
    {
      id: 'p_milan_horvath',
      name: 'Milan Horváth',
      type: 'podozrivý',
      details: 'Hlavný podozrivý, zamestnanec skladu, vlastník čierneho BMW.',
      document_id: 'doc_vypoved_2',
      document_title: 'Výpoveď podozrivého - Milan Horváth',
      degree: 3,
      pageRankScore: 0.42,
      isKeyHub: true
    },
    {
      id: 'p_peter_kovac',
      name: 'Peter Kováč',
      type: 'svedok',
      details: 'Vrátnik na nočnej službe v objekte logistického parku.',
      document_id: 'doc_vypoved_1',
      document_title: 'Výpoveď svedka - Peter Kováč',
      degree: 2,
      pageRankScore: 0.22,
      isKeyHub: false
    },
    {
      id: 'p_elena_horvathova',
      name: 'Elena Horváthová',
      type: 'alibi',
      details: 'Manželka podozrivého, pôvodne uvádzaná ako alibi kontakt.',
      document_id: 'doc_vypoved_3',
      document_title: 'Výpoveď svedkyne - Elena Horváthová',
      degree: 2,
      pageRankScore: 0.26,
      isKeyHub: false
    },
    {
      id: 'p_jozef_varga',
      name: 'Jozef Varga',
      type: 'obeť',
      details: 'Vedúci zmeny v sklade, poškodený pri lúpeži tovaru.',
      document_id: 'doc_vypoved_1',
      document_title: 'Výpoveď svedka - Peter Kováč',
      degree: 1,
      pageRankScore: 0.10,
      isKeyHub: false
    }
  ],
  relationships: [
    {
      id: 'rel_1',
      source: 'p_milan_horvath',
      target: 'p_elena_horvathova',
      label: 'Manželský zväzok & Alibi',
      type: 'rodina',
      time: '21:00 - 22:30',
      description: 'Podozrivý tvrdí, že boli spolu doma, čo manželka čiastočne poprela.'
    },
    {
      id: 'rel_2',
      source: 'p_peter_kovac',
      target: 'p_milan_horvath',
      label: 'Videný pri odchode',
      type: 'kontakt',
      time: '21:30',
      description: 'Vrátnik identifikoval vozidlo patriace Milanovi Horváthovi pri bráne B.'
    },
    {
      id: 'rel_3',
      source: 'p_milan_horvath',
      target: 'p_jozef_varga',
      label: 'Konflikt na pracovisku',
      type: 'nepriatelstvo',
      time: '18:00',
      description: 'Spor ohľadom inventúry a manka v tovare.'
    }
  ],
  claims: [
    {
      id: 'cl_1',
      subject: 'Milan Horváth',
      predicate: 'was_at',
      object: 'Byt Petržalka',
      event_date: '2026-08-16',
      event_time: '21:00',
      confidence: 0.9,
      source_quote: 'Celý večer od deviatej som sedel na gauči v obývačke.',
      document_id: 'doc_vypoved_2',
      document_title: 'Výpoveď podozrivého - Milan Horváth'
    },
    {
      id: 'cl_2',
      subject: 'Milan Horváth',
      predicate: 'was_at',
      object: 'Logistický sklad Ružinov',
      event_date: '2026-08-16',
      event_time: '21:30',
      confidence: 0.85,
      source_quote: 'O pol desiatej večer prešlo okolo vrátnice čierne BMW E90 pána Horvátha.',
      document_id: 'doc_vypoved_1',
      document_title: 'Výpoveď svedka - Peter Kováč'
    },
    {
      id: 'cl_3',
      subject: 'Milan Horváth',
      predicate: 'was_at',
      object: 'Príchod domov Petržalka',
      event_date: '2026-08-16',
      event_time: '22:15',
      confidence: 0.95,
      source_quote: 'Milan dorazil domov až štvrť hodinu po desiatej, dychčal a mal špinavé ruky.',
      document_id: 'doc_vypoved_3',
      document_title: 'Výpoveď svedkyne - Elena Horváthová'
    }
  ],
  contradictions: [
    {
      id: 'contra_1',
      claim_a_id: 'cl_1',
      claim_b_id: 'cl_2',
      document_a_id: 'doc_vypoved_2',
      document_b_id: 'doc_vypoved_1',
      entity_ref: 'Milan Horváth',
      type: 'location_time_conflict',
      severity: 'high',
      confidence: 0.92,
      explanation: 'Časovo-priestorový rozpor: Podozrivý tvrdí, že o 21:30 bol doma v Petržalke, zatiaľ čo vrátnik ho v tom istom čase lokalizoval v Ružinove.',
      status: 'confirmed',
      document_title: 'Výpoveď podozrivého vs Výpoveď vrátnika'
    },
    {
      id: 'contra_2',
      claim_a_id: 'cl_1',
      claim_b_id: 'cl_3',
      document_a_id: 'doc_vypoved_2',
      document_b_id: 'doc_vypoved_3',
      entity_ref: 'Milan Horváth & Elena Horváthová',
      type: 'factual_conflict',
      severity: 'high',
      confidence: 0.89,
      explanation: 'Rozpad alibi: Manželka vyvrátila tvrdenie podozrivého o nepretržitom pobyte doma od 21:00.',
      status: 'confirmed',
      document_title: 'Výpoveď podozrivého vs Výpoveď manželky'
    }
  ],
  events: [
    {
      id: 'evt_1',
      title: 'Hádka pri inventúre',
      type: 'konflikt',
      persons: ['Milan Horváth', 'Jozef Varga'],
      date: '2026-08-16',
      time: '18:00',
      location: 'Sklad Ružinov - Kancelária',
      description: 'Verbálny incident kvôli chýbajúcim položkám v hodnote 45 000 €.',
      source_quote: 'Kričali po sebe v kancelárii vedúceho.',
      confidence: 0.95,
      document_id: 'doc_vypoved_1'
    },
    {
      id: 'evt_2',
      title: 'Násilné vniknutie a nakladanie tovaru',
      type: 'trestný čin',
      persons: ['Neznámy páchateľ'],
      date: '2026-08-16',
      time: '21:15',
      location: 'Nakladacia rampa 4',
      description: 'Odcudzenie elektroniky z paletového boxu.',
      source_quote: 'Spustil sa tichý alarm na rampe 4.',
      confidence: 0.88,
      document_id: 'doc_vypoved_1'
    },
    {
      id: 'evt_3',
      title: 'Odchod podozrivého vozidla',
      type: 'cesta',
      persons: ['Milan Horváth'],
      date: '2026-08-16',
      time: '21:30',
      location: 'Brána B - Areál skladu',
      description: 'Odchod vozidla BMW E90 bez zapnutých svetiel.',
      source_quote: 'Prefrčal popod závoru plnou rýchlosťou.',
      confidence: 0.90,
      document_id: 'doc_vypoved_1'
    },
    {
      id: 'evt_4',
      title: 'Návrat podozrivého domov',
      type: 'stretnutie',
      persons: ['Milan Horváth', 'Elena Horváthová'],
      date: '2026-08-16',
      time: '22:15',
      location: 'Petržalka - Bytový dom',
      description: 'Oneskorený príchod domov v rozrušenom stave.',
      source_quote: 'Prišiel až 22:15 a hneď si išiel umyť ruky.',
      confidence: 0.95,
      document_id: 'doc_vypoved_3'
    }
  ],
  redFlags: [
    {
      id: 'rf_1',
      text: 'Zmena gramatického času pri popise večerného programu podozrivého.',
      document_id: 'doc_vypoved_2',
      document_title: 'Výpoveď podozrivého'
    },
    {
      id: 'rf_2',
      text: 'Vypnuté svetlá na vozidle pri výjazde zo stráženého areálu.',
      document_id: 'doc_vypoved_1',
      document_title: 'Výpoveď svedka'
    },
    {
      id: 'rf_3',
      text: 'Priamy rozpor v čase príchodu domov medzi manželmi (75 minútové okno).',
      document_id: 'doc_vypoved_3',
      document_title: 'Výpoveď manželky'
    }
  ],
  locations: [
    {
      id: 'loc_1',
      name: 'Logistický park Ružinov',
      address: 'Galvaniho 12, Bratislava',
      source_quote: 'V objekte na Galvaniho ulici.',
      confidence: 1.0,
      document_id: 'doc_vypoved_1'
    },
    {
      id: 'loc_2',
      name: 'Byt Horváthovcov',
      address: 'Gessayova 8, Bratislava - Petržalka',
      source_quote: 'U nás v byte na Gessayovej.',
      confidence: 0.95,
      document_id: 'doc_vypoved_2'
    }
  ],
  vehicles: [
    {
      id: 'veh_1',
      type: 'Osobné auto',
      brand_model: 'BMW rad 3 (E90)',
      color: 'čierna',
      license_plate: 'BA-982XY',
      owner_name: 'Milan Horváth',
      source_quote: 'Čierne BMW trojkového radu s bratislavskou značkou.',
      confidence: 0.92,
      document_id: 'doc_vypoved_1'
    }
  ]
}
