const NODE_WIDTH = 170;
const NODE_HEIGHT = 90;
const LAYOUT_AREA_PER_NODE = 160000;
const MIN_LAYOUT_AREA = 720000;
const IDEAL_DISTANCE_MULTIPLIER = 1.25;

const splitTopLevel = (value, delimiter = ',') => {
  const parts = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === delimiter && depth === 0) {
      parts.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }

  const last = value.slice(start).trim();
  if (last) parts.push(last);
  return parts;
};

const readBalancedGroups = (value) => {
  const groups = [];
  let depth = 0;
  let start = null;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (char === '(') {
      if (depth === 0) start = i + 1;
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
      if (depth < 0) throw new Error('RedoRoutes has an unexpected closing parenthesis.');
      if (depth === 0 && start !== null) {
        groups.push(value.slice(start, i).trim());
        start = null;
      }
    }
  }

  if (depth !== 0) throw new Error('RedoRoutes has an unclosed parenthesis.');
  return groups;
};

const normalizeName = (name) => name.trim().replace(/^["']|["']$/g, '');

const isPlaceholderName = (name) => name.toLowerCase() === 'undefined';

const parseRouteSpec = (routeSpec, defaultPriority) => {
  const match = routeSpec.trim().match(/^([^\s(),]+)\s+(ASYNC|SYNC|FASTSYNC)(?:\s+PRIORITY\s*=\s*(\d+))?$/i);
  if (!match) throw new Error(`Could not parse route: ${routeSpec}`);

  return {
    targetName: normalizeName(match[1]),
    logXptMode: match[2].toUpperCase(),
    priority: match[3] ? Number.parseInt(match[3], 10) : defaultPriority,
  };
};

const parseRoutesForPrimary = (routesText) => {
  const routes = [];

  splitTopLevel(routesText).forEach((routeText) => {
    if (routeText.startsWith('(') && routeText.endsWith(')')) {
      const chain = splitTopLevel(routeText.slice(1, -1))
        .map((part, index) => parseRouteSpec(part, index + 1))
        .sort((a, b) => a.priority - b.priority);

      chain.forEach((route, index) => {
        routes.push({
          ...route,
          alternateToName: index > 0 ? chain[0].targetName : null,
        });
      });
      return;
    }

    routes.push({
      ...parseRouteSpec(routeText, 1),
      alternateToName: null,
    });
  });

  return routes;
};

export const parseRedoRoutesStatements = (input) => {
  const statements = [];
  const statementPattern = /EDIT\s+(DATABASE|FAR_SYNC|RECOVERY_APPLIANCE)\s+([^\s]+)\s+SET\s+PROPERTY\s+RedoRoutes\s*=\s*'([^']*)'\s*;?/gi;
  let match;

  while ((match = statementPattern.exec(input)) !== null) {
    const [, sourceType, sourceName, routesProperty] = match;

    readBalancedGroups(routesProperty).forEach((group) => {
      const separatorIndex = group.indexOf(':');
      if (separatorIndex === -1) throw new Error(`Missing primary separator in route group: ${group}`);

      const whenPrimaryName = normalizeName(group.slice(0, separatorIndex));
      const routesText = group.slice(separatorIndex + 1).trim();

      parseRoutesForPrimary(routesText).filter(route => !isPlaceholderName(route.targetName)).forEach((route) => {
        statements.push({
          sourceName: normalizeName(sourceName),
          sourceType: sourceType.toUpperCase(),
          whenPrimaryName,
          ...route,
        });
      });
    });
  }

  if (statements.length === 0) {
    throw new Error('No RedoRoutes statements were found.');
  }

  return statements;
};

const getNodeType = (brokerObjectType) => {
  if (brokerObjectType === 'FAR_SYNC') return 'FAR_SYNC';
  if (brokerObjectType === 'RECOVERY_APPLIANCE') return 'RECOVERY_APPLIANCE';
  return 'DATABASE';
};

const createForceLayout = (nodes, edges) => {
  const nodeCount = nodes.length;
  if (nodeCount === 0) return nodes;

  const area = Math.max(MIN_LAYOUT_AREA, nodeCount * LAYOUT_AREA_PER_NODE);
  const width = Math.sqrt(area * 1.6);
  const height = Math.sqrt(area / 1.6);
  const centerX = width / 2;
  const centerY = height / 2;
  const idealDistance = Math.sqrt((width * height) / nodeCount) * IDEAL_DISTANCE_MULTIPLIER;
  let temperature = width / 8;
  const positions = new Map();

  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodeCount;
    const radius = Math.min(width, height) * (0.25 + (index % 3) * 0.08);
    positions.set(node.id, {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  });

  for (let iteration = 0; iteration < 260; iteration += 1) {
    const displacements = new Map(nodes.map(node => [node.id, { x: 0, y: 0 }]));

    for (let i = 0; i < nodeCount; i += 1) {
      for (let j = i + 1; j < nodeCount; j += 1) {
        const first = nodes[i];
        const second = nodes[j];
        const firstPosition = positions.get(first.id);
        const secondPosition = positions.get(second.id);
        const dx = firstPosition.x - secondPosition.x;
        const dy = firstPosition.y - secondPosition.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const force = (idealDistance * idealDistance) / distance;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        displacements.get(first.id).x += fx;
        displacements.get(first.id).y += fy;
        displacements.get(second.id).x -= fx;
        displacements.get(second.id).y -= fy;
      }
    }

    edges.forEach((edge) => {
      const sourcePosition = positions.get(edge.source);
      const targetPosition = positions.get(edge.target);
      if (!sourcePosition || !targetPosition) return;

      const dx = sourcePosition.x - targetPosition.x;
      const dy = sourcePosition.y - targetPosition.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const force = (distance * distance) / idealDistance;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      displacements.get(edge.source).x -= fx;
      displacements.get(edge.source).y -= fy;
      displacements.get(edge.target).x += fx;
      displacements.get(edge.target).y += fy;
    });

    nodes.forEach((node) => {
      const position = positions.get(node.id);
      const displacement = displacements.get(node.id);
      const length = Math.max(1, Math.hypot(displacement.x, displacement.y));
      position.x = Math.min(width, Math.max(0, position.x + (displacement.x / length) * Math.min(length, temperature)));
      position.y = Math.min(height, Math.max(0, position.y + (displacement.y / length) * Math.min(length, temperature)));
    });

    temperature *= 0.97;
  }

  const minX = Math.min(...nodes.map(node => positions.get(node.id).x));
  const minY = Math.min(...nodes.map(node => positions.get(node.id).y));

  return nodes.map(node => ({
    ...node,
    position: {
      x: Math.round(positions.get(node.id).x - minX + NODE_WIDTH),
      y: Math.round(positions.get(node.id).y - minY + NODE_HEIGHT),
    },
  }));
};

export const buildTopologyFromRedoRoutes = (input) => {
  const parsedRoutes = parseRedoRoutesStatements(input);
  const nodeTypesByName = new Map();
  const primaryNames = new Set();

  parsedRoutes.forEach((route) => {
    nodeTypesByName.set(route.sourceName, getNodeType(route.sourceType));
    if (!nodeTypesByName.has(route.targetName)) nodeTypesByName.set(route.targetName, 'DATABASE');
    if (!nodeTypesByName.has(route.whenPrimaryName)) nodeTypesByName.set(route.whenPrimaryName, 'DATABASE');
    primaryNames.add(route.whenPrimaryName);
  });

  const currentPrimaryName = [...primaryNames][0];
  const nodeIdsByName = new Map([...nodeTypesByName.keys()].sort().map((name, index) => [name, `imported-${index + 1}`]));
  const nodes = [...nodeIdsByName.entries()].map(([name, id]) => {
    const type = nodeTypesByName.get(name);
    return {
      id,
      type: 'database',
      position: { x: 0, y: 0 },
      data: {
        dbUniqueName: name,
        type,
        ...(type === 'DATABASE' ? { role: name === currentPrimaryName ? 'PRIMARY' : 'PHYSICAL_STANDBY' } : {}),
      },
    };
  });

  const edges = parsedRoutes.map((route, index) => ({
    id: `imported-edge-${index + 1}`,
    source: nodeIdsByName.get(route.sourceName),
    target: nodeIdsByName.get(route.targetName),
    type: 'lad',
    data: {
      logXptMode: route.logXptMode,
      priority: route.priority,
      whenPrimaryNodeId: nodeIdsByName.get(route.whenPrimaryName),
      alternateToNodeId: route.alternateToName ? nodeIdsByName.get(route.alternateToName) : null,
    },
  }));

  return {
    nodes: createForceLayout(nodes, edges),
    edges,
  };
};
