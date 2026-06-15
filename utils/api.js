const axios = require('axios');
const { getConfig } = require('./config');

const BASE_URL = 'https://enterprise-api.edge.lamatic.tech/v1';

function getHeaders() {
  const config = getConfig();
  if (!config || !config.apiKey) {
    throw new Error('Not authenticated.');
  }
  return {
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };
}

function getOrgId() {
  const config = getConfig();
  if (!config?.orgId) throw new Error('Org ID not found. Run `lamatic auth login` first.');
  return config.orgId;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

async function createProject({ orgId, name, region, userId }) {
  if (!orgId) throw new Error('Organization ID is required.');
  const res = await axios.post(
    `${BASE_URL}/organizations/${orgId}/project/create`,
    { name, region, userId },
    { headers: getHeaders() }
  );
  return res.data;
}

async function getProject({ orgId, projectId }) {
  const res = await axios.get(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}`,
    { headers: getHeaders() }
  );
  return res.data;
}

async function listProjects() {
  const orgId = getOrgId();
  const res = await axios.get(
    `${BASE_URL}/organizations/${orgId}/projects`,
    { headers: getHeaders() }
  );
  return res.data;
}

async function updateProject({ orgId, projectId, name }) {
  const res = await axios.put(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/update`,
    { name },
    { headers: getHeaders() }
  );
  return res.data;
}

async function deleteProject({ orgId, projectId, userId }) {
  const res = await axios.delete(
    `${BASE_URL}/organizations/${orgId}/project/delete`,
    { headers: getHeaders(), data: { projectId, userId } }
  );
  return res.data;
}

async function triggerDeployment({ orgId, projectId, name, description, userId }) {
  const res = await axios.post(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/deployments/trigger`,
    { name: name || 'Deployment', description: description || 'Triggered from Lamatic CLI', userId },
    { headers: getHeaders() }
  );
  return res.data;
}

// ─── Flows ────────────────────────────────────────────────────────────────────

async function createFlow({ orgId, projectId, name }) {
  const res = await axios.post(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/flows/create`,
    {
      name,
      nodes: [
        {
          id: 'triggerNode_1',
          data: {
            nodeId: 'apiNode',
            values: { id: 'triggerNode_1', nodeName: 'API Trigger' },
            trigger: true,
          },
          type: 'triggerNode',
          position: { x: 225, y: 0 },
          measured: { width: 216, height: 93 },
        },
      ],
      edges: [],
    },
    { headers: getHeaders() }
  );
  return res.data;
}

async function getFlows({ orgId, projectId }) {
  const res = await axios.get(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/flows`,
    { headers: getHeaders() }
  );
  return res.data;
}

async function getFlowDetail({ orgId, projectId, flowId }) {
  const res = await axios.get(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/flows/${flowId}`,
    { headers: getHeaders() }
  );
  return res.data;
}

async function deleteFlow({ orgId, projectId, flowId }) {
  const res = await axios.delete(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/flows/delete`,
    { headers: getHeaders(), data: { flowId } }
  );
  return res.data;
}

async function renameFlow({ orgId, projectId, flowId, name }) {
  const res = await axios.post(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/flows/rename`,
    { flowId, name },
    { headers: getHeaders() }
  );
  return res.data;
}

async function updateFlowStatus({ orgId, projectId, flowId, status }) {
  const res = await axios.put(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/flows/update-status`,
    { flowId, status },
    { headers: getHeaders() }
  );
  return res.data;
}

// ─── Deployments ──────────────────────────────────────────────────────────────

async function listDeployments({ orgId, projectId }) {
  const res = await axios.get(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/deployments`,
    { headers: getHeaders() }
  );
  return res.data;
}

async function getDeployment({ orgId, projectId, deploymentId }) {
  const res = await axios.get(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/deployments/${deploymentId}`,
    { headers: getHeaders() }
  );
  return res.data;
}

// ─── Contexts ─────────────────────────────────────────────────────────────────

async function listContexts({ orgId, projectId }) {
  const res = await axios.get(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/context`,
    { headers: getHeaders() }
  );
  return res.data;
}

async function createContext({ orgId, projectId, name, type }) {
  const res = await axios.post(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/context/create`,
    { name, type },
    { headers: getHeaders() }
  );
  return res.data;
}

async function deleteContext({ orgId, projectId, contextId }) {
  const res = await axios.delete(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/context/${contextId}`,
    { headers: getHeaders() }
  );
  return res.data;
}

// ─── Models ───────────────────────────────────────────────────────────────────

async function listModelCreds({ orgId, projectId }) {
  const res = await axios.get(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/models`,
    { headers: getHeaders() }
  );
  return res.data;
}

async function createModelCreds({ orgId, projectId, name, provider, credentials }) {
  const res = await axios.post(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/models/create`,
    { name, provider, credentials },
    { headers: getHeaders() }
  );
  return res.data;
}

// ─── Integrations ─────────────────────────────────────────────────────────────

async function listIntegrations({ orgId, projectId }) {
  const res = await axios.get(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/integrations`,
    { headers: getHeaders() }
  );
  return res.data;
}

async function listSupportedIntegrations({ orgId, projectId }) {
  const res = await axios.get(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/integrations/supported`,
    { headers: getHeaders() }
  );
  return res.data;
}

async function createIntegration({ orgId, projectId, name, integration, credentials }) {
  const res = await axios.post(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/integrations/create`,
    { name, integration, credentials },
    { headers: getHeaders() }
  );
  return res.data;
}

module.exports = {
  createProject, getProject, listProjects, updateProject, deleteProject, triggerDeployment,
  createFlow, getFlows, getFlowDetail, deleteFlow, renameFlow, updateFlowStatus,
  listDeployments, getDeployment,
  listContexts, createContext, deleteContext,
  listModelCreds, createModelCreds,
  listIntegrations, listSupportedIntegrations, createIntegration,
};