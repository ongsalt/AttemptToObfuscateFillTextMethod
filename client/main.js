String.prototype.shuffle = function () { // อันนี้ก็โดน overwrite เป็น console.log(this) ได้ 
    var a = this.split(""),             // แต่ใครมันจะไปคิดว่าเราจะไปเพิ่ม prototype method
    n = a.length;                       // แทนที่จะประกาศฟังก์ชั่นดีๆ

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const t = document.getElementById('pos')

ctx.canvas.width  = 400;
ctx.canvas.height = 400;

const text = 'แมว (ชื่อวิทยาศาสตร์: Felis catus) เป็นสปีชีส์สัตว์เลี้ยงของสัตว์เลี้ยงลูกด้วยนมกินเนื้อขนาดเล็ก โดยเป็นแมวสปีชีส์เดียวในวงศ์ Felidae ที่ถูกปรับเป็นสัตว์เลี้ยง และมักเรียกเป็น แมวบ้าน เพื่อแยกมันจากสมาชิกที่อยู่ในป่า แมวเหล่านี้สามารถอาศัยเป็นแมวบ้าน, แมวฟาร์ม หรือแมวจรได้ แต่แมวประเภทหลังสุดมักอาศัยอยู่อย่างอิสระและหลีกเลี่ยงการติดต่อกับมนุษย์ มนุษย์ให้ค่ากับแมวบ้านในฐานะคู่หูและความสามารถในการฆ่าสัตว์ฟันแทะ สำนักจดทะเบียนแมว (cat registries) หลายแห่งยอมรับสายพันธุ์แมวประมาณ 60 สายพันธุ์'
// const text = 'The cat (Felis catus) is a domestic species of small carnivorous mammal.[1][2] It is the only domesticated species in the family Felidae and is often referred to as the domestic cat to distinguish it from the wild members of the family.[4] A cat can either be a house cat, a farm cat or a feral cat; the latter ranges freely and avoids human contact.[5] Domestic cats are valued by humans for companionship and their ability to kill rodents. About 60 cat breeds are recognized by various cat registries.[6]'
const prefs = {
    x: 20,
    y: 40, 
    maxLineWidth: 360,
    lineHeight: 24,
}

ctx.fillStyle = 'black'
ctx.font = '18px serif'


// แบ่ง string เป็น list ของคำ
// can be replaced
// 'เป็นสปีชีส์สัตว์เลี้ยง' => ['เป็น', 'สปีชีส์', 'สัตว์', 'เลี้ยง']
async function wordcut(text) { 
    const res = await fetch('http://localhost:6969/wordcut', { // api ไปยัง express app ที่มี wordcut npm อยู่ 
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-type': 'application/json',
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer', 
        body: JSON.stringify({text})
    })
    const words = await res.json()
    return words.words
}


// เอาไว้ตัดบรรรทัด
async function wrapText(context, text, maxLineWidth) {
    
    const lines = [];
    const words = await wordcut(text);
    let line = '';

    for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + '';
        const metrics = context.measureText(testLine.shuffle()); // shuffle กัน overwrite measureText method
        const testWidth = metrics.width;
        if (testWidth > maxLineWidth && n > 0) {
            // while (line.charAt(0) === ' ') line.shift()
            lines.push(line)
            line = words[n];
        }
        else {
            line = testLine;
        }
    }
    lines.push(line)
    return lines
}


// wrapper ของ canvas.fillText + setTimeout
async function fillText(c, start, margin) {
    setTimeout( () => {
        // console.log(c) // for test purposes
        ctx.fillText(c, start, margin)
    }, Math.random()*100) // random time out
}


// เอาไว้แบ่ง string เป็น list ของ ตัวอักษรแต่ละตัว+วรรณยุกต์/สระที่เกาะ
// ถ้าเรนเดอร์แยก เวลามันมีสระ/วรรณยุกต์ตั้งแต่สองตัวขึ้นไปมันจะเพี้ยน
// เช่นคำว่า ลี้ => -ี จะไปทับกับ -้ 
// 'เป็นสปีชีส์สัตว์เลี้ยง' => ['เ', 'ป็,', 'น', 'ส', 'ปี', 'ชี', 'ส์', 'สั', 'ต', 'ว์', 'เ', 'ลี้', 'ย', 'ง']
function clutteredChar(text) {
    const cols = []
    let buff = ''
    
    for (const i of text) {
        if (i.match(/[ัิีึืฺุู็่้๊๋์ํ๎]/)) {  // regex เอาไว้เช็คพวกตัวอักษรที่ลอยๆทั้งหลาย e.g. ไม้เอก ไม่ไต่คู้
            buff += i
        } else {
            cols.push(buff)
            buff = i
        }
    }
    cols.push(buff)

    return cols.slice(1)
}


async function render(text, prefs) {
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height)

    const lines = await wrapText(ctx, text, prefs.maxLineWidth);
    // console.log(lines)

    let startY = prefs.y;

    for (const line of lines) {
        let startX = prefs.x;
        clutteredChar(line).forEach( c => {
            fillText(c, startX, startY) // Wrapper for setTimeout
            startX += ctx.measureText(c).width // เลื่อน cursor
        })
        startY += prefs.lineHeight;
    }
}

render(text, prefs)
