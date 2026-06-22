export type Period = "AM" | "PM";

export type PlaceSuggestion = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  label: string;
};

export type BirthData = {
  date: string;
  time?: string;
  period?: Period;
  place: PlaceSuggestion;
};

export type ChartPosition = {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
  house: number | null;
  retrograde: boolean;
};

export type NatalChart = {
  engine: string;
  accuracy: "exact-time" | "date-only";
  utc: string;
  location: {
    label: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  planets: ChartPosition[];
  ascendant: ChartPosition | null;
  midheaven: ChartPosition | null;
  houses: Array<{ house: number; longitude: number; sign: string; degree: number }> | null;
  aspects: Array<{
    from: string;
    to: string;
    type: string;
    angle: number;
    orb: number;
  }>;
};

export type PersonalReport = {
  title: string;
  reading: string;
  reflection: string;
  question: string;
  disclaimer: string;
};

export type Answer = {
  questionId: string;
  optionId: string;
};

export type JourneyScreen = "birth-data" | "questions" | "processing" | "report";
