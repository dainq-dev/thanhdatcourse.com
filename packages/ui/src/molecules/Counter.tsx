'use client';

import styles from './Counter.module.scss';
import { useCounterAnimation } from './Counter.logic';

interface CounterProps {
  label: string;
  value: number;
  duration?: number;
  className?: string;
}

export function Counter({ label, value, duration = 2, className = '' }: CounterProps) {
  const { ref, numberRef } = useCounterAnimation(value, duration);

  return (
    <div ref={ref} className={`${styles.counter} ${className}`}>
      <span ref={numberRef} className={styles.number}>0</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
