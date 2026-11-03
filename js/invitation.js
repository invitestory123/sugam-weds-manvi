(() => {
  'use strict';
  const data = window.WEDDING_DATA;
  const theme = window.INVITATION_THEMES[data.theme] || window.INVITATION_THEMES['petrol-dahlia'];
  const root = document.documentElement;
  ['paper','ink','accent'].forEach(key => root.style.setProperty(`--${key}`, theme[key]));
  const asset = name => new URL('./assets/' + name.replace(/\.(png|jpe?g)$/, '.webp'), location.href).href;
  root.style.setProperty('--botanical', `url("${asset('botanical.webp')}")`);
  root.style.setProperty('--timeline-flower', `url("${asset('timeline-flower.webp')}")`);
  document.body.classList.add(`theme-${data.theme}`, 'locked');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeURL = value => { try { const u = new URL(value, location.href); return ['http:','https:','file:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  const text = escape;
  const date = new Date(data.wedding.dateISO);
  const validDate = !Number.isNaN(date.getTime());
  const isMultiDay = Array.isArray(data.schedule) && data.schedule.some(item => item.events || item.dayLabel);

  const scheduleHTML = isMultiDay ? `
    <div class="itinerary">
      ${data.schedule.map(day => `
        <article class="itinerary-day reveal">
          <header class="day-header">
            <span class="day-pill">${text(day.dayLabel || day.date)}</span>
            ${day.title ? `<h3 class="day-title">${text(day.title)}</h3>` : ''}
            ${day.subtitle ? `<p class="day-subtitle">${text(day.subtitle)}</p>` : ''}
            <div class="day-ornament" aria-hidden="true"></div>
          </header>
          ${day.cardImage ? `
            <div class="itinerary-card-img-wrap">
              <img class="itinerary-card-img" src="${text(safeURL(day.cardImage))}" alt="${text(day.title || 'Event card')}" loading="lazy">
            </div>
          ` : ''}
          ${day.events && day.events.length ? `
            <div class="day-subevents">
              ${day.events.map(ev => `
                <div class="subevent-card">
                  <h4 class="subevent-title">${text(ev.title)}</h4>
                  ${ev.subtitle ? `<p class="subevent-subtitle">${text(ev.subtitle)}</p>` : ''}
                  <div class="subevent-meta">
                    ${ev.time ? `<time><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${text(ev.time)}</time>` : ''}
                    ${ev.time && ev.location ? `<span class="meta-sep" aria-hidden="true">·</span>` : ''}
                    ${ev.location ? `<span class="meta-loc"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${text(ev.location)}</span>` : ''}
                  </div>
                  ${ev.dressCode ? `
                    <div class="dress-callout">
                      <strong>Dress Code</strong>
                      <span>${text(ev.dressCode)}</span>
                    </div>
                  ` : ''}
                  ${ev.note ? `<p class="subevent-note">${text(ev.note)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${day.dressCode ? `
            <div class="day-dress">
              <span class="dress-kicker">Dress Code</span>
              <p class="dress-desc">${text(day.dressCode)}</p>
            </div>
          ` : ''}
        </article>
      `).join('')}
    </div>
  ` : `<ol class="timeline">${(data.schedule || []).map(event=>`<li class="reveal"><time>${text(event.time)}</time><span class="event-marker" aria-hidden="true"></span><span class="event-name">${text(event.title)}</span></li>`).join('')}</ol>`;

  document.title = `${data.couple.first} & ${data.couple.second} | ${data.wedding.occasion || 'Wedding Invitation'}`;

  document.querySelector('#app').innerHTML = `
    <div class="entrance" id="entrance">
      <img class="envelope" src="${data.media.openingPoster ? text(safeURL(data.media.openingPoster)) : asset('envelope-first.webp')}" alt="${text(theme.name)} floral embossed envelope with a wax seal" fetchpriority="high">
      <img class="envelope envelope-end" id="envelope-end" data-src="${asset('envelope-last.webp')}" alt="" hidden>
      <button class="open-invitation" id="open" aria-label="Open the wedding invitation"><span class="open-caption">Open your invitation<small>${text(data.couple.first)} &amp; ${text(data.couple.second)}</small></span></button>
      <video class="opening-video" id="opening-video" muted playsinline preload="none" hidden></video>
      <button class="skip-opening" id="skip" hidden>Skip opening</button>
    </div>
    <main class="invitation" id="invitation" inert>
      <section class="hero" aria-label="Wedding invitation">
        <img class="hero-art" src="${data.media.heroPoster ? text(safeURL(data.media.heroPoster)) : asset('hero-first.webp')}" alt="${text(theme.scene)}" decoding="async">
        <video class="hero-video" id="hero-video" muted loop playsinline preload="none" hidden></video>
        <div class="hero-copy"><p class="occasion">${text(data.wedding.occasion || 'The Wedding of')}</p>
          <h1 class="names" id="names" tabindex="-1"><span>${text(data.couple.first)}</span><i>&amp;</i><span>${text(data.couple.second)}</span></h1>
          <p class="hero-note">${text(data.couple.heroNote)}</p><a class="hero-link" href="#our-invitation">With love, you are invited</a>
        </div>
      </section>

      <section class="paper-section floral intro" id="our-invitation" aria-label="Our invitation">
        ${data.wedding.invocation ? `<p class="invocation reveal">${text(data.wedding.invocation)}</p>` : ''}
        <h2 class="script reveal">${text(data.couple.subtitle)}</h2>
        
        ${data.couple.grandparents ? `
        <div class="elders-intro reveal">
          ${(() => {
            const raw = String(data.couple.grandparents);
            const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
            if (lines.length >= 2) {
              return `<p class="grandparents-blessing-lead">${text(lines[0])}</p><p class="grandparents-blessing-names">${text(lines.slice(1).join(' '))}</p>`;
            }
            return `<p class="grandparents-blessing">${text(raw)}</p>`;
          })()}
        </div>
        ` : ''}

        ${data.wedding.invitationLead ? `
        <p class="invitation-lead reveal">${text(data.wedding.invitationLead)}</p>
        ` : ''}

        ${(data.couple.groomParents || data.couple.brideParents) ? `
        <div class="honored-couple-grid reveal">
          <div class="couple-side">
            <h2 class="script couple-honor-name">${text(data.couple.groomFull || data.couple.first)}</h2>
            ${data.couple.groomParents ? `<p class="member-parentage">(${text(data.couple.groomParents)})</p>` : ''}
          </div>
          <p class="couple-conjunction" aria-label="with">with</p>
          <div class="couple-side">
            <h2 class="script couple-honor-name">${text(data.couple.brideFull || data.couple.second)}</h2>
            ${data.couple.brideParents ? `<p class="member-parentage">(${text(data.couple.brideParents)})</p>` : ''}
          </div>
        </div>
        ` : ''}

        <div class="rule" aria-hidden="true"></div>
        ${data.wedding.salutation ? `<p class="salutation-heading reveal">${text(data.wedding.salutation)}</p>` : ''}
        <p class="invitation-note reveal">${text(data.wedding.invitationNote)}</p>
      </section>

      <section class="paper-section countdown-section torn" aria-labelledby="countdown-title">
        <h2 class="script" id="countdown-title">${text(data.wedding.countdownTitle || 'Until our celebration begins')}</h2>
        <div class="countdown" id="countdown" role="timer" aria-label="Time until the wedding">
          <div><strong data-count="days">00</strong><span>Days</span></div>
          <div><strong data-count="hours">00</strong><span>Hours</span></div>
          <div><strong data-count="minutes">00</strong><span>Minutes</span></div>
          <div><strong data-count="seconds">00</strong><span>Seconds</span></div>
        </div>
        <p class="countdown-note" id="countdown-note">${text(data.wedding.longDate)}</p>
      </section>

      <section class="paper-section floral schedule-section" aria-labelledby="schedule-title">
        <h2 class="script reveal" id="schedule-title">${text(data.wedding.scheduleTitle || 'Celebration Itinerary')}</h2>
        ${scheduleHTML}
        ${data.wedding.scheduleNote ? `<p class="schedule-note">${text(data.wedding.scheduleNote)}</p>` : ''}
      </section>

      <section class="paper-section venue-section torn" aria-labelledby="venue-title">
        <h2 class="script reveal" id="venue-title">Where we celebrate</h2>
        <img class="venue-scene reveal" src="${asset('hero-first.webp')}" alt="" loading="lazy">
        ${data.venue?.sceneCaption ? `<p class="venue-caption">${text(data.venue.sceneCaption)}</p>` : ''}
        
        <div class="locations-grid">
          ${(data.venues || [data.venue]).map(ven => `
            <div class="location-frame reveal">
              ${ven.role ? `<span class="venue-role-pill">${text(ven.role)}</span>` : ''}
              <h3 class="venue-name">${text(ven.name)}</h3>
              <div class="rule" aria-hidden="true"></div>
              <address class="venue-address">${text(ven.address)}</address>
              ${ven.timeLabel ? `<p class="venue-time">${text(ven.timeLabel)}</p>` : ''}
              <div class="actions">
                <a class="action" href="${text(safeURL(ven.mapsUrl) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ven.name+' '+ven.address)}`)}" target="_blank" rel="noopener noreferrer">Open in maps</a>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="actions-single reveal">
          <button class="action secondary" id="calendar">Add to calendar</button>
        </div>
        ${data.venue?.note ? `<p class="travel-note">${text(data.venue.note)}</p>` : ''}
      </section>

      ${(data.details?.dressCode || data.details?.giftPreference) ? `
      <section class="paper-section floral etiquette" aria-label="Guest details">
        ${data.details?.dressCode ? `<article class="reveal"><h2 class="script">Dress code</h2><p>${text(data.details.dressCode)}</p></article>` : ''}
        ${data.details?.dressCode && data.details?.giftPreference ? `<div class="rule" aria-hidden="true"></div>` : ''}
        ${data.details?.giftPreference ? `<article class="reveal"><h2 class="script">Your presence, our present</h2><p>${text(data.details.giftPreference)}</p></article>` : ''}
      </section>
      ` : ''}

      ${data.details?.blessing ? `
      <section class="paper-section floral blessing-section" aria-label="Family blessing">
        <article class="blessing-card reveal">
          <p class="blessing-message">${text(data.details.blessing.message).replace(/\n/g, '<br>')}</p>
          <div class="blessing-ornament" aria-hidden="true"></div>
          <p class="blessing-regards">${text(data.details.blessing.regards)}</p>
          <h3 class="blessing-family">${text(data.details.blessing.family)}</h3>
        </article>
      </section>
      ` : ''}

      ${data.rsvp ? `
      <section class="paper-section floral rsvp-section" aria-labelledby="rsvp-title">
        ${data.rsvp.contacts ? `
        <div class="rsvp-card rsvp-contact-card reveal">
          ${data.rsvp.monogram ? `
          <div class="rsvp-monogram" aria-hidden="true">
            <span class="monogram-letters">${text(data.rsvp.monogram)}</span>
          </div>
          ` : ''}
          <h2 class="script rsvp-couple-names" id="rsvp-title">${text(data.rsvp.coupleTitle || (data.couple.first + ' & ' + data.couple.second))}</h2>
          <div class="rsvp-rule" aria-hidden="true"></div>
          
          <div class="rsvp-details-grid">
            <div class="rsvp-col rsvp-left">
              <h3 class="rsvp-heading">${text(data.rsvp.title || 'R.S.V.P:')}</h3>
              <ul class="rsvp-contact-list">
                ${(data.rsvp.contacts || []).map(c => `
                  <li><span class="contact-name">${text(c.name)}</span> <span class="contact-sep">-</span> <a class="contact-phone" href="tel:${text(c.raw || c.phone.replace(/[^0-9+]/g, ''))}">${text(c.phone)}</a></li>
                `).join('')}
              </ul>
            </div>

            <div class="rsvp-col-divider" aria-hidden="true"></div>

            <div class="rsvp-col rsvp-right">
              <h3 class="rsvp-heading">${text(data.rsvp.regardsTitle || 'With Warm Regards:')}</h3>
              <p class="rsvp-regards">${text(data.rsvp.regards || 'Family & Friends')}</p>
            </div>
          </div>
        </div>
        ` : `
        <div class="rsvp-card reveal"><span class="rsvp-kicker">Kindly reply</span>
          <svg class="rsvp-envelope" viewBox="0 0 48 36" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><rect x="2" y="3" width="44" height="30" rx="2"/><path d="m3 5 21 16L45 5M3 32l14-14m28 14L31 18"/></svg>
          <h2 class="script" id="rsvp-title">${text(data.rsvp?.heading || 'A place for you')}</h2>
          <p>${text(data.rsvp?.note || 'We would love to celebrate with you. Kindly let us know if you can join us.')}</p>
          ${data.rsvp?.deadline ? `<p class="rsvp-deadline">Kindly reply by ${text(data.rsvp.deadline)}</p>` : ''}
          <form class="rsvp-form" id="rsvp-form"></form>
        </div>
        `}
      </section>
      ` : ''}

      <footer class="closing" aria-labelledby="closing-title">
        <div class="closing-scene">
          <img class="closing-art" src="${data.media.heroPoster ? text(safeURL(data.media.heroPoster)) : asset('hero-first.webp')}" alt="" width="720" height="1280" loading="lazy" decoding="async">
          <div class="closing-copy reveal">
            <p class="closing-eyebrow">The beginning of our forever</p>
            <h2 class="closing-title" id="closing-title">With all<br><em>our love</em></h2>
            <div class="closing-rule" aria-hidden="true"></div>
            <p class="closing-names"><span>${text(data.couple.first)}</span><i>&amp;</i><span>${text(data.couple.second)}</span></p>
            <p class="closing-date">${text(data.wedding.dateLabel)}</p>
            <p class="closing-note">The day will be beautiful.<br>Even more so with you.</p>
            ${data.wedding.familySignature ? `<p class="closing-family-sig">${text(data.wedding.familySignature)}</p>` : ''}
          </div>
          <p class="closing-caption">A little moment. A lifetime of love.</p>
        </div>
        <div class="closing-colophon">
          <button class="reopen" id="reopen">Open the envelope again <span aria-hidden="true">↺</span></button>
          <a class="dearly-signature" href="../" aria-label="Explore Dearly wedding invitations">Dearly<small>Made for your forever</small></a>
          ${data.media.music && data.media.musicTitle ? `<p class="music-credit">Music: ${data.media.musicSource ? `<a href="${text(safeURL(data.media.musicSource))}" target="_blank" rel="noopener noreferrer">${text(data.media.musicTitle)}</a>` : text(data.media.musicTitle)}${data.media.musicArtist ? `<br>${text(data.media.musicArtist)}` : ''}<br><small>Volume adjusted · soft fade-in</small></p>` : ''}
        </div>
      </footer>
    </main>
    <div class="media-controls" id="media-controls" hidden><button class="media-button" id="motion" aria-pressed="false" hidden>Pause motion</button><button class="media-button" id="music" aria-pressed="false" hidden>Play music</button></div>
    <audio id="audio" loop preload="none"></audio><p id="status" class="status" role="status" hidden></p>`;

  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = $('hero-video'), opening = $('opening-video'), audio = $('audio');
  let musicAttempted = false;
  let opened = false, openingTimer, fadeTimer, statusTimer, observersStarted = false;
  let motionPaused = reduced.matches;
  const ambience = window.initInvitationMotion({theme:data.theme,reduced});
  function syncMotion() {
    const stopped = motionPaused || reduced.matches;
    ambience.setPaused(stopped || !opened);
    $('motion').hidden=false;
    $('motion').disabled=reduced.matches;
    $('motion').textContent=reduced.matches ? 'Reduced motion' : (motionPaused ? 'Play motion' : 'Pause motion');
    $('motion').setAttribute('aria-pressed',String(stopped));
    hero.hidden=stopped || !source('heroVideo');
    if(stopped || !opened) hero.pause();
    else if(source('heroVideo')) hero.play().catch(()=>{hero.hidden=true;});
  }
  const notify = message => { $('status').textContent = message; $('status').hidden=false; clearTimeout(statusTimer); statusTimer=setTimeout(()=>$('status').hidden=true,4500); };
  const source = name => data.media[name] ? safeURL(data.media[name]) : '';
  if (source('openingVideo')) { opening.src=source('openingVideo'); opening.poster=source('openingPoster') || asset('envelope-first.webp'); opening.preload='auto'; }
  if (source('heroVideo')) { hero.src=source('heroVideo'); hero.poster=source('heroPoster') || asset('hero-first.webp'); }
  if (source('music')) { audio.src=source('music'); audio.volume=.45; }
  audio.addEventListener('error',()=>{ $('music').textContent='Play music'; $('music').setAttribute('aria-pressed','false'); if(opened) notify('Music could not be loaded. You can still enjoy the invitation.'); });

  if (data.rsvp && $('rsvp-form')) {
    window.initWeddingRSVP($('rsvp-form'), data.rsvp || {}, `${data.couple.first} & ${data.couple.second}`);
  }

  function beginObservers() {
    if(observersStarted || !('IntersectionObserver' in window)) return;
    observersStarted=true;
    const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){if(!reduced.matches && !motionPaused) entry.target.classList.add('arriving');reveal.unobserve(entry.target);}}),{threshold:.12});
    document.querySelectorAll('.reveal').forEach(el=>reveal.observe(el));
    const timeline=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.timeline li').forEach(el=>el.classList.remove('is-current'));entry.target.classList.add('is-current');}}),{rootMargin:'-30% 0px -45% 0px'});
    document.querySelectorAll('.timeline li').forEach(el=>timeline.observe(el));
  }
  function finishOpening() {
    if($('entrance').classList.contains('leaving') || $('entrance').hidden)return;
    clearTimeout(openingTimer);
    $('entrance').classList.add('leaving');
    $('invitation').inert=false;
    document.body.classList.remove('locked');
    $('media-controls').hidden=false;
    syncMotion();
    $('music').hidden=!source('music');
    beginObservers();
    $('names').focus({preventScroll:true});
    fadeTimer=setTimeout(()=>{$('entrance').hidden=true;opening.pause();},reduced.matches?0:900);
  }
  async function openInvitation() {
    if(opened)return;opened=true;$('open').disabled=true;
    if(source('heroVideo') && !reduced.matches) { hero.preload='auto'; hero.load(); }
    if(source('music')) {
      $('media-controls').hidden=false; $('music').hidden=false;
      if(!musicAttempted) { musicAttempted=true; audio.play().then(()=>{ $('music').textContent='Pause music'; $('music').setAttribute('aria-pressed','true'); }).catch(()=>{}); }
    }
    if(source('openingVideo') && !reduced.matches){
      $('skip').hidden=false;$('skip').focus();opening.hidden=false;
      openingTimer=setTimeout(finishOpening,20000);
      try{await opening.play();}catch{finishOpening();}
    }else if(reduced.matches){finishOpening();}
    else{const end=$('envelope-end');end.src=end.dataset.src;end.hidden=false;$('entrance').classList.add('opening');openingTimer=setTimeout(finishOpening,1800);}
  }
  $('open').addEventListener('click',openInvitation);
  $('skip').addEventListener('click',finishOpening);
  opening.addEventListener('ended',finishOpening);
  opening.addEventListener('error',()=>{if(opened)finishOpening();});
  opening.addEventListener('timeupdate',()=>{if(Number.isFinite(opening.duration)&&opening.currentTime>=opening.duration-.8)finishOpening();});
  hero.addEventListener('error',()=>{hero.hidden=true;});
  $('reopen').addEventListener('click',()=>{clearTimeout(fadeTimer);clearTimeout(openingTimer);window.scrollTo({top:0,behavior:'instant'});opened=false;ambience.setPaused(true);opening.pause();opening.currentTime=0;opening.hidden=true;hero.pause();hero.currentTime=0;$('entrance').hidden=false;$('entrance').classList.remove('leaving','opening');$('open').disabled=false;$('skip').hidden=true;$('invitation').inert=true;$('media-controls').hidden=true;document.body.classList.add('locked');$('open').focus();});
  $('music').addEventListener('click',async()=>{if(audio.paused){try{await audio.play();$('music').textContent='Pause music';$('music').setAttribute('aria-pressed','true');}catch{notify('Music could not be played. Please try again.');}}else{audio.pause();$('music').textContent='Play music';$('music').setAttribute('aria-pressed','false');}});
  $('motion').addEventListener('click',()=>{if(reduced.matches)return;motionPaused=!motionPaused;syncMotion();});
  reduced.addEventListener('change',event=>{motionPaused=event.matches;if(event.matches && opened)finishOpening();syncMotion();});

  function tick(){
    if(!validDate){$('countdown').hidden=true;$('countdown-note').textContent=data.wedding.longDate;return;}
    const remaining=Math.max(0,date.getTime()-Date.now()), seconds=Math.floor(remaining/1000);
    const values={days:Math.floor(seconds/86400),hours:Math.floor(seconds/3600)%24,minutes:Math.floor(seconds/60)%60,seconds:seconds%60};
    for(const [key,value] of Object.entries(values)) {
      const el = document.querySelector(`[data-count="${key}"]`);
      if(el) el.textContent=String(value).padStart(2,'0');
    }
    if(!remaining){$('countdown-title').textContent='Our celebration has begun';$('countdown-note').textContent='Thank you for being part of our story.';}
  }
  tick();setInterval(tick,1000);
  const icsEscape=value=>String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const stamp=value=>value.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  if ($('calendar')) {
    $('calendar').disabled=!validDate;
    $('calendar').addEventListener('click',()=>{
      const configuredEnd=new Date(data.wedding.endISO);const end=Number.isFinite(configuredEnd.getTime())&&configuredEnd>date?configuredEnd:new Date(date.getTime()+48*3600000);
      const primaryVenue = (data.venues && data.venues[0]) || data.venue || { name: 'Palms Banquet', address: 'Zirakpur' };
      const lines=[
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Floral Invitations//Wedding//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:${icsEscape(data.theme)}-${date.getTime()}@floral-invitations.local`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(date)}`,
        `DTEND:${stamp(end)}`,
        `SUMMARY:${icsEscape(data.couple.first+' & '+data.couple.second+' Wedding Celebrations')}`,
        `LOCATION:${icsEscape(primaryVenue.name+', '+primaryVenue.address)}`,
        `DESCRIPTION:${icsEscape(data.wedding.invitationNote)}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ];
      const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download=`${data.couple.first}-${data.couple.second}-wedding.ics`;a.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      notify('Your calendar invitation has been downloaded.');
    });
  }
})();
