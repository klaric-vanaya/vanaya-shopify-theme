/* VANAYA Judge.me in-store form repair — 25 Sep 2026 */
(function(){
  function text(el){ return (el && el.textContent || '').replace(/\s+/g,' ').trim(); }
  function exact(root, value){
    return Array.from(root.querySelectorAll('*')).filter(function(el){
      return el.children.length===0 && text(el)===value;
    });
  }
  function findModal(){
    var headings=Array.from(document.querySelectorAll('h1,h2,h3,h4,p,div,span'));
    var h=headings.find(function(el){ return text(el)==='How would you rate this product?'; });
    if(!h) return null;
    var n=h;
    for(var i=0;i<8 && n && n!==document.body;i++,n=n.parentElement){
      var t=text(n);
      if(t.indexOf('Poor')>-1 && t.indexOf('Great')>-1) return n;
    }
    return h.parentElement;
  }
  function repair(){
    var modal=findModal();
    if(!modal) return;

    /* Find the five actual rating controls. Judge.me versions use buttons,
       labels/radios or accessible star-labelled controls. */
    var controls=Array.from(modal.querySelectorAll(
      'button,[role="button"],label,input[type="radio"]'
    )).filter(function(el){
      var blob=[
        el.getAttribute && el.getAttribute('aria-label'),
        el.getAttribute && el.getAttribute('title'),
        el.getAttribute && el.getAttribute('name'),
        el.getAttribute && el.getAttribute('value'),
        text(el)
      ].filter(Boolean).join(' ').toLowerCase();
      return /(^|\b)(1|2|3|4|5)\s*star|star\s*(1|2|3|4|5)|rating\s*(1|2|3|4|5)/i.test(blob);
    });

    /* Fallback: Judge.me often wraps five radio inputs inside labels. */
    if(controls.length<5){
      var radios=Array.from(modal.querySelectorAll('input[type="radio"]'));
      if(radios.length>=5){
        controls=radios.slice(0,5).map(function(r){ return r.closest('label') || r; });
      }
    }

    /* Last fallback: use the five sibling interactive elements directly above
       the Poor/Great guidance. */
    var poor=exact(modal,'Poor')[0], great=exact(modal,'Great')[0];
    if(controls.length<5 && poor && great){
      var gParent=poor.parentElement===great.parentElement ? poor.parentElement : null;
      var candidate=gParent && gParent.previousElementSibling;
      if(candidate){
        var kids=Array.from(candidate.querySelectorAll('button,[role="button"],label'));
        if(kids.length>=5) controls=kids.slice(0,5);
      }
    }

    controls=Array.from(new Set(controls)).slice(0,5);
    if(controls.length===5){
      var row=controls[0].parentElement;
      if(row && controls.every(function(c){return c.parentElement===row;})){
        row.classList.add('vanaya-jm-rating-row');
      }
      controls.forEach(function(c){
        c.classList.add('vanaya-jm-star-force');
        c.style.setProperty('opacity','1','important');
        c.style.setProperty('visibility','visible','important');
      });
    }

    if(poor && great){
      var parent = poor.parentElement===great.parentElement ? poor.parentElement : null;
      if(parent){
        parent.classList.add('vanaya-jm-guidance');
      } else {
        /* If Judge.me places them in separate wrappers, normalize the nearest
           common container and separate the two wrappers. */
        var a=poor.parentElement,b=great.parentElement, p=a;
        while(p && p!==modal && !p.contains(great)) p=p.parentElement;
        if(p && p!==modal){
          p.classList.add('vanaya-jm-guidance');
          a.style.setProperty('position','static','important');
          b.style.setProperty('position','static','important');
        }
      }
    }
  }
  document.addEventListener('DOMContentLoaded',repair);
  new MutationObserver(function(){ repair(); }).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',function(){ setTimeout(repair,50); setTimeout(repair,300); },true);
})();
