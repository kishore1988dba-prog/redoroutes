export const getVisibleEdges = (edges, currentPrimary, nodes = []) => {
  const nodesById = Object.fromEntries(nodes.map(node => [node.id, node]));
  const filtered = edges.filter(e => e.data.whenPrimaryNodeId === currentPrimary?.id);
  const targetMinPriorities = {};

  filtered.forEach(edge => {
    if (!targetMinPriorities[edge.target]) {
      targetMinPriorities[edge.target] = edge.data.priority;
    } else {
      targetMinPriorities[edge.target] = Math.min(targetMinPriorities[edge.target], edge.data.priority);
    }
  });

  return filtered.map(edge => ({
    ...edge,
    data: {
      ...edge.data,
      isEffective: edge.data.priority === targetMinPriorities[edge.target],
      whenPrimaryName: nodesById[edge.data.whenPrimaryNodeId]?.data.dbUniqueName,
      targetDbUniqueName: nodesById[edge.target]?.data.dbUniqueName,
    },
  }));
};

export const findLoopNodes = (edgesList) => {
  const adj = {};
  edgesList.forEach(e => {
    if (!adj[e.source]) adj[e.source] = [];
    adj[e.source].push(e.target);
  });

  const visited = new Set();
  const recStack = new Set();
  const loopNodes = new Set();

  const dfs = (node) => {
    if (recStack.has(node)) {
      recStack.forEach(n => loopNodes.add(n));
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    recStack.add(node);
    (adj[node] || []).forEach(next => dfs(next));
    recStack.delete(node);
  };

  Object.keys(adj).forEach(start => dfs(start));
  return loopNodes;
};

const receivesAsAlternate = (nodeId, visibleEdges, primaryNodeId) => {
  if (nodeId === primaryNodeId) return false;
  const incoming = visibleEdges.filter(e => e.target === nodeId && e.data.isEffective);
  return incoming.length > 0 && incoming.every((edge) => {
    if (!edge.data.alternateToNodeId) return false;

    const alternateToEdge = visibleEdges.find(e => (
      e.source === edge.source
      && e.target === edge.data.alternateToNodeId
      && e.data.whenPrimaryNodeId === edge.data.whenPrimaryNodeId
      && e.data.priority < edge.data.priority
    ));

    return Boolean(alternateToEdge);
  });
};

const getSourceActivationTiers = (sourceId, visibleEdges, primaryNodeId) => {
  if (sourceId === primaryNodeId) return ['PRIMARY'];

  const incoming = visibleEdges.filter(e => e.target === sourceId && e.data.isEffective);
  if (incoming.length === 0) return [`UNFED:${sourceId}`];

  return incoming.map(e => `PRIORITY:${e.data.priority}`);
};

const hasConcurrentIncomingSources = (incoming, visibleEdges, primaryNodeId) => {
  const sourceTiers = incoming.map(edge => getSourceActivationTiers(edge.source, visibleEdges, primaryNodeId));

  for (let i = 0; i < sourceTiers.length; i += 1) {
    for (let j = i + 1; j < sourceTiers.length; j += 1) {
      if (sourceTiers[i].includes('PRIMARY') || sourceTiers[j].includes('PRIMARY')) return true;
      if (sourceTiers[i].some(tier => sourceTiers[j].includes(tier))) return true;
    }
  }

  return false;
};

export const addTopologyWarnings = (nodes, visibleEdges) => {
  const loopNodeIds = findLoopNodes(visibleEdges);
  const primaryNode = nodes.find(n => n.data.role === 'PRIMARY');
  const syncCount = visibleEdges.filter(e => e.source === primaryNode?.id && e.data.logXptMode !== 'ASYNC').length;
  const destCount = visibleEdges.filter(e => e.source === primaryNode?.id).length;

  return nodes.map(node => {
    const incoming = visibleEdges.filter(e => e.target === node.id);
    const effectiveIncoming = incoming.filter(e => e.data.isEffective);
    let warning = '';

    if (node.data.role === 'PHYSICAL_STANDBY' || node.data.type === 'FAR_SYNC' || node.data.type === 'RECOVERY_APPLIANCE') {
      if (effectiveIncoming.length === 0) {
        warning = 'does not receive redo';
      } else if (effectiveIncoming.length === 1 && receivesAsAlternate(effectiveIncoming[0].source, visibleEdges, primaryNode?.id)) {
        warning = 'may not receive redo if source is alternate';
      } else if (hasConcurrentIncomingSources(effectiveIncoming, visibleEdges, primaryNode?.id)) {
        warning = 'cannot receive from multiple sources';
      }
    }

    if (loopNodeIds.has(node.id)) {
      warning = warning ? `${warning}; loop detected` : 'loop detected';
    }

    if (node.id === primaryNode?.id && syncCount > 10) {
      warning = warning ? `${warning}; only 10 non-ASYNC destinations are possible` : 'only 10 non-ASYNC destinations are possible';
    }

    if (node.id === primaryNode?.id && destCount > 30) {
      warning = warning ? `${warning}; max 30 direct destinations` : 'max 30 direct destinations';
    }

    return { ...node, data: { ...node.data, warning } };
  });
};
