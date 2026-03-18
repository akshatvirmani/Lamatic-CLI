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


async function createProject({ orgId, name, region, userId }) {
  if (!orgId) throw new Error('Organization ID is required. Use --org-id or set it during auth login.');

  const res = await axios.post(
    `${BASE_URL}/organizations/${orgId}/project/create`,
    { name, region, userId },
    { headers: getHeaders() }
  );

  return res.data;
}

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
            values: {
              id: 'triggerNode_1',
              nodeName: 'API Trigger',
            },
            trigger: true,
          },
          type: 'triggerNode',
          position: {
            x: 225,
            y: 0,
          },
          measured: {
            width: 216,
            height: 93,
          },
        },
      ],
      edges: [],
    },
    { headers: getHeaders() }
  );
  return res.data;
}

async function triggerDeployment({ orgId, projectId, name, description, userId }) {
  const res = await axios.post(
    `${BASE_URL}/organizations/${orgId}/project/${projectId}/deployments/trigger`,
    {
      name: name || 'Deployment',
      description: description || 'Triggered from Lamatic CLI',
      userId: userId,
    },
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

module.exports = { createProject, createFlow, triggerDeployment, getProject, getFlows, getFlowDetail };



