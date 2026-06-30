import {
  createApplication,
  type PlatformApplication,
} from '@plantasonic/platform';
import type {
  AudioReactiveBridge,
  PresetBundle,
  SoundEngineAdapter,
  VisualEngineAdapter,
  WorkspaceRegionId,
} from '@plantasonic/platform-types';
import {
  bindInspector,
  createInspector,
  createMetrics,
  renderCanvasMount,
  renderTransport,
  startMetricsLoop,
  type MetricsRegistry,
} from 'plantasonic-design-system/instrument';
import {
  bindCreativeWorkspace,
  renderCreativeWorkspace,
} from 'plantasonic-design-system/creative-workspace';
import {
  bindApplicationShell,
  initShellTheme,
  renderApplicationShell,
  type ApplicationShellConfig,
} from 'plantasonic-design-system/shell';

import {
  createDemoAudioReactiveBridge,
  renderAudioReactivePanel,
  wireAudioReactiveBridge,
} from '@plantasonic/platform-demo/bridgeIntegration';
import {
  createDemoPerformanceControls,
  renderPerformancePanel,
  wirePerformanceControls,
} from '@plantasonic/platform-demo/performanceIntegration';
import {
  createDemoPluginManager,
  getEnabledPluginCount,
  renderPluginsPanel,
  wirePluginManager,
} from '@plantasonic/platform-demo/pluginIntegration';
import {
  createDemoPresetBundleRegistry,
  renderPresetBrowserContent,
  wirePresetBundles,
} from '@plantasonic/platform-demo/presetIntegration';
import {
  createDemoProjectPersistence,
  getProjectSummary,
  renderProjectControls,
  wireProjectPersistence,
} from '@plantasonic/platform-demo/projectIntegration';
import {
  bindEngineTransport,
  createDemoSoundAdapter,
  createEngineTransportHandlers,
  renderParameterPanel,
  wireEngineDemo,
} from './signal9SoundIntegration.js';
import { registerTransmissionSession } from './transmissionSession.js';
import {
  bindVisualResize,
  createDemoVisualAdapter,
  mountVisualStage,
  renderVisualParameterPanel,
  wireVisualControls,
} from './signal9VisualIntegration.js';
import { startBassEmojiScalePulse } from './bassEmojiPulse.js';
import { registerSignal9AudioReactiveBridge } from './signal9AudioReactive.js';

import type { InstrumentAppContent } from '@plantasonic/platform-demo/instrumentApp';

let presetBundleRegistry: ReturnType<typeof createDemoPresetBundleRegistry> | null = null;

export function getSignal9PresetBundleRegistry(): ReturnType<
  typeof createDemoPresetBundleRegistry
> | null {
  return presetBundleRegistry;
}

const REGION_SELECTORS: Record<WorkspaceRegionId, string> = {
  stage: '[data-ps-region="stage"]',
  transport: '[data-ps-cw-surface="transport"]',
  inspector: '[data-ps-cw-surface="inspector"]',
  'preset-browser': '[data-ps-cw-surface="browser"]',
  status: '[data-ps-cw-surface="hud"]',
};

function buildShellConfig(
  content: InstrumentAppContent,
  app: PlatformApplication,
  sound: SoundEngineAdapter,
  visual: VisualEngineAdapter,
  bridge: AudioReactiveBridge,
  browserBundles: PresetBundle[],
  getActiveBundleName: () => string,
  getPluginSummary: () => string,
  getProjectStateSummary: () => string,
): {
  config: ApplicationShellConfig;
  workspaceHtml: string;
  metrics: MetricsRegistry;
} {
  const inspector = createInspector();
  inspector.registerPanel({
    id: 'sound-parameters',
    title: 'Sound Parameters',
    render: () => renderParameterPanel(),
  });
  inspector.registerPanel({
    id: 'visual-parameters',
    title: 'Visual Parameters',
    render: () => renderVisualParameterPanel(),
  });
  inspector.registerPanel({
    id: 'audio-reactive',
    title: 'Audio Reactive',
    render: () => renderAudioReactivePanel(),
  });
  inspector.registerPanel({
    id: 'performance',
    title: 'Performance',
    render: () => renderPerformancePanel(),
  });
  inspector.registerPanel({
    id: 'plugins',
    title: 'Plugins',
    render: () => renderPluginsPanel(),
  });

  const metrics = createMetrics([
    { id: 'lifecycle', label: 'Lifecycle', get: () => app.status },
    { id: 'sound-state', label: 'Sound', get: () => sound.getStatus().engineState },
    { id: 'visual-state', label: 'Visual', get: () => visual.getStatus().engineState },
    { id: 'visual-fps', label: 'FPS', get: () => visual.getStatus().fps },
    { id: 'sound-preset', label: 'Preset', get: () => sound.getStatus().currentPresetId ?? '—' },
    { id: 'visual-preset', label: 'Visual', get: () => visual.getStatus().currentPresetId ?? '—' },
    { id: 'active-bundle', label: 'Bundle', get: getActiveBundleName },
    { id: 'plugins-state', label: 'Plugins', get: getPluginSummary },
    { id: 'project-state', label: 'Project', get: getProjectStateSummary },
    {
      id: 'bridge-state',
      label: 'Bridge',
      get: () => {
        const status = bridge.getStatus();
        if (!status.connected) return 'idle';
        if (status.running && status.enabled) return 'reactive';
        if (status.running) return 'active';
        return 'connected';
      },
    },
  ]);

  const statusHud = `<p data-demo-sound-error class="text-danger small mb-1" hidden role="alert"></p><p data-demo-visual-error class="text-danger small mb-1" hidden role="alert"></p><p data-demo-bridge-error class="text-danger small mb-1" hidden role="alert"></p><p data-demo-preset-error class="text-danger small mb-1" hidden role="alert"></p><p data-demo-preset-warning class="text-warning small mb-1" hidden role="status"></p><p data-demo-performance-error class="text-danger small mb-1" hidden role="alert"></p><p data-demo-plugin-error class="text-danger small mb-1" hidden role="alert"></p>${metrics.renderStatusBar()}${renderProjectControls()}<ul class="demo-event-log" data-demo-event-log aria-label="Platform events"></ul>`;

  const workspaceHtml = renderCreativeWorkspace({
    preset: 'instrument',
    mode: content.shell.mode ?? 'edit',
    stage: renderCanvasMount('ps-stage-canvas'),
    transport: renderTransport({
      record: false,
      loop: false,
      performance: false,
      sync: false,
      state: {
        tempo: content.branding.transportTempo ?? 72,
        time: '0.0.0',
      },
    }),
    inspector: inspector.render(),
    presetBrowser: renderPresetBrowserContent(browserBundles),
    statusHud,
    commandPalette: false,
  });

  const config: ApplicationShellConfig = {
    ...content.shell,
    instrument: { transport: false },
  };

  return { config, workspaceHtml, metrics };
}

function bindRegions(app: PlatformApplication, root: HTMLElement): void {
  for (const [id, selector] of Object.entries(REGION_SELECTORS) as [
    WorkspaceRegionId,
    string,
  ][]) {
    const element = root.querySelector<HTMLElement>(selector);
    if (element) {
      app.workspace.bindRegion(id, element);
    }
  }
}

function bindEventLog(app: PlatformApplication, root: HTMLElement): void {
  const log = root.querySelector<HTMLElement>('[data-demo-event-log]');
  if (!log) return;

  for (const prefix of [
    'application',
    'lifecycle',
    'preset',
    'sound',
    'visual',
    'bridge',
    'performance',
    'plugin',
    'project',
  ]) {
    app.eventBus.on(prefix, (event) => {
      const entry = document.createElement('li');
      entry.className = 'demo-event-log__entry';
      entry.textContent = `[${event.type}] ${event.timestamp}`;
      log.prepend(entry);
      while (log.children.length > 12) {
        log.removeChild(log.lastChild!);
      }
    });
  }
}

/** Mount Signal 9 — MP3 drives the bridge; ASCII Visual Engine renders the stage. */
export async function mountInstrumentApp(
  container: HTMLElement,
  content: InstrumentAppContent,
): Promise<PlatformApplication> {
  const browserBundles = [
    ...(content.browserSeedBundles ?? []),
    ...content.presetBundles,
  ];

  const app = createApplication(content.application);
  const [sound, visual] = await Promise.all([
    createDemoSoundAdapter(app),
    createDemoVisualAdapter(app),
  ]);
  const bridge = await createDemoAudioReactiveBridge(app, sound, visual);
  registerSignal9AudioReactiveBridge(bridge);
  startBassEmojiScalePulse();
  let bundleRegistry: ReturnType<typeof createDemoPresetBundleRegistry> | undefined;
  let pluginManager: Awaited<ReturnType<typeof createDemoPluginManager>> | undefined;
  let projectPersistence: ReturnType<typeof createDemoProjectPersistence> | undefined;

  const { config, workspaceHtml, metrics } = buildShellConfig(
    content,
    app,
    sound,
    visual,
    bridge,
    browserBundles,
    () => {
      const id = bundleRegistry?.getActiveBundleId();
      if (!id) return '—';
      return bundleRegistry?.getBundle(id)?.name ?? id;
    },
    () => {
      if (!pluginManager) return '—';
      const total = pluginManager.getAllPluginStatuses().length;
      return `${getEnabledPluginCount(pluginManager)}/${total}`;
    },
    () => {
      if (!projectPersistence) return '—';
      return getProjectSummary(projectPersistence);
    },
  );

  initShellTheme(config.theme ?? 'dark');
  container.innerHTML = renderApplicationShell(config, workspaceHtml);
  bindApplicationShell(config);

  const workspaceRoot = container.querySelector<HTMLElement>('.ps-creative-workspace');
  bindCreativeWorkspace(workspaceRoot, {
    persist: config.persistState ?? false,
    storageKey: `${config.id ?? 'platform'}-workspace`,
  });

  bindRegions(app, container);
  await mountVisualStage(container, visual);
  bindVisualResize(container, visual);
  bundleRegistry = createDemoPresetBundleRegistry(
    app,
    sound,
    visual,
    bridge,
    container,
    content.presetBundles,
  );
  presetBundleRegistry = bundleRegistry;
  const transport = createEngineTransportHandlers(container, app, sound, visual, bridge);
  registerTransmissionSession(visual, transport);
  bindEngineTransport(container, app, sound, visual, bridge);
  bindInspector(container);
  wireEngineDemo(container, app, sound);
  wireVisualControls(container, visual);
  wireAudioReactiveBridge(container, app, bridge, sound, visual);
  wirePresetBundles(container, app, bundleRegistry, bridge);
  const performance = await createDemoPerformanceControls(
    app,
    container,
    sound,
    visual,
    bridge,
    bundleRegistry,
    transport,
  );
  wirePerformanceControls(container, app, performance);
  pluginManager = await createDemoPluginManager(
    app,
    sound,
    visual,
    bridge,
    bundleRegistry,
    performance,
    content.plugins ?? [],
  );
  wirePluginManager(container, app, pluginManager);
  projectPersistence = createDemoProjectPersistence(
    app,
    container,
    sound,
    visual,
    bridge,
    bundleRegistry,
    performance,
    pluginManager,
  );
  wireProjectPersistence(container, app, projectPersistence, bundleRegistry);
  bindEventLog(app, container);
  startMetricsLoop(container, metrics);

  app.eventBus.emit({
    type: 'application.mounted',
    timestamp: new Date().toISOString(),
    source: content.branding.eventSource,
    payload: {
      designSystem: true,
      creativeWorkspace: true,
      soundEngine: true,
      visualEngine: true,
      audioReactiveBridge: true,
      presetBundleRegistry: true,
      performanceControls: true,
      pluginFramework: true,
      workspacePersistence: true,
      variant: 'instrument',
      audioSource: 'mp3-transmission',
    },
  });

  return app;
}
