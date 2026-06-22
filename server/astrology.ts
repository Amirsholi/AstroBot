import { DateTime } from "luxon";
import { calc, constants, houses_ex2, utc_to_jd, version } from "sweph";

type Period = "AM" | "PM";

export type ChartRequest = {
  date: string;
  time?: string;
  period?: Period;
  place: {
    label: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
};

type Position = {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
  house: number | null;
  retrograde: boolean;
};

const signs = [
  "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo",
  "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis",
];

const planetDefinitions = [
  ["Sol", constants.SE_SUN],
  ["Luna", constants.SE_MOON],
  ["Mercurio", constants.SE_MERCURY],
  ["Venus", constants.SE_VENUS],
  ["Marte", constants.SE_MARS],
  ["Júpiter", constants.SE_JUPITER],
  ["Saturno", constants.SE_SATURN],
  ["Urano", constants.SE_URANUS],
  ["Neptuno", constants.SE_NEPTUNE],
  ["Plutón", constants.SE_PLUTO],
] as const;

const aspectDefinitions = [
  ["conjunción", 0, 8],
  ["sextil", 60, 5],
  ["cuadratura", 90, 7],
  ["trígono", 120, 7],
  ["oposición", 180, 8],
] as const;

function normalize(longitude: number) {
  return ((longitude % 360) + 360) % 360;
}

function zodiacPosition(longitude: number) {
  const normalized = normalize(longitude);
  const signIndex = Math.floor(normalized / 30);
  return {
    longitude: Number(normalized.toFixed(6)),
    sign: signs[signIndex],
    degree: Number((normalized % 30).toFixed(4)),
  };
}

function houseForLongitude(longitude: number, cusps: number[]) {
  const target = normalize(longitude);
  for (let index = 0; index < 12; index += 1) {
    const start = normalize(cusps[index]);
    const end = normalize(cusps[(index + 1) % 12]);
    const inside = start <= end
      ? target >= start && target < end
      : target >= start || target < end;
    if (inside) return index + 1;
  }
  return null;
}

function parseLocalDateTime(request: ChartRequest) {
  const [day, month, year] = request.date.split("/").map(Number);
  const hasExactTime = Boolean(request.time);
  let hour = 12;
  let minute = 0;

  if (request.time) {
    const [rawHour, rawMinute] = request.time.split(":").map(Number);
    hour = rawHour % 12;
    if (request.period === "PM") hour += 12;
    minute = rawMinute;
  }

  const local = DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: request.place.timezone },
  );
  if (!local.isValid) throw new Error("Los datos de fecha, hora o zona horaria no son válidos.");
  return { hasExactTime, utc: local.toUTC() };
}

function calculateAspects(planets: Position[]) {
  const aspects = [];
  for (let left = 0; left < planets.length; left += 1) {
    for (let right = left + 1; right < planets.length; right += 1) {
      const rawDistance = Math.abs(planets[left].longitude - planets[right].longitude);
      const distance = Math.min(rawDistance, 360 - rawDistance);
      for (const [type, angle, maxOrb] of aspectDefinitions) {
        const orb = Math.abs(distance - angle);
        if (orb <= maxOrb) {
          aspects.push({
            from: planets[left].name,
            to: planets[right].name,
            type,
            angle,
            orb: Number(orb.toFixed(3)),
          });
          break;
        }
      }
    }
  }
  return aspects;
}

export function calculateNatalChart(request: ChartRequest) {
  const { hasExactTime, utc } = parseLocalDateTime(request);
  const julian = utc_to_jd(
    utc.year,
    utc.month,
    utc.day,
    utc.hour,
    utc.minute,
    utc.second,
    constants.SE_GREG_CAL,
  );
  if (julian.flag !== constants.OK) throw new Error(julian.error || "No se pudo calcular el día juliano.");

  const [julianEt, julianUt] = julian.data;
  const flags = constants.SEFLG_MOSEPH | constants.SEFLG_SPEED;
  const houseResult = hasExactTime
    ? houses_ex2(julianUt, 0, request.place.latitude, request.place.longitude, "P")
    : null;
  if (houseResult && houseResult.flag !== constants.OK) {
    throw new Error(houseResult.error || "No se pudieron calcular las casas.");
  }
  const cusps = houseResult?.data.houses ?? null;

  const planets = planetDefinitions.map(([name, id]) => {
    const result = calc(julianEt, id, flags);
    if (result.flag < 0) throw new Error(result.error || `No se pudo calcular ${name}.`);
    const [longitude, , , longitudeSpeed] = result.data;
    return {
      name,
      ...zodiacPosition(longitude),
      house: cusps ? houseForLongitude(longitude, cusps) : null,
      retrograde: longitudeSpeed < 0,
    };
  });

  const pointPosition = (name: string, longitude: number): Position => ({
    name,
    ...zodiacPosition(longitude),
    house: null,
    retrograde: false,
  });

  return {
    engine: `Swiss Ephemeris ${version()} (Moshier)`,
    accuracy: hasExactTime ? "exact-time" as const : "date-only" as const,
    utc: utc.toISO(),
    location: {
      label: request.place.label,
      latitude: request.place.latitude,
      longitude: request.place.longitude,
      timezone: request.place.timezone,
    },
    planets,
    ascendant: houseResult ? pointPosition("Ascendente", houseResult.data.points[0]) : null,
    midheaven: houseResult ? pointPosition("Medio Cielo", houseResult.data.points[1]) : null,
    houses: cusps?.map((longitude, index) => ({ house: index + 1, ...zodiacPosition(longitude) })) ?? null,
    aspects: calculateAspects(planets),
  };
}
