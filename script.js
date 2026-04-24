document.addEventListener("DOMContentLoaded", () => {
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // --- 1. Global Navigation & Scroll ---
    const sections = document.querySelectorAll("section");
    const navDots = document.querySelectorAll(".nav-dots .dot");

    // Update nav dots on scroll
    sections.forEach((section, index) => {
        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onToggle: self => {
                if(self.isActive) {
                    navDots.forEach(dot => dot.classList.remove("active"));
                    if(navDots[index]) navDots[index].classList.add("active");
                }
            }
        });
    });

    // Smooth scroll for nav dots
    navDots.forEach(dot => {
        dot.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = dot.getAttribute("href");
            const targetSection = document.querySelector(targetId);
            if(targetSection) {
                targetSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    // --- 2. Particle Background (Hero & Conclusion) ---
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");
    
    let width, height;
    let particles = [];
    
    function initCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        for(let i=0; i<60; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }
    }
    
    function drawParticles() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgba(0, 194, 255, 0.4)";
        ctx.strokeStyle = "rgba(0, 194, 255, 0.1)";
        
        for(let i=0; i<particles.length; i++) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            
            if(p.x < 0 || p.x > width) p.vx *= -1;
            if(p.y < 0 || p.y > height) p.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            for(let j=i+1; j<particles.length; j++) {
                let p2 = particles[j];
                let dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
                if(dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(drawParticles);
    }
    
    initCanvas();
    drawParticles();
    window.addEventListener("resize", initCanvas);

    // --- 3. Hero Animations ---
    gsap.from(".hero-content h1", { y: 50, opacity: 0, duration: 1, delay: 0.2, ease: "power3.out" });
    gsap.from(".hero-content p", { y: 30, opacity: 0, duration: 1, delay: 0.4, ease: "power3.out" });
    gsap.from(".hero-content a", { scale: 0.8, opacity: 0, duration: 0.8, delay: 0.6, ease: "back.out(1.7)" });

    // --- 4. What is Ceph Animations ---
    gsap.from("#what-is-ceph .slide-text", {
        scrollTrigger: { trigger: "#what-is-ceph", start: "top 70%" },
        x: -50, opacity: 0, duration: 1
    });
    gsap.from("#what-is-ceph .slide-graphic", {
        scrollTrigger: { trigger: "#what-is-ceph", start: "top 70%" },
        x: 50, opacity: 0, duration: 1
    });

    // Animate basic data packets in slide 2
    function createBasicPacket(svgId, startX, startY, endX, endY) {
        const svg = document.querySelector(svgId);
        if(!svg) return;
        const packet = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        packet.setAttribute("r", "4");
        packet.setAttribute("fill", "#00C2FF");
        packet.setAttribute("class", "data-packet");
        svg.appendChild(packet);

        gsap.fromTo(packet, 
            { attr: { cx: startX, cy: startY }, opacity: 1 },
            { attr: { cx: endX, cy: endY }, duration: 1 + Math.random(), ease: "power1.inOut", opacity: 0,
              onComplete: () => {
                  packet.remove();
                  setTimeout(() => createBasicPacket(svgId, startX, startY, endX, endY), Math.random() * 2000);
              }
            }
        );
    }
    
    setTimeout(() => {
        createBasicPacket("#ceph-cluster-svg #data-packets", 250, 220, 250, 130);
        createBasicPacket("#ceph-cluster-svg #data-packets", 250, 220, 380, 200);
        createBasicPacket("#ceph-cluster-svg #data-packets", 250, 220, 350, 360);
        createBasicPacket("#ceph-cluster-svg #data-packets", 250, 220, 210, 380);
        createBasicPacket("#ceph-cluster-svg #data-packets", 250, 220, 120, 280);
    }, 1000);

    // --- 5. Canonical Ceph Cards ---
    gsap.from(".canonical-card", {
        scrollTrigger: { trigger: "#canonical-ceph", start: "top 70%" },
        y: 50, opacity: 0, duration: 0.8, stagger: 0.2
    });

    // --- 6. Interactive Architecture (MOST IMPORTANT) ---
    const osdGrid = document.getElementById("osd-grid");
    const osdCols = 8;
    const osdRows = 2;
    const startX = 150;
    const startY = 380;
    const spacingX = 90;
    const spacingY = 70;

    for(let r=0; r<osdRows; r++) {
        for(let c=0; c<osdCols; c++) {
            const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            group.setAttribute("class", "arch-element cursor-pointer ceph-node");
            group.setAttribute("data-title", `OSD Node ${r*osdCols + c + 1}`);
            group.setAttribute("data-desc", "Handles read/write operations and replicates data directly to other OSDs.");
            
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", startX + c*spacingX);
            rect.setAttribute("y", startY + r*spacingY);
            rect.setAttribute("width", "60");
            rect.setAttribute("height", "50");
            rect.setAttribute("rx", "5");
            rect.setAttribute("fill", "#112B4D");
            rect.setAttribute("stroke", "#22c55e");
            rect.setAttribute("stroke-width", "2");

            const disk1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            disk1.setAttribute("x1", startX + c*spacingX + 10);
            disk1.setAttribute("y1", startY + r*spacingY + 15);
            disk1.setAttribute("x2", startX + c*spacingX + 50);
            disk1.setAttribute("y2", startY + r*spacingY + 15);
            disk1.setAttribute("stroke", "#22c55e");
            disk1.setAttribute("stroke-width", "2");

            const disk2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            disk2.setAttribute("x1", startX + c*spacingX + 10);
            disk2.setAttribute("y1", startY + r*spacingY + 35);
            disk2.setAttribute("x2", startX + c*spacingX + 50);
            disk2.setAttribute("y2", startY + r*spacingY + 35);
            disk2.setAttribute("stroke", "#22c55e");
            disk2.setAttribute("stroke-width", "2");

            group.appendChild(rect);
            group.appendChild(disk1);
            group.appendChild(disk2);
            if(osdGrid) osdGrid.appendChild(group);
        }
    }

    // Tooltip Logic
    const tooltip = document.getElementById("arch-tooltip");
    const tooltipTitle = document.getElementById("tooltip-title");
    const tooltipDesc = document.getElementById("tooltip-desc");
    const archContainer = document.querySelector(".arch-container");
    const svgElements = document.querySelectorAll(".arch-element");

    if (tooltip && archContainer) {
        svgElements.forEach(el => {
            el.addEventListener("mouseenter", (e) => {
                const title = el.getAttribute("data-title");
                const desc = el.getAttribute("data-desc");
                tooltipTitle.textContent = title;
                tooltipDesc.textContent = desc;
                tooltip.style.opacity = "1";
                
                const rect = el.querySelector("rect");
                if(rect) rect.classList.add("node-glow");
            });

            el.addEventListener("mousemove", (e) => {
                const rect = archContainer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                tooltip.style.left = `${x}px`;
                tooltip.style.top = `${y}px`;
            });

            el.addEventListener("mouseleave", () => {
                tooltip.style.opacity = "0";
                const rect = el.querySelector("rect");
                if(rect) rect.classList.remove("node-glow");
            });
        });
    }

    // --- 7. Features Animations ---
    gsap.from(".feature-item", {
        scrollTrigger: { trigger: "#features", start: "top 70%" },
        y: 40, opacity: 0, duration: 0.8, stagger: 0.2
    });

    // Feature 1: Scalability
    const scaleAnim = document.getElementById("scale-anim");
    if (scaleAnim) {
        setInterval(() => {
            const node = document.createElement("div");
            node.className = "w-8 h-8 bg-brand-accent/50 rounded border border-brand-accent absolute z-0";
            scaleAnim.appendChild(node);
            
            const angle = Math.random() * Math.PI * 2;
            const radius = 60 + Math.random() * 40;
            const tx = Math.cos(angle) * radius;
            const ty = Math.sin(angle) * radius;

            gsap.fromTo(node, 
                { x: 0, y: 0, scale: 0, opacity: 1 },
                { x: tx, y: ty, scale: 1, opacity: 0, duration: 2, ease: "power2.out", onComplete: () => node.remove() }
            );
        }, 500);
    }

    // Feature 2: Fault Tolerance
    const faultAnim = document.getElementById("fault-anim");
    const fNodes = [];
    if (faultAnim) {
        for(let r=0; r<3; r++) {
            for(let c=0; c<4; c++) {
                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute("x", 20 + c*45);
                rect.setAttribute("y", 20 + r*40);
                rect.setAttribute("width", "25");
                rect.setAttribute("height", "25");
                rect.setAttribute("rx", "3");
                rect.setAttribute("fill", "#22c55e");
                faultAnim.appendChild(rect);
                fNodes.push(rect);
            }
        }

        function simulateFailure() {
            if(fNodes.length === 0) return;
            const idx = Math.floor(Math.random() * fNodes.length);
            const node = fNodes[idx];
            
            node.classList.add("node-error");
            
            setTimeout(() => {
                node.classList.remove("node-error");
                node.setAttribute("fill", "#00C2FF"); // Rebuilding
                
                setTimeout(() => {
                    node.setAttribute("fill", "#22c55e"); // Healthy
                }, 1000);
            }, 1500);
        }
        setInterval(simulateFailure, 2500);
    }

    // Feature 3: Mesh Network
    const meshAnim = document.getElementById("mesh-anim");
    const mNodes = [];
    if (meshAnim) {
        for(let i=0; i<8; i++) {
            const x = 100 + Math.cos(i * Math.PI/4) * 60;
            const y = 75 + Math.sin(i * Math.PI/4) * 50;
            mNodes.push({x, y});
            
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", "6");
            circle.setAttribute("fill", "#00C2FF");
            meshAnim.appendChild(circle);
        }
        
        for(let i=0; i<mNodes.length; i++) {
            for(let j=i+1; j<mNodes.length; j++) {
                if(Math.random() > 0.3) {
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute("x1", mNodes[i].x);
                    line.setAttribute("y1", mNodes[i].y);
                    line.setAttribute("x2", mNodes[j].x);
                    line.setAttribute("y2", mNodes[j].y);
                    line.setAttribute("stroke", "rgba(0,194,255,0.2)");
                    line.setAttribute("stroke-width", "1");
                    meshAnim.insertBefore(line, meshAnim.firstChild);
                    
                    gsap.to(line, {
                        strokeOpacity: 0.8,
                        duration: 0.5 + Math.random(),
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        delay: Math.random() * 2
                    });
                }
            }
        }
    }

    // --- 8. Use Cases Horizontal Scroll ---
    const useCasesScroll = document.getElementById("use-cases-scroll");
    if (useCasesScroll) {
        useCasesScroll.addEventListener('wheel', (e) => {
            if(e.deltaY !== 0 && !e.shiftKey) {
                e.preventDefault();
                useCasesScroll.scrollBy({
                    left: e.deltaY * 2,
                    behavior: 'smooth'
                });
            }
        }, { passive: false });
    }
});
