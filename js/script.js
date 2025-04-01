const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const textContainer = document.getElementById('text-container');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Flower configuration
const flowerConfig = {
    x: canvas.width / 2,
    y: canvas.height / 2 - 60,
    petalCount: 11,
    centerRadius: 25,       // Smaller center (reduced from 40)
    petalLength: 70,
    petalWidth: 40,
    stemHeight: 200,
    stemCurve: 20,
    petalOffset: 3
};

// Animation state
let petals = [];
let activePetals = flowerConfig.petalCount;
const phrases = ["Loves me", "Loves me not"];
let resultShown = false;

class Petal {
    constructor(angle, phraseIndex) {
        this.baseAngle = angle;
        this.phraseIndex = phraseIndex;
        this.reset();
    }

    reset() {
        this.angle = this.baseAngle;
        this.x = flowerConfig.x + Math.cos(this.angle) * 
                (flowerConfig.centerRadius + flowerConfig.petalOffset);
        this.y = flowerConfig.y + Math.sin(this.angle) * 
                (flowerConfig.centerRadius + flowerConfig.petalOffset);
        this.velocity = { x: 0, y: 0 };
        this.rotation = this.angle + Math.PI/2;
        this.scale = 1;
        this.alpha = 1;
        this.state = 'attached';
    }

    pluck() {
        this.state = 'falling';
        this.velocity = {
            x: (Math.cos(this.angle) * 1.5) + (Math.random() - 0.5),
            y: -2.5,
            rot: (Math.random() - 0.5) * 0.08
        };
    }

    update() {
        if (this.state === 'falling') {
            this.velocity.y += 0.12;
            this.velocity.x *= 0.98;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.rotation += this.velocity.rot;
            this.scale = Math.max(0.85, this.scale * 0.995);
            
            if (this.y > canvas.height + 50) {
                this.alpha = Math.max(0, this.alpha - 0.015);
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.alpha;

        // Petal shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(15, -15, 25, -35, 0, -flowerConfig.petalLength);
        ctx.bezierCurveTo(-25, -35, -15, -15, 0, 0);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();

        // Petal vein
        ctx.strokeStyle = 'rgba(240, 240, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(10, -20, 0, -flowerConfig.petalLength + 5);
        ctx.stroke();

        ctx.restore();
    }
}

function initFlower() {
    petals = [];
    const angleStep = (Math.PI * 2) / flowerConfig.petalCount;
    for (let i = 0; i < flowerConfig.petalCount; i++) {
        petals.push(new Petal(angleStep * i, i % 2));
    }
    activePetals = flowerConfig.petalCount;
    resultShown = false;
    textContainer.style.color = '#4a4a4a';
}

function drawCenter() {
    // Small solid yellow center
    ctx.beginPath();
    ctx.fillStyle = '#FFD700';
    ctx.arc(flowerConfig.x, flowerConfig.y, flowerConfig.centerRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawStem() {
    // Stem only
    ctx.beginPath();
    ctx.moveTo(flowerConfig.x, flowerConfig.y + flowerConfig.centerRadius);
    ctx.quadraticCurveTo(
        flowerConfig.x + flowerConfig.stemCurve,
        flowerConfig.y + flowerConfig.stemHeight * 0.4,
        flowerConfig.x,
        flowerConfig.y + flowerConfig.stemHeight
    );
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#3CB371';
    ctx.stroke();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawStem();
    
    // Draw attached petals first
    petals.forEach(petal => {
        if (petal.state === 'attached') petal.draw();
    });

    drawCenter();

    // Draw falling petals
    petals.forEach(petal => {
        if (petal.state === 'falling') {
            petal.update();
            petal.draw();
        }
    });

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', () => {
    if (activePetals > 0 && !resultShown) {
        const nextPetal = petals.find(p => p.state === 'attached');
        if (nextPetal) {
            nextPetal.pluck();
            activePetals--;
            
            // Show text
            textContainer.textContent = phrases[nextPetal.phraseIndex];
            textContainer.style.opacity = '1';
            textContainer.style.transform = 'translateY(0)';
            setTimeout(() => {
                textContainer.style.opacity = '0';
                textContainer.style.transform = 'translateY(15px)';
            }, 800);

            // Final result
            if (activePetals === 0) {
                resultShown = true;
                setTimeout(() => {
                    textContainer.textContent = `${phrases[nextPetal.phraseIndex]}!`;
                    textContainer.style.opacity = '1';
                    textContainer.style.color = '#FF69B4';
                    textContainer.style.transform = 'scale(1.15)';
                    setTimeout(initFlower, 1500);
                }, 500);
            }
        }
    }
});

initFlower();
animate();