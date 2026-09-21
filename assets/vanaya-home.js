document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('[data-vanaya-video-hero]').forEach(function(hero){
    var video=hero.querySelector('video');
    var ready=function(){hero.classList.add('is-ready')};
    if(video){if(video.readyState>=2)ready();video.addEventListener('loadeddata',ready);video.addEventListener('playing',ready)}
  });
  document.querySelectorAll('[data-vanaya-products]').forEach(function(root){
    var track=root.querySelector('[data-track]'),cards=Array.from(root.querySelectorAll('[data-product-card]')),current=0,timer;
    var label=root.querySelector('[data-page-label]'),bars=root.querySelectorAll('[data-progress]');
    if(!track || !cards.length) return;
    var visible=function(){return window.matchMedia('(max-width: 900px)').matches ? 2 : 4};
    var maxIndex=function(){return Math.max(0,cards.length-visible());};
    var step=function(){
      if(cards.length<2)return 0;
      var a=cards[0].getBoundingClientRect(),b=cards[1].getBoundingClientRect();
      return b.left-a.left;
    };
    var update=function(){
      if(current>maxIndex())current=maxIndex();
      track.style.transform='translate3d(-'+(current*step())+'px,0,0)';
      if(label)label.textContent=String(current+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
      bars.forEach(function(bar,i){bar.classList.toggle('active',i===current)});
    };
    var move=function(by){
      var max=maxIndex();
      if(max===0){current=0;update();return;}
      current+=by;
      if(current>max)current=0;
      if(current<0)current=max;
      update();
    };
    var start=function(){if(root.dataset.productAutoplay!=='true'||cards.length<=visible())return;clearInterval(timer);timer=setInterval(function(){move(1)},5000)};
    root.querySelectorAll('[data-product-move]').forEach(function(btn){btn.addEventListener('click',function(){move(Number(btn.dataset.productMove));start()})});
    root.addEventListener('mouseenter',function(){clearInterval(timer)});
    root.addEventListener('mouseleave',start);
    window.addEventListener('resize',function(){update()});
    update();start();
  });
  document.querySelectorAll('[data-vanaya-banners]').forEach(function(root){
    var slides=root.querySelectorAll('[data-banner-slide]'),dots=root.querySelectorAll('[data-banner-dot]'),current=0,timer;
    var update=function(){slides.forEach(function(s,i){s.classList.toggle('active',i===current)});dots.forEach(function(d,i){d.classList.toggle('active',i===current)})};
    var move=function(by){current=(current+by+slides.length)%slides.length;update()};
    root.querySelectorAll('[data-banner-move]').forEach(function(btn){btn.addEventListener('click',function(){move(Number(btn.dataset.bannerMove))})});
    dots.forEach(function(dot,i){dot.addEventListener('click',function(){current=i;update()})});
    if(slides.length>1)timer=setInterval(function(){move(1)},6000);update();
  });
});
