import type { Agent } from '../agents/agent';
import type { Simulation } from '../agents/simulation';
import type { SimsCamera } from '../camera/camera';
import type { StateManager } from '../state/stateManager';
import type { FurnitureItem } from '../world/furniture';
import { ROOMS } from '../world/house';
import { BOOK_TITLES } from '../agents/simulation';

const ROOM_NAMES = ROOMS.map(r => r.name);
const ROOM_SHORT: Record<string, string> = {
  'Living Room': 'Living Room',
  'Kitchen': 'Kitchen',
  'Bedroom 1': 'Bedroom 1',
  'Bedroom 2': 'Bedroom 2',
  'Bedroom 3': 'Bedroom 3',
  'Bathroom': 'Bathroom',
};

interface CategoryDef {
  icon: string;
  label: string;
  items: { label: string; cmd: string; data?: string }[];
}

function getCategories(): CategoryDef[] {
  return [
    {
      icon: '🚶', label: 'Move',
      items: ROOM_NAMES.map(r => ({ label: ROOM_SHORT[r] || r, cmd: 'walk', data: r })),
    },
    {
      icon: '🛋', label: 'Interact',
      items: [
        { label: '💺 Sit Down', cmd: 'sit' },
        { label: '📖 Read Book', cmd: 'read' },
        { label: '🍳 Cook', cmd: 'cook' },
        { label: '💻 Use Laptop', cmd: 'use-laptop' },
        { label: '🛏 Sleep', cmd: 'sleep' },
      ],
    },
    {
      icon: '🚿', label: 'Hygiene',
      items: [
        { label: '🚿 Shower', cmd: 'shower' },
        { label: '🚽 Toilet', cmd: 'use-toilet' },
      ],
    },
    {
      icon: '💬', label: 'Social',
      items: [
        { label: '🗣 Say Something', cmd: 'chat' },
        { label: '⏹ Stop / Idle', cmd: 'idle' },
      ],
    },
  ];
}

export class DebugPanel {
  private container: HTMLElement;
  private simulation: Simulation;
  private camera: SimsCamera;
  private stateManager: StateManager;
  private furniture: FurnitureItem[];
  private updateInterval: number;
  private activeAgentId: string | null = null;
  private openCategory: string | null = null;

  constructor(
    simulation: Simulation,
    camera: SimsCamera,
    stateManager: StateManager,
    furniture: FurnitureItem[]
  ) {
    this.container = document.getElementById('agent-bar')!;
    this.simulation = simulation;
    this.camera = camera;
    this.stateManager = stateManager;
    this.furniture = furniture;

    this.buildBar();
    this.updateInterval = window.setInterval(() => this.updateStatus(), 400);

    // Rebuild bar when new agents are dynamically spawned
    this.simulation.onAgentSpawned = () => this.buildBar();

    // Close menus when clicking on the 3D viewport
    document.addEventListener('mousedown', (e) => {
      if (!(e.target as HTMLElement).closest('#agent-bar')) {
        this.closeAll();
      }
    });

    // Log toggle
    const logToggle = document.getElementById('log-toggle');
    const logPanel = document.getElementById('log-panel');
    if (logToggle && logPanel) {
      logToggle.addEventListener('click', () => {
        logPanel.classList.toggle('hidden');
      });
    }
  }

  private buildBar() {
    this.container.innerHTML = '';
    const categories = getCategories();

    // Radial arc config: categories spread in an arc from -50° to +50° (right side)
    const arcRadius = 90; // px from portrait center
    const arcCount = categories.length;
    const arcSpread = 100; // total degrees of the arc
    const arcStart = -arcSpread / 2; // start angle in degrees

    for (const agent of this.simulation.agents) {
      const portrait = document.createElement('div');
      portrait.className = 'agent-portrait';
      portrait.dataset.agentId = agent.state.id;

      const color = agent.state.color;
      const hairColor = this.darkenColor(color, 0.35);

      // Build category buttons positioned in an arc
      const subArcRadius = 80; // px from category center for sub-items

      const catHtml = categories.map((cat, i) => {
        const angleDeg = arcStart + (i / (arcCount - 1)) * arcSpread;
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = Math.cos(angleRad) * arcRadius;
        const y = Math.sin(angleRad) * arcRadius;

        // Sub-items also fan in an arc from the category button
        const subCount = cat.items.length;
        const subSpread = Math.min(subCount * 22, 90); // tighter arc for fewer items
        const subStart = -subSpread / 2;

        const subHtml = cat.items.map((item, j) => {
          const subAngleDeg = subCount === 1 ? 0 : subStart + (j / (subCount - 1)) * subSpread;
          const subAngleRad = (subAngleDeg * Math.PI) / 180;
          const sx = Math.cos(subAngleRad) * subArcRadius;
          const sy = Math.sin(subAngleRad) * subArcRadius;
          return `
            <div class="sub-btn" data-cmd="${item.cmd}" data-agent="${agent.state.id}" ${item.data ? `data-room="${item.data}"` : ''}
                 style="left:${sx}px; top:${sy}px; transform: translate(0, -50%);">
              ${item.label}
            </div>
          `;
        }).join('');

        return `
          <div class="cat-btn" data-cat="${cat.label}" data-agent="${agent.state.id}"
               style="left:${x}px; top:${y}px; transform: translate(0, -50%);">
            <span class="cat-icon">${cat.icon}</span> ${cat.label}
            <div class="sub-menu">${subHtml}</div>
          </div>
        `;
      }).join('');

      portrait.innerHTML = `
        <div class="portrait-status" id="emoji-${agent.state.id}">😊</div>
        <div class="portrait-ring" style="border-color: ${color}55">
          <div class="portrait-head">
            <div class="head-circle" style="background: #f0c8a0; border-radius: 50%;"></div>
            <div style="position:absolute;top:-2px;left:1px;width:26px;height:14px;border-radius:50%;background:${hairColor};"></div>
            <div class="body-rect" style="background: ${color};"></div>
          </div>
        </div>
        <div class="portrait-name">${agent.state.name}</div>
        <div class="category-menu">${catHtml}</div>
      `;

      this.container.appendChild(portrait);
    }

    // Event delegation
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Sub-menu item click
      const subBtn = target.closest('.sub-btn') as HTMLElement;
      if (subBtn) {
        e.stopPropagation();
        const cmd = subBtn.dataset.cmd!;
        const agentId = subBtn.dataset.agent!;
        const room = subBtn.dataset.room;
        const agent = this.simulation.agents.find(a => a.state.id === agentId);
        if (agent) {
          this.executeCommand(agent, cmd, room);
          this.closeAll();
        }
        return;
      }

      // Category button click
      const catBtn = target.closest('.cat-btn') as HTMLElement;
      if (catBtn) {
        e.stopPropagation();
        const wasOpen = catBtn.classList.contains('open');
        // Close all categories for this agent
        catBtn.parentElement!.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('open'));
        if (!wasOpen) {
          catBtn.classList.add('open');
          this.openCategory = catBtn.dataset.cat!;
        } else {
          this.openCategory = null;
        }
        return;
      }

      // Portrait click
      const portraitEl = target.closest('.agent-portrait') as HTMLElement;
      if (portraitEl) {
        const agentId = portraitEl.dataset.agentId!;
        if (this.activeAgentId === agentId) {
          this.closeAll();
        } else {
          this.closeAll();
          this.activeAgentId = agentId;
          portraitEl.classList.add('active');
          portraitEl.querySelector('.portrait-ring')!.setAttribute('style',
            `border-color: ${this.simulation.agents.find(a => a.state.id === agentId)?.state.color || '#8ba4ff'}`);
        }
        return;
      }
    });
  }

  private closeAll() {
    this.activeAgentId = null;
    this.openCategory = null;
    this.container.querySelectorAll('.agent-portrait').forEach(p => p.classList.remove('active'));
    this.container.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('open'));
  }

  private darkenColor(hex: string, factor: number): string {
    const c = parseInt(hex.replace('#', ''), 16);
    const r = Math.floor(((c >> 16) & 0xff) * (1 - factor));
    const g = Math.floor(((c >> 8) & 0xff) * (1 - factor));
    const b = Math.floor((c & 0xff) * (1 - factor));
    return `rgb(${r},${g},${b})`;
  }

  private executeCommand(agent: Agent, cmd: string, room?: string) {
    switch (cmd) {
      case 'walk':
        if (room) {
          agent.walkToRoom(room);
          this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'move', `walks to ${room}`);
        }
        break;
      case 'sit': {
        const chair = this.findNearestFurniture(agent, ['Couch', 'Armchair', 'Chair', 'Porch Bench', 'Bed']);
        if (chair) {
          agent.interactWith(chair);
          this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'interact', `sits on the ${chair.name}`);
        } else { agent.say("Nothing to sit on nearby..."); }
        break;
      }
      case 'read': {
        const bookshelf = this.findNearestFurniture(agent, ['Bookshelf']);
        const book = BOOK_TITLES[Math.floor(Math.random() * BOOK_TITLES.length)];
        if (bookshelf) agent.interactWith(bookshelf);
        agent.say(`📖 Reading "${book}"`);
        agent.doAction('using', 10 + Math.random() * 15);
        this.stateManager.addChatMessage(agent.state.id, agent.state.name, `📖 Reading "${book}"`);
        this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'action', `picks up "${book}" and starts reading`);
        break;
      }
      case 'cook': {
        const stove = this.findNearestFurniture(agent, ['Stove', 'Kitchen Counter']);
        if (stove) { agent.interactWith(stove); agent.say("Time to cook!"); this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'interact', `starts cooking`); }
        else { agent.walkToRoom('Kitchen'); this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'move', `heads to the Kitchen to cook`); }
        break;
      }
      case 'use-laptop': {
        const laptop = this.findNearestFurniture(agent, ['Laptop', 'Desk']);
        if (laptop) { agent.interactWith(laptop); this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'interact', `uses the ${laptop.name}`); }
        else { agent.walkToRoom('Kitchen'); this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'move', `heads to use the laptop`); }
        break;
      }
      case 'shower': {
        const shower = this.findNearestFurniture(agent, ['Shower']);
        if (shower) { agent.interactWith(shower); this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'interact', `takes a shower`); }
        else { agent.walkToRoom('Bathroom'); this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'move', `heads to the Bathroom`); }
        break;
      }
      case 'sleep': {
        const bed = this.findNearestFurniture(agent, ['Bed']);
        if (bed) { agent.interactWith(bed); agent.say("💤 Goodnight..."); agent.doAction('sitting', 15 + Math.random() * 10); this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'action', `goes to sleep`); }
        else { agent.walkToRoom('Bedroom 1'); this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'move', `heads to bed`); }
        break;
      }
      case 'use-toilet': {
        const toilet = this.findNearestFurniture(agent, ['Toilet']);
        if (toilet) { agent.interactWith(toilet); this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'interact', `uses the toilet`); }
        else { agent.walkToRoom('Bathroom'); this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'move', `heads to the Bathroom`); }
        break;
      }
      case 'chat': {
        const messages = ["Hey everyone!", "What's up?", "This is fun!", "Who wants to hang out?", "I'm bored...", "Great house!", "Anyone home?", "Let's chat!"];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        agent.say(msg);
        this.stateManager.addChatMessage(agent.state.id, agent.state.name, msg);
        break;
      }
      case 'idle':
        agent.doAction('idle', 0);
        break;
    }
  }

  private findNearestFurniture(agent: Agent, names: string[]): FurnitureItem | null {
    const pos = agent.character.group.position;
    let best: FurnitureItem | null = null;
    let bestDist = Infinity;
    for (const item of this.furniture) {
      if (!names.includes(item.name)) continue;
      const dx = item.interactionPoint.x - pos.x;
      const dz = item.interactionPoint.z - pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < bestDist) { bestDist = dist; best = item; }
    }
    return best;
  }

  private updateStatus() {
    for (const agent of this.simulation.agents) {
      const el = document.getElementById(`emoji-${agent.state.id}`);
      if (el) {
        const emoji = agent.action === 'walking' ? '🚶' :
          agent.action === 'sitting' ? '🪑' :
          agent.action === 'using' ? '🔧' :
          agent.action === 'chatting' ? '💬' : '😊';
        el.textContent = emoji;
      }
    }
  }

  destroy() {
    clearInterval(this.updateInterval);
  }
}
