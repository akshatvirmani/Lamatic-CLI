const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.lamatic');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

function saveConfig(data) {
  fs.ensureDirSync(CONFIG_DIR);
  fs.writeJsonSync(CONFIG_PATH, data, { spaces: 2 });
}

function getConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  return fs.readJsonSync(CONFIG_PATH);
}

function clearConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    fs.removeSync(CONFIG_PATH);
  }
}

module.exports = { saveConfig, getConfig, clearConfig };