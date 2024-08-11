const contents = Array.from(document.getElementById("contents").children);
const sections = document.querySelectorAll(".section");
const sectionNames = Array.from(sections).map(section => section.id);

async function changeDisplay(element, isDisplay) {
  const style = element.style;

  const seconds = getComputedStyle(element).transitionDuration;
  const duration = parseFloat(seconds.slice(0, -1)) * 1000;

  if (isDisplay) {
    style.display = "block";
    element.animate([{opacity: 0}, {opacity: 1}], duration);

  } else {
    await element.animate([{opacity: 1}, {opacity: 0}], duration).finished;
    style.display = "none";
  }
}

contents.forEach((content, c) => {
  content.addEventListener("click", () => {
    const [currentHash, newHash] = [location.hash, `#${sectionNames[c]}`];
    if (currentHash == newHash) return;

    sections.forEach((section, s) => {
      changeDisplay(section, c == s);
    });

    location.hash = newHash;
  });
});

const hash = location.hash.slice(1);
let contentIndex = hash ? sectionNames.indexOf(hash) : 0;
if (contentIndex == -1) contentIndex = 2;
changeDisplay(sections[contentIndex], true);

const tabContents = document.querySelectorAll(".tabContent");
const tabs = document.querySelectorAll(".tab");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const id = tab.id.slice(0, -3);
    const selectedIndex = (id == "list") ? 0 : 1;
    const otherIndex = (selectedIndex + 1) % 2;

    changeDisplay(tabContents[selectedIndex], true);
    changeDisplay(tabContents[otherIndex], false);

    tab.style.backgroundColor = "#dfdfdf";
    tabs[otherIndex].style.backgroundColor = "";
  });
});

tabs[0].click();

document.getElementById("toTop").addEventListener("click", () => {
  window.scrollTo({ top: 0 });
});

const difTexts = ["☆☆☆☆☆", "★☆☆☆☆", "★★☆☆☆", "★★★☆☆", "★★★★☆", "★★★★★", "⭐️⭐️⭐️⭐️⭐️⭐️", "🌟🌟🌟🌟🌟🌟🌟", "🔥🔥🔥🔥🔥🔥🔥🔥"];

(async () => {
  const parser = new DOMParser();
  const [listContent, mediaContent] = tabContents;

  for await (const [i, q] of qList.entries()) {
    const container = document.createElement("div");
    container.id = `q${q.no}`;
    container.className = "qContainer";
    listContent.appendChild(container);

    if (i % 3 == 0) {
      const mediaRow = document.createElement("div");
      mediaRow.className = "mediaRow";
      mediaContent.append(mediaRow);
    }

    const url = `https://publish.twitter.com/oembed?url=https://twitter.com/mariomaQ_OA/status/${q.link}&omit_script=true&hide_thread=true`;

    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
    const result = await res.text();
    const doc = JSON.parse(result).html;

    const dom = parser.parseFromString(doc, "text/html");
    const docElement = dom.documentElement;
    const block = docElement.children[1].firstChild;

    const date = block.lastChild.textContent;
    const text = block.firstChild;

    let [title, problem] = ["", ""];
    let isProblem = false;

    for (let node of Array.from(text.childNodes)) {
      const textContent = node.textContent;
      if (textContent == "") continue;

      const preTitle = textContent.match(/〈.+〉/u) || [];
      if (preTitle.length) {
        title = preTitle[0].slice(2).slice(0, -2);
        isProblem = true;
        continue;
      }

      if (textContent[0] == "難") {
        break;

      } else if (isProblem) {
        problem += textContent;
        continue;
      }
    }

    problem = `${(problem[0] == "Q") ? "" : "Q. "}${problem}`;

    const noElm = document.createElement("span");
    const titleElm = document.createElement("a");
    const difElm = document.createElement("span");
    const makerElm = document.createElement("span");
    const makerIdElm = document.createElement("a");
    const problemElm = document.createElement("span");

    noElm.className = "qNo";
    titleElm.className = "qTitle";
    difElm.className = "qDif";
    makerElm.className = "qMaker";
    makerIdElm.className = "qMakerId";
    problemElm.className = "qProblem";

    noElm.textContent = `No. ${q.no}`;
    titleElm.text = `〈 ${title} 〉`;
    titleElm.href = `https://twitter.com/mariomaQ_OA/status/${q.link}`;

    difElm.textContent = `難易度: ${difTexts[q.dif]}`;

    const maker = makerNames[q.maker];
    makerIdElm.text = `@${maker[0]}`;
    makerIdElm.href = `https://twitter.com/i/user/${q.maker}`;
    makerElm.append(`${maker[1]} (`, makerIdElm, ")");

    problemElm.textContent = problem;

    container.append(noElm, titleElm, difElm, problemElm);

    const imgSrc = `https://pbs.twimg.com/media/${q.imgId}?format=jpg&name=orig`;
    const img = document.createElement("img");
    img.className = "qImage";
    img.src = imgSrc;

    container.append(img, makerElm);

    const mediaContainer = document.createElement("div");
    mediaContainer.className = "mediaContainer";
    mediaContent.lastChild.appendChild(mediaContainer);

    const mediaNo = document.createElement("span");
    mediaNo.className = "mediaNo";
    mediaNo.textContent = q.no;

    const mediaImg = document.createElement("img");
    mediaImg.className = "mediaImage";
    mediaImg.src = imgSrc;

    mediaImg.addEventListener("click", () => {
      tabs[0].click();
      location.hash = `#${container.id}`;
    });

    mediaContainer.append(mediaNo, mediaImg);
  }
})();
