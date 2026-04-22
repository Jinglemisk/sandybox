import type { ActionEntry } from '../state/types';

export class ActivityLog {
  private container: HTMLElement;
  private entries: HTMLElement;
  private lastEntryCount = 0;

  constructor() {
    this.container = document.getElementById('log-panel')!;
    this.entries = document.getElementById('log-entries')!;
  }

  update(actionLog: ActionEntry[]) {
    // Only add new entries
    if (actionLog.length <= this.lastEntryCount) return;

    const newEntries = actionLog.slice(this.lastEntryCount);
    this.lastEntryCount = actionLog.length;

    for (const entry of newEntries) {
      const div = document.createElement('div');
      div.className = `log-entry ${entry.type}`;

      const time = new Date(entry.timestamp);
      const timeStr = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      div.innerHTML = `
        <span class="time">${timeStr}</span>
        <span class="agent-name">${entry.agentName}</span>
        ${entry.description}
      `;

      this.entries.appendChild(div);
    }

    // Auto-scroll to bottom
    this.container.scrollTop = this.container.scrollHeight;

    // Remove old DOM entries if too many
    while (this.entries.children.length > 100) {
      this.entries.removeChild(this.entries.firstChild!);
    }
  }
}
