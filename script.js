// 題庫設計：混合 Level 1 (換算/整數), Level 2 (50g), Level 3 (25g)
const questions = [
    // --- Level 1: 基礎換算 ---
    {
        type: "convert",
        text: "1 kg 等於多少 g？",
        answer: "1000g",
        options: ["100g", "1000g", "10g", "500g"],
        hint: "口訣：1 公斤加 3 個 0！"
    },
    {
        type: "convert",
        text: "2000 g 等於多少 kg？",
        answer: "2kg",
        options: ["20kg", "2kg", "200kg", "0.2kg"],
        hint: "g 變 kg，切掉 3 個 0 (瘦身)！"
    },
    
    // --- Level 2: 讀秤 (50g) ---
    {
        type: "scale",
        text: "指針指在哪裡？(注意這是一半)",
        val: 150, max: 200, step: 50, // 0-100 分兩格，一格 50
        answer: "150g",
        options: ["100g", "150g", "125g", "200g"],
        hint: "100 到 200 的正中間是 150 喔！"
    },
    {
        type: "scale",
        text: "過了 200，在中間！",
        val: 250, max: 400, step: 50,
        answer: "250g",
        options: ["200g", "250g", "300g", "205g"],
        hint: "像 50 元硬幣一樣，中間是 50！"
    },
    
    // --- Level 3: 魔王題 (25g) ---
    // step: 25 會觸發 SVG 畫出細分刻度
    {
        type: "scale",
        text: "【魔王題】指針在第一小格！",
        val: 25, max: 100, step: 25, 
        answer: "25g",
        options: ["10g", "20g", "25g", "50g"],
        hint: "100g 分成 4 份，一格是 25g！"
    },
    {
        type: "scale",
        text: "仔細看，這是多少？",
        val: 75, max: 100, step: 25,
        answer: "75g",
        options: ["50g", "75g", "80g", "60g"],
        hint: "25, 50... 下一個是？"
    },
    {
        type: "scale",
        text: "指針過了 100，在第一小格",
        val: 125, max: 200, step: 25,
        answer: "125g",
        options: ["110g", "125g", "150g", "105g"],
        hint: "100 + 25 = 125"
    },
    {
        type: "scale",
        text: "這包糖果有多重？",
        val: 175, max: 200, step: 25,
        answer: "175g",
        options: ["150g", "175g", "180g", "125g"],
        hint: "還差一小格就到 200 了 (200 - 25)"
    },
    {
        type: "scale",
        text: "超級魔王題！",
        val: 225, max: 300, step: 25,
        answer: "225g",
        options: ["215g", "225g", "250g", "275g"],
        hint: "過了 200 的第一格！"
    },
    {
        type: "convert",
        text: "最後一題：半公斤 (0.5kg) 是多少？",
        answer: "500g",
        options: ["50g", "500g", "5000g", "5g"],
        hint: "1公斤是1000g，一半就是..."
    }
];

let currentQIndex = 0;
let score = 0;

// 遊戲開始
function startGame() {
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    loadQuestion();
}

// 載入題目
function loadQuestion() {
    // 檢查是否結束
    if (currentQIndex >= questions.length) {
        showResult();
        return;
    }

    const q = questions[currentQIndex];
    document.getElementById('current-q').innerText = currentQIndex + 1;
    document.getElementById('question-text').innerText = q.text;
    
    // 重置介面
    const feedback = document.getElementById('feedback');
    feedback.className = 'feedback hidden';
    feedback.innerText = "";
    document.getElementById('options-container').innerHTML = ''; // 清空選項
    const visualArea = document.getElementById('canvas-container');
    visualArea.innerHTML = ''; // 清空舊圖

    // 判斷類型：畫圖 或 顯示文字
    if (q.type === 'scale') {
        // 呼叫我們的 SVG 繪圖引擎
        visualArea.appendChild(drawScale(q.val, q.max, q.step));
    } else {
        visualArea.innerHTML = '<div style="font-size: 80px; margin: 10px;">⚖️🍬</div>';
    }

    // 產生選項按鈕 (隨機排序)
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

    shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, q.answer, q.hint); // 綁定點擊事件
        document.getElementById('options-container').appendChild(btn);
    });
}

// 檢查答案
function checkAnswer(selected, correct, hintText) {
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('hidden');

    if (selected === correct) {
        score += 10;
        document.getElementById('score').innerText = score;
        feedback.innerText = "🎉 答對了！Cinnamoroll 為你轉圈圈！";
        feedback.className = "feedback correct";
        
        // 鎖定按鈕避免重複點擊
        const btns = document.querySelectorAll('.option-btn');
        btns.forEach(b => b.disabled = true);

        // 1.5秒後下一題
        setTimeout(() => {
            currentQIndex++;
            loadQuestion();
        }, 1500);
    } else {
        feedback.innerText = "❌ 哎呀，再試試看！\n💡 " + hintText;
        feedback.className = "feedback wrong";
    }
}

// 顯示結果
function showResult() {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');
    document.getElementById('final-score').innerText = score;
    
    let comment = "";
    if (score === 100) comment = "👑 完美！你是真正的重量大師！";
    else if (score >= 80) comment = "🌟 很棒喔！只差一點點！";
    else comment = "💪 加油！看著我們的筆記再試一次！";
    
    document.getElementById('comment').innerText = comment;
}

// 🎨 SVG 畫秤引擎 (核心魔法功能)
function drawScale(value, maxVal, step) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 200 160"); // 設定畫布大小
    
    const cx = 100; // 圓心 X
    const cy = 130; // 圓心 Y
    const r = 100;  // 半徑

    // 1. 畫秤的外框 (藍色半圓)
    const arc = document.createElementNS(svgNS, "path");
    // 路徑指令：M(移動) -> A(畫弧)
    arc.setAttribute("d", "M 10 130 A 90 90 0 0 1 190 130");
    arc.setAttribute("fill", "none");
    arc.setAttribute("stroke", "#4D96FF");
    arc.setAttribute("stroke-width", "5");
    arc.setAttribute("stroke-linecap", "round");
    svg.appendChild(arc);

    // 2. 畫刻度 (Tick Marks)
    // 邏輯：從 0 循環到 maxVal，步長為 step
    for (let i = 0; i <= maxVal; i += step) {
        // 計算角度：將數值轉換為角度 (左 -90deg ~ 右 90deg)
        const percent = i / maxVal;
        const angleDeg = -90 + (percent * 180);
        const angleRad = (angleDeg * Math.PI) / 180;

        // 判斷是大格 (100的倍數) 還是小格
        const isMajor = (i % 100 === 0);
        
        // 設定線條樣式
        const tickLen = isMajor ? 15 : 8; // 大格長，小格短
        const color = isMajor ? "#FF6B6B" : "#888"; // 大格紅，小格灰
        const width = isMajor ? 3 : 1;

        // 計算線條座標 (三角函數)
        // 外點
        const x1 = cx + (r - 15) * Math.cos(angleRad);
        const y1 = cy + (r - 15) * Math.sin(angleRad);
        // 內點
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

        // 如果是大格，加上數字標籤
        if (isMajor) {
            const tx = cx + (r - 45) * Math.cos(angleRad);
            const ty = cy + (r - 45) * Math.sin(angleRad);
            
            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", tx);
            text.setAttribute("y", ty);
            text.setAttribute("text-anchor", "middle"); // 文字置中
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("fill", "#333");
            text.setAttribute("font-size", "14");
            text.setAttribute("font-weight", "bold");
            text.textContent = i;
            svg.appendChild(text);
        }
    }

    // 3. 畫指針 (Needle)
    const targetPercent = value / maxVal;
    const targetAngle = -90 + (targetPercent * 180);

    const needleGroup = document.createElementNS(svgNS, "g");
    // 設定旋轉中心點
    needleGroup.setAttribute("transform", `rotate(${targetAngle}, 100, 130)`);

    // 紅色指針 (畫一個尖三角形)
    const needle = document.createElementNS(svgNS, "path");
    needle.setAttribute("d", "M 96 130 L 100 50 L 104 130 Z");
    needle.setAttribute("fill", "#FF4757");
    needleGroup.appendChild(needle);

    // 中心裝飾點
    const centerDot = document.createElementNS(svgNS, "circle");
    centerDot.setAttribute("cx", 100);
    centerDot.setAttribute("cy", 130);
    centerDot.setAttribute("r", 6);
    centerDot.setAttribute("fill", "#333");
    needleGroup.appendChild(centerDot);

    svg.appendChild(needleGroup);

    // 4. 顯示單位 "g"
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
