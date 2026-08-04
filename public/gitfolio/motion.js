(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const embedded = new URLSearchParams(location.search).has('embedded');
  if (embedded) document.body.classList.add('gitfolio-embedded');
  const landingPage = /(?:index|landing)\.html$/.test(location.pathname);
  const root = document.body.firstElementChild;

  const revealTargets = new Set();
  if (root && landingPage) {
    [...root.children].forEach((el) => {
      if (!el.matches('aside, main')) revealTargets.add(el);
    });
  }
  if (landingPage) {
    document.querySelectorAll('section > div > *, h1, h2').forEach((el) => {
      if (!el.closest('header')) revealTargets.add(el);
    });
    const hero = document.querySelector('section');
    const heroLogo = hero?.querySelector('img[src*="gitfolio-logo"]');
    const decorations = [...(hero?.querySelectorAll('svg') || [])];
    hero?.classList.add('onboarding-hero');
    heroLogo?.classList.add('onboarding-logo');
    decorations.forEach((decoration, index) => {
      decoration.classList.add('onboarding-orbit');
      decoration.style.setProperty('--orbit-direction', index % 2 ? '-1' : '1');
    });

    document.querySelectorAll('a[style*="background:#fafafa"]').forEach((button) => button.classList.add('onboarding-cta'));
    if (!reduced && hero) {
      let frame = 0;
      hero.addEventListener('pointermove', (event) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = hero.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - .5;
          const y = (event.clientY - rect.top) / rect.height - .5;
          hero.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
          hero.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
          heroLogo?.style.setProperty('transform', `translate3d(${x * 14}px, ${y * 10}px, 0) rotate(${x * 2}deg)`);
          decorations.forEach((decoration, index) => {
            const depth = index ? -18 : 18;
            decoration.style.translate = `${x * depth}px ${y * depth}px`;
          });
        });
      });
      hero.addEventListener('pointerleave', () => {
        heroLogo?.style.removeProperty('transform');
        decorations.forEach((decoration) => decoration.style.removeProperty('translate'));
      });
    }
  }

  let delayIndex = 0;
  revealTargets.forEach((el) => {
    el.classList.add('motion-reveal');
    el.style.setProperty('--motion-delay', `${Math.min(delayIndex % 5, 4) * 65}ms`);
    delayIndex += 1;
  });

  document.querySelectorAll('div').forEach((el) => {
    const style = getComputedStyle(el);
    const radius = parseFloat(style.borderRadius) || 0;
    const rect = el.getBoundingClientRect();
    const interactiveSize = rect.width > 150 && rect.height > 52 && rect.height < 500;
    const surface = style.backgroundColor !== 'rgba(0, 0, 0, 0)' || style.borderStyle !== 'none';
    if (radius >= 8 && interactiveSize && surface) el.classList.add('motion-card');
  });

  if (landingPage && !reduced) {
    document.querySelectorAll('.motion-card').forEach((card) => {
      card.classList.add('onboarding-tilt');
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const rx = ((event.clientY - rect.top) / rect.height - .5) * -5;
        const ry = ((event.clientX - rect.left) / rect.width - .5) * 5;
        card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => card.style.removeProperty('transform'));
    });
  }

  if (!landingPage) {
    document.querySelectorAll('.motion-card').forEach((card, index) => {
      card.classList.add('ux-enter');
      card.style.setProperty('--ux-enter-delay', `${Math.min(index, 8) * 45}ms`);
    });
  }

  if (location.pathname.endsWith('commitanalysis.html')) {
    const analysisMain = document.querySelector('main');
    const blocks = analysisMain ? [...analysisMain.children].filter((el) => {
      const text = el.textContent.trim();
      return text.includes('작업으로 분리') || text.includes('로그인 화면 UI 구현') || text === 'AI 분석' || text.includes('로그인 화면 구현과 함께') || text === '변경 파일' || text.includes('src/pages/Login.tsx');
    }) : [];
    blocks.forEach((block, index) => {
      block.classList.add('ux-analysis-enter');
      block.style.setProperty('--ux-enter-delay', `${100 + index * 70}ms`);
    });
  }

  document.querySelectorAll('.motion-card').forEach((card) => {
    card.querySelectorAll('div, span').forEach((el) => {
      if (el.children.length || el.closest('button')) return;
      const raw = el.textContent.trim();
      const match = raw.match(/^(₩)?([\d,]+)(%|건|개|회)?$/);
      if (!match) return;
      const target = Number(match[2].replaceAll(',', ''));
      if (!Number.isFinite(target) || target === 0) return;
      const prefix = match[1] || '';
      const suffix = match[3] || '';
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / 720, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${prefix}${Math.round(target * eased).toLocaleString('ko-KR')}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  });

  document.querySelectorAll('[style*="width:"][style*="%"], [style*="width: "][style*="%"]')
    .forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      if (rect.height <= 24 && rect.width > 20) {
        el.classList.add('motion-progress');
        el.style.setProperty('--motion-delay', `${180 + (index % 6) * 80}ms`);
      }
    });

  if (reduced) {
    revealTargets.forEach((el) => el.classList.add('motion-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('motion-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    revealTargets.forEach((el) => observer.observe(el));
  }

  requestAnimationFrame(() => document.body.classList.add('motion-ready'));

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank') return;
    if (location.pathname.endsWith('repolist.html') && link.closest('[style*="grid-template-columns:2.2fr"]')) return;
    const href = link.getAttribute('href') || '';
    if (embedded && href && !href.startsWith('#') && !href.startsWith('http') && href.includes('.html')) {
      event.preventDefault();
      window.parent.postMessage({ type: 'gitfolio:navigate', href }, '*');
    }
  }, { capture: true });

  const header = document.querySelector('header');
  if (header) {
    const updateHeader = () => header.classList.toggle('motion-scrolled', window.scrollY > 12);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  const toast = document.createElement('div');
  toast.className = 'ux-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  let toastTimer;
  const showToast = (message) => {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('ux-show');
    toastTimer = setTimeout(() => toast.classList.remove('ux-show'), 1900);
  };

  const repositoryProfiles = {
    'gitfolio-web': { name: 'gitfolio-web', status: 'completed', description: '개인용 프로젝트 분석 서비스 프론트엔드', language: 'TypeScript', visibility: '비공개', commits: '812', analyzed: '598', additions: '+18,200줄', deletions: '-6,400줄', extensions: '.ts, .tsx, .css' },
    'order-service': { name: 'order-service', status: 'analyzing', description: '주문/결제 백엔드 · 조직 저장소', language: 'Java', visibility: '비공개', commits: '1,204', analyzed: '772', additions: '+41,000줄', deletions: '-12,800줄', extensions: '.java, .kt, .xml' },
    'legacy-admin': { name: 'legacy-admin', status: 'failed', description: '2022년 사내 관리자 도구', language: 'JavaScript', visibility: '공개', commits: '356', analyzed: '0', additions: '+9,100줄', deletions: '-3,200줄', extensions: '.js, .jsx, .css' },
    'weather-app-ios': { name: 'weather-app-ios', status: 'created', description: '2021년 개인 프로젝트', language: 'Swift', visibility: '공개', commits: '128', analyzed: '104', additions: '+4,600줄', deletions: '-1,100줄', extensions: '.swift, .plist' },
    'study-algorithm': { name: 'study-algorithm', status: 'created', description: '알고리즘 스터디 저장소', language: 'Python', visibility: '공개', commits: '642', analyzed: '611', additions: '+11,300줄', deletions: '-2,900줄', extensions: '.py, .ipynb' },
  };
  const selectedRepository = () => {
    try { return JSON.parse(localStorage.getItem('gitfolio:selected-repository')) || repositoryProfiles['gitfolio-web']; }
    catch { return repositoryProfiles['gitfolio-web']; }
  };

  const repo = selectedRepository();
  if (location.pathname.endsWith('repodetail.html')) {
    const main = document.querySelector('main');
    const breadcrumb = main?.firstElementChild;
    const heading = main?.querySelector('h1');
    const description = heading?.nextElementSibling;
    const action = main?.querySelector('a[href="estimate.html"]');
    const metrics = [...(main?.querySelectorAll('[style*="grid-template-columns:repeat(4"]') || [])][0];
    const metricValues = metrics ? [...metrics.children].map((card) => card.lastElementChild) : [];
    if (breadcrumb) breadcrumb.textContent = `저장소 / ${repo.name}`;
    if (heading) heading.textContent = repo.name;
    if (description) description.textContent = `${repo.description} · ${repo.language} · main 브랜치 · ${repo.visibility}`;
    if (metricValues[0]) metricValues[0].textContent = repo.commits;
    if (metricValues[1]) metricValues[1].textContent = repo.status === 'failed' ? '확인 필요' : repo.analyzed;
    const inputs = main?.querySelectorAll('input');
    if (inputs?.[1]) inputs[1].value = repo.extensions;
    if (action && repo.status === 'failed') action.textContent = '분석 다시 준비하기';
    if (repo.status === 'failed' && heading?.parentElement) {
      const notice = document.createElement('div');
      notice.style.cssText = 'margin-top:10px;color:#ef4444;font-size:13px;font-weight:700';
      notice.textContent = '이전 분석이 실패했습니다 · 범위를 확인한 뒤 다시 시작해주세요';
      heading.parentElement.appendChild(notice);
    }
  }
  if (location.pathname.endsWith('estimate.html')) {
    const main = document.querySelector('main');
    if (main?.firstElementChild) main.firstElementChild.textContent = `저장소 / ${repo.name} / 견적`;
    const values = [...(main?.querySelectorAll('[style*="justify-content:space-between"] span:last-child') || [])];
    const replacements = [repo.commits, repo.analyzed, '4.2개', repo.additions, repo.deletions];
    replacements.forEach((value, index) => { if (values[index]) values[index].textContent = value; });
  }
  if (location.pathname.endsWith('orchestration.html')) {
    const main = document.querySelector('main');
    if (main?.firstElementChild) main.firstElementChild.textContent = `저장소 / ${repo.name} / 분석 진행`;
    const progress = [...(main?.querySelectorAll('span') || [])].find((el) => el.textContent.includes('/'));
    if (progress) progress.textContent = `64% · ${repo.analyzed} / ${repo.commits} 커밋`;
  }
  if (location.pathname.endsWith('commitanalysis.html')) {
    const repoTitle = document.querySelector('body > div > div:nth-of-type(1) > div:first-child');
    if (repoTitle) repoTitle.textContent = `${repo.name} · 커밋`;
  }

  const confirmAction = (title, message) => new Promise((resolve) => {
    const layer = document.createElement('div');
    layer.className = 'ux-dialog-layer';
    layer.innerHTML = `<div class="ux-dialog" role="dialog" aria-modal="true"><h2>${title}</h2><p>${message}</p><div class="ux-dialog-actions"><button type="button">취소</button><button type="button">확인</button></div></div>`;
    const finish = (value) => { layer.remove(); resolve(value); };
    const [cancel, confirm] = layer.querySelectorAll('button');
    cancel.addEventListener('click', () => finish(false));
    confirm.addEventListener('click', () => finish(true));
    layer.addEventListener('click', (event) => { if (event.target === layer) finish(false); });
    document.body.appendChild(layer);
    cancel.focus();
  });

  document.querySelectorAll('span').forEach((span) => {
    if (span.textContent.trim() === '테마') span.parentElement?.remove();
  });

  const settingKey = (label) => `gitfolio:${location.pathname}:${label}`;
  document.querySelectorAll('div').forEach((track) => {
    const rect = track.getBoundingClientRect();
    const knob = track.children.length === 1 ? track.firstElementChild : null;
    if (!knob || rect.width < 36 || rect.width > 52 || rect.height < 19 || rect.height > 29) return;
    const knobRect = knob.getBoundingClientRect();
    if (Math.abs(knobRect.width - knobRect.height) > 3) return;
    const row = track.parentElement;
    const label = row?.querySelector('span')?.textContent?.trim() || '설정';
    const initialOn = Boolean(knob.style.right && knob.style.right !== 'auto');
    const saved = localStorage.getItem(settingKey(label));
    let on = saved === null ? Boolean(initialOn) : saved === 'true';
    track.classList.add('ux-toggle');
    track.setAttribute('role', 'switch');
    track.setAttribute('tabindex', '0');
    track.setAttribute('aria-label', label);
    const render = () => {
      track.setAttribute('aria-checked', String(on));
      knob.style.left = on ? '20px' : '2px';
      knob.style.right = 'auto';
    };
    const toggle = () => {
      on = !on;
      localStorage.setItem(settingKey(label), String(on));
      render();
      showToast(`${label}: ${on ? '켜짐' : '꺼짐'}`);
    };
    track.addEventListener('click', toggle);
    track.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); }
    });
    render();
  });

  const radioGroups = new Map();
  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    const group = radio.parentElement?.parentElement;
    if (!group) return;
    if (!radioGroups.has(group)) radioGroups.set(group, []);
    radioGroups.get(group).push(radio);
  });
  radioGroups.forEach((radios, group) => {
    const name = `choice-${Math.random().toString(36).slice(2)}`;
    const render = () => radios.forEach((radio) => {
      radio.name = name;
      radio.parentElement?.classList.add('ux-choice');
      radio.parentElement?.classList.toggle('ux-selected', radio.checked);
    });
    radios.forEach((radio) => radio.addEventListener('change', () => {
      render();
      showToast(`${radio.parentElement?.textContent?.trim() || '옵션'} 선택됨`);
      if (location.pathname.endsWith('retrospective.html')) {
        const previewTitle = document.querySelector('main h2');
        if (previewTitle) previewTitle.textContent = `Gitfolio 웹 프론트엔드 · ${radio.parentElement?.textContent.trim()}`;
      }
    }));
    render();
  });

  document.querySelectorAll('span').forEach((item) => {
    if (!['작게', '보통', '크게'].includes(item.textContent.trim())) return;
    item.classList.add('ux-choice');
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    const select = () => {
      const group = item.parentElement;
      group.querySelectorAll(':scope > span').forEach((s) => s.classList.remove('ux-selected'));
      item.classList.add('ux-selected');
      document.body.classList.remove('ux-font-small', 'ux-font-medium', 'ux-font-large');
      if (item.textContent.trim() === '작게') document.body.classList.add('ux-font-small');
      if (item.textContent.trim() === '보통') document.body.classList.add('ux-font-medium');
      if (item.textContent.trim() === '크게') document.body.classList.add('ux-font-large');
      showToast(`코드 폰트: ${item.textContent.trim()}`);
    };
    item.addEventListener('click', select);
    item.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') select(); });
    item.classList.toggle('ux-selected', item.textContent.trim() === (localStorage.getItem('gitfolio:font-size') || '보통'));
    item.addEventListener('click', () => localStorage.setItem('gitfolio:font-size', item.textContent.trim()));
  });
  const savedFontSize = localStorage.getItem('gitfolio:font-size');
  document.querySelectorAll('pre, code, textarea, [style*="font-family:monospace"]').forEach((el) => el.classList.add('ux-code-text'));
  document.querySelectorAll('main div').forEach((el) => {
    if (el.previousElementSibling?.textContent.trim() === 'AI 분석') el.classList.add('ux-code-text');
  });
  if (savedFontSize === '작게') document.body.classList.add('ux-font-small');
  else if (savedFontSize === '크게') document.body.classList.add('ux-font-large');
  else document.body.classList.add('ux-font-medium');

  const createChoiceGroup = (items, initialText, onSelect) => {
    items.forEach((item) => {
      item.classList.add('ux-choice');
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      const select = () => {
        items.forEach((other) => other.classList.remove('ux-selected'));
        item.classList.add('ux-selected');
        onSelect?.(item.textContent.trim(), item);
      };
      item.addEventListener('click', select);
      item.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); } });
      if (item.textContent.trim() === initialText) item.classList.add('ux-selected');
    });
  };

  const formatItems = [...document.querySelectorAll('span')].filter((el) => ['PDF', 'Markdown', 'JSON', '텍스트 복사'].includes(el.textContent.trim()));
  if (formatItems.length === 4) {
    const exportButton = [...document.querySelectorAll('button')].find((el) => el.textContent.includes('내보내기'));
    createChoiceGroup(formatItems, 'PDF', (format) => {
      const ext = format === 'Markdown' ? 'md' : format === 'JSON' ? 'json' : format === 'PDF' ? 'pdf' : '';
      if (exportButton) exportButton.textContent = format === '텍스트 복사' ? '선택한 내용 텍스트로 복사' : `gitfolio-web · 개발 기록.${ext} 내보내기`;
    });
  }

  const filterLabels = ['전체', '공개', '비공개', '개인', '조직', '분석 전', '분석 중', '분석 완료', '분석 실패'];
  const filterItems = [...document.querySelectorAll('main div, main span')].filter((el) => filterLabels.includes(el.textContent.trim()) && el.children.length === 0);
  if (location.pathname.endsWith('repolist.html') && filterItems.length > 2) {
    const repoRows = [...document.querySelectorAll('main [data-repo]')];
    const search = document.querySelector('input[placeholder*="저장소명"]');
    let activeFilter = '전체';
    const applyRepoFilter = () => {
      const query = search?.value.trim().toLowerCase() || '';
      let visible = 0;
      repoRows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        const filterMatch = activeFilter === '전체'
          || (activeFilter === '공개' && text.includes('공개') && !text.includes('비공개'))
          || (activeFilter === '비공개' && text.includes('비공개'))
          || (activeFilter === '개인' && (text.includes('개인') || text.includes('개인용')))
          || (activeFilter === '조직' && text.includes('조직'))
          || text.includes(activeFilter.toLowerCase());
        const show = filterMatch && (!query || text.includes(query));
        row.style.display = show ? 'grid' : 'none';
        if (show) visible += 1;
      });
      showToast(`${activeFilter} · ${visible}개 저장소`);
    };
    createChoiceGroup(filterItems, '전체', (value) => { activeFilter = value; applyRepoFilter(); });
    search?.addEventListener('input', applyRepoFilter);

    repoRows.forEach((row) => {
      row.style.cursor = 'pointer';
      row.setAttribute('tabindex', '0');
      const openRepository = (event) => {
        event?.preventDefault?.();
        const profile = repositoryProfiles[row.dataset.repo] || repositoryProfiles['gitfolio-web'];
        localStorage.setItem('gitfolio:selected-repository', JSON.stringify(profile));
        const href = row.dataset.status === 'completed' ? 'commitanalysis.html'
          : row.dataset.status === 'analyzing' ? 'orchestration.html'
          : 'repodetail.html';
        embedded ? window.parent.postMessage({ type: 'gitfolio:navigate', href }, '*') : location.href = href;
      };
      row.addEventListener('click', openRepository, { capture: true });
      row.addEventListener('keydown', (event) => { if (event.key === 'Enter') openRepository(event); });
    });

    const sort = document.querySelector('main select');
    if (sort) {
      sort.innerHTML = '<option value="updated">정렬: 최근 업데이트순</option><option value="name">정렬: 이름순</option><option value="commits">정렬: 커밋 많은순</option>';
      sort.addEventListener('change', () => {
        const parent = repoRows[0]?.parentElement;
        const sorted = [...repoRows].sort((a, b) => {
          if (sort.value === 'name') return a.textContent.localeCompare(b.textContent, 'ko');
          if (sort.value === 'commits') {
            const number = (row) => Number((row.children[2]?.textContent || '0').replaceAll(',', ''));
            return number(b) - number(a);
          }
          return repoRows.indexOf(a) - repoRows.indexOf(b);
        });
        sorted.forEach((row) => parent?.appendChild(row));
        showToast(sort.options[sort.selectedIndex].text.replace('정렬: ', '') + '으로 정렬했습니다');
      });
    }
  }

  if (location.pathname.endsWith('commitanalysis.html')) {
    const commitItems = [...document.querySelectorAll('body > div > div:nth-of-type(1) > div:nth-child(2) > div')];
    const title = document.querySelector('main h1');
    const sha = title?.parentElement?.querySelector('[style*="font-family:monospace"]');
    commitItems.forEach((item) => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        commitItems.forEach((other) => { other.style.background = 'transparent'; other.style.borderLeftColor = 'transparent'; });
        item.style.background = 'rgba(255,255,255,0.06)';
        item.style.borderLeftColor = '#fafafa';
        const parts = item.textContent.trim().split(/\s+/);
        const commitTitle = item.firstElementChild?.textContent.trim();
        const commitSha = item.lastElementChild?.textContent.trim().split(' · ')[0];
        if (title) title.textContent = `"${commitTitle}"`;
        if (sha) sha.textContent = commitSha;
        showToast(`${commitTitle} 분석을 불러왔습니다`);
      });
    });

    const fileRows = [...document.querySelectorAll('main [style*="font-family:monospace"]')].filter((row) => row.textContent.includes('src/'));
    fileRows.forEach((row) => {
      row.classList.add('ux-file-link');
      row.setAttribute('role', 'link');
      row.setAttribute('tabindex', '0');
      row.setAttribute('aria-label', `${row.firstElementChild?.textContent || '변경 파일'} GitHub에서 열기`);
      row.querySelectorAll('span').forEach((span) => {
        if (span.textContent.trim().startsWith('+')) span.style.color = '#3fb950';
        span.querySelectorAll?.('span').forEach((nested) => { if (nested.textContent.trim().startsWith('+')) nested.style.color = '#3fb950'; });
      });
      const open = () => window.open('https://github.com/', '_blank', 'noopener,noreferrer');
      row.addEventListener('click', open);
      row.addEventListener('keydown', (event) => { if (event.key === 'Enter') open(); });
    });
  }

  if (location.pathname.endsWith('timeline.html')) {
    const modes = [...document.querySelectorAll('main span')].filter((el) => ['주별', '개발 단계별', '기능별'].includes(el.textContent.trim()));
    const subtitle = document.querySelector('main h1')?.parentElement?.nextElementSibling;
    const firstLabels = [...document.querySelectorAll('main [style*="width:120px"]')];
    createChoiceGroup(modes, '개발 단계별', (mode) => {
      if (subtitle) subtitle.textContent = mode === '주별' ? '커밋을 주차별로 묶어 개발 흐름을 보여줍니다' : mode === '기능별' ? '연관 커밋을 기능 단위로 묶어 보여줍니다' : '커밋을 개발 단계의 흐름에 따라 재구성했습니다';
      firstLabels.forEach((label, index) => {
        const top = label.firstElementChild;
        const bottom = label.lastElementChild;
        if (mode === '주별') { top.textContent = `${index + 1}주차`; bottom.textContent = ['설정', '기능 구현', '안정화', '개선'][index] || '개선'; }
        if (mode === '기능별') { top.textContent = ['프로젝트', '저장소', '인증', '상태관리'][index] || '기능'; bottom.textContent = ['기반 설정', '연동·분석', '로그인', '구조 개선'][index] || '기능'; }
        if (mode === '개발 단계별') { top.textContent = ['2023.02', '2023.04–06', '2023.07', '2024.01–03'][index]; bottom.textContent = ['초기 설정', '핵심 기능 구현', '오류 수정', '구조 개선'][index]; }
      });
    });
  }

  document.querySelectorAll('a[href="#"]').forEach((link) => {
    if (/^[a-f\d]{7,}$/i.test(link.textContent.trim())) {
      link.href = 'https://github.com/';
      link.target = '_blank';
      link.rel = 'noreferrer';
    }
  });

  if (location.pathname.endsWith('memoryquestions.html')) {
    const questions = [
      ['gitfolio-web · 2023.02.18 커밋 a71c220 관련', '초기 상태 관리 구조를 선택한 이유를 기억하시나요?'],
      ['gitfolio-web · 2023.04.02 커밋 c19f820 관련', 'GitHub OAuth 연결에서 가장 어려웠던 점은 무엇이었나요?'],
      ['order-service · 2025.05.10 커밋 4b9e110 관련', 'API 응답 구조를 변경한 이유를 기억하시나요?'],
      ['order-service · 2025.06.03 커밋 6ca81d2 관련', '결제 실패 재시도 로직을 추가한 계기가 있었나요?'],
      ['legacy-admin · 2025.07.14 커밋 19f44ae 관련', '목록 성능 개선 전 사용자가 겪던 문제는 무엇이었나요?'],
      ['gitfolio-web · 2025.08.01 커밋 92b0cf1 관련', '다시 구현한다면 가장 먼저 바꾸고 싶은 부분은 무엇인가요?'],
    ];
    let index = 2;
    const textarea = document.querySelector('textarea');
    const progress = [...document.querySelectorAll('div')].find((el) => el.textContent.trim().startsWith('기억 보완 질문 ·'));
    const prompt = [...document.querySelectorAll('div')].find((el) => el.textContent.includes('API 응답 구조를 변경한 이유'));
    const context = prompt?.previousElementSibling;
    const buttons = [...document.querySelectorAll('button')];
    const renderQuestion = () => {
      if (progress) progress.textContent = `기억 보완 질문 · ${index + 1} / ${questions.length}`;
      if (context) context.textContent = questions[index][0];
      if (prompt) prompt.textContent = questions[index][1];
      if (textarea) textarea.value = localStorage.getItem(`gitfolio:memory:${index}`) || '';
    };
    buttons.find((b) => b.textContent.trim() === '다음')?.addEventListener('click', () => {
      if (textarea?.value.trim()) localStorage.setItem(`gitfolio:memory:${index}`, textarea.value.trim());
      if (index < questions.length - 1) { index += 1; renderQuestion(); } else showToast('모든 답변을 저장했습니다');
    });
    buttons.find((b) => b.textContent.trim() === '이전')?.addEventListener('click', () => { if (index > 0) { index -= 1; renderQuestion(); } });
    buttons.find((b) => b.textContent.trim() === '건너뛰기')?.addEventListener('click', () => { localStorage.setItem(`gitfolio:memory:${index}`, 'SKIPPED'); if (index < questions.length - 1) { index += 1; renderQuestion(); } });
  }

  if (location.pathname.endsWith('retrospectivechat.html')) {
    const input = document.querySelector('input[placeholder*="답변"]');
    const send = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === '전송');
    const skip = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === '건너뛰기');
    const chat = input?.parentElement?.previousElementSibling;
    const preview = document.querySelector('div[style*="width:48%"]');
    const waitingText = preview?.querySelector('p[style*="font-style:italic"]');
    const progress = [...document.querySelectorAll('span')].find((el) => el.textContent.includes('질문 4 / 6'));
    const finish = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('지금까지 내용으로 완료'));
    let answered = 4;
    const submitTurn = (skipped = false) => {
      const value = skipped ? '이 질문은 건너뛰었어요.' : input?.value.trim();
      if (!value) { showToast('답변을 입력해주세요'); return; }
      const bubble = document.createElement('div');
      bubble.style.cssText = 'display:flex;justify-content:flex-end;margin:4px 0 12px';
      bubble.innerHTML = `<div style="background:#fafafa;color:#0a0a0a;border-radius:12px;padding:14px 16px;font-size:14px;line-height:1.6;max-width:420px">${value.replace(/[<>]/g, '')}</div>`;
      chat?.appendChild(bubble);
      if (input) input.value = '';
      send?.classList.add('ux-busy');
      setTimeout(() => {
        send?.classList.remove('ux-busy');
        if (!skipped && waitingText) {
          waitingText.textContent = value;
          waitingText.style.color = '#d4d4d4';
          waitingText.style.fontStyle = 'normal';
        }
        answered = Math.min(answered + 1, 6);
        if (progress) progress.textContent = `질문 ${answered} / 6 완료`;
        const reply = document.createElement('div');
        reply.style.cssText = 'display:flex;gap:12px;margin:4px 0 12px';
        reply.innerHTML = `<div style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.10);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0">AI</div><div style="background:#171717;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px 16px;font-size:14px;line-height:1.6;max-width:420px">${answered >= 6 ? '좋아요. 답변을 모두 반영했어요. 오른쪽 미리보기를 확인한 뒤 회고를 완료해주세요.' : '답변을 반영했어요. 이 경험을 통해 가장 크게 배운 점은 무엇인가요?'}</div>`;
        chat?.appendChild(reply);
        showToast('답변을 회고 미리보기에 반영했습니다');
        chat?.scrollTo?.({ top: chat.scrollHeight, behavior: 'smooth' });
      }, 700);
    };
    send?.addEventListener('click', () => submitTurn(false));
    skip?.addEventListener('click', () => submitTurn(true));
    input?.addEventListener('keydown', (event) => { if (event.key === 'Enter') submitTurn(false); });
    finish?.addEventListener('click', async () => {
      const ok = await confirmAction('회고 완료', '지금까지 답변한 내용으로 회고를 저장할까요? 저장 후 내보내기에서 PDF로 받을 수 있어요.');
      if (!ok) return;
      localStorage.setItem('gitfolio:retrospective:completed', 'true');
      finish.textContent = '회고 저장 완료';
      finish.disabled = true;
      showToast('회고를 저장했습니다');
    });
  }

  if (location.pathname.endsWith('retrospective.html')) {
    const rooms = [...document.querySelectorAll('[data-retro-room]')];
    const filters = [...document.querySelectorAll('button')].filter((button) => ['전체 3', '작성 중 2', '완료 1'].includes(button.textContent.trim()));
    filters.forEach((filter) => filter.addEventListener('click', () => {
      const value = filter.textContent.trim().split(' ')[0];
      filters.forEach((item) => {
        item.style.background = item === filter ? '#2a2a2a' : '#111';
        item.style.color = item === filter ? '#fafafa' : '#a3a3a3';
      });
      rooms.forEach((room) => {
        room.style.display = value === '전체' || room.textContent.includes(value) ? 'grid' : 'none';
      });
    }));
    document.querySelector('[data-retro-new]')?.addEventListener('click', () => {
      embedded
        ? window.parent.postMessage({ type: 'gitfolio:navigate', href: 'retrospectivechat.html' }, '*')
        : location.href = 'retrospectivechat.html';
    });
  }

  document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', async () => {
      button.blur();
      const text = button.textContent.trim();
      if (text.includes('동기화')) {
        button.classList.add('ux-busy');
        showToast('GitHub 데이터를 동기화하고 있어요');
        setTimeout(() => { button.classList.remove('ux-busy'); showToast('동기화가 완료됐습니다'); }, 1100);
      } else if (text.includes('최근 분석 이어보기')) {
        embedded ? window.parent.postMessage({ type: 'gitfolio:navigate', href: 'commitanalysis.html' }, '*') : location.href = 'commitanalysis.html';
      }
      else if (text.includes('새로운 커밋')) {
        embedded ? window.parent.postMessage({ type: 'gitfolio:navigate', href: 'repolist.html' }, '*') : location.href = 'repolist.html';
      }
      else if (text === '저장') showToast('변경사항을 저장했습니다');
      else if (text.includes('재생성')) showToast('내용을 다시 생성했습니다');
      else if (text.includes('회고 생성하기')) {
        button.classList.add('ux-busy');
        button.textContent = '회고 생성 중…';
        setTimeout(() => {
          embedded
            ? window.parent.postMessage({ type: 'gitfolio:navigate', href: 'retrospectivechat.html' }, '*')
            : location.href = 'retrospectivechat.html';
        }, 700);
      }
      else if (text.includes('내보내기')) {
        button.classList.add('ux-busy');
        const original = button.textContent;
        button.textContent = '파일 생성 중…';
        setTimeout(() => { button.classList.remove('ux-busy'); button.textContent = original; showToast('파일이 준비됐습니다 · 7일간 다운로드할 수 있어요'); }, 1200);
      }
      else if (text.includes('확정')) {
        const card = button.closest('.motion-card') || button.parentElement?.parentElement;
        const status = card?.querySelector('div:first-child > span');
        if (status) { status.textContent = '사용자 확인 완료'; status.style.background = 'rgba(34,197,94,.14)'; status.style.color = '#22c55e'; }
        button.parentElement.innerHTML = '<span style="color:#22c55e;font-size:13px;font-weight:700">확정 완료 · 타임라인과 회고에 반영됨</span>';
        showToast('분석 결과를 확정하고 후속 결과에 반영했습니다');
      }
      else if (text === '보류') {
        const card = button.closest('.motion-card') || button.parentElement?.parentElement;
        const status = card?.querySelector('div:first-child > span');
        if (status) { status.textContent = '보류'; status.style.background = 'rgba(255,255,255,.08)'; status.style.color = '#a3a3a3'; }
        button.parentElement.innerHTML = '<span style="color:#a3a3a3;font-size:13px;font-weight:700">보류됨 · 나중에 다시 검토할 수 있어요</span>';
        showToast('검토 항목으로 보류했습니다');
      }
      else if (text.includes('삭제') || text.includes('탈퇴') || text.includes('연결 해제')) {
        const ok = await confirmAction(text, `${text}하면 되돌리기 어려울 수 있습니다. 계속하시겠어요?`);
        if (ok) showToast(`${text} 처리가 완료됐습니다`);
      }
    });
  });

  document.querySelectorAll('span, button').forEach((el) => {
    if (!el.textContent.includes('복사')) return;
    if (el.textContent.trim() === '텍스트 복사') return;
    el.classList.add('ux-choice');
    el.addEventListener('click', async () => {
      await navigator.clipboard?.writeText(document.querySelector('main')?.innerText || document.body.innerText);
      showToast('클립보드에 복사했습니다');
    });
  });
})();
