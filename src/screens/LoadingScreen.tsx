import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { GeneratingReading } from "../components/GeneratingReading";

type LoadingScreenProps = {
  error: string;
  onRetry: () => void;
};

export function LoadingScreen({ error, onRetry }: LoadingScreenProps) {
  if (error) {
    return (
      <main className="loading-screen" role="alert">
        <p>No pudimos completar la lectura.</p>
        <span>{error}</span>
        <button type="button" onClick={onRetry}>
          <ArrowCounterClockwise aria-hidden="true" size={18} />
          Intentar nuevamente
        </button>
      </main>
    );
  }

  return <GeneratingReading />;
}
