// 題庫設計：混合 Level 1 (換算), Level 2 (50g), Level 3 (25g)
const questions = [
    // --- Level 1: 基礎換算 ---
    {
        type: "convert",
        text: "1 kg 等於多少 g？",
        answer: "1000g",
        options: ["100g", "1000g", "10g", "500g"],
        hint: "口訣：1 公斤 = 1000 克 (加3個0)！"
    },
    {
        type: "convert",
        text: "2000 g 等於多少 kg？",
        answer: "2kg",
        options: ["20kg", "2kg", "200kg", "0.2kg"],
        hint: "g 變 kg，切掉 3 個 0 (瘦身)！"
    },
    
    // --- Level 2: 讀秤 (50g) ---
    // 修正後：0在左，100在上，200在右。150在右上方。
    {
        type: "scale",
        text: "指針指在哪裡？(注意這是一半)",
        val: 150, max: 200, step: 50, 
        answer: "150g",
        options: ["100g", "150g", "125g", "200g"],
        hint: "100(上方) 到 200(右邊) 的正中間！"
    },
    {
        // 修正後：200在上，400在右。250在過了上方一點點。
        type: "scale",
        text: "過了 200，在中間！",
        val: 250, max: 400, step: 50,
        answer: "250g",
        options: ["200g", "250g", "300g", "205g"],
        hint: "指針過了正中間的 200！"
    },
    
    // --- Level 3: 魔王題 (25g) ---
    // 0-100範圍。0左, 50上, 100右。
    // 25g 會指在左上方 (9點與12點中間)
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
        hint: "50(上方) 和 100(右邊) 的中間！"
    },
    {
        // 0-200範圍。100在上。125在過了上方的第一格。
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

function startGame() {
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    loadQuestion();
}

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

    if (q.type === 'scale') {
        visualArea.appendChild(drawScale(q.val, q.max, q.step));
    } else {
        visualArea.innerHTML = '<div style="font-size: 80px; margin: 10px;">⚖️🍬</div>';
    }

    // 選項亂數排列
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
    shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, q.answer, q.hint); 
        document.getElementById('options-container').appendChild(btn);
    });
}

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

// 🎨 修正後的 SVG 畫秤引擎 (座標系對齊版)
function drawScale(value, maxVal, step) {
    const svgNS = "http://www
