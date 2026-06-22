import { useEffect, useRef, useState } from "react";
import { AnimatedOption } from "../components/AnimatedOption";
import { AnimatedQuestion } from "../components/AnimatedQuestion";
import { questions } from "../data/questions";
import type { Answer } from "../types";

type QuestionsScreenProps = {
  initialAnswers: Answer[];
  onComplete: (answers: Answer[]) => void;
};

export function QuestionsScreen({ initialAnswers, onComplete }: QuestionsScreenProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [moving, setMoving] = useState(false);
  const transitionTimer = useRef<number | null>(null);
  const question = questions[index];
  const selected = answers.find((answer) => answer.questionId === question.id)?.optionId;

  useEffect(() => () => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
  }, []);

  function choose(optionId: string) {
    if (moving) return;
    const nextAnswers = [
      ...answers.filter((answer) => answer.questionId !== question.id),
      { questionId: question.id, optionId },
    ];
    setAnswers(nextAnswers);
    setMoving(true);
    transitionTimer.current = window.setTimeout(() => {
      if (index === questions.length - 1) onComplete(nextAnswers);
      else {
        setIndex((current) => current + 1);
        setMoving(false);
      }
    }, 720);
  }

  return (
    <main className="question-screen">
      <div className="question-progress" aria-label={`Pregunta ${index + 1} de ${questions.length}`}>
        {questions.map((item, itemIndex) => (
          <span className={itemIndex <= index ? "question-progress__active" : ""} key={item.id} />
        ))}
      </div>

      <AnimatedQuestion questionKey={question.id}>
        <h1 id="question-title">{question.prompt}</h1>
        <div className="options" role="radiogroup" aria-labelledby="question-title">
          {question.options.map((option, optionIndex) => (
            <AnimatedOption
              className={`option ${selected === option.id ? "option--selected" : ""}`}
              index={optionIndex}
              key={option.id}
            >
              <input
                checked={selected === option.id}
                disabled={moving}
                name={question.id}
                type="radio"
                value={option.id}
                onChange={() => choose(option.id)}
              />
              <span>{option.label}</span>
            </AnimatedOption>
          ))}
        </div>
      </AnimatedQuestion>
    </main>
  );
}
