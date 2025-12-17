import { useCallback, useEffect, useState } from 'react';
import type { MBTIDimension, MBTIQuestion } from '../data/types/quiz';

type AnswerMap = Record<number, number>;

const dimensionLetters: Record<MBTIDimension, [string, string]> = {
  EI: ['E', 'I'],
  SN: ['S', 'N'],
  TF: ['T', 'F'],
  JP: ['J', 'P']
};

const scoreAnswer = (value: number, reverse?: boolean) => {
  const base = value - 3; // 1-5 -> -2..2
  return reverse ? -base : base;
};

const calculateType = (answers: AnswerMap, questions: MBTIQuestion[]) => {
  const scores: Record<MBTIDimension, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };

  questions.forEach((question) => {
    const value = answers[question.id];
    if (!value) return;
    scores[question.dimension] += scoreAnswer(value, question.reverse);
  });

  return (Object.keys(scores) as MBTIDimension[])
    .map((dimension) => {
      const [positive, negative] = dimensionLetters[dimension];
      return scores[dimension] >= 0 ? positive : negative;
    })
    .join('');
};

export const useMBTI = (questions: MBTIQuestion[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [resultType, setResultType] = useState<string | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
    setDirection(0);
    setAnswers({});
    setResultType(null);
  }, [questions]);

  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = total ? (answeredCount / total) * 100 : 0;

  const answerQuestion = useCallback(
    (value: number) => {
      if (!currentQuestion || resultType) return;
      const nextAnswers = { ...answers, [currentQuestion.id]: value };
      setAnswers(nextAnswers);
      setDirection(value === 3 ? 0 : value > 3 ? 1 : -1);

      if (currentIndex >= total - 1) {
        const type = calculateType(nextAnswers, questions);
        setTimeout(() => setResultType(type), 400);
      } else {
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 250);
      }
    },
    [answers, currentIndex, currentQuestion, questions, resultType, total]
  );

  return {
    currentIndex,
    currentQuestion,
    progress,
    direction,
    total,
    answerQuestion,
    resultType,
    answers
  };
};
