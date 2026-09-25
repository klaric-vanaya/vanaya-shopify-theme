/* VANAYA Judge.me in-store form repair — 25 Sep 2026 */
(function(){
  function cleanText(el){
    return (el && el.textContent || '').replace(/\s+/g,' ').trim();
  }
  function findModal(){
    var all=Array.from(document.querySelectorAll('h1,h2,h3,h4,p,div,span'));
    var h=all.find(function(el){ return cleanText(el)==='How would you rate this product?'; });
    if(!h) return null;
    var n=h;
    for(var i=0;i<9 && n && n!==document.body;i++,n=n.parentElement){
      var t=cleanText(n);
      if(t.indexOf('Poor')>-1 && t.indexOf('Great')>-1) return n;
    }
    return h.parentElement;
  }
  function getControls(modal){
    var controls=Array.from(modal.querySelectorAll('button,[role="button"],label,input[type="radio"]')).filter(function(el){
      var blob=[
        el.getAttribute && el.getAttribute('aria-label'),
        el.getAttribute && el.getAttribute('title'),
        el.getAttribute && el.getAttribute('name'),
        el.getAttribute && el.getAttribute('value'),
        cleanText(el)
      ].filter(Boolean).join(' ').toLowerCase();
      return /(^|\b)(1|2|3|4|5)\s*star|star\s*(1|2|3|4|5)|rating\s*(1|2|3|4|5)/i.test(blob);
    });
    if(controls.length<5){
      var radios=Array.from(modal.querySelectorAll('input[type="radio"]'));
      if(radios.length>=5) controls=radios.slice(0,5).map(function(r){ return r.closest('label') || r; });
    }
    return Array.from(new Set(controls)).slice(0,5);
  }
  function findLabelLeaf(modal, word){
    return Array.from(modal.querySelectorAll('*')).find(function(el){
      return el.children.length===0 && cleanText(el)===word;
    });
  }
  function repair(){
    var modal=findModal();
    if(!modal) return;

    var controls=getControls(modal);
    if(controls.length===5){
      var common=controls[0].parentElement;
      if(common && controls.every(function(c){return c.parentElement===common;})){
        common.classList.add('vanaya-jm-rating-row');
        common.style.setProperty('display','flex','important');
        common.style.setProperty('justify-content','center','important');
        common.style.setProperty('align-items','center','important');
        common.style.setProperty('gap','12px','important');
        common.style.setProperty('width','100%','important');
        common.style.setProperty('max-width','100%','important');
        common.style.setProperty('margin-left','auto','important');
        common.style.setProperty('margin-right','auto','important');
        common.style.setProperty('padding-left','0','important');
        common.style.setProperty('padding-right','0','important');
        common.style.setProperty('transform','none','important');
        common.style.setProperty('text-align','center','important');
      }
      controls.forEach(function(c){
        c.classList.add('vanaya-jm-star-force');
        c.style.setProperty('float','none','important');
        c.style.setProperty('position','relative','important');
        c.style.setProperty('left','auto','important');
        c.style.setProperty('right','auto','important');
        c.style.setProperty('transform','none','important');
        c.style.setProperty('opacity','1','important');
        c.style.setProperty('visibility','visible','important');
      });

      /* Replace Judge.me's overlapping Poor/Great helper with our own fixed guide.
         Hide only the original leaf labels; the rating controls remain untouched. */
      var poor=findLabelLeaf(modal,'Poor');
      var great=findLabelLeaf(modal,'Great');
      if(poor) poor.style.setProperty('display','none','important');
      if(great) great.style.setProperty('display','none','important');

      if(common && !modal.querySelector('.vanaya-jm-guidance-custom')){
        var guide=document.createElement('div');
        guide.className='vanaya-jm-guidance-custom';
        guide.innerHTML='<span>Poor</span><span>Great</span>';
        common.insertAdjacentElement('afterend',guide);
      }
    }
  }
  document.addEventListener('DOMContentLoaded',repair);
  new MutationObserver(function(){ repair(); }).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',function(){ setTimeout(repair,40); setTimeout(repair,250); },true);
  window.addEventListener('resize',repair);
})();