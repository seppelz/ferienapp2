import { Holiday } from '../types/holiday';

export const commonHolidays: Record<number, Holiday[]> = {
  2024: [
    {
      name: "Neujahr",
      date: "2024-01-01",
      type: "public",
      details: {
        description: "Der erste Tag des neuen Jahres ist bundesweit ein gesetzlicher Feiertag.",
        culturalSignificance: "Symbolisiert den Beginn eines neuen Jahres und die damit verbundenen Hoffnungen und Vorsätze.",
        traditions: ["Feuerwerk", "Neujahrswünsche", "Bleigießen", "Neujahrsspaziergänge"]
      }
    },
    {
      name: "Karfreitag",
      date: "2024-03-29",
      type: "public",
      details: {
        description: "Der Karfreitag erinnert an die Kreuzigung Jesu und ist bundesweit ein gesetzlicher Feiertag.",
        culturalSignificance: "Einer der wichtigsten christlichen Feiertage, der den Opfertod Jesu Christi gedenkt.",
        traditions: ["Gottesdienste", "Prozessionen", "Fastenzeit"]
      }
    },
    {
      name: "Ostermontag",
      date: "2024-04-01",
      type: "public",
      details: {
        description: "Der Ostermontag folgt auf das Osterfest und ist bundesweit ein gesetzlicher Feiertag.",
        culturalSignificance: "Teil der Osterfeierlichkeiten, die die Auferstehung Christi feiern.",
        traditions: ["Ostereiersuche", "Familienbesuche", "Osterspaziergang"]
      }
    },
    {
      name: "Tag der Arbeit",
      date: "2024-05-01",
      type: "public",
      details: {
        description: "Der Tag der Arbeit ist ein internationaler Feiertag der Arbeiterbewegung.",
        culturalSignificance: "Gedenktag der Arbeiterbewegung und ihrer Errungenschaften.",
        traditions: ["Demonstrationen", "Kundgebungen", "Maifeste"]
      }
    },
    {
      name: "Christi Himmelfahrt",
      date: "2024-05-09",
      type: "public",
      details: {
        description: "Christi Himmelfahrt wird 40 Tage nach Ostern gefeiert.",
        culturalSignificance: "Feiert die Rückkehr Jesu in den Himmel.",
        traditions: ["Vatertagsausflüge", "Gottesdienste", "Prozessionen"]
      }
    },
    {
      name: "Pfingstmontag",
      date: "2024-05-20",
      type: "public",
      details: {
        description: "Der Pfingstmontag folgt auf das Pfingstfest.",
        culturalSignificance: "Feiert die Aussendung des Heiligen Geistes.",
        traditions: ["Pfingstausflüge", "Gottesdienste", "Volksfeste"]
      }
    },
    {
      name: "Tag der Deutschen Einheit",
      date: "2024-10-03",
      type: "public",
      details: {
        description: "Der Tag der Deutschen Einheit erinnert an die Wiedervereinigung.",
        culturalSignificance: "Nationaler Feiertag zur Erinnerung an die Deutsche Wiedervereinigung 1990.",
        traditions: ["Bürgerfeste", "Politische Feiern", "Kulturveranstaltungen"]
      }
    },
    {
      name: "1. Weihnachtstag",
      date: "2024-12-25",
      type: "public",
      details: {
        description: "Der erste Weihnachtsfeiertag ist bundesweit ein gesetzlicher Feiertag.",
        culturalSignificance: "Feiert die Geburt Jesu Christi.",
        traditions: ["Bescherung", "Festessen", "Gottesdienste"]
      }
    },
    {
      name: "2. Weihnachtstag",
      date: "2024-12-26",
      type: "public",
      details: {
        description: "Der zweite Weihnachtsfeiertag ist bundesweit ein gesetzlicher Feiertag.",
        culturalSignificance: "Fortsetzung der Weihnachtsfeierlichkeiten.",
        traditions: ["Familienbesuche", "Festessen", "Weihnachtskonzerte"]
      }
    }
  ],
  2025: [
    // Same structure for 2025 with updated dates from holidays.ts
  ],
  2026: [
    // Same structure for 2026 with updated dates from holidays.ts
  ]
}; 