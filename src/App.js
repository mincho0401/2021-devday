import React, { useCallback, useEffect, useRef, useState } from 'react';
import { XTerm } from 'xterm-for-react'
import { WebLinksAddon } from 'xterm-addon-web-links';
import { HELP_LIST, NOT_FOUND, SHOW_HELP, WELCOME_TEXTS, WITH_PROMPT } from './utils';

function DevDayPage() {
  const [input, setInput] = useState('');
  const xtermRef = useRef(null);
  const writeTerminal = useCallback((text) => xtermRef.current?.terminal.write(text), []);

  useEffect(() => {
    loadAddons();
    focus();
    welcomeTyped();

    function loadAddons() {
      xtermRef.current?.terminal.loadAddon(new WebLinksAddon());
    }

    async function asyncTyped(text, time = 200) {
      return new Promise((resolve) => {
        setTimeout(() => {
          writeTerminal(text);
          resolve(null);
        }, time);
      });
    }

    async function renderKmongDevday(arr) {
      for (const text of arr) {
        await asyncTyped(text, 120);
      }
    }

    function focus() {
      xtermRef.current?.terminal.focus()
    }
    
    async function welcomeTyped() {
      await renderKmongDevday(WELCOME_TEXTS.KMONG);
      await asyncTyped('', 750);
      await renderKmongDevday(WELCOME_TEXTS.DEVDAY);
      await asyncTyped('', 500);
      await asyncTyped('1');
      await asyncTyped('회');
      await asyncTyped(' 크');
      await asyncTyped('몽');
      await asyncTyped(' 데', 150);
      await asyncTyped('브', 150);
      await asyncTyped('데', 150);
      await asyncTyped('이\r\n$ ', 150);
      await asyncTyped('', 500);
    }
  }, [writeTerminal])

  const writeNotFoundCommand = useCallback(() => {
    writeTerminal(WITH_PROMPT);
    writeTerminal(NOT_FOUND(input));
    writeTerminal(WITH_PROMPT);
    writeTerminal(SHOW_HELP);
    writeTerminal(WITH_PROMPT);
  }, [input, writeTerminal]);

  const writeHelp = useCallback(() => {
    HELP_LIST.forEach((help) => {
      writeTerminal(WITH_PROMPT);
      writeTerminal(`devday ${help.command}    ${help.description}`);
    });
  }, [writeTerminal]);

  const writeReadme = useCallback(() => {
    writeTerminal(WITH_PROMPT);
    const url = HELP_LIST.find((help) => help.command === 'readme').url;
    writeTerminal(`visit to ${url}`);
  }, [writeTerminal]);

  const writeStart = useCallback(() => {
    writeTerminal(WITH_PROMPT);
    const url = HELP_LIST.find((help) => help.command === 'start').url;
    writeTerminal(`visit to ${url}`);
  }, [writeTerminal]);

  const pressBackspace = useCallback(() => {
    writeTerminal("\b \b");
  }, [writeTerminal]);

  const typing = useCallback((data) => {
    writeTerminal(data);
    setInput(input + data);
  }, [input, writeTerminal]);

  const pressEnterKey = useCallback(() => {
    switch (input) {
      case '': {
        break;
      }
      case 'devday start': {
        writeStart();
        break;
      }
      case 'devday readme': {
        writeReadme();
        break;
      }
      case 'devday --help': {
        writeHelp();
        break;
      }
      default: {
        writeNotFoundCommand();
        break;
      }
    }
    writeTerminal(WITH_PROMPT);
    writeTerminal("");
    setInput('');
  }, [input, writeHelp, writeNotFoundCommand, writeReadme, writeStart, writeTerminal]);

  const onChange = useCallback((data) => {
    if (!xtermRef.current) {
      return;
    }

    const code = data.charCodeAt(0);
    if (code === 13) {
      // 엔터
      pressEnterKey();
    } else if (code < 32) {
      // 이상한거 (컨투롤, 알트 커맨드 등등)
      return;
    } else if (code === 127) {
      // 빽스페이스
      pressBackspace();
    } else {
      // 타이핑
      typing(data);
    }
  }, [pressBackspace, pressEnterKey, typing]);

  return (
    <main style={styles.main}>
      <XTerm
        ref={xtermRef}
        options={{ cursorBlink: true }}
        onData={onChange}
      />
    </main>
  );
}

const styles = {
  main: {
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  }
};

export default DevDayPage;
