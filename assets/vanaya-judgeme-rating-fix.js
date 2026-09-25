/* VANAYA Judge.me in-store form repair — final targeted fix */
(function(){
  function txt(el){ return (el && el.textContent || '').replace(/\s+/g,' ').trim(); }

  function findModal(){
    var h=Array.from(document.querySelectorAll('h1,h2,h3,h4,p,div,span'))
      .find(function(el){ return txt(el)==='How would you rate this product?'; });
    if(!h) return null;
    var n=h;
    for(var i=0;i<10 && n && n!==document.body;i++,n=n.parentElement){
      var t=txt(n);
      if(t.indexOf('Poor')>-1 && t.indexOf('Great')>-1) return n;
    }
    return h.parentElement;
  }

  function fixGuide(modal){
    var candidates=Array.from(modal.querySelectorAll('*'));
    var guide=candidates.find(function(el){
      var t=txt(el).replace(/\s/g,'');
      return el.children.length===0 && t==='PoorGreat';
    });

    if(!guide){
      var poor=candidates.find(function(el){ return el.children.length===0 && txt(el)==='Poor'; });
      var great=candidates.find(function(el){ return el.children.length===0 && txt(el)==='Great'; });
      if(poor && great){
        var p=poor.parentElement;
        while(p && p!==modal && !p.contains(great)) p=p.parentElement;
        guide=p && p!==modal ? p : poor.parentElement;
      }
    }

    if(!guide) return null;

    guide.classList.add('vanaya-jm-guide-fixed');
    guide.innerHTML='<span class="vanaya-jm-guide-poor">Poor</span><span class="vanaya-jm-guide-great">Great</span>';

    return guide;
  }

  function fixStarRow(modal, guide){
    var row=null;

    if(guide){
      row=guide.previousElementSibling;
      if(row && row.children.length<3) row=null;
    }

    if(!row){
      var starish=Array.from(modal.querySelectorAll('button,label,[role="button"],input[type="radio"]'))
        .filter(function(el){
          var blob=[
            el.getAttribute && el.getAttribute('aria-label'),
            el.getAttribute && el.getAttribute('title'),
            el.getAttribute && el.getAttribute('name'),
            el.getAttribute && el.getAttribute('value'),
            txt(el)
          ].filter(Boolean).join(' ').toLowerCase();
          return /star|rating/.test(blob);
        });
      if(starish.length>=5){
        var parent=starish[0].parentElement;
        if(parent && starish.slice(0,5).every(function(x){return x.parentElement===parent;})) row=parent;
      }
    }

    if(!row) return;

    row.classList.add('vanaya-jm-stars-fixed');
    row.style.setProperty('display','flex','important');
    row.style.setProperty('justify-content','center','important');
    row.style.setProperty('align-items','center','important');
    row.style.setProperty('gap','12px','important');
    row.style.setProperty('width','100%','important');
    row.style.setProperty('max-width','100%','important');
    row.style.setProperty('margin-left','auto','important');
    row.style.setProperty('margin-right','auto','important');
    row.style.setProperty('padding-left','0','important');
    row.style.setProperty('padding-right','0','important');
    row.style.setProperty('left','auto','important');
    row.style.setProperty('right','auto','important');
    row.style.setProperty('transform','none','important');
    row.style.setProperty('float','none','important');
    row.style.setProperty('text-align','center','important');

    Array.from(row.children).forEach(function(el){
      el.style.setProperty('float','none','important');
      el.style.setProperty('margin-left','0','important');
      el.style.setProperty('margin-right','0','important');
      el.style.setProperty('left','auto','important');
      el.style.setProperty('right','auto','important');
      el.style.setProperty('transform','none','important');
    });
  }

  function repair(){
    var modal=findModal();
    if(!modal) return;
    var guide=fixGuide(modal);
    fixStarRow(modal,guide);
  }

  function schedule(){
    repair();
    setTimeout(repair,50);
    setTimeout(repair,250);
    setTimeout(repair,700);
  }

  document.addEventListener('DOMContentLoaded',schedule);
  document.addEventListener('click',schedule,true);
  window.addEventListener('resize',schedule);
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();