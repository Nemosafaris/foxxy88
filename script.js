const questions = [
    { text: "คุณชอบการทำงานแบบไหน?", options: [
        { label: "อิสระและสามารถทำงานได้ตามจังหวะของตัวเอง", value: "independent" },
        { label: "รักการทำงานเป็นทีมและร่วมมือกับผู้อื่น", value: "collaborative" },
        { label: "ชอบทำตามขั้นตอนแต่ยืดหยุ่นได้", value: "structured-flexible" },
        { label: "เน้นความรวดเร็วและผลลัพธ์เป็นหลัก", value: "result-oriented" }
    ] },
    { text: "เมื่อเจอปัญหาคุณจะ...", options: [
        { label: "คิดและหาวิธีแก้คนเดียวก่อน", value: "think-alone" },
        { label: "ปรึกษาเพื่อนหรือขอความช่วยเหลือ", value: "ask-for-help" },
        { label: "รอให้มันค่อยๆ แก้เองตามธรรมชาติ", value: "wait-and-see" },
        { label: "หาข้อมูลออนไลน์มาวิเคราะห์เอง", value: "research" }
    ] },
    { text: "คุณเป็นคนที่ชอบ...", options: [
        { label: "วางแผนและจัดลำดับความสำคัญ", value: "planner" },
        { label: "ลองทำสิ่งใหม่ๆ ดูผลก่อน", value: "spontaneous" },
        { label: "ทำตามแผนที่มีอยู่แล้ว", value: "routine" },
        { label: "ปรับตัวตามสถานการณ์ที่เกิดขึ้น", value: "adaptable" }
    ] },
    { text: "เมื่อคนแปลกหน้าเข้ามาทักทาย...", options: [
        { label: "ยิ้มและคุยแบบสุภาพ", value: "polite" },
        { label: "ดูเป็นธรรมชาติและไม่สนใจมาก", value: "casual" },
        { label: "เปิดใจและแสดงความต้อนรับ", value: "welcoming" },
        { label: "ตอบกลับแบบสั้นๆ แล้วกลับสู่กิจกรรมเดิม", value: "concise" }
    ] },
    { text: "คุณชอบการทำงานแบบไหน?", options: [
        { label: "มีเป้าหมายชัดเจนและทำตามขั้นตอน", value: "structured" },
        { label: "ยืดหยุ่นและปรับได้ตามสถานการณ์", value: "flexible" },
        { label: "เน้นความละเอียดและความแม่นยำ", value: "precision" },
        { label: "ทำงานให้เสร็จก่อนกำหนดเวลาเสมอ", value: "time-manager" }
    ] },
    { text: "เมื่อรู้สึกเบื่อ...", options: [
        { label: "ทำสิ่งที่เคยโปรดปรานเดิมๆ", value: "stay-comfortable" },
        { label: "เปลี่ยนไปหาอะไรใหม่ๆ ทำ", value: "try-new" },
        { label: "พักผ่อนให้ถึงก่อนแล้วค่อยเริ่มใหม่", value: "rest-recover" },
        { label: "ทำสิ่งที่เคยไม่สนใจแต่พยายามทำให้", value: "challenge-self" }
    ] },
    { text: "คุณเป็นคนที่...", options: [
        { label: "เก็บความรู้สึกและแสดงออกน้อย", value: "reserved" },
        { label: "เปิดใจและสื่อสารอย่างตรงไปตรงมา", value: "open" },
        { label: "มองบวกต่อทุกสถานการณ์", value: "optimistic" },
        { label: "วิเคราะห์ก่อนแล้วค่อยตัดสินใจ", value: "analytical" }
    ] },
    { text: "การตัดสินใจเรื่องสำคัญ...", options: [
        { label: "คิดวิเคราะห์อย่างละเอียดก่อน", value: "careful" },
        { label: "ลงมือทำแล้วค่อยปรับปรุง", value: "improvement" },
        { label: "ฟังคนอื่นก่อนแล้วตัดสินใจ", value: "consensus" },
        { label: "ตัดสินใจเร็วเพื่อไม่เสียเวลา", value: "decisive" }
    ] },
    { text: "คุณชอบบรรยากาศที่...", options: [
        { label: "มีระเบียบและชัดเจน", value: "organized" },
        { label: "ผ่อนคลายและเป็นกันเอง", value: "relaxed" },
        { label: "มีพื้นที่ส่วนตัวและไม่รบกวนผู้อื่น", value: "private" },
        { label: "แอคทีฟและมีพลังงานอยู่เสมอ", value: "energetic" }
    ] },
    { text: "เมื่อเรียนรู้อะไรใหม่ๆ...", options: [
        { label: "จดบันทึกและทบทวนให้เข้าใจ", value: "memorize" },
        { label: "ลงมือทำจริงเป็นหลัก", value: "practice" },
        { label: "ถามเพื่อนหรือผู้เชี่ยวชาญ", value: "ask-expert" },
        { label: "สังเกตและเรียนรู้จากการลองผิดลองถูก", value: "experience-learning" }
    ] }
];


// ผลลัพธ์ด้านบุคลิกภาพเป็นการสะท้อนแนวโน้มจากคำตอบ ไม่ใช่แบบทดสอบทางจิตวิทยาที่ผ่านการรับรอง
const traits = {
    analytical: { icon: '🔍', name: 'นักคิดและวางแผน', detail: 'คุณมีแนวโน้มให้ความสำคัญกับข้อมูล ความรอบคอบ และการวางแผนก่อนลงมือทำ' },
    social: { icon: '🤝', name: 'นักประสานงาน', detail: 'คุณมีแนวโน้มให้ความสำคัญกับการสื่อสาร การรับฟัง และการทำงานร่วมกับผู้อื่น' },
    adaptable: { icon: '🌱', name: 'นักปรับตัวและเรียนรู้', detail: 'คุณมีแนวโน้มเปิดรับการเปลี่ยนแปลง เรียนรู้จากประสบการณ์ และปรับวิธีการตามสถานการณ์' },
    action: { icon: '⚡', name: 'นักลงมือทำ', detail: 'คุณมีแนวโน้มเน้นการลงมือปฏิบัติ ความกระตือรือร้น และการทำงานให้สำเร็จ' }
};
// ระบุลักษณะจากแต่ละตัวเลือกอย่างชัดเจน ไม่ใช้ value ซึ่งไม่ซ้ำกันมาเป็นคะแนน
const traitByQuestion = [
    ['adaptable', 'social', 'analytical', 'action'],
    ['analytical', 'social', 'adaptable', 'analytical'],
    ['analytical', 'action', 'analytical', 'adaptable'],
    ['social', 'adaptable', 'social', 'analytical'],
    ['analytical', 'adaptable', 'analytical', 'action'],
    ['analytical', 'adaptable', 'adaptable', 'action'],
    ['analytical', 'social', 'adaptable', 'analytical'],
    ['analytical', 'action', 'social', 'action'],
    ['analytical', 'social', 'analytical', 'action'],
    ['analytical', 'action', 'social', 'adaptable']
];

let nickname = '';
let currentQuestion = 0;
let isSubmitting = false;
const answers = Array(questions.length).fill(null);

const $ = (selector) => document.querySelector(selector);

function createNotification(message, type = 'error') {
    const area = $('.notifications-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'status');
    notification.textContent = message;
    area.appendChild(notification);
    setTimeout(() => notification.remove(), 4500);
}

function updateProgress() {
    const completed = answers.filter(value => value !== null).length;
    const percent = Math.round(completed / questions.length * 100);
    $('#progress-label').textContent = `ข้อ ${currentQuestion + 1} จาก ${questions.length} · ตอบแล้ว ${completed} ข้อ`;
    $('#progress-fill').style.width = `${percent}%`;
    $('.progress-bar').setAttribute('aria-valuenow', String(percent));
}

function renderQuestion() {
    const question = questions[currentQuestion];
    const container = $('#questions-container');
    container.replaceChildren();
    const heading = document.createElement('h2');
    heading.className = 'question-text';
    heading.textContent = question.text;
    container.appendChild(heading);
    const options = document.createElement('div');
    options.className = 'options';
    question.options.forEach((option, index) => {
        const label = document.createElement('label');
        label.className = 'option-item';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `q${currentQuestion}`;
        input.value = option.value;
        input.checked = answers[currentQuestion] === option.value;
        if (input.checked) label.classList.add('selected');
        const span = document.createElement('span');
        span.className = 'option-label';
        span.textContent = option.label;
        label.append(input, span);
        input.addEventListener('change', () => {
            answers[currentQuestion] = option.value;
            options.querySelectorAll('.option-item').forEach(item => item.classList.remove('selected'));
            label.classList.add('selected');
            updateProgress();
            updateButtons();
        });
        options.appendChild(label);
    });
    container.appendChild(options);
    updateProgress();
    updateButtons();
}

function updateButtons() {
    $('#prev-btn').classList.toggle('hidden', currentQuestion === 0);
    $('#next-btn').classList.toggle('hidden', currentQuestion === questions.length - 1);
    $('#survey-submit').classList.toggle('hidden', currentQuestion !== questions.length - 1);
    $('#next-btn').disabled = isSubmitting;
    $('#prev-btn').disabled = isSubmitting;
    $('#survey-submit').disabled = isSubmitting;
}

function ensureAnswered() {
    if (answers[currentQuestion] !== null) return true;
    createNotification('กรุณาเลือกคำตอบก่อนดำเนินการต่อ');
    $('#questions-container input[type="radio"]')?.focus();
    return false;
}

function findFirstMissing() {
    return answers.findIndex(value => value === null);
}

function createTraitIcon(key) {
    const icon = document.createElement('span');
    icon.classList.add('trait-icon', 'trait-icon--' + key);
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = traits[key].icon;
    return icon;
}

function createResults() {
    const scores = Object.fromEntries(Object.keys(traits).map(key => [key, 0]));
    const summary = [];
    answers.forEach((answer, questionIndex) => {
        const optIndex = questions[questionIndex].options.findIndex(option => option.value === answer);
        if (optIndex < 0) return;
        scores[traitByQuestion[questionIndex][optIndex]]++;
        summary.push({question: questions[questionIndex].text, answer: questions[questionIndex].options[optIndex].label});
    });
    const highest = Math.max(...Object.values(scores));
    const leaders = Object.entries(scores).filter(([,value]) => value === highest).map(([key]) => key);
    const feedback = $('#feedback-section');
    feedback.replaceChildren();
    const title = document.createElement('h3');
    title.textContent = `แนวโน้มเด่นของคุณ: ${leaders.map(key => traits[key].name).join(' / ')}`;
    const badge = document.createElement('div');
    badge.className = 'trait-hero';
    badge.append(...leaders.map(createTraitIcon));
    feedback.append(badge, title);
    const description = document.createElement('p');
    description.textContent = leaders.map(key => traits[key].detail).join(' ');
    feedback.appendChild(description);
    const scoresTitle = document.createElement('h4');
    scoresTitle.textContent = 'คะแนนแนวโน้มจากคำตอบ';
    feedback.appendChild(scoresTitle);
    for (const [key, score] of Object.entries(scores)) {
        const row = document.createElement('div');
        row.className = 'score-row';
        const name = document.createElement('span');
        name.className = 'score-name';
        name.append(createTraitIcon(key), traits[key].name);
        const count = document.createElement('strong');
        count.textContent = `${score} / ${questions.length}`;
        row.append(name, count);
        feedback.appendChild(row);
    }
    const details = document.createElement('details');
    const detailsTitle = document.createElement('summary');
    detailsTitle.textContent = 'ดูคำตอบทั้งหมด';
    const list = document.createElement('ol');
    summary.forEach(item => {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = item.question;
        const answer = document.createElement('div');
        answer.textContent = item.answer;
        li.append(strong, answer);
        list.appendChild(li);
    });
    details.append(detailsTitle, list);
    feedback.appendChild(details);
    const caveat = document.createElement('p');
    caveat.className = 'disclaimer';
    caveat.textContent = 'ผลประเมินนี้เป็นเพียงการสะท้อนแนวโน้มจากคำตอบ 10 ข้อ ไม่ใช่การวินิจฉัยหรือแบบวัดบุคลิกภาพมาตรฐาน';
    feedback.appendChild(caveat);
}

async function submitSurvey(event) {
    event.preventDefault();
    if (isSubmitting || !nickname) return;
    const missing = findFirstMissing();
    if (missing >= 0) {
        currentQuestion = missing;
        renderQuestion();
        createNotification('กรุณาตอบคำถามให้ครบทุกข้อ');
        return;
    }
    isSubmitting = true;
    updateButtons();
    const data = Object.fromEntries(answers.map((answer, index) => [`q${index}`, answer]));
    data.nickname = nickname;
    $('#restart-btn').disabled = true;
    // แสดงผลได้โดยไม่ต้องพึ่งพาเซิร์ฟเวอร์ (มีเพียงไฟล์ frontend ที่แนบมา)
    createResults();
    $('#questions-container').classList.add('hidden');
    $('.nav-buttons').classList.add('hidden');
    $('#progress-section').classList.add('hidden');
    $('#results-container').classList.remove('hidden');
    $('#restart-btn').classList.remove('hidden');
    $('#results-container').focus();

    // ส่งบันทึกไป backend เฉพาะเมื่อเปิดผ่าน HTTP(S); แจ้งสถานะตามจริง
    const status = $('#save-status');
    if (window.location.protocol === 'file:') {
        status.textContent = 'ผลแสดงบนเครื่องนี้เท่านั้น: หากต้องการบันทึกลงฐานข้อมูล ต้องเชื่อมต่อ API /api/results';
    } else {
        status.textContent = 'กำลังตรวจสอบการบันทึกข้อมูลบนเซิร์ฟเวอร์…';
        try {
            const response = await fetch('/api/results', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            status.textContent = 'ส่งข้อมูลไปยังเซิร์ฟเวอร์สำเร็จ';
        } catch (error) {
            status.textContent = 'แสดงผลสำเร็จ แต่ยังบันทึกลงเซิร์ฟเวอร์ไม่ได้ (โปรดตรวจสอบ API /api/results)';
            createNotification('ยังไม่สามารถบันทึกข้อมูลลงเซิร์ฟเวอร์ได้');
            console.error('Result submission failed:', error);
        }
    }
    isSubmitting = false;
    $('#restart-btn').disabled = false;
}

function restartSurvey() {
    answers.fill(null);
    currentQuestion = 0;
    isSubmitting = false;
    $('#questions-container').classList.remove('hidden');
    $('.nav-buttons').classList.remove('hidden');
    $('#progress-section').classList.remove('hidden');
    $('#results-container').classList.add('hidden');
    $('#restart-btn').classList.add('hidden');
    $('#save-status').textContent = '';
    nickname = '';
    $('#nickname-form').reset();
    $('#personalityForm').classList.add('hidden');
    $('#nickname-form').classList.remove('hidden');
    $('#nickname').focus();
    window.scrollTo({top: 0, behavior: 'smooth'});
}

document.addEventListener('DOMContentLoaded', () => {
    $('#next-btn').addEventListener('click', () => {
        if (!ensureAnswered()) return;
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            renderQuestion();
        }
    });
    $('#prev-btn').addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            renderQuestion();
        }
    });
    $('#personalityForm').addEventListener('submit', submitSurvey);
    $('#restart-btn').addEventListener('click', restartSurvey);
    const nicknameInput = $('#nickname');
    nicknameInput.addEventListener('input', () => nicknameInput.setCustomValidity(''));
    $('#nickname-form').addEventListener('submit', event => {
        event.preventDefault();
        const value = nicknameInput.value.trim();
        if (!value || /[\x00-\x1f\x7f\uD800-\uDFFF\uFFFE\uFFFF]/u.test(value)) {
            nicknameInput.setCustomValidity('กรุณากรอกชื่อเล่นที่ถูกต้อง');
            nicknameInput.reportValidity();
            return;
        }
        nickname = value;
        $('#nickname-form').classList.add('hidden');
        $('#personalityForm').classList.remove('hidden');
        renderQuestion();
        const heading = $('#questions-container h2');
        heading.tabIndex = -1;
        heading.focus();
    });
});
