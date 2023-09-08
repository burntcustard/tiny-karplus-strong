
let audioContext;

const init = () => audioContext = new AudioContext();

let feedbackGain; // decay
let delayTime; // delayTime
let width; // noiseGain ramping (?)
let delayNode;
let noiseGainNode;
let feedbackNode;
let noiseNode;

function setFeedbackGain() {
  const newValue = document.querySelector('#decay').value;
  feedbackGain = parseFloat(newValue).toFixed(3);
  document.querySelector('#decay-indicator').innerText = feedbackGain;
}

function setDelayTime() {
  const newValue = parseFloat(document.querySelector('#delay').value).toFixed(1);
  delayTime = newValue / 1000;
  document.querySelector('#delay-indicator').innerText = newValue;
  if (delayNode) delayNode.delayTime.value = delayTime;
}

function setWidth() {
  const newValue = document.querySelector('#width').value;
  width = parseFloat(newValue).toFixed(1);
  document.querySelector('#width-indicator').innerText = width;
}

setFeedbackGain();
setDelayTime();
setWidth();

document.querySelector('#decay').addEventListener('input', setFeedbackGain);
document.querySelector('#delay').addEventListener('input', setDelayTime);
document.querySelector('#width').addEventListener('input', setWidth);

document.querySelector('button').addEventListener('click', () => {
  if (!audioContext) {
    init();
  }

  const buffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);

  for (let i = 0; i < audioContext.sampleRate; i++) {
    buffer.getChannelData(0)[i] = Math.random() * 2 - 1;
  }

  delayNode = new DelayNode(audioContext, { delayTime });
  noiseGainNode = new GainNode(audioContext, { gain: 0 });
  feedbackNode = new GainNode(audioContext, { gain: feedbackGain });
  noiseNode = new AudioBufferSourceNode(audioContext, { buffer });

  noiseNode.start();
  noiseNode.connect(noiseGainNode);
  noiseGainNode.connect(audioContext.destination);
  noiseGainNode.connect(delayNode);
  delayNode.connect(feedbackNode);
  feedbackNode.connect(delayNode);
  feedbackNode.connect(audioContext.destination);

  noiseGainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  noiseGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + width / 1000);
});
