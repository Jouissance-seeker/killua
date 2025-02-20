'use client';

import { IconArrowRight } from '@/public/icons/arrow-right';
import IconChevron from '@/public/icons/chevron';
import IconCopy from '@/public/icons/copy';
import IconTick from '@/public/icons/tick';
import { sliceCounter } from '@/slices/counter';
import 'highlight.js/styles/atom-one-dark-reasonable.css';
import { useKillua } from 'killua';
import Link from 'next/link';
import { useState } from 'react';
import Highlight from 'react-highlight';

export default function Hero(): JSX.Element {
  // install command copy to clipboard
  const [
    installCommandCopyToClipboardSuccessfully,
    setInstallCommandCopyToClipboardSuccessfully
  ] = useState(false);
  const installCommandCopyToClipboardHandler = (): void => {
    navigator.clipboard.writeText(`npm i killua`);
    setInstallCommandCopyToClipboardSuccessfully(true);
    setTimeout((): void => {
      setInstallCommandCopyToClipboardSuccessfully(false);
    }, 2000);
  };

  // killua counter
  const localStorageCounter = useKillua(sliceCounter);

  // change file tab
  const [activedFileTab, setActivedFileTab] = useState<'counter' | 'component'>(
    'counter'
  );

  const [
    sourceCodeCopyToClipboardSuccessfully,
    setSourceCodeCopyToClipboardSuccessfully
  ] = useState(false);
  const codeCopyToClipboardHandler = (): void => {
    navigator.clipboard.writeText(activedSourceCode);
    setSourceCodeCopyToClipboardSuccessfully(true);
    setTimeout((): void => {
      setSourceCodeCopyToClipboardSuccessfully(false);
    }, 2000);
  };
  const activedSourceCode =
    activedFileTab === 'counter'
      ? `// slices/counter.ts
import { slice } from "killua";

export const counterSlice = slice({
  key: "counter",
  defaultClient: 1,
  // optional ...
  defaultServer: 3,
  expire: '0d-0h-0m-10s',
  obfuscate: true,
  schema: z.number().min(0).max(10),
  reducers: {
    increment: value => value + 1,
    incrementWithPayload: (value, payload: number) => value + payload
  },
  selectors: {
    getPlusOne: value => value + 1,
    getPlusWithPayload: (value, payload: number) => value + payload
  }
});`
      : `// components/component.tsx
import { useKillua } from "killua";
import { counterSlice } from "@/slices/counter";

export default function Component() {
  const localStorageCounter = useKillua(counterSlice);
  return (
    <div>
      <button onClick={
        () => localStorageCounter.set(prev => prev + 1)
      }>+</button>
      <p>{localStorageCounter.get()}</p>
      <button onClick={
        () => localStorageCounter.set(prev => prev - 1)
      }>-</button>
    </div>
  )
};`;

  return (
    <section
      className={`lg:bg-[url('/images/hero-bg.png')] bg-center bg-cover bg-no-repeat items-center flex lg:mt-16 lg:mb-4`}
    >
      <div className="container flex flex-col items-center lg:flex-row lg:gap-4 lg:items-center space-y-14 lg:space-y-0">
        {/* left */}
        <div className="sm:w-[500px] gap-3 lg:gap-4 sm:text-center lg:text-start flex flex-col sm:flex-col sm:justify-center sm:items-center lg:items-start lg:w-1/2">
          {/* install command */}
          <div className="relative mb-2 group w-fit">
            <button
              onClick={installCommandCopyToClipboardHandler}
              className="btn-animation font-normal bg-[#222] w-fit px-2 py-1 rounded-lg"
            >
              $ npm i killua
            </button>
            <p className="invisible absolute -top-9 left-1/2 -translate-x-1/2 z-50 w-fit rounded-md bg-c-purple py-1 px-3 text-[13px] text-white opacity-0 transition-all duration-200 before:absolute before:-top-2 before:right-0 before:h-[10px] before:w-full after:absolute after:right-1/2 after:translate-x-1/2 after:w-1 after:border-x-8 after:border-b-8 after:border-t-0 after:border-solid after:border-x-transparent after:rotate-180 after:-bottom-2 after:border-b-c-purple group-hover:visible group-hover:opacity-100">
              {installCommandCopyToClipboardSuccessfully ? 'Copied!' : 'Copy'}
            </p>
          </div>
          <h1 className="text-white text-[28px] max-w-[400px] lg:max-w-full leading-[30px] lg:text-[40px] lg:leading-[50px] font-daysOne">
            <span className="relative px-3">
              <span className="relative z-20 text-black">Killua</span>
              <div className="w-full h-full rounded-full bg-gradient-to-r from-[#A020F0] to-[#F3F731] absolute top-0 left-0 z-0"></div>
            </span>{' '}
            is a localStorage management library for React applications.
          </h1>
          <h2 className="font-normal max-w-[550px]">
            Simplify localStorage management in your React applications using
            Killua, a robust library specifically designed for efficient
            handling of localStorage operations.
          </h2>
          <Link
            target="_blank"
            href={'https://killua-document.vercel.app/'}
            className="flex group p-2.5 gap-1 px-[18px] w-fit rounded-full bg-c-purple"
          >
            <span>Get Started</span>
            <IconArrowRight />
          </Link>
        </div>
        {/* right */}
        <div className="flex flex-col items-center justify-center w-full gap-3 lg:w-1/2 lg:flex-row lg:justify-end">
          <div className="relative w-full mx-2 sm:mx-0 max-w-[400px] sm:max-w-[530px] p-[1px] bg-gradient-to-tl rounded-xl from-c-purple from-40% via-c-yellow via-50% to-transparent to-60%">
            <div className="h-full w-full minimal-scrollbar bg-[#151515] rounded-xl">
              {/* source code */}
              <div>
                <Highlight className="!bg-transparent minimal-scrollbar mb-2 !pb-0 language-javascript !w-full !text-[13px] sm:text-sm">
                  {activedSourceCode}
                </Highlight>
              </div>
              {/* copy-to-clipboard */}
              <div className="flex justify-end gap-2 px-3 pb-3">
                <button
                  onClick={codeCopyToClipboardHandler}
                  className="p-1.5 h-9 btn-animation rounded-lg border"
                >
                  {sourceCodeCopyToClipboardSuccessfully ? (
                    <IconTick />
                  ) : (
                    <IconCopy />
                  )}
                </button>
              </div>
            </div>
            {/* tabs */}
            <div className="absolute -top-[30px] left-2 lg:left-4 text-sm lg:text-md">
              <button
                onClick={(): void => setActivedFileTab('counter')}
                className={`text-white font-normal px-9 h-8 bg-contain bg-no-repeat ${
                  activedFileTab === 'counter' &&
                  "!font-bold bg-[url('/images/active-file-bg.png')]"
                }`}
              >
                counter.ts
              </button>
              <button
                onClick={(): void => setActivedFileTab('component')}
                className={`text-white -ml-8 font-normal px-9 h-8 bg-cover ${
                  activedFileTab === 'component' &&
                  "!font-bold bg-[url('/images/active-file-bg.png')]"
                }`}
              >
                component.tsx
              </button>
            </div>
          </div>
          {/* counter */}
          <div
            className={`border-c-gradient rounded-full relative transition-all duration-300 ${
              localStorageCounter.isReady
                ? 'opacity-100 visible'
                : 'opacity-0 invisible'
            }`}
          >
            <div className="w-full h-full flex lg:flex-col-reverse items-center justify-center gap-6 lg:gap-4 bg-[#222] rounded-full px-3 py-2.5">
              <button
                disabled={localStorageCounter.get() === 1}
                onClick={() => localStorageCounter.set(prev => prev - 1)}
              >
                <IconChevron
                  className={`lg:-rotate-90 w-[26px] h-[26px] btn-animation ${
                    localStorageCounter.get() === 1
                      ? 'stroke-gray-400'
                      : 'stroke-c-yellow'
                  }`}
                />
              </button>
              <p className="flex items-center justify-center w-5 h-5">
                {localStorageCounter.get()}
              </p>
              <button onClick={() => localStorageCounter.set(prev => prev + 1)}>
                <IconChevron
                  className={`stroke-[10px] btn-animation stroke-c-yellow rotate-180 lg:rotate-90 w-[26px] h-[26px]`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
