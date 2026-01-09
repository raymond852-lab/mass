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
        val: 150, max: 200, step: 50, 
        answer: "150g",
        options: ["100g", "150g", "125g", "200g"],
        hint: "100 到 200 的正中間是 150 喔！"
    },
    {
        // 修正後的邏輯：200 會在正上方，250 會在右邊一點點
        type: "scale",
        text: "過了 200，在中間！",
        val: 250, max: 400, step: 50,
        answer: "250g",
        options: ["200g", "250g", "300g", "205g"],
        hint: "指針過了正中間的 200，指向下一格！"
    },
    
    // --- Level 3: 魔王題 (25g) ---
    // 這裡我們把最大值設為 100 或 200，讓刻度更清楚
    {
        type: "scale",
        text: "【魔王題】指針在第一小格！",
        val: 25, max: 100, step: 25, 
        answer: "25g",
        options: ["10g", "20g", "25g", "50g"],
        hint: "0 到 100 分成 4 份，第一格是 25！"
    },
    {
        type: "scale",
        text: "仔細看，這是多少？",
        val: 75, max: 100, step: 25,
        answer: "75g",
        options: ["50g", "75g", "80g", "60g"],
        hint: "25, 50, 75... 數數看！"
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
    document.getElementById('options-container').innerHTML = ''; 
    const visualArea = document.getElementById('canvas-container');
    visualArea.innerHTML = ''; 

    // 判斷類型：畫圖 或 顯示文字
    if (q.type === 'scale') {
        visualArea.appendChild(drawScale(q.val, q.max, q.step));
    } else {
        visualArea.innerHTML = '<div style="font-size: 80px; margin: 10px;">⚖️🍬</div>';
    }

    // 產生選項按鈕
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

    shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, q.answer, q.hint); 
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
        feedback.innerText = "🎉 答對了！太棒了！";
        feedback.className = "feedback correct";
        
        const btns = document.querySelectorAll('.option-btn');
        btns.forEach(b => b.disabled = true);

        setTimeout(() => {
            currentQIndex++;
            loadQuestion();
        }, 1500);
    } else {
        feedback.innerText = "❌ 哎呀，再試試看！\n💡 " + hintText;
        feedback.className = "feedback wrong";
    }
}

function showResult() {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');
    document.getElementById('final-score').innerText = score;
    
    let comment = "";
    if (score === 100) comment = "👑 完美！你是真正的重量大師！";
    else if (score >= 80) comment = "🌟 很棒喔！只差一點點！";
    else comment = "💪 加油！再練習一次！";
    
    document.getElementById('comment').innerText = comment;
}

// 🎨 修正後的 SVG 畫秤引擎
function drawScale(value, maxVal, step) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 200 160"); 
    
    const cx = 100; // 圓心 X
    const cy = 130; // 圓心 Y
    const r = 100;  // 半徑

    // 1. 畫秤的外框 (藍色半圓)
    const arc = document.createElementNS(svgNS, "path");
    // 從左 (10, 130) 畫到右 (190, 130)
    arc.setAttribute("d", "M 10 130 A 90 90 0 0 1 190 130");
    arc.setAttribute("fill", "none");
    arc.setAttribute("stroke", "#4D96FF");
    arc.setAttribute("stroke-width", "5");
    arc.setAttribute("stroke-linecap", "round");
    svg.appendChild(arc);

    // 2. 畫刻度 (Tick Marks)
    // 邏輯修正：角度從 180度 (左) 到 360度 (右)
    for (let i = 0; i <= maxVal; i += step) {
        const percent = i / maxVal;
        
        // 【重要修正】這裡的角度計算改了
        // percent 0 -> 180度 (左邊, 9點鐘)
        // percent 0.5 -> 270度 (上面, 12點鐘)
        // percent 1 -> 360度 (右邊, 3點鐘)
        const angleDeg = 180 + (percent * 180);
        const angleRad = (angleDeg * Math.PI) / 180;

        const isMajor = (i % 100 === 0);
        const tickLen = isMajor ? 15 : 8; 
        const color = isMajor ? "#FF6B6B" : "#888"; 
        const width = isMajor ? 3 : 1;

        // 計算線條座標
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

        // 如果是大格，加上數字
        if (isMajor) {
            // 文字位置稍微往內縮一點
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

    // 3. 畫指針 (Needle)
    // 【重要修正】指針角度也要跟著改
    const targetPercent = value / maxVal;
    const targetAngle = 180 + (targetPercent * 180); // 修正這裡

    const needleGroup = document.createElementNS(svgNS, "g");
    needleGroup.setAttribute("transform", `rotate(${targetAngle}, 100, 130)`);

    // 指針本體 (這裡畫一個指向 360度/0度 方向的箭頭，然後透過 transform 旋轉)
    // 因為 SVG 預設 0度是右邊，所以我們畫一個向右的箭頭，然後轉到對應位置
    // 但為了方便對齊，我們通常畫好後再轉。
    // 這裡我們畫一個指向右邊的箭頭：
    // 不，因為我們旋轉基準是圓心。
    // 我們可以畫一個指向 "0度" (右邊) 的指針，然後旋轉它。
    
    // 修正：直接畫一個指向圓周的指針形狀
    // 為了簡單，我們假設指針原本是指向右邊 (0度) 的
    // M 100 126 L 190 130 L 100 134 Z (這是一個指向右邊的尖三角形)
    // 但為了配合之前的代碼結構，我們微調一下 path
    
    const needle = document.createElementNS(svgNS, "path");
    // 這裡畫一個指向 "右邊" (X軸正向) 的箭頭，長度 80
    // 圓心是 100,130
    // 箭頭尖端: 180, 130
    // 箭頭尾部: 100, 126 和 100, 134
    needle.setAttribute("d", "M 100 126 L 180 130 L 100 134 Z");
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
