document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".slide");
    const totalSlides = slides.length;
    let currentSlide = 0;
    let isAnimating = false;

    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const currentNum = document.getElementById("current-num");
    const totalNum = document.getElementById("total-num");
    const dotsContainer = document.getElementById("nav-dots");

    totalNum.textContent = totalSlides;

    // Create nav dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("button");
        dot.className = "nav-dot" + (i === 0 ? " active" : "");
        dot.addEventListener("click", () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    const dots = dotsContainer.querySelectorAll(".nav-dot");

    // Initialize first slide
    slides[0].classList.add("active");

    // --- CORE NAVIGATION ---
    window.goToSlide = function(index) {
        if (isAnimating || index === currentSlide || index < 0 || index >= totalSlides) return;
        isAnimating = true;

        const direction = index > currentSlide ? "down" : "up";
        const oldSlide = slides[currentSlide];
        const newSlide = slides[index];

        // Exit old slide
        oldSlide.classList.remove("active");
        oldSlide.classList.add(direction === "down" ? "exit-up" : "exit-down");

        // Enter new slide
        newSlide.classList.remove("exit-up", "exit-down");
        newSlide.classList.add("active");

        currentSlide = index;
        updateUI();

        // Animate inner content
        const inner = newSlide.querySelector(".slide-inner");
        if (inner) {
            gsap.fromTo(inner, { y: direction === "down" ? 30 : -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.15, ease: "power2.out" });
        }

        setTimeout(() => {
            oldSlide.classList.remove("exit-up", "exit-down");
            isAnimating = false;
        }, 650);
    };

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    function updateUI() {
        currentNum.textContent = currentSlide + 1;
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
        dots.forEach((d, i) => d.classList.toggle("active", i === currentSlide));
    }

    // --- KEYBOARD NAVIGATION ---
    document.addEventListener("keydown", (e) => {
        switch(e.key) {
            case "ArrowDown": case "ArrowRight": case " ": case "Enter":
                e.preventDefault(); nextSlide(); break;
            case "ArrowUp": case "ArrowLeft": case "Backspace":
                e.preventDefault(); prevSlide(); break;
            case "Home": e.preventDefault(); goToSlide(0); break;
            case "End": e.preventDefault(); goToSlide(totalSlides - 1); break;
        }
    });

    // Button clicks
    nextBtn.addEventListener("click", nextSlide);
    prevBtn.addEventListener("click", prevSlide);

    // Mouse wheel
    let wheelTimeout = false;
    document.addEventListener("wheel", (e) => {
        if (wheelTimeout) return;
        wheelTimeout = true;
        if (e.deltaY > 0) nextSlide(); else prevSlide();
        setTimeout(() => { wheelTimeout = false; }, 800);
    }, { passive: true });

    // --- PARTICLE BACKGROUND ---
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");
    let W, H, particles = [];

    function initCanvas() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({ x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4, s: Math.random()*2+0.5 });
        }
    }
    function drawParticles() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "rgba(0,194,255,0.35)";
        ctx.strokeStyle = "rgba(0,194,255,0.08)";
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI*2); ctx.fill();
            for (let j = i+1; j < particles.length; j++) {
                const q = particles[j];
                const d = Math.hypot(p.x-q.x, p.y-q.y);
                if (d < 130) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
            }
        }
        requestAnimationFrame(drawParticles);
    }
    initCanvas(); drawParticles();
    window.addEventListener("resize", initCanvas);

    // --- DATA PACKETS (Slide 2) ---
    function spawnPacket(parentSel, sx, sy, ex, ey) {
        const svg = document.querySelector(parentSel);
        if (!svg) return;
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("r", "3.5"); c.setAttribute("fill", "#00C2FF"); c.setAttribute("class", "data-packet");
        svg.appendChild(c);
        gsap.fromTo(c, { attr: { cx: sx, cy: sy }, opacity: 1 }, {
            attr: { cx: ex, cy: ey }, duration: 1 + Math.random(), ease: "power1.inOut", opacity: 0,
            onComplete: () => { c.remove(); setTimeout(() => spawnPacket(parentSel, sx, sy, ex, ey), Math.random()*2000); }
        });
    }
    setTimeout(() => {
        spawnPacket("#data-packets", 200,175, 200,100);
        spawnPacket("#data-packets", 222,190, 310,160);
        spawnPacket("#data-packets", 215,220, 280,300);
        spawnPacket("#data-packets", 185,220, 125,300);
        spawnPacket("#data-packets", 175,200, 90,190);
    }, 500);

    // --- ARCHITECTURE OSD GRID ---
    const osdGrid = document.getElementById("osd-grid");
    if (osdGrid) {
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 8; c++) {
                const x = 80 + c * 95, y = 310 + r * 65;
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.setAttribute("class", "arch-el cursor-pointer");
                g.setAttribute("data-t", `OSD Node ${r*8+c+1}`);
                g.setAttribute("data-d", "Handles read/write ops. Replicates data to other OSDs via CRUSH.");
                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute("x", x); rect.setAttribute("y", y);
                rect.setAttribute("width", "60"); rect.setAttribute("height", "45"); rect.setAttribute("rx", "5");
                rect.setAttribute("fill", "#112B4D"); rect.setAttribute("stroke", "#22c55e"); rect.setAttribute("stroke-width", "2");
                g.appendChild(rect);
                // disk lines
                for (let d = 0; d < 2; d++) {
                    const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    ln.setAttribute("x1", x+8); ln.setAttribute("y1", y+12+d*18);
                    ln.setAttribute("x2", x+52); ln.setAttribute("y2", y+12+d*18);
                    ln.setAttribute("stroke", "#22c55e"); ln.setAttribute("stroke-width", "1.5");
                    g.appendChild(ln);
                }
                osdGrid.appendChild(g);
            }
        }
    }

    // Architecture tooltip
    const tooltip = document.getElementById("arch-tooltip");
    const ttTitle = document.getElementById("tooltip-title");
    const ttDesc = document.getElementById("tooltip-desc");
    const archBox = document.getElementById("arch-box");
    document.querySelectorAll(".arch-el").forEach(el => {
        el.addEventListener("mouseenter", () => {
            ttTitle.textContent = el.dataset.t;
            ttDesc.textContent = el.dataset.d;
            tooltip.style.opacity = "1";
            const r = el.querySelector("rect");
            if (r) r.classList.add("node-glow");
        });
        el.addEventListener("mousemove", (e) => {
            if (!archBox) return;
            const b = archBox.getBoundingClientRect();
            tooltip.style.left = (e.clientX - b.left) + "px";
            tooltip.style.top = (e.clientY - b.top - 70) + "px";
        });
        el.addEventListener("mouseleave", () => {
            tooltip.style.opacity = "0";
            const r = el.querySelector("rect");
            if (r) r.classList.remove("node-glow");
        });
    });

    // --- FEATURE ANIMATIONS ---
    // Scalability
    const scaleAnim = document.getElementById("scale-anim");
    if (scaleAnim) {
        setInterval(() => {
            const node = document.createElement("div");
            node.className = "absolute z-0";
            node.style.cssText = "width:28px;height:28px;background:rgba(0,194,255,0.4);border:1px solid #00C2FF;border-radius:4px;";
            scaleAnim.appendChild(node);
            const a = Math.random()*Math.PI*2, rad = 50+Math.random()*30;
            gsap.fromTo(node, { x:0, y:0, scale:0, opacity:1 }, { x:Math.cos(a)*rad, y:Math.sin(a)*rad, scale:1, opacity:0, duration:1.8, ease:"power2.out", onComplete:()=>node.remove() });
        }, 600);
    }

    // Fault tolerance
    const faultSvg = document.getElementById("fault-anim");
    const fNodes = [];
    if (faultSvg) {
        for (let r=0; r<2; r++) for (let c=0; c<4; c++) {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", 15+c*45); rect.setAttribute("y", 15+r*50);
            rect.setAttribute("width", "30"); rect.setAttribute("height", "30"); rect.setAttribute("rx", "4");
            rect.setAttribute("fill", "#22c55e");
            faultSvg.appendChild(rect);
            fNodes.push(rect);
        }
        setInterval(() => {
            const n = fNodes[Math.floor(Math.random()*fNodes.length)];
            n.classList.add("node-error");
            setTimeout(() => { n.classList.remove("node-error"); n.setAttribute("fill","#00C2FF"); setTimeout(()=>n.setAttribute("fill","#22c55e"),800); }, 1200);
        }, 2200);
    }

    // Mesh network
    const meshSvg = document.getElementById("mesh-anim");
    if (meshSvg) {
        const pts = [];
        for (let i=0; i<7; i++) {
            const x = 100+Math.cos(i*Math.PI*2/7)*55, y = 60+Math.sin(i*Math.PI*2/7)*40;
            pts.push({x,y});
            const c = document.createElementNS("http://www.w3.org/2000/svg","circle");
            c.setAttribute("cx",x); c.setAttribute("cy",y); c.setAttribute("r","5"); c.setAttribute("fill","#00C2FF");
            meshSvg.appendChild(c);
        }
        for (let i=0; i<pts.length; i++) for (let j=i+1; j<pts.length; j++) {
            if (Math.random()>0.35) {
                const ln = document.createElementNS("http://www.w3.org/2000/svg","line");
                ln.setAttribute("x1",pts[i].x); ln.setAttribute("y1",pts[i].y);
                ln.setAttribute("x2",pts[j].x); ln.setAttribute("y2",pts[j].y);
                ln.setAttribute("stroke","rgba(0,194,255,0.2)"); ln.setAttribute("stroke-width","1");
                meshSvg.insertBefore(ln, meshSvg.firstChild);
                gsap.to(ln, { attr:{"stroke-opacity":0.7}, duration:0.5+Math.random(), repeat:-1, yoyo:true, ease:"sine.inOut", delay:Math.random()*2 });
            }
        }
    }

    // Hero entrance
    gsap.from(".slide[data-index='0'] h1", { y:40, opacity:0, duration:0.8, delay:0.2, ease:"power3.out" });
    gsap.from(".slide[data-index='0'] p", { y:20, opacity:0, duration:0.8, delay:0.4, ease:"power3.out" });
    gsap.from(".slide[data-index='0'] button", { scale:0.8, opacity:0, duration:0.6, delay:0.6, ease:"back.out(1.7)" });
});
