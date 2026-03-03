import { useState, useRef } from 'react';
import type { AnimDirection } from '../types';

interface UseCardAnimation {
  animClass: string;
  animateTo: (dir: AnimDirection, callback: () => void) => void;
}

export function useCardAnimation(): UseCardAnimation {
  const [animClass, setAnimClass] = useState('');
  const busyRef = useRef(false);

  function animateTo(dir: AnimDirection, callback: () => void) {
    if (busyRef.current) return;
    busyRef.current = true;

    const outCls = dir === 'forward' ? 'out-left' : 'out-right';
    const inCls = dir === 'forward' ? 'in-left' : 'in-right';

    setAnimClass(outCls);

    setTimeout(() => {
      callback();
      setAnimClass(inCls);
      setTimeout(() => {
        setAnimClass('');
        busyRef.current = false;
      }, 340);
    }, 240);
  }

  return { animClass, animateTo };
}
