'use strict';
/* =====================================================================
   PROJETO MIAU: loja virtual (TCC). Tudo em HTML, CSS e JavaScript puro.
   Organização deste arquivo:
   1. Configuração   2. Dados (produtos e estampas)   3. Carrinho
   4. Painel lateral 5. Modelo 3D   6. Telas (loja, produto, carrinho,
   checkout, pedido)  7. Gatinho animado  8. Rotas (navegação por #)
   ===================================================================== */

/* ---------- 1. CONFIGURAÇÃO (troque aqui) ---------- */
const CONFIG = {
  whatsapp: '5551996480855',
  chavePix: 'COLOQUE-A-CHAVE-PIX-AQUI',   // chave Pix real do Projeto Miau
  nomePix: 'PROJETO MIAU',
  cidadePix: 'PORTO ALEGRE',
  freteEntrega: 10                          // valor fixo da entrega (retirada é grátis)
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const R = n => 'R$ ' + n.toFixed(2).replace('.', ',');
const ls = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } }
};

/* ---------- 2. DADOS ---------- */
const COR = {
  preto: ['Preto', '#1F1F23'], rosa: ['Rosa', '#F58FB1'], branco: ['Branco', '#FAFAFA'],
  azul: ['Azul', '#6FA8E8'], verde: ['Verde', '#7FCF9A'], amarelo: ['Amarelo', '#F6DD6E'], cinza: ['Cinza', '#B8B8BE']
};

/* Produtos. "cores" com ":200" = só existe no tamanho 200ml.
   "modelo" = arquivo .glb na pasta modelos/ (se não existir, usa o modelo gerado por código).
   "foto" = foto do produto (opcional). "promo" = "leve N por X". */
const PRODUTOS = [
  { id: 'bottons', foto: 'assets/produtos/bottons.png', nome: 'Bottons', preco: 8, est: 1, forma: 'botton', modelo: 'modelos/botton.glb', promo: { n: 2, preco: 12 }, desc: 'Para colecionar! Escolha a estampa.' },
  {
    id: 'canecas', foto: 'assets/produtos/canecas.png', nome: 'Canecas', nomeItem: 'Caneca', forma: 'caneca', modelo: 'modelos/caneca.glb', est: 1, corPadrao: 'branco',
    tam: [{ id: '300', nome: '300ml', preco: 35 }, { id: '200', nome: '200ml', preco: 25 }],
    cores: ['preto', 'rosa', 'branco', 'azul:200', 'verde:200', 'amarelo:200'],
    desc: 'Monte a sua caneca do seu jeito: escolha o tamanho, a cor e a estampa.'
  },
  { id: 'xicara', nome: 'Xícara 200ml', preco: 25, est: 1, forma: 'xicara', modelo: 'modelos/xicara.glb', cores: ['preto', 'rosa', 'verde'], desc: 'Xícara com a estampa que você escolher.' },
  { id: 'copo', gato: true, nome: 'Copo térmico', preco: 50, est: 1, forma: 'copo', modelo: 'modelos/copo.glb', cores: ['rosa'], desc: 'Mesmo processo de estampa das canecas.', nota: 'Cor rosa em pronta entrega. Outras cores sob encomenda.' },
  { id: 'ecobag', nome: 'Ecobag', preco: 30, est: 1, forma: 'ecobag', modelo: 'modelos/ecobag.glb', desc: 'Estampa em DTF têxtil, com qualidade e durabilidade.' },
  { id: 'canetas', nome: 'Canetas', preco: 10, modelo: 'modelos/caneta.glb', desc: 'Caneta com patinha.' },
  { id: 'chaveiros', nome: 'Chaveiros', preco: 15, modelo: 'modelos/chaveiro.glb', desc: 'Feito em impressão 3D + pingente de biscuit.' },
  { id: 'marcapaginas', nome: 'Marca páginas', preco: 5, modelo: 'modelos/marcapaginas.glb', cores: ['branco', 'cinza', 'preto'], desc: 'Feito em impressão 3D.', nota: 'Parceria com @siegward3d.' },
  { id: 'kickers', nome: 'Kickers', preco: 25, esgotado: true, desc: 'Brinquedo recheado de catnip.', nota: 'Parceria com @sosgatinhosesfeio.' }
];

/* Estampas. Aqui estão 6 desenhos de teste. Para usar as estampas reais, troque cada item por:
   { nome: 'Mãe de gato', src: 'assets/estampas/mae-de-gato.png' }  (PNG com fundo transparente) */
function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, 7); }
function gatinho(c, x, y, r, cor, olho) {
  c.fillStyle = cor; circ(c, x, y, r); c.fill();
  c.beginPath(); c.moveTo(x - r * .95, y - r * .2); c.lineTo(x - r * .8, y - r * 1.45); c.lineTo(x - r * .05, y - r * .85); c.fill();
  c.beginPath(); c.moveTo(x + r * .95, y - r * .2); c.lineTo(x + r * .8, y - r * 1.45); c.lineTo(x + r * .05, y - r * .85); c.fill();
  if (olho) { c.fillStyle = olho; circ(c, x - r * .38, y, r * .16); c.fill(); circ(c, x + r * .38, y, r * .16); c.fill(); }
}
function coracao(c, x, y, s) {
  c.beginPath(); c.moveTo(x, y + s * .9);
  c.bezierCurveTo(x - s * 1.4, y - s * .1, x - s * .7, y - s * 1.1, x, y - s * .45);
  c.bezierCurveTo(x + s * .7, y - s * 1.1, x + s * 1.4, y - s * .1, x, y + s * .9); c.closePath();
}
function pata(c, x, y, r, cor) {
  c.fillStyle = cor; c.beginPath(); c.ellipse(x, y + r * .35, r * .9, r * .7, 0, 0, 7); c.fill();
  [[-1, -.2], [-.4, -.85], [.4, -.85], [1, -.2]].forEach(p => { circ(c, x + p[0] * r * .9, y + p[1] * r * .9, r * .34); c.fill(); });
}
function texto(c, t, x, y, tam, cor) { c.font = '700 ' + tam + 'px Fredoka, Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = cor; c.fillText(t, x, y); }
const ESTAMPAS = [
  { nome: 'Projeto Miau', draw(c, s) { c.fillStyle = '#F9EFC7'; circ(c, s / 2, s / 2, s * .47); c.fill(); c.lineWidth = s * .02; c.strokeStyle = '#2B2B2B'; c.stroke(); gatinho(c, s / 2, s * .53, s * .2, '#2B2B2B', '#F9EFC7'); texto(c, 'PROJETO MIAU', s / 2, s * .2, s * .07, '#2B2B2B'); texto(c, 'PROTEÇÃO ANIMAL', s / 2, s * .83, s * .05, '#2B2B2B'); } },
  { nome: 'Adopt, don’t shop', draw(c, s) { c.fillStyle = '#FFFFFF'; circ(c, s / 2, s / 2, s * .47); c.fill(); c.lineWidth = s * .02; c.strokeStyle = '#2B2B2B'; c.stroke(); coracao(c, s / 2, s * .52, s * .25); c.fillStyle = '#FF8FB1'; c.fill(); c.lineWidth = s * .015; c.stroke(); pata(c, s / 2, s * .5, s * .07, '#FFFFFF'); texto(c, 'ADOPT, DON’T SHOP', s / 2, s * .2, s * .06, '#2B2B2B'); texto(c, '@projetomiau_poa', s / 2, s * .84, s * .04, '#2B2B2B'); } },
  { nome: 'Mãe de gato', draw(c, s, ink) { coracao(c, s / 2, s * .5, s * .36); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = s * .035; c.strokeStyle = ink; c.stroke(); texto(c, 'Mãe', s / 2, s * .4, s * .15, '#F08CC4'); texto(c, 'de', s / 2, s * .54, s * .08, '#F08CC4'); texto(c, 'GATO', s / 2, s * .65, s * .15, '#4A8FE0'); } },
  { nome: 'Lua e gato', draw(c, s, ink) { c.fillStyle = ink; circ(c, s * .5, s * .5, s * .4); c.fill(); c.globalCompositeOperation = 'destination-out'; circ(c, s * .64, s * .42, s * .34); c.fill(); c.globalCompositeOperation = 'source-over'; gatinho(c, s * .38, s * .72, s * .08, ink, null); } },
  { nome: 'Patinha', draw(c, s) { c.fillStyle = '#FF8FB1'; circ(c, s / 2, s / 2, s * .47); c.fill(); pata(c, s / 2, s * .5, s * .2, '#FFFFFF'); } },
  { nome: 'Mother of feral cats', draw(c, s, ink) { gatinho(c, s / 2, s * .2, s * .08, ink, null); texto(c, 'MOTHER', s / 2, s * .38, s * .15, ink); texto(c, 'OF', s / 2, s * .53, s * .1, ink); texto(c, 'FERAL', s / 2, s * .68, s * .15, ink); texto(c, 'CATS', s / 2, s * .83, s * .15, ink); } }
];
function desenhar(cv, i, ink, cb) {
  const c = cv.getContext('2d'), e = ESTAMPAS[i]; c.clearRect(0, 0, cv.width, cv.height);
  if (e.src) { const im = new Image(); im.onload = () => { c.drawImage(im, 0, 0, cv.width, cv.height); if (cb) cb(); }; im.src = e.src; }
  else { e.draw(c, cv.width, ink || '#2B2B2B'); if (cb) cb(); }
}
const cacheMiniatura = {};
function miniEst(i) { // imagem pequena da estampa (para cards, carrinho e botões)
  const e = ESTAMPAS[i]; if (e.src) return e.src;
  if (!cacheMiniatura[i]) { const cv = document.createElement('canvas'); cv.width = cv.height = 120; desenhar(cv, i, '#2B2B2B'); cacheMiniatura[i] = cv.toDataURL(); }
  return cacheMiniatura[i];
}

const prod = id => PRODUTOS.find(p => p.id === id);
const temOpcoes = p => !!(p.tam || p.est || (p.cores && p.cores.length > 1));
const listaCores = p => (p.cores || []).map(s => { const [id, so] = s.split(':'); return { id, nome: COR[id][0], hex: COR[id][1], so }; });
const precoUn = (p, tam) => p.tam ? p.tam.find(t => t.id === tam).preco : p.preco;
const precoTxt = p => p.tam ? 'a partir de ' + R(Math.min(...p.tam.map(t => t.preco))) : R(p.preco) + (p.promo ? ' (2 por ' + R(p.promo.preco) + ')' : '');
const miniProd = (p, n = 0) => p.foto || (p.est ? miniEst((n + 4) % ESTAMPAS.length) : miniEst(4));

/* ---------- 3. CARRINHO (salvo no navegador com localStorage) ---------- */
let cart = ls.get('miau-carrinho', []);
function salvar() { ls.set('miau-carrinho', cart); $('#cont').textContent = cart.reduce((a, i) => a + i.qtd, 0); }
function nomeItem(i) { const p = prod(i.id); return (p.nomeItem || p.nome) + (i.tam ? ' ' + p.tam.find(t => t.id === i.tam).nome : ''); }
function descItem(i) { return [i.cor && COR[i.cor][0], i.est !== null && ESTAMPAS[i.est].nome].filter(Boolean).join(', '); }
function miniItem(i) { return i.est !== null ? miniEst(i.est) : miniProd(prod(i.id)); }
function adicionar(novo) {
  const k = [novo.id, novo.tam, novo.cor, novo.est].join('|'), ex = cart.find(i => i.k === k);
  if (ex) ex.qtd += novo.qtd; else cart.push({ ...novo, k });
  salvar(); return cart.find(i => i.k === k);
}
function calcular() { // subtotal, desconto das promoções (ex.: 2 bottons por R$ 12) e total
  let sub = 0, desc = 0; const q = {};
  cart.forEach(i => { sub += i.un * i.qtd; q[i.id] = (q[i.id] || 0) + i.qtd; });
  for (const id in q) { const p = prod(id); if (p.promo) desc += Math.floor(q[id] / p.promo.n) * (p.promo.n * p.preco - p.promo.preco); }
  return { sub, desc, total: sub - desc, qtd: cart.reduce((a, i) => a + i.qtd, 0) };
}

/* ---------- 4. PAINEL LATERAL "Adicionado ao carrinho" ---------- */
const sugestoes = (exceto, n) => PRODUTOS.filter(p => p.id !== exceto && !p.esgotado).slice(0, n)
  .map(p => `<a class="mini" href="#produto-${p.id}" data-fechar><img src="${miniProd(p)}" alt=""><span>${p.nome}</span><b>${precoTxt(p)}</b></a>`).join('');
let focoAntes = null;
function abrirGaveta(item, qtdAdd) {
  const c = calcular();
  $('#gaveta-c').innerHTML = `
    <div class="g-topo"><img src="${miniItem(item)}" alt=""><div><strong>Adicionado ao carrinho</strong>
      <p>${nomeItem(item)}</p><p class="mut">${descItem(item)}${descItem(item) ? ', ' : ''}${qtdAdd} ${qtdAdd > 1 ? 'unidades' : 'unidade'}</p></div></div>
    <p class="g-tot">Seu carrinho: ${c.qtd} ${c.qtd > 1 ? 'itens' : 'item'}, ${R(c.total)}</p>
    <div class="g-sug"><h3>Você também pode gostar</h3>${sugestoes(item.id, 3)}</div>
    <div class="g-bt"><a class="btn" href="#carrinho" data-fechar>Ir para o carrinho</a><button class="btn sec" data-fechar>Continuar comprando</button></div>`;
  focoAntes = document.activeElement; document.body.classList.add('g-aberta'); $('#gaveta').setAttribute('aria-hidden', 'false');
  $('.fechar').focus();
}
function fecharGaveta() {
  if (!document.body.classList.contains('g-aberta')) return;
  document.body.classList.remove('g-aberta'); $('#gaveta').setAttribute('aria-hidden', 'true');
  if (focoAntes && focoAntes.focus) focoAntes.focus();
}

/* ---------- 5. MODELO 3D (Three.js) ----------
   Tenta carregar o seu .glb (p.modelo). Se o arquivo não existir, monta um modelo simples por código.
   No .glb, o material "corpo" muda de cor e o material "estampa" recebe a imagem da estampa. */
function criarViewer(palco, p) {
  let rend;
  try { rend = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
  catch (e) { palco.insertAdjacentHTML('afterbegin', '<p style="padding:24px">Seu navegador não conseguiu abrir o modelo 3D (WebGL).</p>'); return { set() { }, dispose() { } }; }
  rend.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  rend.shadowMap.enabled = true; rend.shadowMap.type = THREE.PCFSoftShadowMap;
  rend.outputEncoding = THREE.sRGBEncoding; rend.toneMapping = THREE.ACESFilmicToneMapping; rend.toneMappingExposure = 1.05;
  palco.prepend(rend.domElement);
  const cena = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, .1, 60);

  // Ambiente de estúdio (dá o brilho de cerâmica)
  const ec = document.createElement('canvas'); ec.width = 1024; ec.height = 512; const e = ec.getContext('2d');
  const g = e.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#fff'); g.addColorStop(.55, '#dcd0d6'); g.addColorStop(1, '#7d6b75');
  e.fillStyle = g; e.fillRect(0, 0, 1024, 512); e.fillStyle = '#fff'; e.fillRect(140, 110, 180, 210); e.fillRect(600, 90, 280, 160);
  const et = new THREE.CanvasTexture(ec); et.mapping = THREE.EquirectangularReflectionMapping; et.encoding = THREE.sRGBEncoding;
  cena.environment = new THREE.PMREMGenerator(rend).fromEquirectangular(et).texture;
  cena.add(new THREE.HemisphereLight(0xffffff, 0xf3c6d4, .35));
  const luz = new THREE.DirectionalLight(0xffffff, 1.1); luz.position.set(3, 6, 4); luz.castShadow = true;
  luz.shadow.mapSize.set(2048, 2048); luz.shadow.radius = 5; luz.shadow.bias = -.0004;
  Object.assign(luz.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: 1, far: 18 }); luz.shadow.camera.updateProjectionMatrix(); cena.add(luz);
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.ShadowMaterial({ opacity: .22 }));
  chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);

  const pivo = new THREE.Group(), obj = new THREE.Group(); cena.add(pivo); pivo.add(obj); pivo.rotation.y = -.55;
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xfafafa, roughness: .2, clearcoat: 1, clearcoatRoughness: .06 });
  const cv = document.createElement('canvas'); cv.width = cv.height = 1024;
  const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = rend.capabilities.getMaxAnisotropy();
  const matEst = new THREE.MeshPhysicalMaterial({ map: tex, transparent: true, roughness: .3, clearcoat: 1, clearcoatRoughness: .1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  let H = 2, glb = false, corpos = [], estampas = [], estado = null, esc = 1, alvo = 1, dist = 8.6, elev = .3, auto = true, tAuto, viva = true, arrasta = false, lx = 0, ly = 0;

  function caneca(f) { // caneca, xícara e copo: peça de revolução (torno) + alça + estampa curva
    const P = { caneca: { r: 1, h: 1.9, al: .46, tb: .1, ay: .5 }, xicara: { r: 1.1, h: 1.25, al: .3, tb: .08, ay: .55 }, copo: { r: .85, h: 2.1 } }[f];
    const pf = [], a = (k, y) => pf.push(new THREE.Vector2(P.r * k, y)), h = P.h;
    a(.001, 0); a(.7, 0); a(.85, .01); a(.95, .05); a(.99, .12); a(1, .2); a(1, h - .1); a(.995, h - .04); a(.98, h - .005); a(.955, h + .01); a(.93, h - .005); a(.915, h - .04); a(.91, h - .1); a(.91, .2); a(.89, .13); a(.5, .1); a(.001, .1);
    if (f === 'copo') { mat.metalness = .5; mat.roughness = .3; }
    const corpo = new THREE.Mesh(new THREE.LatheGeometry(pf, 96), mat); corpo.castShadow = corpo.receiveShadow = true; obj.add(corpo);
    if (P.al) { const al = new THREE.Mesh(new THREE.TorusGeometry(P.al, P.tb, 24, 48, Math.PI), mat); al.rotation.z = -Math.PI / 2; al.scale.x = 1.15; al.position.set(P.r * .97, h * P.ay, 0); al.castShadow = true; obj.add(al); }
    const L = Math.min(1.3 * P.r, h * .68), tl = L / (P.r * 1.004);
    const est = new THREE.Mesh(new THREE.CylinderGeometry(P.r * 1.004, P.r * 1.004, L, 72, 1, true, -tl / 2, tl), matEst); est.position.y = h * .52; obj.add(est);
    H = h + .02;
  }
  function botton() {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, .14, 64), new THREE.MeshPhysicalMaterial({ color: 0xc9ccd2, metalness: .9, roughness: .3 }));
    d.rotation.x = Math.PI / 2; d.position.y = 1.2; d.castShadow = true; obj.add(d);
    const s = new THREE.Mesh(new THREE.CircleGeometry(1.12, 64), matEst); s.position.set(0, 1.2, .075); obj.add(s); H = 2.4;
  }
  function ecobag() {
    const tec = new THREE.MeshStandardMaterial({ color: 0xE9D9BD, roughness: .95 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.5, .25), tec); b.position.y = 1.25; b.castShadow = true; obj.add(b);
    const al = new THREE.Mesh(new THREE.TorusGeometry(.6, .05, 10, 40, Math.PI), tec); al.position.y = 2.5; obj.add(al);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), matEst); s.position.set(0, 1.3, .13); obj.add(s); H = 3.1;
  }
  function porCodigo() {
    if (p.forma === 'caneca' || p.forma === 'xicara' || p.forma === 'copo') caneca(p.forma);
    else if (p.forma === 'botton') botton(); else if (p.forma === 'ecobag') ecobag(); else return false;
    return true;
  }
  function posicionar() {
    obj.position.y = -H / 2; chao.position.y = -H / 2; dist = 4.3 * Math.max(H, 2); camera(); aplicar();
  }
  function carregar() {
    const falhou = () => { if (!viva) return; if (porCodigo()) posicionar(); else { $$('.dica,.zoom', palco).forEach(x => x.remove()); palco.insertAdjacentHTML('beforeend', `<div class="sem3d"><img src="${miniProd(p)}" alt=""><p class="mut">Modelo 3D em breve</p></div>`); } };
    if (!p.modelo || !THREE.GLTFLoader) { falhou(); return; }
    new THREE.GLTFLoader().load(p.modelo, gl => {
      if (!viva) return;
      const m = gl.scene, box = new THREE.Box3().setFromObject(m), sz = box.getSize(new THREE.Vector3());
      m.scale.setScalar(2 / sz.y); box.setFromObject(m); const c = box.getCenter(new THREE.Vector3());
      m.position.set(-c.x, -box.min.y, -c.z); obj.add(m); H = 2; glb = true; tex.flipY = false;
      m.traverse(o => {
        if (!o.isMesh) return; o.castShadow = true;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(mt => {
          if (mt.name === 'estampa') { mt.map = tex; mt.color.set(0xffffff); mt.transparent = true; mt.needsUpdate = true; estampas.push(mt); }
          else if (mt.name === 'corpo') corpos.push(mt);
        });
      });
      posicionar();
    }, undefined, falhou);
  }
  function aplicar() { // aplica cor, estampa e tamanho escolhidos pela pessoa
    if (!estado) return;
    if (estado.hex) { mat.color.set(estado.hex); corpos.forEach(m => m.color.set(estado.hex)); }
    if (estado.est !== null && estado.est !== undefined) desenhar(cv, estado.est, estado.hex === COR.preto[1] ? '#FFFFFF' : '#2B2B2B', () => { tex.needsUpdate = true; });
    alvo = estado.escala || 1;
  }
  function camera() { cam.position.set(0, Math.sin(elev) * dist, Math.cos(elev) * dist); cam.lookAt(0, .05, 0); }
  function tamanho() { const w = palco.clientWidth, h = palco.clientHeight; if (!w || !h) return; rend.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  const ro = window.ResizeObserver ? new ResizeObserver(tamanho) : null; if (ro) ro.observe(palco); tamanho(); camera();

  const dom = rend.domElement;
  function pausar() { auto = false; clearTimeout(tAuto); tAuto = setTimeout(() => auto = true, 5000); }
  dom.addEventListener('pointerdown', ev => { arrasta = true; lx = ev.clientX; ly = ev.clientY; dom.setPointerCapture(ev.pointerId); palco.classList.add('pega'); pausar(); });
  dom.addEventListener('pointermove', ev => { if (!arrasta) return; pivo.rotation.y += (ev.clientX - lx) * .011; elev = Math.max(.02, Math.min(1.1, elev + (ev.clientY - ly) * .005)); lx = ev.clientX; ly = ev.clientY; camera(); pausar(); });
  const solta = () => { arrasta = false; palco.classList.remove('pega'); };
  dom.addEventListener('pointerup', solta); dom.addEventListener('pointercancel', solta);
  function zoom(d) { dist = Math.max(2.6 * Math.max(H, 2), Math.min(7 * Math.max(H, 2), dist + d)); camera(); pausar(); }
  dom.addEventListener('wheel', ev => { ev.preventDefault(); zoom(ev.deltaY * .004); }, { passive: false });
  const zi = $('#zin', palco), zo = $('#zout', palco); if (zi) zi.onclick = () => zoom(-1); if (zo) zo.onclick = () => zoom(1);

  (function laco() {
    if (!viva) return; requestAnimationFrame(laco);
    if (auto && !arrasta) pivo.rotation.y += .004;
    esc += (alvo - esc) * .14; obj.scale.setScalar(esc); rend.render(cena, cam);
  })();
  carregar();
  return {
    set(s) { estado = s; aplicar(); },
    dispose() { viva = false; if (ro) ro.disconnect(); rend.dispose(); if (rend.forceContextLoss) rend.forceContextLoss(); }
  };
}

/* ---------- 6. TELAS ---------- */
const app = $('#app');
let viewer = null;

/* 6.1 Loja */
/* Desenho de cada produto nos cards (SVG). As estampas entram dentro do desenho. */
function ilustra(p, n) {
  const est = p.est ? miniEst(n % ESTAMPAS.length) : '';
  const img = (x, y, w) => `<image href="${est}" x="${x}" y="${y}" width="${w}" height="${w}"/>`;
  const sombra = '<ellipse cx="67" cy="110" rx="42" ry="6" fill="#000" opacity=".1"/>';
  const d = {
    canecas: `${sombra}<path d="M97 44c32-4 34 40 2 44" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round"/><rect x="30" y="22" width="68" height="82" rx="12" fill="#fff"/><ellipse cx="64" cy="26" rx="34" ry="6" fill="#EFE6EA"/>${img(42, 44, 44)}`,
    xicara: `${sombra}<ellipse cx="64" cy="100" rx="50" ry="8" fill="#fff" opacity=".85"/><path d="M26 44h76c0 30-14 52-38 52S26 74 26 44z" fill="#fff"/><path d="M100 52c22-2 22 24-2 26" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>${img(46, 48, 36)}`,
    copo: `${sombra}<path d="M40 22h54l-6 82H46z" fill="#F9A8C3"/><rect x="36" y="14" width="62" height="11" rx="5" fill="#fff"/>${img(50, 46, 34)}`,
    ecobag: `${sombra}<path d="M46 38c0-26 42-26 42 0" fill="none" stroke="#D9C39B" stroke-width="6"/><rect x="26" y="36" width="82" height="74" rx="6" fill="#F1E3C6"/>${img(42, 54, 50)}`,
    bottons: `<ellipse cx="67" cy="110" rx="38" ry="5" fill="#000" opacity=".1"/><circle cx="67" cy="60" r="46" fill="#D8DCE3"/><circle cx="67" cy="60" r="40" fill="#fff"/><image href="${miniEst(n % ESTAMPAS.length)}" x="31" y="24" width="72" height="72"/>`,
    canetas: `<g transform="rotate(-35 67 60)"><rect x="52" y="8" width="16" height="100" rx="8" fill="#FF8FB1"/><circle cx="60" cy="16" r="11" fill="#fff"/></g><g transform="rotate(-35 90 60)"><rect x="82" y="8" width="16" height="100" rx="8" fill="#fff"/><circle cx="90" cy="16" r="11" fill="#FF8FB1"/></g>`,
    chaveiros: `<circle cx="67" cy="24" r="14" fill="none" stroke="#9AA0AA" stroke-width="5"/><path d="M67 38v14" stroke="#9AA0AA" stroke-width="4"/><path d="M67 108C36 88 34 56 54 56c9 0 13 5 13 10 0-5 4-10 13-10 20 0 18 32-13 52z" fill="#E8456F"/>`,
    marcapaginas: `${sombra}<rect x="48" y="10" width="38" height="94" rx="8" fill="#fff"/><g fill="#F58FB1"><ellipse cx="67" cy="82" rx="11" ry="9"/><circle cx="54" cy="68" r="4.5"/><circle cx="63" cy="58" r="4.5"/><circle cx="72" cy="58" r="4.5"/><circle cx="80" cy="68" r="4.5"/></g>`,
    kickers: `<g transform="rotate(-20 67 60)"><rect x="18" y="42" width="98" height="38" rx="17" fill="#7FCF9A"/><path d="M40 42v38M62 42v38M84 42v38" stroke="#fff" stroke-width="4" opacity=".6"/></g><path d="M112 40l12-14M116 52l16-8M110 30l4-18" stroke="#F58FB1" stroke-width="4" stroke-linecap="round"/>`
  };
  return `<svg viewBox="0 0 134 120" role="img" aria-label="${p.nome}">${d[p.id] || ''}</svg>`;
}
const ICONE_CARRINHO = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6"/></svg>';
function card(p, n) {
  const botao = p.esgotado ? `<button class="btn peq" disabled>${ICONE_CARRINHO} Esgotado</button>`
    : temOpcoes(p) ? `<a class="btn peq" href="#produto-${p.id}">${ICONE_CARRINHO} Escolher opções</a>`
      : `<button class="btn peq" data-add="${p.id}">${ICONE_CARRINHO} Adicionar ao carrinho</button>`;
  return `<div class="cw">${p.gato ? gatoSVG() : ''}
    <div class="card"><a class="card-link" href="#produto-${p.id}"><div class="vitrine">${p.foto ? `<img src="${p.foto}" alt="${p.nome}">` : ilustra(p, n)}</div>
      <h2>${p.nome}</h2><p class="pr">${precoTxt(p)}</p></a>${p.esgotado ? '<span class="tag">Esgotado</span>' : ''}${botao}</div></div>`;
}
function vLoja() {
  app.innerHTML = `<section class="hero">
      <h1>Nossa Loja <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="16" rx="5.5" ry="4.5"/><circle cx="5" cy="11" r="2.3"/><circle cx="9.5" cy="6.5" r="2.3"/><circle cx="14.5" cy="6.5" r="2.3"/><circle cx="19" cy="11" r="2.3"/></svg></h1>
      <p>Produtos incríveis para você e seu pet!</p></section>
    <div class="grade">${PRODUTOS.map(card).join('')}</div>`;
  iniciarGato();
}

/* 6.2 Página do produto (modelo 3D + opções) */
function vProduto(id) {
  const p = prod(id); if (!p) { location.hash = 'loja'; return; }
  const cores = listaCores(p);
  const st = { tam: p.tam ? p.tam[0].id : null, cor: cores.length ? (p.corPadrao || cores[0].id) : null, est: p.est ? 0 : null, qtd: 1 };
  const grupo = (rot, id, corpo, extra = '') => `<div><div class="rot">${rot}: <span id="${id}"></span></div><div class="linha">${corpo}</div>${extra}</div>`;
  app.innerHTML = `<nav class="migalha" aria-label="Você está em"><a href="#loja">Lojinha</a> / ${p.nome}</nav>
  <div class="pgrid">
    <section class="painel"><div class="palco" id="palco">
      <div class="dica"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>Arraste para girar</div>
      <div class="zoom"><button id="zin" aria-label="Aproximar">+</button><button id="zout" aria-label="Afastar">&minus;</button></div></div></section>
    <section class="painel info">
      <div><h1>${p.nome}</h1><p class="desc">${p.desc || ''}</p></div>
      <div><div class="preco" id="preco"></div><div class="nota" id="pnota"></div></div>
      ${p.tam ? grupo('Tamanho', 'l-tam', p.tam.map(t => `<button class="tam" data-tam="${t.id}">${t.nome}<small>${R(t.preco)}</small></button>`).join('')) : ''}
      ${cores.length > 1 ? grupo('Cor', 'l-cor', cores.map(c => `<button class="cor" data-cor="${c.id}" style="background:${c.hex}" aria-label="${c.nome}"></button>`).join(''), p.tam ? '<div class="nota">Algumas cores só existem em um dos tamanhos.</div>' : '') : ''}
      ${p.est ? grupo('Estampa', 'l-est', ESTAMPAS.map((e, i) => `<button class="est" data-est="${i}" aria-label="Estampa ${e.nome}"><img src="${miniEst(i)}" alt=""></button>`).join('')) : ''}
      ${p.nota ? `<div class="nota">${p.nota}</div>` : ''}
      <div class="compra"><div class="qtd"><button id="qm" aria-label="Diminuir quantidade">&minus;</button><span id="qn">1</span><button id="qp" aria-label="Aumentar quantidade">+</button></div>
        <button class="btn" id="add" ${p.esgotado ? 'disabled' : ''}>${p.esgotado ? 'Esgotado' : 'Adicionar ao carrinho'}</button></div>
      <div id="msg" role="status" aria-live="polite"></div>
    </section></div>`;
  const palco = $('#palco');
  viewer = criarViewer(palco, p);   // usa o seu .glb se existir; senão o modelo gerado por código

  function atualizar(pop) {
    const un = precoUn(p, st.tam), pe = $('#preco');
    pe.textContent = R(un); if (pop) { pe.classList.remove('pop'); void pe.offsetWidth; pe.classList.add('pop'); }
    $('#pnota').textContent = p.promo ? `Leve ${p.promo.n} por ${R(p.promo.preco)}` : (p.tam ? (p.nomeItem || p.nome) + ' ' + p.tam.find(t => t.id === st.tam).nome : '');
    if (st.tam) { $('#l-tam').textContent = p.tam.find(t => t.id === st.tam).nome; $$('.tam').forEach(b => b.setAttribute('aria-pressed', b.dataset.tam === st.tam)); }
    if (cores.length > 1) {
      $$('.cor').forEach(b => { const c = cores.find(x => x.id === b.dataset.cor); b.disabled = !!c.so && c.so !== st.tam; b.setAttribute('aria-pressed', b.dataset.cor === st.cor); });
      $('#l-cor').textContent = COR[st.cor][0];
    }
    if (p.est) { $('#l-est').textContent = ESTAMPAS[st.est].nome; $$('.est').forEach(b => b.setAttribute('aria-pressed', +b.dataset.est === st.est)); }
    $('#qn').textContent = st.qtd;
    if (viewer) viewer.set({ hex: st.cor ? COR[st.cor][1] : null, est: st.est, escala: p.id === 'canecas' && st.tam === '200' ? .86 : 1 });
  }
  $$('.tam').forEach(b => b.onclick = () => { st.tam = b.dataset.tam; const c = cores.find(x => x.id === st.cor); if (c && c.so && c.so !== st.tam) st.cor = 'branco'; atualizar(true); });
  $$('.cor').forEach(b => b.onclick = () => { if (!b.disabled) { st.cor = b.dataset.cor; atualizar(); } });
  $$('.est').forEach(b => b.onclick = () => { st.est = +b.dataset.est; atualizar(); });
  $('#qm').onclick = () => { st.qtd = Math.max(1, st.qtd - 1); atualizar(); };
  $('#qp').onclick = () => { st.qtd = Math.min(20, st.qtd + 1); atualizar(); };
  $('#add').onclick = () => {
    const item = adicionar({ id: p.id, un: precoUn(p, st.tam), qtd: st.qtd, tam: st.tam, cor: st.cor, est: st.est });
    abrirGaveta(item, st.qtd);
  };
  atualizar();
  if (document.fonts && document.fonts.load) document.fonts.load('700 40px Fredoka').then(() => atualizar(), () => { });
}

/* 6.3 Página do carrinho */
function linhaItem(i) {
  return `<article class="item"><img src="${miniItem(i)}" alt=""><div><h3>${nomeItem(i)}</h3><p class="mut">${descItem(i)}</p>
    <div class="acoes"><div class="qtd"><button data-act="menos" data-k="${i.k}" aria-label="Diminuir quantidade">&minus;</button><span>${i.qtd}</span><button data-act="mais" data-k="${i.k}" aria-label="Aumentar quantidade">+</button></div>
    <button class="lixo" data-act="rem" data-k="${i.k}">Remover</button></div></div><div class="valor">${R(i.un * i.qtd)}</div></article>`;
}
function resumoHTML(c, frete) {
  const ft = frete || 0;
  return `<dl><div><dt>Produtos (${c.qtd})</dt><dd>${R(c.sub)}</dd></div>
    ${c.desc ? `<div class="verde"><dt>Desconto</dt><dd>&minus; ${R(c.desc)}</dd></div>` : ''}
    ${frete !== undefined ? `<div><dt>Entrega</dt><dd>${ft ? R(ft) : 'Grátis'}</dd></div>` : ''}</dl>
    <div class="tot"><span>Total</span><span>${R(c.total + ft)}</span></div>${c.desc ? `<p class="verde mut">Você economiza ${R(c.desc)}</p>` : ''}`;
}
function vCarrinho() {
  if (!cart.length) { app.innerHTML = `<div class="painel vazio"><h1>Seu carrinho está vazio</h1><p>Escolha um produto na lojinha pra começar.</p><a class="btn" href="#loja">Ver produtos</a></div>`; return; }
  const c = calcular();
  app.innerHTML = `<h1 class="tit">Carrinho</h1><div class="cgrid"><section class="painel">${cart.map(linhaItem).join('')}</section>
    <aside class="painel resumo"><h2>Resumo da compra</h2>${resumoHTML(c)}<a class="btn grande" href="#checkout">Continuar</a></aside></div>
    <section class="sug"><h2>Você também pode gostar</h2><div class="grade">${PRODUTOS.filter(p => !p.esgotado).slice(0, 4).map(card).join('').replace(gatoSVG(), '')}</div></section>`;
}
function acaoCarrinho(b) {
  const i = cart.find(x => x.k === b.dataset.k); if (!i) return;
  if (b.dataset.act === 'mais') i.qtd = Math.min(20, i.qtd + 1);
  if (b.dataset.act === 'menos') i.qtd = Math.max(1, i.qtd - 1);
  if (b.dataset.act === 'rem') cart = cart.filter(x => x !== i);
  salvar(); vCarrinho();
}

/* 6.4 Checkout em etapas (o pagamento é uma SIMULAÇÃO: nada é cobrado) */
function pixPayload(valor, txid) { // "Pix copia e cola" no padrão do Banco Central (BR Code)
  const f = (id, v) => id + String(v.length).padStart(2, '0') + v;
  const s = f('00', '01') + f('26', f('00', 'br.gov.bcb.pix') + f('01', CONFIG.chavePix)) + f('52', '0000') + f('53', '986') + f('54', valor.toFixed(2)) + f('58', 'BR')
    + f('59', CONFIG.nomePix.slice(0, 25)) + f('60', CONFIG.cidadePix.slice(0, 15)) + f('62', f('05', txid)) + '6304';
  let crc = 0xFFFF;
  for (const ch of s) { crc ^= ch.charCodeAt(0) << 8; for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF; }
  return s + crc.toString(16).toUpperCase().padStart(4, '0');
}
const luhn = n => { let s = 0, d = false; for (let i = n.length - 1; i >= 0; i--) { let x = +n[i]; if (d) { x *= 2; if (x > 9) x -= 9; } s += x; d = !d; } return s % 10 === 0; };
function vCheckout() {
  if (!cart.length) { location.hash = 'carrinho'; return; }
  const nomes = ['Identificação', 'Entrega', 'Pagamento', 'Revisão'];
  const co = ls.get('miau-dados', { nome: '', email: '', tel: '', ent: 'retirada', cep: '', rua: '', num: '', comp: '', bairro: '', cidade: '', pag: 'pix' });
  let passo = 0;
  const campo = (id, rot, tipo = 'text', extra = '') => `<div class="campo"><label for="${id}">${rot}</label><input id="${id}" name="${id}" type="${tipo}" value="${(co[id] || '').toString().replace(/"/g, '&quot;')}" ${extra}></div>`;
  function corpo() {
    if (passo === 0) return `${campo('nome', 'Nome completo', 'text', 'required autocomplete="name"')}${campo('email', 'E-mail', 'email', 'required autocomplete="email"')}${campo('tel', 'Telefone com DDD', 'tel', 'required autocomplete="tel"')}`;
    if (passo === 1) return `<label class="opcao"><input type="radio" name="ent" value="retirada" ${co.ent === 'retirada' ? 'checked' : ''}><span><b>Retirar em Cavalhada, Porto Alegre</b>Grátis. Combinamos o horário pelo WhatsApp.</span></label>
      <label class="opcao"><input type="radio" name="ent" value="entrega" ${co.ent === 'entrega' ? 'checked' : ''}><span><b>Receber em casa</b>${R(CONFIG.freteEntrega)}</span></label>
      <div id="end" ${co.ent === 'entrega' ? '' : 'hidden'}>
        <div class="campo"><label for="cep">CEP</label><div class="duas"><input id="cep" name="cep" type="text" inputmode="numeric" maxlength="9" value="${co.cep}" autocomplete="postal-code"><button type="button" class="btn sec" id="buscar">Buscar endereço</button></div></div>
        ${campo('rua', 'Rua')}<div class="duas">${campo('num', 'Número')}${campo('comp', 'Complemento')}</div><div class="duas">${campo('bairro', 'Bairro')}${campo('cidade', 'Cidade/UF')}</div></div>`;
    if (passo === 2) return `<div class="aviso">Demonstração do TCC: nenhum pagamento é cobrado de verdade.</div>
      <label class="opcao"><input type="radio" name="pag" value="pix" ${co.pag === 'pix' ? 'checked' : ''}><span><b>Pix</b>Gera o QR Code e o código “copia e cola” depois de finalizar.</span></label>
      <label class="opcao"><input type="radio" name="pag" value="cartao" ${co.pag === 'cartao' ? 'checked' : ''}><span><b>Cartão de crédito (simulado)</b>Os dados são só validados, nada é enviado.</span></label>
      ${co.ent === 'retirada' ? `<label class="opcao"><input type="radio" name="pag" value="dinheiro" ${co.pag === 'dinheiro' ? 'checked' : ''}><span><b>Dinheiro na retirada</b>Você paga quando buscar o pedido.</span></label>` : ''}
      <div id="cartao" ${co.pag === 'cartao' ? '' : 'hidden'}>${campo('cnum', 'Número do cartão', 'text', 'inputmode="numeric" autocomplete="off" maxlength="23"')}${campo('cnome', 'Nome impresso no cartão')}<div class="duas">${campo('cval', 'Validade (MM/AA)', 'text', 'maxlength="5" placeholder="MM/AA"')}${campo('ccvv', 'CVV', 'text', 'inputmode="numeric" maxlength="4"')}</div></div>`;
    const c = calcular();
    return `<h2>Revise seu pedido</h2><p><b>${co.nome}</b><br>${co.email}, ${co.tel}</p>
      <p>${co.ent === 'retirada' ? 'Retirada em Cavalhada, Porto Alegre' : `${co.rua}, ${co.num} ${co.comp}<br>${co.bairro}, ${co.cidade}, CEP ${co.cep}`}</p>
      <p>Pagamento: <b>${{ pix: 'Pix', cartao: 'Cartão (simulado)', dinheiro: 'Dinheiro na retirada' }[co.pag]}</b></p>
      ${cart.map(i => `<p class="mut">${i.qtd}x ${nomeItem(i)}${descItem(i) ? ' (' + descItem(i) + ')' : ''}: ${R(i.un * i.qtd)}</p>`).join('')}`;
  }
  const frete = () => co.ent === 'entrega' ? CONFIG.freteEntrega : 0;
  function pintar() {
    const c = calcular();
    app.innerHTML = `<h1 class="tit">Finalizar compra</h1>
      <ol class="etapas" aria-label="Etapas">${nomes.map((n, i) => `<li class="${i === passo ? 'on' : i < passo ? 'ok' : ''}" ${i === passo ? 'aria-current="step"' : ''}>${n}</li>`).join('')}</ol>
      <div class="cgrid"><form class="painel" id="form" novalidate>${corpo()}<div class="erro" id="erro" role="alert"></div>
        <div class="nav-passos">${passo ? '<button type="button" class="btn sec" id="volta">Voltar</button>' : '<a class="btn sec" href="#carrinho">Voltar ao carrinho</a>'}
        <button class="btn" type="submit">${passo === 3 ? 'Finalizar pedido' : 'Continuar'}</button></div></form>
      <aside class="painel resumo"><h2>Resumo da compra</h2>${resumoHTML(c, passo > 0 ? frete() : undefined)}</aside></div>`;
    const f = $('#form'); f.addEventListener('submit', ev => { ev.preventDefault(); avancar(); });
    const v = $('#volta'); if (v) v.onclick = () => { ler(); passo--; pintar(); };
    $$('input[name=ent]', f).forEach(r => r.onchange = () => { co.ent = r.value; if (co.ent === 'entrega' && co.pag === 'dinheiro') co.pag = 'pix'; $('#end').hidden = co.ent !== 'entrega'; pintar2(); });
    $$('input[name=pag]', f).forEach(r => r.onchange = () => { co.pag = r.value; $('#cartao').hidden = co.pag !== 'cartao'; });
    const b = $('#buscar'); if (b) b.onclick = buscarCep;
    const f1 = $('input'); if (f1 && passo !== 1) f1.focus();
  }
  function pintar2() { const c = calcular(); $('.resumo').innerHTML = `<h2>Resumo da compra</h2>${resumoHTML(c, frete())}`; }
  function ler() { $$('#form input').forEach(i => { if (i.type === 'radio') { if (i.checked) co[i.name] = i.value; } else if (!['cnum', 'cnome', 'cval', 'ccvv'].includes(i.id)) co[i.id] = i.value.trim(); }); ls.set('miau-dados', co); }
  function buscarCep() { // preenche o endereço sozinho com a API gratuita ViaCEP
    const cep = $('#cep').value.replace(/\D/g, ''); const erro = $('#erro'); erro.textContent = '';
    if (cep.length !== 8) { erro.textContent = 'Digite um CEP com 8 números.'; return; }
    fetch(`https://viacep.com.br/ws/${cep}/json/`).then(r => r.json()).then(d => {
      if (d.erro) { erro.textContent = 'Não encontramos esse CEP. Preencha o endereço à mão.'; return; }
      $('#rua').value = d.logradouro || ''; $('#bairro').value = d.bairro || ''; $('#cidade').value = d.localidade + '/' + d.uf; $('#num').focus();
    }).catch(() => { erro.textContent = 'Não foi possível buscar o CEP agora. Preencha o endereço à mão.'; });
  }
  function validar() {
    const erro = txt => { $('#erro').textContent = txt; return false; };
    if (passo === 0) { if (co.nome.length < 3) return erro('Digite seu nome completo.'); if (!/^\S+@\S+\.\S+$/.test(co.email)) return erro('Digite um e-mail válido, como nome@email.com.'); if (co.tel.replace(/\D/g, '').length < 10) return erro('Digite o telefone com DDD.'); }
    if (passo === 1 && co.ent === 'entrega') { if (co.cep.replace(/\D/g, '').length !== 8) return erro('Digite o CEP.'); if (!co.rua || !co.num || !co.bairro || !co.cidade) return erro('Preencha rua, número, bairro e cidade.'); }
    if (passo === 2 && co.pag === 'cartao') {
      const n = $('#cnum').value.replace(/\D/g, ''), v = $('#cval').value.match(/^(\d{2})\/(\d{2})$/), cv = $('#ccvv').value;
      if (n.length < 13 || !luhn(n)) return erro('O número do cartão não é válido. Para testar, use 4242 4242 4242 4242.');
      if ($('#cnome').value.trim().length < 3) return erro('Digite o nome impresso no cartão.');
      if (!v || +v[1] < 1 || +v[1] > 12) return erro('Digite a validade no formato MM/AA.');
      if (!/^\d{3,4}$/.test(cv)) return erro('O CVV tem 3 ou 4 números.');
    }
    return true;
  }
  function avancar() {
    ler(); if (!validar()) return;
    if (passo < 3) { passo++; pintar(); return; }
    const c = calcular(), num = String(Date.now()).slice(-6);
    ls.set('miau-pedido', { num, itens: cart, c, frete: frete(), co, quando: new Date().toLocaleString('pt-BR') });
    cart = []; salvar(); location.hash = 'pedido';
  }
  pintar();
}

/* 6.5 Confirmação do pedido */
function vPedido() {
  const o = ls.get('miau-pedido', null); if (!o) { location.hash = 'loja'; return; }
  const total = o.c.total + o.frete;
  const msg = `Olá! Fiz o pedido #${o.num} na lojinha do Projeto Miau.\n` + o.itens.map(i => `${i.qtd}x ${nomeItem(i)}${descItem(i) ? ' (' + descItem(i) + ')' : ''}`).join('\n')
    + `\nTotal: ${R(total)}\n${o.co.ent === 'retirada' ? 'Retirada em Cavalhada' : 'Entrega: ' + o.co.rua + ', ' + o.co.num + ' - ' + o.co.cidade}\nPagamento: ${o.co.pag}\nNome: ${o.co.nome}`;
  const payload = pixPayload(total, 'MIAU' + o.num);
  app.innerHTML = `<div class="painel ok-pedido"><h1>Pedido realizado!</h1><p>Número do pedido: <b>#${o.num}</b></p>
    <div class="aviso">Demonstração do TCC: nenhum pagamento foi cobrado de verdade.</div>
    ${o.itens.map(i => `<p class="mut">${i.qtd}x ${nomeItem(i)}${descItem(i) ? ' (' + descItem(i) + ')' : ''}</p>`).join('')}
    <p class="valor">Total: ${R(total)}</p>
    ${o.co.pag === 'pix' ? `<div class="pix"><div id="qr"></div><p class="mut">Pix de demonstração. Escaneie ou copie o código:</p><code id="copia">${payload}</code><button class="btn sec" id="copiar">Copiar código Pix</button></div>` : ''}
    ${o.co.pag === 'cartao' ? '<p>Pagamento com cartão aprovado (simulação).</p>' : ''}${o.co.pag === 'dinheiro' ? '<p>Você paga em dinheiro quando retirar o pedido.</p>' : ''}
    <p><a class="btn" target="_blank" rel="noopener" href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}">Enviar pedido pelo WhatsApp</a></p>
    <p><a href="#loja">Voltar para a lojinha</a></p></div>`;
  if (o.co.pag === 'pix') {
    if (window.QRCode) new QRCode($('#qr'), { text: payload, width: 180, height: 180, correctLevel: QRCode.CorrectLevel.M });
    $('#copiar').onclick = () => { (navigator.clipboard ? navigator.clipboard.writeText(payload) : Promise.reject()).then(() => $('#copiar').textContent = 'Código copiado!', () => { const r = document.createRange(); r.selectNode($('#copia')); getSelection().removeAllRanges(); getSelection().addRange(r); }); };
  }
}

/* ---------- 7. GATINHO ANIMADO (card das Canecas) ---------- */
function gatoSVG() {
  // Duas camadas: "tras" (cabeça, boca, língua e balão) fica ATRÁS do card; "frente" (patinhas) fica na frente.
  return `<div class="gato-wrap">
  <svg class="gato-tras" viewBox="260 0 1340 900" role="button" tabindex="0" aria-label="Gatinho do Projeto Miau. Passe o mouse, toque ou aperte Enter para ele miar.">
    <g class="sobe"><image href="assets/gato-cabeca.png" x="330" y="30" width="1070" height="770"/>
      <g class="boca"><path d="M868 603 V626 M826 626 Q846 654 868 626 Q890 654 910 626" fill="none" stroke="#8A5560" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g transform="translate(868 612)"><g class="lingua"><image href="assets/gato-lingua.png" x="-118" y="-22" width="240" height="170"/></g></g></g>
    <g transform="translate(1255 245)"><g class="balao"><ellipse cx="175" cy="-125" rx="150" ry="105" fill="#FFFFFF" stroke="#F3D3D6" stroke-width="3"/>
      <path d="M85 -60 Q45 -20 0 0 Q95 -12 150 -42 Z" fill="#FFFFFF"/>
      <text x="175" y="-92" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="88" fill="#E8456F">Miau!</text></g></g>
    <rect id="hit" x="330" y="235" width="1070" height="550" fill="transparent"/></svg>
  <svg class="gato-frente" viewBox="260 0 1340 900" aria-hidden="true"><image href="assets/gato-patas.png" x="340" y="670" width="1060" height="210"/></svg></div>`;
}
function iniciarGato() {
  const g = $('.gato-wrap'); if (!g) return; let ocupado = false;
  const tocar = () => {
    if (ocupado) return; ocupado = true; g.classList.add('play');
    const menos = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => { g.classList.remove('play'); ocupado = false; }, menos ? 2000 : 4100);
  };
  $('#hit', g).addEventListener('pointerenter', tocar); $('#hit', g).addEventListener('click', tocar);
  $('.gato-tras', g).addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tocar(); } });
}

/* ---------- 8. ROTAS: a tela muda conforme o texto depois do # na barra de endereço ---------- */
function rota() {
  const h = location.hash.slice(1) || 'loja';
  if (viewer) { viewer.dispose(); viewer = null; }
  fecharGaveta();
  if (h.startsWith('produto-')) vProduto(h.slice(8));
  else if (h === 'carrinho') vCarrinho();
  else if (h === 'checkout') vCheckout();
  else if (h === 'pedido') vPedido();
  else vLoja();
  window.scrollTo(0, 0);
}
document.addEventListener('click', e => {
  if (e.target.closest('[data-fechar]') || e.target.id === 'fundo') fecharGaveta();
  const a = e.target.closest('[data-act]'); if (a) acaoCarrinho(a);
  const b = e.target.closest('[data-add]');
  if (b) { const p = prod(b.dataset.add); const item = adicionar({ id: p.id, un: p.preco, qtd: 1, tam: null, cor: null, est: null }); abrirGaveta(item, 1); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharGaveta(); });
window.addEventListener('hashchange', rota);
salvar(); rota();
// quando a fonte Fredoka carrega, refaz as miniaturas das estampas (que usam texto)
if (document.fonts && document.fonts.load) document.fonts.load('700 20px Fredoka').then(() => {
  Object.keys(cacheMiniatura).forEach(k => delete cacheMiniatura[k]);
  if (!location.hash || location.hash === '#loja') rota();
}, () => { });
