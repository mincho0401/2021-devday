import React, { useCallback, useEffect, useRef, useState } from 'react';
import { XTerm } from 'xterm-for-react'
import { WebLinksAddon } from 'xterm-addon-web-links';
import { colors, HELP_LIST, NOT_FOUND, SHOW_HELP, WELCOME_TEXTS, WITH_PROMPT } from './utils';

function DevDayPage() {
  const [enabled, setEnabled] = useState(true);
  const [input, setInput] = useState('');
  const xtermRef = useRef(null);
  const writeTerminal = useCallback((text) => xtermRef.current?.terminal.write(text), []);

  const asyncTyped = useCallback(async (text, time = 200) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        writeTerminal(text);
        resolve(null);
      }, time);
    });
  }, [writeTerminal]);

  useEffect(() => {
    loadAddons();
    focus();
    welcomeTyped();

    function loadAddons() {
      xtermRef.current?.terminal.loadAddon(new WebLinksAddon());
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
      asyncTyped('이\r\n');
      asyncTyped('press any key to start');
    }
  }, [asyncTyped, writeTerminal])

  const pressEnterKey = useCallback(() => {
    switch (input) {
      case '': {
        break;
      }
      case 'ls': {
        writeLs();
        break;
      }
      case 'cd':
      case 'cd ':
      case 'cd ..':
      case 'cd bk':
      case 'cd edgar':
      case 'cd daniel':
      case 'cd mincho':
      case 'cd vigli': {
        const person = input.split(' ')[1] ?? '';
        if (person === '' || person === '..') {
          writeNoSuchCd();
        } else {
          writeCd();
        }
        break;
      }
      case 'show me the money': {
        writeTerminal('\r\n');
        writeTerminal('10,000');
        writeTerminal('\r\n');
        break;
      }
      case 'rm -rf':
      case 'rm -rf /': {
        writeTerminal('\r\n');
        writeTerminal('please');
        writeTerminal('\r\n');
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

    function writeNotFoundCommand() {
      writeTerminal('\r\n');
      writeTerminal(NOT_FOUND(input));
      writeTerminal('\r\n');
      writeTerminal(SHOW_HELP);
      writeTerminal('\r\n');
    }

    function writeHelp() {
      writeTerminal('\r\n');
      HELP_LIST.forEach((help) => {
        writeTerminal(WITH_PROMPT);
        writeTerminal(`${help.command}    ${help.description}`);
      });
      writeTerminal('\r\n');
    }

    function writeLs() {
      writeTerminal('\r\n');
      writeTerminal('bk                edgar               daniel');
      writeTerminal('\r\n');
      writeTerminal('mincho            vigli');
      writeTerminal('\r\n');
    }

    function writeCd() {
      const person = input.split(' ')[1] ?? '';
      writeTerminal('\r\n');
      writeTerminal(`${colors.red}WARNING${colors.white} Access denied for user to database '${person}'.`);
      writeTerminal('\r\n');
    }

    function writeNoSuchCd() {
      writeTerminal('\r\n');
      writeTerminal(`${colors.red}WARNING${colors.white} bash: cd: desktop: No such file or directory`);
      writeTerminal('\r\n');
    }

    function writeReadme() {
      writeTerminal(WITH_PROMPT);
      const url = HELP_LIST.find((help) => help.command === 'devday readme').url;
      writeTerminal(`visit to ${url}`);
    }

    async function writeStart() {
      writeTerminal(WITH_PROMPT);
      const url = HELP_LIST.find((help) => help.command === 'devday start').url;
      writeTerminal(`visit to ${url}`);
      setEnabled(false);
      writeTerminal('\r\n');
      await asyncTyped('.', 300);
      writeTerminal('\r\n');
      await asyncTyped('..', 400);
      writeTerminal('\r\n');
      await asyncTyped('...', 500);
      writeTerminal('\r\n');
      await asyncTyped('....', 700);
      writeTerminal('\r\n');
      await asyncTyped('.....', 900);
      writeTerminal('\r\n');
      writeTerminal("[프로세스 완료됨]");
    }
  }, [asyncTyped, input, writeTerminal]);

  const onChange = useCallback((data) => {
    if (!enabled) {
      return;
    }

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

    function pressBackspace() {
      writeTerminal("\b \b");
      setInput(input.slice(0, -1));
    }

    function typing(data) {
      writeTerminal(data);
      setInput(input + data);
    }
  }, [enabled, input, pressEnterKey, writeTerminal]);

  return (
    <main style={styles.main}>
      <XTerm
        ref={xtermRef}
        options={{ cursorBlink: enabled }}
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
