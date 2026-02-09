import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export interface DOSPost {
  id: string;
  title: string;
  date: string;
  content: string;
  tags: string[];
}

export const dosPosts: DOSPost[] = [
  {
    id: '1',
    title: 'Welcome to DOS Terminal',
    date: '2026-02-09',
    content: `Welcome to my DOS-style terminal space!

This is a retro-inspired interface built with xterm.js.
You can navigate using classic DOS commands.

Available commands:
- HELP    - Show available commands
- LIST    - List all entries
- READ <id> - Read a specific entry
- CLEAR   - Clear the terminal
- ABOUT   - About this terminal
- EXIT    - Exit (just refresh the page)

Enjoy your stay in the terminal!`,
    tags: ['welcome', 'intro']
  },
  {
    id: '2',
    title: 'Building a DOS Terminal',
    date: '2026-02-09',
    content: `I've always been fascinated by retro computing and terminal interfaces.
There's something beautiful about the simplicity and directness of command-line interfaces.

This experience is built using:
- xterm.js for the terminal emulator
- TypeScript for type safety
- Astro for the framework

The DOS aesthetic brings back memories of simpler times when computing was more direct and less cluttered.`,
    tags: ['tech', 'retro', 'xterm']
  },
  {
    id: '3',
    title: 'The Art of Minimalism',
    date: '2026-02-08',
    content: `Minimalism in design isn't about removing everything.
It's about keeping only what's essential.

In terminal interfaces, every character matters.
Every command serves a purpose.
There's no room for unnecessary decoration.

This philosophy extends beyond code to life itself.`,
    tags: ['philosophy', 'design', 'minimalism']
  }
];

export class DOSTerminal {
  private terminal: Terminal;
  private fitAddon: FitAddon;
  private currentLine: string = '';
  private commandHistory: string[] = [];
  private historyIndex: number = -1;

  constructor(container: HTMLElement) {
    this.terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 14,
      fontFamily: "'Courier New', 'MS-DOS', monospace",
      theme: {
        background: '#000000',
        foreground: '#00FF00',
        cursor: '#00FF00',
        black: '#000000',
        red: '#FF0000',
        green: '#00FF00',
        yellow: '#FFFF00',
        blue: '#0000FF',
        magenta: '#FF00FF',
        cyan: '#00FFFF',
        white: '#C0C0C0',
        brightBlack: '#808080',
        brightRed: '#FF8080',
        brightGreen: '#80FF80',
        brightYellow: '#FFFF80',
        brightBlue: '#8080FF',
        brightMagenta: '#FF80FF',
        brightCyan: '#80FFFF',
        brightWhite: '#FFFFFF'
      },
      allowProposedApi: true
    });

    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);
    this.terminal.open(container);
    this.fitAddon.fit();

    window.addEventListener('resize', () => {
      this.fitAddon.fit();
    });

    this.init();
  }

  private init() {
    this.printWelcome();
    this.printPrompt();
    this.setupInput();
  }

  private printWelcome() {
    this.terminal.writeln('\x1b[32m╔═══════════════════════════════════════════════════════════╗\x1b[0m');
    this.terminal.writeln('\x1b[32m║                                                           ║\x1b[0m');
    this.terminal.writeln('\x1b[32m║                DOS TERMINAL INTERFACE v1.0                ║\x1b[0m');
    this.terminal.writeln('\x1b[32m║                                                           ║\x1b[0m');
    this.terminal.writeln('\x1b[32m╚═══════════════════════════════════════════════════════════╝\x1b[0m');
    this.terminal.writeln('');
    this.terminal.writeln('\x1b[33mType HELP for available commands.\x1b[0m');
    this.terminal.writeln('');
  }

  private printPrompt() {
    this.terminal.write('\x1b[32mC:\\DOS>\x1b[0m ');
  }

  private setupInput() {
    this.terminal.onData((data) => {
      const code = data.charCodeAt(0);

      if (code === 13) {
        this.handleEnter();
      } else if (code === 127 || code === 8) {
        this.handleBackspace();
      } else if (code === 27) {
        const rest = data.slice(1);
        if (rest === '[A') {
          this.handleArrowUp();
        } else if (rest === '[B') {
          this.handleArrowDown();
        }
      } else if (data >= ' ') {
        this.currentLine += data;
        this.terminal.write(data);
      }
    });
  }

  private handleEnter() {
    this.terminal.writeln('');
    const command = this.currentLine.trim().toUpperCase();

    if (command) {
      this.commandHistory.push(this.currentLine.trim());
      this.historyIndex = this.commandHistory.length;
      this.executeCommand(command);
    }

    this.currentLine = '';
    this.printPrompt();
  }

  private handleBackspace() {
    if (this.currentLine.length > 0) {
      this.currentLine = this.currentLine.slice(0, -1);
      this.terminal.write('\b \b');
    }
  }

  private handleArrowUp() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.clearCurrentLine();
      this.currentLine = this.commandHistory[this.historyIndex];
      this.terminal.write(this.currentLine);
    }
  }

  private handleArrowDown() {
    if (this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      this.clearCurrentLine();
      this.currentLine = this.commandHistory[this.historyIndex];
      this.terminal.write(this.currentLine);
    } else {
      this.historyIndex = this.commandHistory.length;
      this.clearCurrentLine();
      this.currentLine = '';
    }
  }

  private clearCurrentLine() {
    const length = this.currentLine.length;
    for (let i = 0; i < length; i++) {
      this.terminal.write('\b \b');
    }
  }

  private executeCommand(command: string) {
    const parts = command.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case 'HELP':
      case '?':
        this.showHelp();
        break;
      case 'LIST':
      case 'DIR':
        this.listEntries();
        break;
      case 'READ':
        if (args.length > 0) {
          this.readEntry(args[0]);
        } else {
          this.terminal.writeln('\x1b[31mError: Please specify an entry ID.\x1b[0m');
          this.terminal.writeln('Usage: READ <id>');
        }
        break;
      case 'CLEAR':
      case 'CLS':
        this.clearTerminal();
        break;
      case 'ABOUT':
        this.showAbout();
        break;
      case 'EXIT':
      case 'QUIT':
        this.terminal.writeln('\x1b[33mTo exit, please refresh the page.\x1b[0m');
        break;
      case '':
        break;
      default:
        this.terminal.writeln(`\x1b[31mBad command or file name: ${cmd}\x1b[0m`);
        this.terminal.writeln('Type HELP for available commands.');
    }
  }

  private showHelp() {
    this.terminal.writeln('');
    this.terminal.writeln('\x1b[33m═══════════════════════════════════════════════════════════\x1b[0m');
    this.terminal.writeln('\x1b[33m                    AVAILABLE COMMANDS\x1b[0m');
    this.terminal.writeln('\x1b[33m═══════════════════════════════════════════════════════════\x1b[0m');
    this.terminal.writeln('');
    this.terminal.writeln('  \x1b[32mHELP\x1b[0m     - Display this help message');
    this.terminal.writeln('  \x1b[32mLIST\x1b[0m     - List all entries');
    this.terminal.writeln('  \x1b[32mREAD <id>\x1b[0m - Read a specific entry');
    this.terminal.writeln('  \x1b[32mCLEAR\x1b[0m    - Clear the terminal screen');
    this.terminal.writeln('  \x1b[32mABOUT\x1b[0m    - Show information about this terminal');
    this.terminal.writeln('  \x1b[32mEXIT\x1b[0m     - Exit (refresh page)');
    this.terminal.writeln('');
  }

  private listEntries() {
    this.terminal.writeln('');
    this.terminal.writeln('\x1b[33m═══════════════════════════════════════════════════════════\x1b[0m');
    this.terminal.writeln('\x1b[33m                        ENTRIES\x1b[0m');
    this.terminal.writeln('\x1b[33m═══════════════════════════════════════════════════════════\x1b[0m');
    this.terminal.writeln('');

    dosPosts.forEach((entry) => {
      const id = `\x1b[32m[${entry.id}]\x1b[0m`;
      const title = `\x1b[36m${entry.title}\x1b[0m`;
      const date = `\x1b[33m${entry.date}\x1b[0m`;
      const tags = entry.tags.map(t => `\x1b[35m#${t}\x1b[0m`).join(' ');

      this.terminal.writeln(`  ${id} ${title}`);
      this.terminal.writeln(`      Date: ${date}  Tags: ${tags}`);
      this.terminal.writeln('');
    });

    this.terminal.writeln(`Total: ${dosPosts.length} entr(y/ies)`);
    this.terminal.writeln('');
  }

  private readEntry(id: string) {
    const entry = dosPosts.find(p => p.id === id);

    if (!entry) {
      this.terminal.writeln(`\x1b[31mEntry not found: ${id}\x1b[0m`);
      this.terminal.writeln('Use LIST to see available entries.');
      return;
    }

    this.terminal.writeln('');
    this.terminal.writeln('\x1b[33m═══════════════════════════════════════════════════════════\x1b[0m');
    this.terminal.writeln(`\x1b[36m${entry.title}\x1b[0m`);
    this.terminal.writeln('\x1b[33m═══════════════════════════════════════════════════════════\x1b[0m');
    this.terminal.writeln('');
    this.terminal.writeln(`\x1b[33mDate:\x1b[0m ${entry.date}`);
    this.terminal.writeln(`\x1b[33mTags:\x1b[0m ${entry.tags.map(t => `#${t}`).join(' ')}`);
    this.terminal.writeln('');
    this.terminal.writeln('\x1b[33m───────────────────────────────────────────────────────────\x1b[0m');
    this.terminal.writeln('');

    const lines = entry.content.split('\n');
    lines.forEach(line => {
      this.terminal.writeln(`  ${line}`);
    });

    this.terminal.writeln('');
    this.terminal.writeln('\x1b[33m───────────────────────────────────────────────────────────\x1b[0m');
    this.terminal.writeln('');
  }

  private clearTerminal() {
    this.terminal.clear();
    this.printWelcome();
  }

  private showAbout() {
    this.terminal.writeln('');
    this.terminal.writeln('\x1b[33m═══════════════════════════════════════════════════════════\x1b[0m');
    this.terminal.writeln('\x1b[33m                         ABOUT\x1b[0m');
    this.terminal.writeln('\x1b[33m═══════════════════════════════════════════════════════════\x1b[0m');
    this.terminal.writeln('');
    this.terminal.writeln('  A retro-inspired DOS terminal experience built with:');
    this.terminal.writeln('  - xterm.js terminal emulator');
    this.terminal.writeln('  - TypeScript');
    this.terminal.writeln('  - Astro framework');
    this.terminal.writeln('');
    this.terminal.writeln('  Experience the nostalgia of DOS-era computing');
    this.terminal.writeln('  with a modern twist.');
    this.terminal.writeln('');
    this.terminal.writeln('  Type HELP for available commands.');
    this.terminal.writeln('');
  }
}

