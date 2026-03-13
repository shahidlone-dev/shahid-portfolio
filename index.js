/* ════════════════════════════════

1. CINEMATIC HERO REVEAL
   ════════════════════════════════ */

const loader = document.getElementById('loader')
const curtainTop = document.getElementById('curtain-top')
const curtainBot = document.getElementById('curtain-bot')

function launchReveal(){

loader.style.transition = 'opacity .4s ease'
loader.style.opacity = '0'

setTimeout(()=>{
loader.style.display = 'none'
},420)

setTimeout(()=>{
if(curtainTop) curtainTop.classList.add('open')
if(curtainBot) curtainBot.classList.add('open')
},200)

setTimeout(()=>{
document.querySelectorAll('#hero .fu, #hero .cr')
.forEach(el => el.classList.add('in'))
},480)

setTimeout(()=>{
if(curtainTop) curtainTop.remove()
if(curtainBot) curtainBot.remove()
},1400)

}

if(document.fonts){
document.fonts.ready.then(()=>setTimeout(launchReveal,900))
}else{
setTimeout(launchReveal,1100)
}

/* ════════════════════════════════
2. WEBGL FILM GRAIN
════════════════════════════════ */

(function initGrain(){

const canvas = document.getElementById('grain-canvas')

if(!canvas) return

const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

if(!gl){
canvas.remove()
return
}

function resize(){
canvas.width = window.innerWidth
canvas.height = window.innerHeight
gl.viewport(0,0,canvas.width,canvas.height)
}

resize()
window.addEventListener('resize',resize)

const vs = gl.createShader(gl.VERTEX_SHADER)

gl.shaderSource(vs,"attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos,0,1); }")

gl.compileShader(vs)

const fs = gl.createShader(gl.FRAGMENT_SHADER)

gl.shaderSource(fs,`
precision mediump float;

uniform float u_time;
uniform vec2 u_res;

float hash(vec2 p){
p = fract(p * vec2(234.34,435.345));
p += dot(p,p+34.23);
return fract(p.x*p.y);
}

void main(){

vec2 uv = gl_FragCoord.xy / u_res;

float grain = hash(uv + fract(u_time * 0.07));

float v = grain * 0.06;

gl_FragColor = vec4(v,v,v,grain * 0.18);

}
`)

gl.compileShader(fs)

const prog = gl.createProgram()

gl.attachShader(prog,vs)
gl.attachShader(prog,fs)

gl.linkProgram(prog)

gl.useProgram(prog)

const buf = gl.createBuffer()

gl.bindBuffer(gl.ARRAY_BUFFER,buf)

gl.bufferData(
gl.ARRAY_BUFFER,
new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),
gl.STATIC_DRAW
)

const aPos = gl.getAttribLocation(prog,'a_pos')

gl.enableVertexAttribArray(aPos)

gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0)

const uTime = gl.getUniformLocation(prog,'u_time')
const uRes = gl.getUniformLocation(prog,'u_res')

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)

let t = 0

function render(){

t += 1

gl.uniform1f(uTime,t)
gl.uniform2f(uRes,canvas.width,canvas.height)

gl.drawArrays(gl.TRIANGLES,0,6)

requestAnimationFrame(render)

}

render()

})()

/* ════════════════════════════════
3. SCROLL VELOCITY DISTORTION
════════════════════════════════ */

(function initScrollDistort(){

let lastScroll = window.scrollY
let velocity = 0
let rafId

const moImages = document.querySelectorAll('.mo img')

function applyDistort(){

const current = window.scrollY
const raw = current - lastScroll

lastScroll = current

velocity += (raw - velocity) * 0.25

const clamp = Math.max(-18,Math.min(18,velocity))

const skewY = clamp * 0.18
const scaleY = 1 + Math.abs(clamp) * 0.003

moImages.forEach(img=>{
img.style.transform = "skewY(${skewY}deg) scaleY(${scaleY})"
})

rafId = requestAnimationFrame(applyDistort)

}

applyDistort()

document.addEventListener('visibilitychange',()=>{

if(document.hidden){
cancelAnimationFrame(rafId)
}else{
applyDistort()
}

})

})()

/* ════════════════════════════════
CURSOR
════════════════════════════════ */

const dot = document.getElementById('c-dot')
const ring = document.getElementById('c-ring')

let mx = 0
let my = 0
let rx = 0
let ry = 0

document.addEventListener('mousemove',e=>{

mx = e.clientX
my = e.clientY

if(dot){
dot.style.left = mx + 'px'
dot.style.top = my + 'px'
}

})

function cursorLoop(){

rx += (mx - rx) * 0.1
ry += (my - ry) * 0.1

if(ring){
ring.style.left = rx + 'px'
ring.style.top = ry + 'px'
}

requestAnimationFrame(cursorLoop)

}

cursorLoop()

document.querySelectorAll('a,.sk,.mo,.mag-btn').forEach(el=>{

el.addEventListener('mouseenter',()=>{

if(dot){
dot.style.width='12px'
dot.style.height='12px'
}

if(ring){
ring.style.width='46px'
ring.style.height='46px'
ring.style.borderColor='rgba(240,235,226,.5)'
}

})

el.addEventListener('mouseleave',()=>{

if(dot){
dot.style.width='5px'
dot.style.height='5px'
}

if(ring){
ring.style.width='28px'
ring.style.height='28px'
ring.style.borderColor='rgba(240,235,226,.28)'
}

})

})

/* ════════════════════════════════
MAGNETIC BUTTONS
════════════════════════════════ */

document.querySelectorAll('.mag-btn').forEach(btn=>{

const inner = btn.querySelector('.mag-btn-inner')

btn.addEventListener('mousemove',e=>{

const r = btn.getBoundingClientRect()

const dx = e.clientX - (r.left + r.width/2)
const dy = e.clientY - (r.top + r.height/2)

inner.style.transform = "translate(${dx*.28}px, ${dy*.28}px)"

})

btn.addEventListener('mouseleave',()=>{

inner.style.transform='translate(0,0)'

})

})

/* ════════════════════════════════
SCROLL PROGRESS
════════════════════════════════ */

const prog = document.getElementById('prog')

window.addEventListener('scroll',()=>{

const pct = window.scrollY / (document.documentElement.scrollHeight - innerHeight) * 100

if(prog) prog.style.width = pct + '%'

},{passive:true})

/* ════════════════════════════════
NAV HIDE
════════════════════════════════ */

let lastY = 0

const topNav = document.getElementById('top-nav')

window.addEventListener('scroll',()=>{

const y = window.scrollY

if(topNav){
topNav.style.transform =
(y > 70 && y > lastY) ? 'translateY(-110%)' : 'translateY(0)'
}

lastY = y

},{passive:true})

/* ════════════════════════════════
SCROLL REVEAL
════════════════════════════════ */

const io = new IntersectionObserver(entries=>{

entries.forEach(e=>{
if(e.isIntersecting) e.target.classList.add('in')
})

},{threshold:0.08})

document.querySelectorAll('.fu,.cr').forEach(el=>io.observe(el))

/* ════════════════════════════════
SECTION INDICATOR
════════════════════════════════ */

const sections = ['hero','projects','stack','moments','contact']

const snItems = document.querySelectorAll('.sn-item')

const secObs = new IntersectionObserver(entries=>{

entries.forEach(e=>{

if(e.isIntersecting){

snItems.forEach(item=>{
item.classList.toggle(
'active',
item.dataset.sec === e.target.id
)
})

}

})

},{threshold:0.35})

sections.forEach(id=>{

const el = document.getElementById(id)

if(el) secObs.observe(el)

})

snItems.forEach(item=>{

item.addEventListener('click',()=>{

const el = document.getElementById(item.dataset.sec)

if(el) el.scrollIntoView({behavior:'smooth'})

})

})

/* ════════════════════════════════
HERO GHOST PARALLAX
════════════════════════════════ */

const ghost = document.querySelector('.hero-ghost')

document.addEventListener('mousemove',e=>{

if(!ghost) return

const x = (e.clientX / window.innerWidth - 0.5) * 38
const y = (e.clientY / window.innerHeight - 0.5) * 38

ghost.style.transform = "translate(${x}px, ${y}px)"

})

/* ════════════════════════════════
PROJECT PREVIEW
════════════════════════════════ */

const preview = document.getElementById('proj-preview')
const ppImg = document.getElementById('pp-img')
const ppLabel = document.getElementById('pp-label')

document.querySelectorAll('.proj-row').forEach(row=>{

row.addEventListener('mouseenter',()=>{

const src = row.dataset.preview

if(src && ppImg) ppImg.src = src

if(ppLabel) ppLabel.textContent = row.dataset.name || ''

if(preview) preview.classList.add('show')

})

row.addEventListener('mouseleave',()=>{

if(preview) preview.classList.remove('show')

})

row.addEventListener('mousemove',e=>{

if(!preview) return

const x = e.clientX + 28
const y = e.clientY - 80

const maxX = window.innerWidth - preview.offsetWidth - 20
const maxY = window.innerHeight - preview.offsetHeight - 20

preview.style.left = Math.min(x,maxX) + 'px'
preview.style.top = Math.max(20,Math.min(y,maxY)) + 'px'

})

})

/* ════════════════════════════════
CLOCK
════════════════════════════════ */

const ft = document.getElementById('f-time')

function tick(){

if(!ft) return

const n = new Date()

ft.textContent =
"${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')} IST"

}

setInterval(tick,1000)
tick()