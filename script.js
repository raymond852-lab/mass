// 全域變數
let currentQNumber = 1;
let score = 0;
let currentQuestion = {}; // 存放當前生成的題目

// 遊戲開始
function startGame() {
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    // 重置數據
    score = 0;
    currentQNumber = 1;
    document.getElementById('score').innerText = "0";
    
    // 產生第一題
    loadNewQuestion();
}

// 產生並載入新題目
function loadNewQuestion() {
    // 1. 更新介面上的題號
    document.getElementById('current-q').innerText = currentQNumber;
    
    // 2. 重置回饋與繪圖區
    const feedback = document.getElementById('feedback');
    feedback.className = 'feedback hidden';
    feedback.innerText = "";
    document.getElementById('options-container').innerHTML = ''; 
    const visualArea = document.getElementById('canvas-container');
    visualArea.innerHTML = ''; 

    // 3. 隨機生成題目 (30% 機率是換算題，70% 是讀秤題)
    if (Math.random() < 0.3) {
        currentQuestion = generateConvertQuestion();
        visualArea.innerHTML = '<div style="font-size: 80px; margin: 10px;">⚖️🍬</div>';
    } else {
        currentQuestion = generateScaleQuestion();
        // 呼叫 SVG 繪圖引擎
        visualArea.appendChild(drawScale(currentQuestion.val, currentQuestion.max, currentQuestion.step));
    }

    // 4. 更新題目文字
    document.getElementById('question-text').innerText = currentQuestion.text;

    // 5. 產生選項按鈕 (打亂順序)
    const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);

    shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, currentQuestion.answer, currentQuestion.hint); 
        document.getElementById('options-container').appendChild(btn);
    });
}

// 🎲 隨機產生「換算題」
function generateConvertQuestion() {
    const isKgToG = Math.random() > 0.5; // 50% 機率 kg轉g
    let qText, ans, opts, hintText;

    if (isKgToG) {
        // 產生 1~9 的整數，或者 0.5, 1.5 這類小數
        const num = Math.random() > 0.3 ? Math.floor(Math.random() * 9) + 1 : (Math.floor(Math.random() * 5) + 0.5);
        qText = `${num} kg 等於多少 g？`;
        ans = `${num * 1000}g`;
        hintText = "1 kg = 1000 g，也就是加 3 個 0！";
        
        // 產生干擾選項
        opts = [ans];
        opts.push(`${num * 100}g`);   // 少一個0
        opts.push(`${num * 10}g`);    // 少兩個0
        opts.push(`${num + 1000}g`);  // 亂加的
    } else {
        // g 轉 kg (例如 2000g, 500g, 1500g)
        const num = (Math.floor(Math.random() * 20) + 1) * 500; // 500, 1000, 1500...
        qText = `${num} g 等於多少 kg？`;
        ans = `${num / 1000}kg`;
        hintText = "g 變 kg 要除以 1000 (切掉3個0)！";
        
        opts = [ans];
        opts.push(`${num / 100}kg`);
        opts.push(`${num * 10}kg`);
        opts.push(`${num}kg`);
    }

    return {
        text: qText,
        answer: ans,
        options: [...new Set(opts)], // 確保選項不重複
        hint: hintText
    };
}

// 🎲 隨機產生「讀秤題」 (核心邏輯)
function generateScaleQuestion() {
    // 1. 隨機決定秤的最大值 (100, 200, 300, 400, 500)
    const maxVals = [100, 200, 300, 400, 500];
    const max = maxVals[Math.floor(Math.random() * maxVals.length)];

    // 2. 隨機決定刻度 (25 或 50)
    // 如果 max 是 100，我們強制用 25，不然題目太簡單
    const step = (max === 100) ? 25 : (Math.random() > 0.5 ? 25 : 50);

    // 3. 隨機決定目標值 (必須是 step 的倍數，且不超過 max)
    const totalSteps = max / step;
    // 避免出 0 或 max (太簡單)，所以從 1 到 totalSteps-1
    let randomStepIndex = Math.floor(Math.random() * (totalSteps - 1)) + 1;
    let val = randomStepIndex * step;

    // 4. 產生題目文字
    let text = "指針指在哪裡？";
    if (val === max / 2) text = "剛好在正中間！是多少？";
    else if (val % 100 === 25) text = "注意看！這是一小格 (25g)";
    else if (val > max / 2) text = `過了 ${max/2} 了，仔細看！`;

    const ans = `${val}g`;
    const hint = `每一小格代表 ${step}g，慢慢加或是用減的！`;

    // 5. 產生干擾選項 (確保不重複且合理)
    let opts = new Set();
    opts.add(ans);

    while (opts.size < 4) {
        // 隨機策略：加減刻度、加減10(混淆視聽)、或是看錯大格
        let type = Math.floor(Math.random() * 3);
        let fakeVal;

        if (type === 0) fakeVal = val + step; // 多算一格
        else if (type === 1) fakeVal = val - step; // 少算一格
        else fakeVal = val + 10; // 常見錯誤：以為一格是10

        // 確保 fakeVal 是正數且不等於正確答案
        if (fakeVal > 0 && fakeVal !== val) {
            opts.add(`${fakeVal}g`);
        }
    }

    return {
        text: text,
        val: val,
        max: max,
        step: step,
        answer: ans,
        options: Array.from(opts),
        hint: hint
    };
}

// 檢查答案
function checkAnswer(selected, correct, hintText) {
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('hidden');

    if (selected === correct) {
        score += 10;
        document.getElementById('score').innerText = score;
        feedback.innerText = "🎉 答對了！";
        feedback.className = "feedback correct";
        
        // 鎖定按鈕
        const btns = document.querySelectorAll('.option-btn');
        btns.forEach(b => b.disabled = true);

        // 1.5秒後產生下一題 (無盡模式)
        setTimeout(() => {
            currentQNumber++;
            loadNewQuestion();
        }, 1500);
    } else {
        feedback.innerText = "❌ 再試試看！\n💡 " + hintText;
        feedback.className = "feedback wrong";
        // 答錯可以選擇扣分，或是不扣分，這裡保持不扣分但要重選
    }
}

// 雖然是無盡模式，但我們可以保留一個手動結束的功能 (可選)
// 這裡保留原有的 showResult 結構，防止報錯，但遊戲邏輯不會主動呼叫它
function showResult() {
    alert(`遊戲結束！你一共答對了 ${currentQNumber} 題，獲得 ${score} 分！`);
    location.reload();
}

// 🎨 SVG 畫秤引擎 (保持修正後的正確版本)
function drawScale(value, maxVal, step) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 200 160"); 
    
    const cx = 100; 
    const cy = 130; 
    const r = 100;  

    // 外框 (180度 -> 360度)
    const arc = document.createElementNS(svgNS, "path");
    arc.setAttribute("d", "M 10 130 A 90 90 0 0 1 190 130");
    arc.setAttribute("fill", "none");
    arc.setAttribute("stroke", "#4D96FF");
    arc.setAttribute("stroke-width", "5");
    arc.setAttribute("stroke-linecap", "round");
    svg.appendChild(arc);

    // 刻度
    for (let i = 0; i <= maxVal; i += step) {
        const percent = i / maxVal;
        const angleDeg = 180 + (percent * 180);
        const angleRad = (angleDeg * Math.PI) / 180;

        const isMajor = (i % 100 === 0);
        const tickLen = isMajor ? 15 : 8; 
        const color = isMajor ? "#FF6B6B" : "#888"; 
        const width = isMajor ? 3 : 1;

        const x1 = cx + (r - 15) * Math.cos(angleRad);
        const y1 = cy + (r - 15) * Math.sin(angleRad);
        const x2 = cx + (r - 15 - tickLen) * Math.cos(angleRad);
        const y2 = cy + (r - 15 - tickLen) * Math.sin(angleRad);

        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", width);
        svg.appendChild(line);

        if (isMajor) {
            const tx = cx + (r - 40) * Math.cos(angleRad);
            const ty = cy + (r - 40) * Math.sin(angleRad);
            
            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", tx);
            text.setAttribute("y", ty);
            text.setAttribute("text-anchor", "middle"); 
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("fill", "#333");
            text.setAttribute("font-size", "14");
            text.setAttribute("font-weight", "bold");
            text.textContent = i;
            svg.appendChild(text);
        }
    }

    // 指針
    const targetPercent = value / maxVal;
    const targetAngle = 180 + (targetPercent * 180); 

    const needleGroup = document.createElementNS(svgNS, "g");
    needleGroup.setAttribute("transform", `rotate(${targetAngle}, 100, 130)`);

    const needle = document.createElementNS(svgNS, "path");
    needle.setAttribute("d", "M 100 126 L 180 130 L 100 134 Z");
    needle.setAttribute("fill", "#FF4757");
    needleGroup.appendChild(needle);

    const centerDot = document.createElementNS(svgNS, "circle");
    centerDot.setAttribute("cx", 100);
    centerDot.setAttribute("cy", 130);
    centerDot.setAttribute("r", 6);
    centerDot.setAttribute("fill", "#333");
    needleGroup.appendChild(centerDot);

    svg.appendChild(needleGroup);

    // 單位 g
    const unitText = document.createElementNS(svgNS, "text");
    unitText.setAttribute("x", 100);
    unitText.setAttribute("y", 100);
    unitText.setAttribute("text-anchor", "middle");
    unitText.setAttribute("fill", "#89CFF0");
    unitText.setAttribute("font-size", "24");
    unitText.setAttribute("font-weight", "bold");
    unitText.textContent = "g";
    svg.appendChild(unitText);

    return svg;
}
