Autentifikácia

Kopírovať všetko
Nainštalujte Base44 SDK a inicializujte klienta pomocou ID vašej aplikácie. SDK spravuje autentifikáciu a poskytuje typované metódy pre všetky operácie entít a backendové funkcie.

npm install @base44/sdk

Rozumiem
import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: "6a81f5e7f4adbf6a9523b9d8",
  headers: {
    "api_key": "fafad43d1f2e4c0ea0724f2e33181a39"
  }
});

Rozumiem

Koncové body entít

Kopírovať všetko

Rozpor

Kopírovacia entita
Schéma
Pole	Typ	Popis
claim_a_id*	Struna	ID prvého tvrdenia (ForensicClaim)
claim_b_id*	Struna	ID druhého tvrdenia (ForensicClaim)
document_a_id*	Struna	ID dokumentu prvého tvrdenia
document_b_id*	Struna	ID dokumentu druhého tvrdenia
entity_ref	Struna	Subjekt/osoba, ktorého sa rozpor týka
type*	reťazec (time_conflict | location_conflict | location_time_conflict | factual_conflict | identity_conflict | event_participation_conflict)	Typ rozporu
severity	struna (vysoká | stredná | nízka)	—
confidence	Číslo	Spôsobilosť detekcie 0.0–1.0
explanation	Struna	Krátke vysvetlenie rozporu s odkazmi na oba dokumenty
status*	reťazec (možné | potvrdené | zrušené)	Stav: možné (automaticky detegované, neistické), potvrdené (Human-in-the-loop potvrdený), zrušené (zamietnutý)
document_id	Struna	ID dokumentu, ktorého analýza rozpor vytvorila (pre idempotenciu)
document_title	Struna	—
id	Struna	Jedinečný identifikátor záznamu
created_date	reťazec <dátum-čas>	Časová pečiatka vytvorenia záznamu
updated_date	reťazec <dátum-čas>	Zaznamenať časovú pečiatku poslednej aktualizácie
created_by_id	Struna	ID používateľa, ktorý záznam vytvoril
Koncové body

DOSTAŤ
/entities/Contradiction
Záznamy o rozporoch v zozname
const records = await base44.entities.Contradiction.list();

Rozumiem

POST
/entities/Contradiction
Vytvoriť záznam Contradiction
const record = await base44.entities.Contradiction.create({
  // your data
});

Rozumiem

DELETE
/entities/Contradiction
Vymažte viacero záznamov Contradiction
await base44.entities.Contradiction.deleteMany({
  // query filter — WARNING: empty {} deletes ALL records
  claim_a_id: "Example claim_a_id"
});

Rozumiem

POST
/entities/Contradiction/bulk
Hromadné vytváranie protirečivých záznamov
const records = await base44.entities.Contradiction.bulkCreate([
  { /* record 1 */ },
  { /* record 2 */ },
]);

Rozumiem

PUT
/entities/Contradiction/bulk
Hromadná aktualizácia záznamov o rozporoch
// bulk-update is not available via SDK — use the REST API

Rozumiem

PATCH
/entities/Contradiction/update-many
Aktualizujte mnohé záznamy Contradiction pomocou dotazu
// update-many is not available via SDK — use the REST API

Rozumiem

DOSTAŤ
/entities/Contradiction/{Contradiction_id}
Získajte záznam o rozporoch podľa ID
const record = await base44.entities.Contradiction.get(recordId);

Rozumiem

PUT
/entities/Contradiction/{Contradiction_id}
Aktualizujte záznam Contradiction
const record = await base44.entities.Contradiction.update(recordId, {
  // fields to update
});

Rozumiem

DELETE
/entities/Contradiction/{Contradiction_id}
Vymazať záznam Contradiction
await base44.entities.Contradiction.delete(recordId);

Rozumiem

PUT
/entities/Contradiction/{Contradiction_id}/restore
Obnoviť vymazaný záznam Contradiction
const record = await base44.entities.Contradiction.restore(recordId);