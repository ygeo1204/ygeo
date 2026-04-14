/* ═══════════════════════════════════════════════════════
   청첩장 | 어연걸 & 김소정
   script.js
═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 전역 변수 ──────────────────────────────────────── */
  var opening      = document.getElementById('opening');
  var main         = document.getElementById('main');
  var rsvpForm     = document.getElementById('rsvpForm');
  var rsvpResult   = document.getElementById('rsvpResult');
  var galleryModal = document.getElementById('galleryModal');
  var modalSlider  = document.getElementById('modalSlider');
  var modalIdxEl   = document.getElementById('modalIdx');

  var WEDDING = new Date('2026-09-20T13:20:00');
  var envelopeOpened   = false;
  var scrollInited     = false;
  var countdownTimer   = null;

  /* ── 갤러리 ─────────────────────────────────────────── */
  var galleryTrack    = document.getElementById('galleryTrack');
  var galleryDots     = document.getElementById('galleryDots');
  var currentGallery  = 0;
  var totalGallery    = 3;

  /* 모달 슬라이드 */
  var modalCurrent    = 0;
  var totalModal      = 3;

  /* ═══════════════════════════════════════════════════
     1. 오프닝 화면
  ═══════════════════════════════════════════════════ */
  function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;
    opening.classList.add('hidden');
    main.classList.add('visible');
    sessionStorage.setItem('inv_opened', '1');
    setTimeout(function () {
      opening.style.display = 'none';
      startCountdown();
      initScroll();
    }, 1000);
  }

  /* 세션 복원 */
  if (sessionStorage.getItem('inv_opened')) {
    envelopeOpened = true;
    opening.classList.add('hidden');
    main.classList.add('visible');
    opening.style.display = 'none';
    setTimeout(function () { startCountdown(); initScroll(); }, 80);
  }

  window.openEnvelope = openEnvelope;
  document.addEventListener('touchstart', function () { openEnvelope(); }, { once: true });
  document.addEventListener('scroll',     function () { openEnvelope(); }, { once: true });
  /* 2.3초 후 자동 오픈 */
  setTimeout(function () { if (!envelopeOpened) openEnvelope(); }, 2300);

  /* ═══════════════════════════════════════════════════
     2. 스크롤 등장 애니메이션
  ═══════════════════════════════════════════════════ */
  function initScroll() {
    if (scrollInited) return;
    scrollInited = true;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.section-inner').forEach(function (el) {
      io.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════════
     3. 달력 생성 (2026년 9월)
  ═══════════════════════════════════════════════════ */
  function generateCalendar() {
    var grid = document.getElementById('calGrid');
    if (!grid) return;

    var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    var html = '';

    /* 요일 헤더 */
    dayNames.forEach(function (d, i) {
      var cls = i === 0 ? 'sun' : i === 6 ? 'sat' : '';
      html += '<div class="cal-day-name ' + cls + '">' + d + '</div>';
    });

    /* 2026-09-01 = 화요일(index 2) */
    var startDay = 2;
    var totalDays = 30;
    var WEDDING_DAY = 20;

    for (var i = 0; i < startDay; i++) {
      html += '<div class="cal-cell empty"><div class="cal-day"></div></div>';
    }
    for (var d = 1; d <= totalDays; d++) {
      var col   = (startDay + d - 1) % 7;
      var isSun = col === 0;
      var isSat = col === 6;
      var isWed = d === WEDDING_DAY;
      var cls   = [];
      if (isWed) cls.push('wedding');
      if (isSun) cls.push('sun');
      if (isSat) cls.push('sat');
      html += '<div class="cal-cell"><div class="cal-day ' + cls.join(' ') + '">' + d + '</div></div>';
    }

    grid.innerHTML = html;
  }
  generateCalendar();

  /* ═══════════════════════════════════════════════════
     4. 실시간 카운트다운
  ═══════════════════════════════════════════════════ */
  function startCountdown() {
    if (countdownTimer) clearInterval(countdownTimer);
    updateCountdown();
    countdownTimer = setInterval(updateCountdown, 1000);
  }

  function updateCountdown() {
    var cdDays  = document.getElementById('cd-days');
    var cdHours = document.getElementById('cd-hours');
    var cdMins  = document.getElementById('cd-mins');
    var cdSecs  = document.getElementById('cd-secs');
    if (!cdDays) return;

    var now  = new Date();
    var diff = WEDDING - now;

    if (diff <= 0) {
      cdDays.textContent  = '000';
      cdHours.textContent = '00';
      cdMins.textContent  = '00';
      cdSecs.textContent  = '00';
      clearInterval(countdownTimer);
      return;
    }

    var totalSecs = Math.floor(diff / 1000);
    var days  = Math.floor(totalSecs / 86400);
    var hours = Math.floor((totalSecs % 86400) / 3600);
    var mins  = Math.floor((totalSecs % 3600) / 60);
    var secs  = totalSecs % 60;

    cdDays.textContent  = String(days).padStart(3, '0');
    cdHours.textContent = String(hours).padStart(2, '0');
    cdMins.textContent  = String(mins).padStart(2, '0');
    cdSecs.textContent  = String(secs).padStart(2, '0');
  }

  /* ═══════════════════════════════════════════════════
     5. 갤러리 스와이프 (섹션 내)
  ═══════════════════════════════════════════════════ */
  if (galleryTrack) {
    var touchStartX = 0;
    var touchDeltaX = 0;
    var isDragging  = false;

    function setGallerySlide(idx) {
      currentGallery = (idx + totalGallery) % totalGallery;
      galleryTrack.style.transform = 'translateX(' + (-currentGallery * 100) + '%)';
      /* 도트 업데이트 */
      var dots = galleryDots ? galleryDots.querySelectorAll('.dot') : [];
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === currentGallery);
      });
    }

    /* 터치 이벤트 */
    galleryTrack.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      isDragging  = true;
    }, { passive: true });

    galleryTrack.addEventListener('touchmove', function (e) {
      if (!isDragging) return;
      touchDeltaX = e.touches[0].clientX - touchStartX;
    }, { passive: true });

    galleryTrack.addEventListener('touchend', function () {
      if (!isDragging) return;
      isDragging = false;
      if (Math.abs(touchDeltaX) > 48) {
        setGallerySlide(touchDeltaX < 0 ? currentGallery + 1 : currentGallery - 1);
      }
      touchDeltaX = 0;
    });

    /* 마우스 드래그 (PC 미리보기용) */
    var mouseStartX = 0;
    var mouseDown   = false;

    galleryTrack.addEventListener('mousedown', function (e) {
      mouseStartX = e.clientX;
      mouseDown   = true;
    });
    galleryTrack.addEventListener('mousemove', function (e) {
      if (mouseDown) e.preventDefault();
    });
    galleryTrack.addEventListener('mouseup', function (e) {
      if (!mouseDown) return;
      mouseDown = false;
      var delta = e.clientX - mouseStartX;
      if (Math.abs(delta) > 48) {
        setGallerySlide(delta < 0 ? currentGallery + 1 : currentGallery - 1);
      }
    });
    galleryTrack.addEventListener('mouseleave', function () { mouseDown = false; });

    /* 도트 클릭 */
    if (galleryDots) {
      galleryDots.querySelectorAll('.dot').forEach(function (dot) {
        dot.addEventListener('click', function () {
          setGallerySlide(parseInt(dot.getAttribute('data-idx'), 10));
        });
      });
    }
  }

  /* ═══════════════════════════════════════════════════
     6. 갤러리 모달 (풀스크린 + 스와이프)
  ═══════════════════════════════════════════════════ */
  window.openModal = function (idx) {
    modalCurrent = idx;
    if (galleryModal) {
      galleryModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      updateModalSlider();
    }
  };

  window.closeModal = function () {
    if (galleryModal) {
      galleryModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  window.modalPrev = function () {
    modalCurrent = (modalCurrent - 1 + totalModal) % totalModal;
    updateModalSlider();
  };

  window.modalNext = function () {
    modalCurrent = (modalCurrent + 1) % totalModal;
    updateModalSlider();
  };

  function updateModalSlider() {
    if (modalSlider) {
      modalSlider.style.transform = 'translateX(' + (-modalCurrent * 100) + '%)';
    }
    if (modalIdxEl) {
      modalIdxEl.textContent = (modalCurrent + 1) + ' / ' + totalModal;
    }
  }

  /* 모달 배경 클릭으로 닫기 */
  if (galleryModal) {
    galleryModal.addEventListener('click', function (e) {
      if (e.target === galleryModal) window.closeModal();
    });

    /* 모달 터치 스와이프 */
    var mTouchStartX = 0;
    modalSlider.addEventListener('touchstart', function (e) {
      mTouchStartX = e.touches[0].clientX;
    }, { passive: true });
    modalSlider.addEventListener('touchend', function (e) {
      var delta = e.changedTouches[0].clientX - mTouchStartX;
      if (Math.abs(delta) > 48) {
        delta < 0 ? window.modalNext() : window.modalPrev();
      }
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════
     7. 계좌 탭 전환
  ═══════════════════════════════════════════════════ */
  window.switchTab = function (side) {
    var groomBtn   = document.getElementById('tab-groom-btn');
    var brideBtn   = document.getElementById('tab-bride-btn');
    var groomPanel = document.getElementById('panel-groom');
    var bridePanel = document.getElementById('panel-bride');

    if (side === 'groom') {
      groomBtn.classList.add('active');
      brideBtn.classList.remove('active');
      groomPanel.style.display = 'flex';
      bridePanel.style.display  = 'none';
    } else {
      brideBtn.classList.add('active');
      groomBtn.classList.remove('active');
      bridePanel.style.display = 'flex';
      groomPanel.style.display  = 'none';
    }
  };

  /* ═══════════════════════════════════════════════════
     8. 계좌번호 복사
  ═══════════════════════════════════════════════════ */
  window.copyAccount = function (num, btn) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num).then(function () {
        var orig = btn.textContent;
        btn.textContent = '완료 ✓';
        btn.style.borderColor = '#C4907F';
        btn.style.color = '#C4907F';
        setTimeout(function () {
          btn.textContent = orig;
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 1800);
      }).catch(function () {
        alert('계좌번호: ' + num);
      });
    } else {
      alert('계좌번호: ' + num);
    }
  };

  /* ═══════════════════════════════════════════════════
     9. 캘린더 추가 (.ics)
  ═══════════════════════════════════════════════════ */
  window.addToCalendar = function () {
    var ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding//KO',
      'BEGIN:VEVENT',
      'DTSTART:20260920T132000',
      'DTEND:20260920T150000',
      'SUMMARY:어연걸 ♥ 김소정 결혼식',
      'LOCATION:KU컨벤션웨딩홀, 서울특별시',
      'DESCRIPTION:2026년 9월 20일 일요일 오후 1시 20분',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    a.download = 'wedding-20260920.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /* ═══════════════════════════════════════════════════
     10. 링크 공유
  ═══════════════════════════════════════════════════ */
  window.shareLink = function () {
    var url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: '청첩장 | 어연걸 ♥ 김소정',
        text: '2026년 9월 20일, 저희 결혼식에 초대합니다.',
        url: url
      }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        alert('링크가 복사되었습니다!');
      });
    } else {
      alert(url);
    }
  };

  /* ═══════════════════════════════════════════════════
     11. RSVP 폼 제출
  ═══════════════════════════════════════════════════ */
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {
        name:       rsvpForm.guestName.value,
        attendance: rsvpForm.attendance.value,
        guests:     rsvpForm.guests.value,
        message:    rsvpForm.message.value
      };
      /* 실제 서버로 보낼 경우 여기에 fetch/axios 코드를 추가하세요 */
      console.log('RSVP 데이터:', data);
      rsvpForm.style.display  = 'none';
      rsvpResult.style.display = 'block';
    });
  }

  /* ═══════════════════════════════════════════════════
     초기 실행
  ═══════════════════════════════════════════════════ */
  /* 오프닝이 이미 열려 있다면 즉시 카운트다운 시작 */
  if (envelopeOpened) startCountdown();

})();
