const socket = new WebSocket('ws://localhost:5555');

const instancesContainer = document.getElementById('instances');
const worklogsContainer = document.getElementById('worklogs');

function addWorklogEntry(time, id, type) {
  const worklogElement = document.createElement('div');

  const timeElement = document.createElement('div');
  timeElement.classList.add('datetime');
  timeElement.textContent = time;
  worklogElement.appendChild(timeElement);

  const infoContainer = document.createElement('div');
  infoContainer.classList.add('infoContainer');
  const serverIdElement = document.createElement('div');
  serverIdElement.textContent = `Server: ${id}`;
  infoContainer.appendChild(serverIdElement);
  const textElement = document.createElement('div');
  textElement.textContent = `INFO: ${type}`;
  infoContainer.appendChild(textElement);
  worklogElement.appendChild(infoContainer);

  worklogsContainer.appendChild(worklogElement);
}

let instances = [];

function renderInstanceActions(instance) {
  const actionsContainer = document.createElement('div');
  actionsContainer.classList.add('instanceDescriptionLine');

  const actionsLabel = document.createElement('span');
  actionsLabel.textContent = 'Actions: ';
  actionsContainer.appendChild(actionsLabel);

  const changeStateElement = document.createElement('span');
  changeStateElement.textContent = `${instance.state === 'running' ? '❚❚' : '►'}`;
  changeStateElement.addEventListener('click', () => {
    socket.send(JSON.stringify({ id: instance.id, action: instance.state === 'running' ? 'stop' : 'start' }));
  });
  actionsContainer.appendChild(changeStateElement);

  const removeInstance = document.createElement('span');
  removeInstance.textContent = ' ✖';
  removeInstance.addEventListener('click', () => {
    socket.send(JSON.stringify({ id: instance.id, action: 'remove' }));
  });
  actionsContainer.appendChild(removeInstance);

  return actionsContainer;
}

function renderInstanceId(instance) {
  const idElement = document.createElement('div');
  idElement.textContent = instance.id;
  return idElement;
}

function renderInstanceStatus(instance) {
  const statusElement = document.createElement('div');
  statusElement.classList.add('instanceDescriptionLine');
  statusElement.textContent = `Status: ${instance.state === 'running' ? '🟢' : '⚫'} ${instance.state}`;
  return statusElement;
}

function renderInstance(instance) {
  const instanceContainer = document.createElement('div');
  instanceContainer.classList.add('instance');

  const instanceElement = document.createElement('div');
  instanceElement.classList.add('instanceInner');
  instanceElement.appendChild(renderInstanceId(instance));
  instanceElement.appendChild(renderInstanceStatus(instance));
  instanceElement.appendChild(renderInstanceActions(instance));

  instanceContainer.appendChild(instanceElement);
  return instanceContainer;
}

function renderInstances() {
  instancesContainer.innerHTML = '';
  for (const instance of instances) {
    instancesContainer.appendChild(renderInstance(instance));
  }
}

socket.addEventListener('message', (msg) => {
  const data = JSON.parse(msg.data);

  const { ts, id, type } = data;

  switch (type) {
    case 'initial':
      instances = data.instances;
      renderInstances();
      break;
    case 'created':
      instances.push({ id, state: 'stopped' });
      renderInstances();
      break;
    case 'removed':
      instances = instances.filter((item) => item.id !== id);
      renderInstances();
      break;
    case 'stopped':
      instances.find((item) => item.id === id).state = 'stopped';
      renderInstances();
      break;
    case 'started':
      instances.find((item) => item.id === id).state = 'running';
      renderInstances();
      break;
    default:
      console.error('Unknown message');
      break;
  }

  if (type !== 'initial') {
    addWorklogEntry(ts, id, type);
  }
});

document.querySelector('#createInstanceButton > a').addEventListener('click', (event) => {
  event.preventDefault();
  socket.send(JSON.stringify({ action: 'create' }));
});
