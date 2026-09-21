(function(){
  'use strict';
  var KEY='vanayaWishlistV293';
  function read(){try{var d=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(d)?d:[]}catch(e){return []}}
  function write(items){localStorage.setItem(KEY,JSON.stringify(items));updateCount();syncButtonStates();window.dispatchEvent(new CustomEvent('vanaya:wishlist:changed',{detail:{items:items}}));}
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c];});}
  function updateCount(){var n=read().length;document.querySelectorAll('[data-wishlist-count]').forEach(function(el){el.textContent=n?String(n):'';});}
  function isSaved(handle){return read().some(function(x){return x.handle===handle;});}
  function itemFromButton(btn){return {handle:btn.dataset.handle||'',title:btn.dataset.title||'Vanaya product',url:btn.dataset.url||('/products/'+(btn.dataset.handle||'')),image:btn.dataset.image||'',price:btn.dataset.price||'',variantId:btn.dataset.variantId||'',savedAt:Date.now()};}
  function setButtonState(btn,saved){btn.classList.toggle('is-saved',saved);btn.setAttribute('aria-pressed',saved?'true':'false');var l=btn.querySelector('[data-wishlist-label]'),i=btn.querySelector('[data-wishlist-icon]');if(l)l.textContent=saved?'Saved to Wishlist':'Add to Wishlist';if(i)i.textContent=saved?'♥':'♡';if(!l&&!i)btn.textContent=saved?'♥':'♡';}
  function syncButtonStates(){document.querySelectorAll('[data-v29-wishlist]').forEach(function(btn){if(btn.dataset.handle)setButtonState(btn,isSaved(btn.dataset.handle));});}
  function toggle(btn){var h=btn.dataset.handle;if(!h)return;var items=read(),idx=items.findIndex(function(x){return x.handle===h;});if(idx>-1)items.splice(idx,1);else items.unshift(itemFromButton(btn));write(items);}
  function bindButtons(scope){(scope||document).querySelectorAll('[data-v29-wishlist]').forEach(function(btn){if(btn.dataset.wishlistBound==='1')return;btn.dataset.wishlistBound='1';setButtonState(btn,isSaved(btn.dataset.handle));btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();toggle(btn);});});}
  async function addToBag(item,button){var variantId=item.variantId;if(!variantId&&item.handle){try{var r=await fetch('/products/'+encodeURIComponent(item.handle)+'.js',{credentials:'same-origin'});if(r.ok){var p=await r.json();if(p&&p.variants&&p.variants.length){var c=p.variants.find(function(v){return v.available;})||p.variants[0];variantId=c&&c.id;}}}catch(e){}}if(!variantId){location.href=item.url;return;}var old=button.textContent;button.disabled=true;button.textContent='Adding…';try{var res=await fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({items:[{id:Number(variantId),quantity:1}]})});if(!res.ok)throw new Error();button.textContent='Added ✓';setTimeout(function(){button.disabled=false;button.textContent='Move to Bag';},1200);}catch(e){button.disabled=false;button.textContent=old;location.href=item.url;}}
  function renderWishlist(){var grid=document.querySelector('[data-v29-wishlist-grid]');if(!grid)return;var items=read(),status=document.querySelector('[data-v293-wishlist-status]');if(status)status.textContent=items.length?(items.length+' saved '+(items.length===1?'ritual':'rituals')):'No saved rituals yet';if(!items.length){grid.innerHTML='<div class="v293-wishlist-empty" style="grid-column:1/-1"><div class="v293-empty-heart">♡</div><h2>Your wishlist is waiting</h2><p>Save the Vanaya rituals you would like to return to.</p><a class="v293-primary-btn" href="/collections/all">Explore the range</a></div>';return;}grid.innerHTML=items.map(function(x){return '<article class="v293-wishlist-card"><button type="button" class="v293-remove" data-remove-wishlist="'+encodeURIComponent(x.handle)+'">×</button><a class="v293-wishlist-image" href="'+esc(x.url)+'">'+(x.image?'<img src="'+esc(x.image)+'" alt="'+esc(x.title)+'" loading="lazy">':'<div class="v293-image-placeholder">VANAYA</div>')+'</a><div class="v293-wishlist-copy"><p class="v293-wishlist-kicker">Vanaya ritual</p><h3><a href="'+esc(x.url)+'">'+esc(x.title)+'</a></h3><p class="v293-wishlist-price">'+esc(x.price)+'</p><div class="v293-wishlist-actions"><button type="button" class="v293-primary-btn" data-move-to-bag="'+encodeURIComponent(x.handle)+'">Move to Bag</button><a class="v293-secondary-btn" href="'+esc(x.url)+'">View Product</a></div></div></article>';}).join('');grid.querySelectorAll('[data-remove-wishlist]').forEach(function(btn){btn.addEventListener('click',function(){var h=decodeURIComponent(btn.dataset.removeWishlist);write(read().filter(function(x){return x.handle!==h;}));renderWishlist();});});grid.querySelectorAll('[data-move-to-bag]').forEach(function(btn){btn.addEventListener('click',function(){var h=decodeURIComponent(btn.dataset.moveToBag),item=read().find(function(x){return x.handle===h;});if(item)addToBag(item,btn);});});}
  
function migrateLegacyWishlist(){
  if(read().length) return;
  ['vanayaWishlist','vanayaWishlistV29','vanayaWishlistV291','vanayaWishlistV292'].some(function(k){
    try{
      var d=JSON.parse(localStorage.getItem(k)||'[]');
      if(Array.isArray(d) && d.length){
        write(d);
        return true;
      }
    }catch(e){}
    return false;
  });
}

function ensureWishlistPage(){
  var path=(location.pathname||'').replace(/\/+$/,'');
  if(path!='/pages/wishlist') return;
  if(document.querySelector('[data-v29-wishlist-grid]')) return;

  var host=document.querySelector('main#content, #content, main, [role="main"]');
  if(!host) return;

  host.innerHTML =
    '<section class="v293-wishlist-page">'+
      '<div class="v293-wishlist-hero">'+
        '<p class="v29-account-kicker">Saved for your ritual</p>'+
        '<h1>My Wishlist</h1>'+
        '<p>Keep the Vanaya formulas that caught your attention close at hand.</p>'+
        '<span class="v293-wishlist-status" data-v293-wishlist-status></span>'+
      '</div>'+
      '<div class="v29-wishlist-grid v293-wishlist-grid" data-v29-wishlist-grid></div>'+
    '</section>';
}

function init(){
  migrateLegacyWishlist();
  ensureWishlistPage();
  updateCount();
  bindButtons(document);
  renderWishlist();
}
  document.addEventListener('DOMContentLoaded',init);
  document.addEventListener('shopify:section:load',function(e){bindButtons(e.target||document);renderWishlist();});
  window.addEventListener('storage',function(e){if(e.key===KEY){updateCount();syncButtonStates();renderWishlist();}});
  window.VanayaWishlist={read:read,write:write,refresh:function(){updateCount();syncButtonStates();renderWishlist();},storageKey:KEY};
})();
