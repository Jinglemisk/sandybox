import type { Agent } from '../agents/agent';
import type { SimsCamera } from '../camera/camera';

interface BubbleState {
  element: HTMLElement;
  agentId: string;
}

export class SpeechBubbleManager {
  private container: HTMLElement;
  private bubbles: Map<string, BubbleState> = new Map();
  private canvas: HTMLCanvasElement;
  private camera: SimsCamera;

  constructor(canvas: HTMLCanvasElement, camera: SimsCamera) {
    this.container = document.getElementById('app')!;
    this.canvas = canvas;
    this.camera = camera;
  }

  update(agents: Agent[]) {
    const activeBubbles = new Set<string>();

    for (const agent of agents) {
      if (agent.currentMessage && agent.messageTimer > 0) {
        activeBubbles.add(agent.state.id);
        let bubble = this.bubbles.get(agent.state.id);

        if (!bubble) {
          const el = document.createElement('div');
          el.className = 'speech-bubble';
          this.container.appendChild(el);
          bubble = { element: el, agentId: agent.state.id };
          this.bubbles.set(agent.state.id, bubble);
        }

        bubble.element.textContent = agent.currentMessage;

        // Position above agent's head
        const headPos = agent.character.getHeadWorldPosition();
        headPos.y += 0.5;
        const screen = this.camera.worldToScreen(headPos, this.canvas);

        if (screen) {
          bubble.element.style.display = 'block';
          bubble.element.style.left = `${screen.x}px`;
          bubble.element.style.top = `${screen.y - 20}px`;
          bubble.element.style.transform = 'translate(-50%, -100%)';
        } else {
          bubble.element.style.display = 'none';
        }

        // Fade out near end
        if (agent.messageTimer < 1) {
          bubble.element.style.opacity = String(agent.messageTimer);
        } else {
          bubble.element.style.opacity = '1';
        }
      }
    }

    // Remove expired bubbles
    for (const [id, bubble] of this.bubbles) {
      if (!activeBubbles.has(id)) {
        bubble.element.remove();
        this.bubbles.delete(id);
      }
    }
  }
}
