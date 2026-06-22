import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { CalendarBlank, Clock, MapPin } from "@phosphor-icons/react";
import { searchPlaces } from "../utils/api";
import type { BirthData, Period, PlaceSuggestion } from "../types";

type BirthDataScreenProps = {
  onSubmit: (data: BirthData) => Promise<void>;
};

function formatDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatTime(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function BirthDataScreen({ onSubmit }: BirthDataScreenProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [period, setPeriod] = useState<Period>("AM");
  const [placeQuery, setPlaceQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedPlace || placeQuery.trim().length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        setSuggestions(await searchPlaces(placeQuery.trim(), controller.signal));
      } catch (searchError) {
        if (searchError instanceof Error && searchError.name !== "AbortError") {
          setError(searchError.message);
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [placeQuery, selectedPlace]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!selectedPlace) {
      setError("Selecciona una ciudad de la lista.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        date,
        time: time || undefined,
        period: time ? period : undefined,
        place: selectedPlace,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No pudimos calcular tu carta.");
    } finally {
      setSubmitting(false);
    }
  }

  function updatePlace(value: string) {
    setPlaceQuery(value);
    setSelectedPlace(null);
    setError("");
  }

  function choosePlace(place: PlaceSuggestion) {
    setSelectedPlace(place);
    setPlaceQuery(place.label);
    setSuggestions([]);
    setError("");
  }

  return (
    <main className="entry-screen">
      <motion.form
        className="birth-card"
        initial={{ opacity: 0, scale: 0.985, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={submit}
      >
        <label className="field">
          <span>Fecha de nacimiento</span>
          <span className="field__control">
            <CalendarBlank aria-hidden="true" size={19} />
            <input
              required
              aria-label="Fecha de nacimiento"
              autoComplete="bday"
              inputMode="numeric"
              maxLength={10}
              pattern="(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/([0-9]{4})"
              placeholder="DD / MM / AAAA"
              type="text"
              value={date}
              onChange={(event) => setDate(formatDate(event.target.value))}
            />
          </span>
        </label>

        <div className="field">
          <span>Hora de nacimiento <small>opcional</small></span>
          <div className="time-row">
            <label className="field__control field__control--time">
              <Clock aria-hidden="true" size={19} />
              <input
                aria-label="Hora de nacimiento"
                inputMode="numeric"
                maxLength={5}
                pattern="(0[1-9]|1[0-2]):[0-5][0-9]"
                placeholder="HH:MM"
                type="text"
                value={time}
                onChange={(event) => setTime(formatTime(event.target.value))}
              />
            </label>
            <div className="period-toggle" aria-label="Período horario" role="group">
              {(["AM", "PM"] as const).map((option) => (
                <button
                  aria-pressed={period === option}
                  className={period === option ? "period-toggle__active" : ""}
                  disabled={!time}
                  key={option}
                  type="button"
                  onClick={() => setPeriod(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="field place-field">
          <label htmlFor="birth-place">Lugar de nacimiento</label>
          <span className="field__control">
            <MapPin aria-hidden="true" size={19} />
            <input
              required
              aria-autocomplete="list"
              aria-controls="place-suggestions"
              aria-expanded={suggestions.length > 0}
              autoComplete="off"
              id="birth-place"
              placeholder="Ciudad, país"
              type="text"
              value={placeQuery}
              onChange={(event) => updatePlace(event.target.value)}
            />
            {searching && <span className="field-status">Buscando</span>}
          </span>
          {suggestions.length > 0 && (
            <div className="place-suggestions" id="place-suggestions" role="listbox">
              {suggestions.map((place) => (
                <button
                  aria-selected={selectedPlace?.id === place.id}
                  key={`${place.id}-${place.latitude}`}
                  role="option"
                  type="button"
                  onClick={() => choosePlace(place)}
                >
                  <strong>{place.name}</strong>
                  <span>{[place.admin1, place.country].filter(Boolean).join(", ")}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="entry-button" disabled={submitting} type="submit">
          {submitting ? "Calculando..." : "Comenzar"}
        </button>
        <p className="privacy-note">Tus respuestas solo serán utilizadas para esta experiencia.</p>
      </motion.form>
    </main>
  );
}
