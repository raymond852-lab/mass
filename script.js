// 設定一回合有幾題
const MAX_QUESTIONS = 10;

// 全域變數
let currentQNumber = 1;
let score = 0;
let currentQuestion = {}; 

// 遊戲開始
function startGame() {
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('result-screen').classList.remove('active');
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
    // 檢查是否到達終點 (例如第 11 題)
    if (currentQNumber > MAX_QUESTIONS) {
        showResult();
        return;
    }

    // 更新介面上的題號 (顯示 1 / 10)
    document.getElementById('current-q').innerText = `${currentQNumber} / ${MAX_QUESTIONS}`;
    
    // 重置回饋與繪圖區
    const feedback = document.getElementById('feedback');
    feedback.className = 'feedback hidden';
    feedback.innerText = "";
    document.getElementById('options-container').innerHTML = ''; 
    const visualArea = document.getElementById('canvas-container');
    visualArea.innerHTML = ''; 

    // 隨機生成題目 (30% 換算題，70% 讀秤題)
    if (Math.random() < 0.3) {
        currentQuestion = generateConvertQuestion();
        visualArea.innerHTML = '<div style="font-size: 80px; margin: 10px;">⚖️🍬</div>';
    } else {
        currentQuestion = generateScaleQuestion();
        visualArea.appendChild(drawScale(currentQuestion.val, currentQuestion.max, currentQuestion.step));
    }

    // 更新題目文字
    document.getElementById('question-text').innerText = currentQuestion.text;

    // 產生選項按鈕 (打亂順序)
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
    const isKgToG = Math.random() > 0.5; 
    let qText, ans, opts, hintText;

    if (isKgToG) {
        const num = Math.random() > 0.3 ? Math.floor(Math.random() * 9) + 1 : (Math.floor(Math.random() * 5) + 0.5);
        qText = `${num} kg 等於多少 g？`;
        ans = `${num * 1000}g`;
        hintText = "1 kg = 1000 g，也就是加 3 個 0！";
        
        opts = [ans];
        opts.push(`${num * 100}g`);
        opts.push(`${num * 10}g`);
        opts.push(`${num + 1000}g`);
    } else {
        const num = (Math.floor(Math.random() * 20) + 1) * 500; 
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
        options: [...new Set(opts)],
        hint: hintText
    };
}

// 🎲 隨機產生「讀秤題」
function generateScaleQuestion() {
    const maxVals = [100, 200, 300, 400, 500];
    const max = maxVals[Math.floor(Math.random() * maxVals.length)];
    const step = (max === 100) ? 25 : (Math.random() > 0.5 ? 25 : 50);

    const totalSteps = max / step;
    let randomStepIndex = Math.floor(Math.random() * (totalSteps - 1)) + 1;
    let val = randomStepIndex * step;

    let text = "指針指在哪裡？";
    if (val === max / 2) text = "剛好在正中間！是多少？";
    else if (val % 100 === 25) text = "注意看！這是一小格 (25g)";
    else if (val > max / 2) text = `過了 ${max/2} 了，仔細看！`;

    const ans = `${val}g`;
    const hint = `每一小格代表 ${step}g，慢慢加或是用減的！`;

    let opts = new Set();
    opts.add(ans);

    while (opts.size < 4) {
        let type = Math.floor(Math.random() * 3);
        let fakeVal;
        if (type === 0) fakeVal = val + step; 
        else if (type === 1) fakeVal = val - step; 
        else fakeVal = val + 10; 

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
        
        const btns = document.querySelectorAll('.option-btn');
        btns.forEach(b => b.disabled = true);

        // 1.5秒後產生下一題
        setTimeout(() => {
            currentQNumber++;
            loadNewQuestion();
        }, 1500);
    } else {
        feedback.innerText = "❌ 再試試看！\n💡 " + hintText;
        feedback.className = "feedback wrong";
    }
}

// 🏆 顯示結果畫面 (修正版)
function showResult() {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');
    
    document.getElementById('final-score').innerText = score;
    
    // 根據分數給予不同評語
    let comment = "";
    if (score === MAX_QUESTIONS * 10) comment = "👑 完美！重量大師就是你！";
    else if (score >= MAX_QUESTIONS * 8) comment = "🌟 太厲害了！幾乎全對！";
    else if (score >= MAX_QUESTIONS * 6) comment = "👍 很棒喔！繼續加油！";
    else comment = "💪 沒關係，多練習幾次就會了！";
    
    document.getElementById('comment').innerText = comment;
    
    // 注意：HTML 中的 "再玩一次" 按鈕已經綁定 onclick="location.reload()"
    // 為了更好的體驗，我們可以改成直接呼叫 startGame() 而不重新整理網頁
    // 這樣切換比較順暢
    const restartBtn = document.querySelector('.restart-btn');
    restartBtn.onclick = startGame; 
    restartBtn.innerText = "再挑戰一輪新題目！🔄";
}

// 🎨 SVG 畫秤引擎 (保持不變)
function drawScale(value, maxVal, step) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 200 160"); 
    
    const cx = 100; const cy = 130; const r = 100;  

    const arc = document.createElementNS(svgNS, "path");
    arc.setAttribute("d", "M 10 130 A 90 90 0 0 1 190 130");
    arc.setAttribute("fill", "none");
    arc.setAttribute("stroke", "#4D96FF");
    arc.setAttribute("stroke-width", "5");
    arc.setAttribute("stroke-linecap", "round");
    svg.appendChild(arc);

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
        line.setAttribute("x1", x1); line.setAttribute("y1", y1);
        line.setAttribute("x2", x2); line.setAttribute("y2", y2);
        line.setAttribute("stroke", color); line.setAttribute("stroke-width", width);
        svg.appendChild(line);

        if (isMajor) {
            const tx = cx + (r - 40) * Math.cos(angleRad);
            const ty = cy + (r - 40) * Math.sin(angleRad);
            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", tx); text.setAttribute("y", ty);
            text.setAttribute("text-anchor", "middle"); 
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("fill", "#333");
            text.setAttribute("font-size", "14");
            text.setAttribute("font-weight", "bold");
            text.textContent = i;
            svg.appendChild(text);
        }
    }

    const targetPercent = value / maxVal;
    const targetAngle = 180 + (targetPercent * 180); 

    const needleGroup = document.createElementNS(svgNS, "g");
    needleGroup.setAttribute("transform", `rotate(${targetAngle}, 100, 130)`);
    const needle = document.createElementNS(svgNS, "path");
    needle.setAttribute("d", "M 100 126 L 180 130 L 100 134 Z");
    needle.setAttribute("fill", "#FF4757");
    needleGroup.appendChild(needle);
    const centerDot = document.createElementNS(svgNS, "circle");
    centerDot.setAttribute("cx", 100); centerDot.setAttribute("cy", 130);
    centerDot.setAttribute("r", 6); centerDot.setAttribute("fill", "#333");
    needleGroup.appendChild(centerDot);
    svg.appendChild(needleGroup);

    const unitText = document.createElementNS(svgNS, "text");
    unitText.setAttribute("x", 100); unitText.setAttribute("y", 100);
    unitText.setAttribute("text-anchor", "middle");
    unitText.setAttribute("fill", "#89CFF0");
    unitText.setAttribute("font-size", "24");
    unitText.setAttribute("font-weight", "bold");
    unitText.textContent = "g";
    svg.appendChild(unitText);

    return svg;
}
