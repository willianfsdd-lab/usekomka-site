document.addEventListener('DOMContentLoaded', () => {
	const whatsappNumber = '5522997801245'
	// Produtos usando imagens locais (coloque as fotos na pasta `images/`)
	const products = [
		{id:1,name:'Glow',price:70.00,image:'images/WhatsApp Image 2026-08-18 at 11.32.11.jpeg',description:'Biquíni verde com modelagem confortável. Tecido premium, ideal para dias de sol.',badge:'Novo'},
		{id:2,name:'Aura',price:60.00,image:'images/WhatsApp Image 2026-08-18 at 11.32.11 (1).jpeg',description:'Tom nude elegante, design minimalista. Ajuste perfeito e secagem rápida.'}
	]

	const grid = document.getElementById('product-grid')
	const cartBtn = document.getElementById('cart-btn')
	const cartEl = document.getElementById('cart')
	const cartCount = document.getElementById('cart-count')
	const cartItemsEl = document.getElementById('cart-items')
	const cartTotalEl = document.getElementById('cart-total')
	const checkoutBtn = document.getElementById('checkout')
	const closeCart = document.getElementById('close-cart')

	let cart = JSON.parse(localStorage.getItem('usekomka_cart')||'[]')

	function formatPrice(v){return v.toFixed(2)}

	function renderProducts(){
		grid.innerHTML = ''
		products.forEach(p => {
			const card = document.createElement('div')
						card.className = 'card'
						card.innerHTML = `
								<div class="card-media" style="position:relative">
									${p.badge?`<div class="badge">${p.badge}</div>`:''}
									<img src="${p.image}" alt="${p.name}">
									<div class="quick" role="button" aria-label="Visualizar ${p.name}">Visualizar</div>
								</div>
								<div class="card-body">
									<div class="title">${p.name}</div>
									<div class="desc">${p.description || ''}</div>
									<div class="card-footer"><div class="price">R$ ${formatPrice(p.price)}</div>
									<button data-id="${p.id}" class="add-btn">Adicionar</button></div>
								</div>
						`
			const btn = card.querySelector('button.add-btn')
			btn.addEventListener('click', (e)=>{ e.stopPropagation(); addToCart(p.id) })
			// quick view / open modal when clicking image or quick overlay
			card.querySelector('.card-media').addEventListener('click', ()=> openModal(p))
			grid.appendChild(card)
		})
	}

	function saveCart(){localStorage.setItem('usekomka_cart', JSON.stringify(cart))}

	function sendOrderToWhatsApp(items){
		const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)
		const orderLines = items.map(item => `${item.name} | Tamanho: ${item.size || 'A definir'} | Quantidade: ${item.qty} | R$ ${formatPrice(item.price * item.qty)}`)
		const message = [
			'Olá! Quero fazer este pedido na Usekomka:',
			'',
			...orderLines,
			'',
			`Total: R$ ${formatPrice(total)}`,
			'',
			'Podem me confirmar disponibilidade e formas de pagamento?'
		].join('\n')
		window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener')
	}

	function addToCart(id, size){
		const prod = products.find(p=>p.id===id)
		const existing = cart.find(i=>i.id===id && (i.size||null) === (size||null))
		if(existing){ existing.qty += 1 } else { cart.push({id:prod.id,name:prod.name,price:prod.price,qty:1,size:size||null}) }
		saveCart(); renderCart();
	}

	function removeFromCart(id, size){
		cart = cart.filter(i=>!(i.id===id && (i.size||'')===(size||'')))
		saveCart(); renderCart()
	}

	function renderCart(){
		cartItemsEl.innerHTML = ''
		let total = 0
		cart.forEach(item=>{
			const li = document.createElement('li')
			const prod = products.find(p=>p.id===item.id) || {}
			li.innerHTML = `
				<div class="cart-item">
					<img class="cart-thumb" src="${prod.image||''}" alt="${item.name}">
					<div class="cart-meta">
						<div class="cart-name">${item.name} ${item.size?`<small>(${item.size})</small>`:''}</div>
						<div class="cart-qty">R$ ${formatPrice(item.price)} x ${item.qty}</div>
					</div>
					<button data-id="${item.id}" data-size="${item.size||''}" class="remove">Remover</button>
				</div>
			`
			const btn = li.querySelector('button.remove')
			btn.addEventListener('click', ()=> removeFromCart(item.id, btn.dataset.size))
			cartItemsEl.appendChild(li)
			total += item.price * item.qty
		})
		cartTotalEl.textContent = formatPrice(total)
		cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0)
	}

	// Modal handlers
	const modal = document.getElementById('product-modal')
	const modalImg = document.getElementById('modal-img')
	const modalTitle = document.getElementById('modal-title')
	const modalPrice = document.getElementById('modal-price')
	const modalDesc = document.getElementById('modal-desc')
	const modalQty = document.getElementById('modal-qty')
	const modalAdd = document.getElementById('modal-add')
	const modalClose = document.getElementById('modal-close')

	let activeProduct = null

	function openModal(p){
		activeProduct = p
		modalImg.src = p.image
		modalImg.alt = p.name
		modalTitle.textContent = p.name
		modalPrice.textContent = formatPrice(p.price)
		modalDesc.textContent = p.description || 'Peça confortável e elegante.'
		modalQty.value = 1
		// default size
		modalSelectedSize = 'M'
		Array.from(document.querySelectorAll('.size-btn')).forEach(b=>{
			b.classList.toggle('active', b.dataset.size===modalSelectedSize)
		})
		modal.classList.remove('hidden')
		modal.setAttribute('aria-hidden','false')
	}

	function closeModal(){
		modal.classList.add('hidden')
		modal.setAttribute('aria-hidden','true')
	}

	modalClose.addEventListener('click', closeModal)
	modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal() })

	modalAdd.addEventListener('click', ()=>{
		const qty = Math.max(1, parseInt(modalQty.value||1,10))
		for(let i=0;i<qty;i++) addToCart(activeProduct.id, modalSelectedSize)
		closeModal();
	})

	// Buy now - add to cart then simulate checkout
	const modalBuy = document.getElementById('modal-buy')
	let modalSelectedSize = 'M'
	document.querySelectorAll('.size-btn').forEach(b=>{
		b.addEventListener('click',(e)=>{
			document.querySelectorAll('.size-btn').forEach(x=>x.classList.remove('active'))
			b.classList.add('active')
			modalSelectedSize = b.dataset.size
		})
	})

	modalBuy.addEventListener('click', ()=>{
		const qty = Math.max(1, parseInt(modalQty.value||1,10))
		for(let i=0;i<qty;i++) addToCart(activeProduct.id, modalSelectedSize)
		sendOrderToWhatsApp(cart)
		closeModal()
	})

	cartBtn.addEventListener('click', ()=>{
		cartEl.classList.toggle('hidden')
		const hidden = cartEl.classList.contains('hidden')
		cartEl.setAttribute('aria-hidden', hidden)
	})
	closeCart.addEventListener('click', ()=> cartEl.classList.add('hidden'))

	checkoutBtn.addEventListener('click', ()=>{
		if(cart.length===0){ alert('Carrinho vazio.'); return }
		sendOrderToWhatsApp(cart)
		cartEl.classList.add('hidden')
	})

	renderProducts(); renderCart()
})
