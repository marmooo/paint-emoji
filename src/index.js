import { toPixelData } from "https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm";

const courseNode = document.getElementById("course");
let audioContext;
const audioBufferCache = {};
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function createAudioContext() {
  if (globalThis.AudioContext) {
    return new globalThis.AudioContext();
  } else {
    console.error("Web Audio API is not supported in this browser");
    return null;
  }
}

function unlockAudio() {
  if (audioContext) {
    audioContext.resume();
  } else {
    audioContext = createAudioContext();
    loadAudio("modified", "/paint-emoji/mp3/decision50.mp3");
    loadAudio("correctAll", "/paint-emoji/mp3/correct1.mp3");
  }
  document.removeEventListener("pointerdown", unlockAudio);
  document.removeEventListener("keydown", unlockAudio);
}

async function loadAudio(name, url) {
  if (!audioContext) return;
  if (audioBufferCache[name]) return audioBufferCache[name];
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBufferCache[name] = audioBuffer;
    return audioBuffer;
  } catch (error) {
    console.error(`Loading audio ${name} error:`, error);
    throw error;
  }
}

function playAudio(name, volume) {
  if (!audioContext) return;
  const audioBuffer = audioBufferCache[name];
  if (!audioBuffer) {
    console.error(`Audio ${name} is not found in cache`);
    return;
  }
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  const gainNode = audioContext.createGain();
  if (volume) gainNode.gain.value = volume;
  gainNode.connect(audioContext.destination);
  sourceNode.connect(gainNode);
  sourceNode.start();
}

function changeLang() {
  const langObj = document.getElementById("lang");
  const lang = langObj.options[langObj.selectedIndex].value;
  location.href = `/paint-emoji/${lang}/`;
}

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => {
    return characters[Math.floor(Math.random() * characters.length)];
  }).join("");
}

function uniqIds(svg) {
  const ids = {};
  [...svg.querySelectorAll("[id]")].forEach((node) => {
    const id = node.getAttribute("id");
    const newId = `id_${generateRandomString(64)}`;
    node.setAttribute("id", newId);
    ids[id] = newId;
  });
  [...svg.getElementsByTagName("*")].forEach((node) => {
    for (const attr of node.attributes) {
      if (attr.value.startsWith("url(#")) {
        const id = attr.value.slice(5, -1);
        const newId = ids[id];
        if (newId) {
          attr.value = `url(#${newId})`;
        } else {
          console.log("uniqIds error");
        }
      }
    }
  });
}

function removeUseTags(svg) {
  const uses = [...svg.getElementsByTagName("use")];
  for (const use of uses) {
    let id = use.getAttributeNS(xlinkNamespace, "href").slice(1);
    if (!id) id = use.getAttribute("href").slice(1); // SVG 2
    if (!id) continue;
    const g = svg.getElementById(id).cloneNode(true);
    for (const attribute of use.attributes) {
      if (attribute.localName == "href") continue;
      g.setAttribute(attribute.name, attribute.value);
    }
    g.removeAttribute("id");
    use.replaceWith(g);
  }
}

// https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units
function lengthToPixel(str) {
  const x = parseFloat(str);
  switch (str.slice(0, -2)) {
    case "cm":
      return x / 96 * 2.54;
    case "mm":
      return x / 96 * 254;
    case "in":
      return x / 96;
    case "pc":
      return x * 16;
    case "pt":
      return x / 96 * 72;
    case "px":
      return x;
    default:
      return x;
  }
}

function getViewBox(svg) {
  const viewBox = svg.getAttribute("viewBox");
  if (viewBox) {
    return viewBox.split(" ").map(Number);
  } else {
    const width = lengthToPixel(svg.getAttribute("width"));
    const height = lengthToPixel(svg.getAttribute("height"));
    return [0, 0, width, height];
  }
}

function setViewBox(svg) {
  const viewBox = getViewBox(svg);
  svg.setAttribute("viewBox", viewBox.join(" "));
}

async function fetchIconList(course) {
  const response = await fetch(`/paint-emoji/data/${course}.txt`);
  const text = await response.text();
  return text.trimEnd().split("\n");
}

async function fetchIcon(url) {
  const response = await fetch(url);
  const svg = await response.text();
  return new DOMParser().parseFromString(svg, "image/svg+xml");
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg
const presentationAttributes = new Set([
  "alignment-baseline",
  "baseline-shift",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "cursor",
  // "d",
  "direction",
  "display",
  "dominant-baseline",
  "enable-background",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flood-color",
  "flood-opacity",
  "font-family",
  "font-size",
  "font-size-adjust",
  "font-stretch",
  "font-style",
  "font-variant",
  "font-weight",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "image-rendering",
  "kerning",
  "letter-spacing",
  "lighting-color",
  "marker-end",
  "marker-mid",
  "marker-start",
  "mask",
  "opacity",
  "overflow",
  "pointer-events",
  "shape-rendering",
  "solid-color",
  "solid-opacity",
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "text-anchor",
  "text-decoration",
  "text-rendering",
  "transform",
  "unicode-bidi",
  "vector-effect",
  "visibility",
  "word-spacing",
  "writing-mode",
]);

function removeSvgTagAttributes(svg) {
  const candidates = [];
  [...svg.attributes].forEach((attribute) => {
    if (presentationAttributes.has(attribute.name)) {
      candidates.push(attribute);
      svg.removeAttribute(attribute.name);
    }
  });
  if (candidates.length > 0) {
    const g = document.createElementNS(svgNamespace, "g");
    candidates.forEach((attribute) => {
      g.setAttribute(attribute.name, attribute.value);
    });
    [...svg.children].forEach((node) => {
      g.appendChild(node);
    });
    svg.appendChild(g);
  }
}

function styleAttributeToAttributes(svg) {
  [...svg.querySelectorAll("[style]")].forEach((node) => {
    node.getAttribute("style").split(";").forEach((style) => {
      const [property, value] = style.split(":").map((str) => str.trim());
      if (presentationAttributes.has(property)) {
        node.setAttribute(property, value);
        node.style.removeProperty(property);
      }
    });
  });
}

function initColor(svg, pieces) {
  const viewBox = getViewBox(svg);
  const strokeWidth = viewBox[3] / svg.clientWidth;
  for (const node of svg.querySelectorAll(pieceSelector)) {
    if (pieces.includes(node)) {
      const style = node.style;
      node.dataset.stroke = style.stroke;
      node.dataset.strokeWidth = style.strokeWidth;
      style.fill = "Canvas";
      style.stroke = "currentColor";
      style.strokeWidth = strokeWidth;
      style.cursor = "pointer";
      node.onclick = () => {
        style.fill = selectedColorNode.style.backgroundColor;
        style.stroke = node.dataset.stroke;
        style.strokeWidth = node.dataset.strokeWidth;
        scoring(svg);
      };
    } else {
      node.style.cursor = "pointer";
      node.onclick = (event) => {
        const target = document.elementsFromPoint(event.clientX, event.clientY);
        const path = target.find((node) => pieces.includes(node));
        const style = path.style;
        style.fill = selectedColorNode.style.backgroundColor;
        style.stroke = path.dataset.stroke;
        style.strokeWidth = path.dataset.strokeWidth;
        scoring(svg);
      };
    }
  }
}

function shuffle(array) {
  for (let i = array.length; 1 < i; i--) {
    const k = Math.floor(Math.random() * i);
    [array[k], array[i - 1]] = [array[i - 1], array[k]];
  }
  return array;
}

function getPieces() {
  const pieces = [];
  const svgRect = svg.getBoundingClientRect();
  const areaThreshold = svgRect.width * svgRect.height * areaRatio;
  for (const path of svg.querySelectorAll(pieceSelector)) {
    resetCurrentColor(path);
    const pathRect = path.getBoundingClientRect();
    const area = pathRect.width * pathRect.height;
    if (area < areaThreshold) continue;
    const fill = path.getAttribute("fill");
    if (!fill) continue;
    if (fill == "none") continue; // TODO: fill=none, stroke=red
    if (fill.startsWith("url(#")) continue;
    pieces.push(path);
  }
  return pieces;
}

function setColorPanel(pieces) {
  const colorPanel = document.getElementById("colorPanel");
  colorPanel.replaceChildren();
  const colors = [];
  pieces.forEach((path) => {
    const colorOrId = path.getAttribute("fill");
    if (!colorOrId) {
      colors.push("black");
    } else {
      colors.push(colorOrId);
    }
  });
  const uniqueColors = [...new Set(colors)];
  const initialPos = Math.floor(uniqueColors.length / 2);
  shuffle(uniqueColors).forEach((color, i) => {
    const button = document.createElement("button");
    if (i == initialPos) {
      button.style.width = "96px";
      button.style.height = "96px";
      selectedColorNode = button;
    } else {
      button.style.width = "64px";
      button.style.height = "64px";
    }
    button.type = "button";
    button.style.backgroundColor = color;
    button.setAttribute("class", "border border-5 rounded-circle");
    button.onclick = () => {
      selectedColorNode.style.width = "64px";
      selectedColorNode.style.height = "64px";
      button.style.width = "96px";
      button.style.height = "96px";
      selectedColorNode = button;
    };
    colorPanel.appendChild(button);
  });
}

function computeAttribute(node, attributeName) {
  let attributeValue;
  while (!attributeValue && node && node.tagName) {
    attributeValue = node.getAttribute(attributeName);
    node = node.parentNode;
  }
  return attributeValue;
}

function resetCurrentColor(node) {
  const fill = computeAttribute(node, "fill");
  const stroke = computeAttribute(node, "stroke");
  node.setAttribute("fill", fill);
  node.setAttribute("stroke", stroke);
}

async function nextProblem() {
  maxScore = clearScore;
  document.getElementById("score").textContent = 0;
  const courseNode = document.getElementById("course");
  const course = courseNode.options[courseNode.selectedIndex].value;
  if (iconList.length == 0) {
    iconList = await fetchIconList(course);
  }
  const filePath = iconList[getRandomInt(0, iconList.length)];
  const url = `/svg/${course}/${filePath}`;
  const icon = await fetchIcon(url);
  svg = icon.documentElement;
  styleAttributeToAttributes(svg);
  const tehon = svg.cloneNode(true);

  removeSvgTagAttributes(svg);
  removeUseTags(svg);
  uniqIds(svg);

  const targets = document.querySelectorAll("#problems .iconContainer");
  targets[0].replaceChildren(tehon);
  targets[1].replaceChildren(svg);

  const pieces = getPieces(svg);
  setColorPanel(pieces);

  tehon.style.width = "100%";
  tehon.style.height = "100%";
  svg.style.width = "100%";
  svg.style.height = "100%";
  setViewBox(svg);
  tehon.setAttribute("viewBox", svg.getAttribute("viewBox"));
  initColor(svg, pieces);
  tehonPixels = await toPixelData(tehon, htmlToImageOptions);
}

async function changeCourse() {
  const course = courseNode.options[courseNode.selectedIndex].value;
  iconList = await fetchIconList(course);
  selectAttribution(courseNode.selectedIndex);
  nextProblem();
}

function selectRandomCourse() {
  const index = getRandomInt(0, courseNode.options.length);
  courseNode.options[index].selected = true;
  selectAttribution(index);
}

function selectAttribution(index) {
  const divs = [...document.getElementById("attribution").children];
  divs.forEach((div, i) => {
    if (i == index) {
      div.classList.remove("d-none");
    } else {
      div.classList.add("d-none");
    }
  });
}

async function scoring(svg) {
  const pixels = await toPixelData(svg, htmlToImageOptions);
  let correctCount = 0;
  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i] == tehonPixels[i]) correctCount += 1;
  }
  const score = Math.round(correctCount / pixels.length * 100);
  if (maxScore < score) {
    maxScore = score;
    playAudio("correctAll");
  } else {
    playAudio("modified");
  }
  document.getElementById("score").textContent = score;
}

document.getElementById("gamePanel")
  .appendChild(document.getElementById("gamePanelTemplate").content);

const svgNamespace = "http://www.w3.org/2000/svg";
const xlinkNamespace = "http://www.w3.org/1999/xlink";
const pieceSelector =
  "rect, circle, ellipse, line, polyline, polygon, path, text";
const clearScore = 85;
const areaRatio = 0.05;
const htmlToImageOptions = { width: 256, height: 256 };
let svg;
let iconList = [];
let selectedColorNode;
let tehonPixels;
let maxScore = clearScore;

selectRandomCourse();
nextProblem();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("lang").onchange = changeLang;
document.getElementById("startButton").onclick = nextProblem;
courseNode.onclick = changeCourse;
document.addEventListener("pointerdown", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });
