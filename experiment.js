// ---- 全局变量 ----
let groupNames = [];
let currentGroupIndex = 0;
let currentWordIndex = 0;
let results = [];
let startTime;
let inInstruction = true;
let subjectID = "";

// ---- 获取 DOM 元素 ----
const subjectInputDiv = document.getElementById("subjectInput");
const instructionDiv = document.getElementById("instruction");
const wordDiv = document.getElementById("word");
const feedbackDiv = document.getElementById("feedback");
const downloadBtn = document.getElementById("downloadBtn");

// ---- 工具函数：打乱数组 ----
function shuffleArray(array) {
  const arr = array.slice(); // 拷贝
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---- 开始实验按钮 ----
document.getElementById("startBtn").addEventListener("click", () => {
  const idInput = document.getElementById("subjectID").value.trim();
  if (idInput === "") {
    alert("Si prega di inserire il numero！");
    return;
  }
  subjectID = idInput;

  // 随机排列类别
  groupNames = shuffleArray(Object.keys(wordGroups));
  currentGroupIndex = 0;
  currentWordIndex = 0;
  results = [];

  // 随机排列每个类别内部的单词
  for (let group in wordGroups) {
    wordGroups[group] = shuffleArray(wordGroups[group]);
  }

  // 显示实验区域
  subjectInputDiv.style.display = "none";
  instructionDiv.style.display = "block";
  wordDiv.style.display = "block";
  feedbackDiv.style.display = "block";

  showInstruction();
});

// ---- 显示组指导语 ----
function showInstruction() {
  const groupName = groupNames[currentGroupIndex];
  instructionDiv.innerHTML = `successivamente vedrai i nomi di <span style="color:red;">${groupName}</span>, Premere la barra spaziatrice per continuare`;
  wordDiv.textContent = "";
  feedbackDiv.textContent = "";
  inInstruction = true;
}


// ---- 显示下一个单词 ----
function showNextWord() {
  const groupName = groupNames[currentGroupIndex];
  const words = wordGroups[groupName];

  if (currentWordIndex >= words.length) {
    currentGroupIndex++;
    currentWordIndex = 0;
    if (currentGroupIndex >= groupNames.length) {
      endExperiment();
      return;
    } else {
      showInstruction();
      return;
    }
  }

  // 空屏 500ms
  wordDiv.textContent = "";
  instructionDiv.textContent = "";
  feedbackDiv.textContent = "";
  setTimeout(() => {
    const word = words[currentWordIndex];
    wordDiv.textContent = word;
    startTime = performance.now();
  }, 500);
}

// ---- 键盘监听 ----
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (inInstruction) {
    if (key === " ") {
      inInstruction = false;
      showNextWord();
    }
    return;
  }

  const groupName = groupNames[currentGroupIndex];
  const words = wordGroups[groupName];
  const word = words[currentWordIndex];
  if (!wordDiv.textContent) return;

  // 判断正确规则：首字母大写按空格，小写按 b
  const isUpper = word[0] === word[0].toUpperCase();
  let correct = false;
  if ((isUpper && key === " ") || (!isUpper && key === "b")) correct = true;

  const rt = performance.now() - startTime;
  results.push({ subjectID, group: groupName, word, key, correct, rt });

  currentWordIndex++;
  showNextWord();
});

// ---- 实验结束 ----
function endExperiment() {
  wordDiv.textContent = "Esperimento terminato";
  instructionDiv.textContent = "";
  const correctCount = results.filter(r => r.correct).length;
  feedbackDiv.textContent = `tasso di precisione: ${Math.round(correctCount / results.length * 100)}%`;

  downloadBtn.style.display = "inline-block";
  downloadBtn.addEventListener("click", downloadCSV);
}

// ---- 下载 CSV ----
function downloadCSV() {
  let csv = "subjectID,group,word,key,correct,rt\n";
  results.forEach(r => {
    csv += `${r.subjectID},${r.group},${r.word},${r.key},${r.correct},${r.rt.toFixed(2)}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  // 用 subjectID 来生成文件名
  const fileName = `${subjectID}_experiment_result.csv`;
  a.download = fileName;

  a.click();
  URL.revokeObjectURL(url);
}
