/**
 * app.js — Motor do Funil Valeur Consultoria
 * Gerencia: renderização, navegação, validação,
 * persistência, tracking e submit.
 */

import {
  steps,
  disqualifyScreen,
  successScreen,
  heroContent,
  authorityContent,
  faqContent,
  FUNNEL_CONFIG,
} from './flow.js';

// ─────────────────────────────────────────────
// TRACKING — configure os IDs abaixo
// ─────────────────────────────────────────────
const TRACKING_CONFIG = {
  ga4_id: '',        // Ex: 'G-XXXXXXXXXX'
  meta_pixel_id: '', // Ex: '1234567890'
  custom_webhook: '', // Ex: 'https://hooks.zapier.com/...'
};

function track(event, data = {}) {
  const payload = { event, timestamp: Date.now(), ...data };

  // Console sempre (dev + fallback)
  console.log('[Valeur Track]', payload);

  // GA4
  if (TRACKING_CONFIG.ga4_id && window.gtag) {
    window.gtag('event', event, data);
  }

  // Meta Pixel
  if (TRACKING_CONFIG.meta_pixel_id && window.fbq) {
    window.fbq('trackCustom', event, data);
  }

  // Webhook customizado
  if (TRACKING_CONFIG.custom_webhook) {
    fetch(TRACKING_CONFIG.custom_webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
}

// ─────────────────────────────────────────────
// ESTADO GLOBAL
// ─────────────────────────────────────────────
const State = {
  currentStepIndex: 0,
  answers: {},
  startTime: null,
  stepStartTime: null,
  funnelStarted: false,
  submitted: false,

  save() {
    try {
      sessionStorage.setItem(
        'valeur_funnel',
        JSON.stringify({
          currentStepIndex: this.currentStepIndex,
          answers: this.answers,
          startTime: this.startTime,
        })
      );
    } catch (_) {}
  },

  load() {
    try {
      const raw = sessionStorage.getItem('valeur_funnel');
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.currentStepIndex = data.currentStepIndex || 0;
      this.answers = data.answers || {};
      this.startTime = data.startTime || null;
      return true;
    } catch (_) {
      return false;
    }
  },

  clear() {
    sessionStorage.removeItem('valeur_funnel');
    this.currentStepIndex = 0;
    this.answers = {};
    this.startTime = null;
    this.funnelStarted = false;
    this.submitted = false;
  },
};

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
function el(id) {
  return document.getElementById(id);
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}

function totalSteps() {
  // Exclui steps auxiliares da contagem de progresso
  return steps.filter((s) => !s.id.includes('dq-check')).length;
}

function visibleStepNumber(step) {
  const visible = steps.filter((s) => !s.id.includes('dq-check'));
  const idx = visible.findIndex((s) => s.id === step.id);
  return idx >= 0 ? idx + 1 : step.stepNumber;
}

// ─────────────────────────────────────────────
// RENDERIZAÇÃO DA LANDING PAGE (seção hero + autoridade + FAQ)
// ─────────────────────────────────────────────
function renderLandingPage() {
  // Hero
  const heroEl = el('hero-headline');
  if (heroEl) {
    heroEl.innerHTML = heroContent.headline.replace('\n', '<br>');
  }
  const heroSub = el('hero-subheadline');
  if (heroSub) heroSub.textContent = heroContent.subheadline;

  const heroEyebrow = el('hero-eyebrow');
  if (heroEyebrow) heroEyebrow.textContent = heroContent.eyebrow;

  const heroCta = el('hero-cta');
  if (heroCta) {
    heroCta.textContent = heroContent.ctaText;
    heroCta.addEventListener('click', () => {
      el('funnel-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => initFunnel(), 400);
    });
  }

  const heroCtaSub = el('hero-cta-sub');
  if (heroCtaSub) heroCtaSub.textContent = heroContent.ctaSubtext;

  // Stats
  const statsEl = el('hero-stats');
  if (statsEl) {
    statsEl.innerHTML = heroContent.stats
      .map(
        (s) => `
      <div class="stat-item">
        <span class="stat-value">${s.value}</span>
        <span class="stat-label">${s.label}</span>
      </div>`
      )
      .join('');
  }

  // Autoridade
  const authHeadline = el('authority-headline');
  if (authHeadline) authHeadline.textContent = authorityContent.headline;

  const authDesc = el('authority-description');
  if (authDesc) authDesc.textContent = authorityContent.description;

  const methodEl = el('methodology-steps');
  if (methodEl) {
    methodEl.innerHTML = authorityContent.methodology
      .map(
        (m) => `
      <div class="method-step">
        <div class="method-number">${m.number}</div>
        <div class="method-content">
          <h3>${m.title}</h3>
          <p>${m.description}</p>
        </div>
      </div>`
      )
      .join('');
  }

  // FAQ
  const faqEl = el('faq-list');
  if (faqEl) {
    faqEl.innerHTML = faqContent
      .map(
        (f, i) => `
      <div class="faq-item" data-index="${i}">
        <button class="faq-question" aria-expanded="false" aria-controls="faq-answer-${i}">
          <span>${f.question}</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </button>
        <div class="faq-answer" id="faq-answer-${i}" hidden>
          <p>${f.answer}</p>
        </div>
      </div>`
      )
      .join('');

    faqEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-question');
      if (!btn) return;
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // Fecha todos
      faqEl.querySelectorAll('.faq-question').forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        b.closest('.faq-item').querySelector('.faq-answer').hidden = true;
        b.querySelector('.faq-icon').textContent = '+';
      });
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        btn.querySelector('.faq-icon').textContent = '−';
      }
    });
  }
}

// ─────────────────────────────────────────────
// PROGRESSO
// ─────────────────────────────────────────────
function updateProgress(stepIndex) {
  const total = totalSteps();
  const current = Math.min(stepIndex + 1, total);
  const pct = Math.round((current / total) * 100);

  const bar = el('progress-bar-fill');
  if (bar) bar.style.width = pct + '%';

  const text = el('progress-text');
  if (text) text.textContent = `Passo ${current} de ${total}`;

  const pctEl = el('progress-pct');
  if (pctEl) pctEl.textContent = pct + '%';
}

// ─────────────────────────────────────────────
// RENDERIZAÇÃO DE CAMPOS
// ─────────────────────────────────────────────
function renderField(field, savedValue) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field-wrapper';
  wrapper.setAttribute('data-field-id', field.id);

  const labelEl = document.createElement('label');
  labelEl.className = 'field-label';
  labelEl.setAttribute('for', field.id);
  labelEl.innerHTML = `${field.label}${field.required ? ' <span class="required" aria-label="obrigatório">*</span>' : ' <span class="optional">(opcional)</span>'}`;
  wrapper.appendChild(labelEl);

  if (field.hint) {
    const hint = document.createElement('p');
    hint.className = 'field-hint';
    hint.id = `hint-${field.id}`;
    hint.textContent = field.hint;
    wrapper.appendChild(hint);
  }

  let inputEl;

  switch (field.type) {
    case 'radio-cards':
      inputEl = renderRadioCards(field, savedValue);
      break;
    case 'checkbox-cards':
      inputEl = renderCheckboxCards(field, savedValue);
      break;
    case 'select':
      inputEl = renderSelect(field, savedValue);
      break;
    case 'checkbox':
      inputEl = renderSingleCheckbox(field, savedValue);
      break;
    default:
      inputEl = renderTextInput(field, savedValue);
  }

  wrapper.appendChild(inputEl);

  // Área de erro
  const errorEl = document.createElement('p');
  errorEl.className = 'field-error';
  errorEl.id = `error-${field.id}`;
  errorEl.setAttribute('role', 'alert');
  errorEl.setAttribute('aria-live', 'assertive');
  errorEl.hidden = true;
  wrapper.appendChild(errorEl);

  return wrapper;
}

function renderRadioCards(field, savedValue) {
  const group = document.createElement('div');
  group.className = 'radio-cards';
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-labelledby', `label-${field.id}`);

  field.options.forEach((opt) => {
    const card = document.createElement('label');
    card.className = 'radio-card' + (savedValue === opt.value ? ' selected' : '');
    card.setAttribute('tabindex', '0');

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = field.id;
    input.value = opt.value;
    input.checked = savedValue === opt.value;
    input.className = 'sr-only';

    input.addEventListener('change', () => {
      group.querySelectorAll('.radio-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      clearError(field.id);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.checked = true;
        input.dispatchEvent(new Event('change'));
      }
    });

    card.appendChild(input);

    const content = document.createElement('div');
    content.className = 'radio-card-content';
    content.innerHTML = `<span class="radio-card-label">${opt.label}</span>`;
    if (opt.description) {
      content.innerHTML += `<span class="radio-card-desc">${opt.description}</span>`;
    }
    card.appendChild(content);

    const check = document.createElement('span');
    check.className = 'radio-card-check';
    check.setAttribute('aria-hidden', 'true');
    card.appendChild(check);

    group.appendChild(card);
  });

  return group;
}

function renderCheckboxCards(field, savedValue) {
  const group = document.createElement('div');
  group.className = 'checkbox-cards';

  const selected = Array.isArray(savedValue) ? savedValue : [];

  field.options.forEach((opt) => {
    const card = document.createElement('label');
    card.className = 'checkbox-card' + (selected.includes(opt.value) ? ' selected' : '');
    card.setAttribute('tabindex', '0');

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = field.id;
    input.value = opt.value;
    input.checked = selected.includes(opt.value);
    input.className = 'sr-only';

    input.addEventListener('change', () => {
      card.classList.toggle('selected', input.checked);
      clearError(field.id);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.checked = !input.checked;
        input.dispatchEvent(new Event('change'));
      }
    });

    card.appendChild(input);

    const content = document.createElement('div');
    content.className = 'checkbox-card-content';
    content.innerHTML = `<span class="checkbox-card-label">${opt.label}</span>`;
    card.appendChild(content);

    const check = document.createElement('span');
    check.className = 'checkbox-card-check';
    check.setAttribute('aria-hidden', 'true');
    card.appendChild(check);

    group.appendChild(card);
  });

  return group;
}

function renderSelect(field, savedValue) {
  const select = document.createElement('select');
  select.id = field.id;
  select.name = field.id;
  select.className = 'field-select';
  if (field.required) select.required = true;
  select.setAttribute('aria-describedby', `error-${field.id}`);

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = field.placeholder || 'Selecione...';
  placeholder.disabled = true;
  placeholder.selected = !savedValue;
  select.appendChild(placeholder);

  field.options.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    if (savedValue === opt.value) option.selected = true;
    select.appendChild(option);
  });

  select.addEventListener('change', () => clearError(field.id));

  return select;
}

function renderSingleCheckbox(field, savedValue) {
  const wrapper = document.createElement('div');
  wrapper.className = 'checkbox-single-wrapper';

  const label = document.createElement('label');
  label.className = 'checkbox-single';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = field.id;
  input.name = field.id;
  input.checked = !!savedValue;
  input.setAttribute('aria-describedby', `error-${field.id}`);
  input.addEventListener('change', () => clearError(field.id));

  const span = document.createElement('span');
  span.textContent = field.label;

  label.appendChild(input);
  label.appendChild(span);
  wrapper.appendChild(label);

  return wrapper;
}

function renderTextInput(field, savedValue) {
  const input = document.createElement('input');
  input.type = field.type || 'text';
  input.id = field.id;
  input.name = field.id;
  input.className = 'field-input';
  input.placeholder = field.placeholder || '';
  if (field.required) input.required = true;
  if (field.autocomplete) input.autocomplete = field.autocomplete;
  if (savedValue) input.value = savedValue;
  input.setAttribute('aria-describedby', `error-${field.id}${field.hint ? ` hint-${field.id}` : ''}`);

  if (field.type === 'tel') {
    input.addEventListener('input', () => {
      input.value = formatPhone(input.value);
      clearError(field.id);
    });
  } else {
    input.addEventListener('input', () => clearError(field.id));
  }

  return input;
}

// ─────────────────────────────────────────────
// VALIDAÇÃO
// ─────────────────────────────────────────────
function getFieldValue(field) {
  switch (field.type) {
    case 'radio-cards': {
      const checked = document.querySelector(`input[name="${field.id}"]:checked`);
      return checked ? checked.value : null;
    }
    case 'checkbox-cards': {
      const checked = document.querySelectorAll(`input[name="${field.id}"]:checked`);
      return Array.from(checked).map((i) => i.value);
    }
    case 'select': {
      const sel = document.getElementById(field.id);
      return sel ? sel.value || null : null;
    }
    case 'checkbox': {
      const cb = document.getElementById(field.id);
      return cb ? cb.checked : false;
    }
    default: {
      const inp = document.getElementById(field.id);
      return inp ? inp.value.trim() : '';
    }
  }
}

function validateField(field) {
  const value = getFieldValue(field);

  if (field.required) {
    if (field.type === 'checkbox' && !value) {
      return field.errorMessage || 'Este campo é obrigatório';
    }
    if (field.type === 'checkbox-cards') {
      // checkbox-cards é opcional neste funil
      return null;
    }
    if (!value || (typeof value === 'string' && !value)) {
      return 'Erro: Este campo é obrigatório';
    }
  }

  if (value && field.validation) {
    if (field.validation.minLength && value.length < field.validation.minLength) {
      return `Erro: ${field.validation.message}`;
    }
    if (field.validation.pattern && !field.validation.pattern.test(value)) {
      return `Erro: ${field.validation.message}`;
    }
  }

  return null;
}

function showError(fieldId, message) {
  const errorEl = el(`error-${fieldId}`);
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.hidden = false;

  const wrapper = document.querySelector(`[data-field-id="${fieldId}"]`);
  if (wrapper) wrapper.classList.add('has-error');
}

function clearError(fieldId) {
  const errorEl = el(`error-${fieldId}`);
  if (!errorEl) return;
  errorEl.hidden = true;
  errorEl.textContent = '';

  const wrapper = document.querySelector(`[data-field-id="${fieldId}"]`);
  if (wrapper) wrapper.classList.remove('has-error');

  const summary = el('error-summary');
  if (summary) {
    const remaining = document.querySelectorAll('.field-error:not([hidden])');
    if (remaining.length === 0) summary.hidden = true;
  }
}

function validateStep(step) {
  const errors = [];

  step.fields.forEach((field) => {
    const error = validateField(field);
    if (error) {
      errors.push({ fieldId: field.id, message: error });
      showError(field.id, error);
    }
  });

  if (errors.length > 0) {
    // Mostra resumo de erros no topo
    const summary = el('error-summary');
    if (summary) {
      summary.hidden = false;
      summary.innerHTML = `<p><strong>Atenção:</strong> Corrija ${errors.length === 1 ? 'o campo abaixo' : 'os campos abaixo'} para continuar.</p>`;
      summary.setAttribute('role', 'alert');
      summary.setAttribute('aria-live', 'assertive');
      summary.focus();
    }

    track('field_error', {
      step_id: step.id,
      fields: errors.map((e) => e.fieldId),
    });

    return false;
  }

  return true;
}

// ─────────────────────────────────────────────
// NAVEGAÇÃO
// ─────────────────────────────────────────────
function collectStepAnswers(step) {
  step.fields.forEach((field) => {
    const value = getFieldValue(field);
    if (value !== null && value !== undefined) {
      State.answers[field.id] = value;
    }
  });
}

function getNextStepId(step) {
  if (typeof step.nextStep === 'function') {
    return step.nextStep(State.answers);
  }
  return step.nextStep;
}

function navigateToStep(stepId) {
  if (stepId === 'disqualify') {
    renderDisqualify();
    return;
  }
  if (!stepId) {
    submitFunnel();
    return;
  }

  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx === -1) {
    submitFunnel();
    return;
  }

  State.currentStepIndex = idx;
  State.save();
  renderCurrentStep();
}

function goBack() {
  if (State.currentStepIndex <= 0) return;

  const currentStep = steps[State.currentStepIndex];
  track('step_back', {
    from_step: currentStep.id,
  });

  // Volta para o step anterior — pula dq-check se necessário
  let prevIdx = State.currentStepIndex - 1;
  while (prevIdx > 0 && steps[prevIdx].id.includes('dq-check')) {
    prevIdx--;
  }

  State.currentStepIndex = prevIdx;
  State.save();
  renderCurrentStep();
}

// ─────────────────────────────────────────────
// RENDERIZAÇÃO DO STEP ATUAL
// ─────────────────────────────────────────────
function renderCurrentStep() {
  const container = el('funnel-container');
  if (!container) return;

  const step = steps[State.currentStepIndex];
  if (!step) return;

  State.stepStartTime = Date.now();

  updateProgress(visibleStepNumber(step) - 1);

  track('step_view', {
    step_id: step.id,
    step_number: step.stepNumber,
    step_title: step.title,
  });

  container.innerHTML = '';

  // Resumo de erros (vazio, aparece só ao validar)
  const errorSummary = document.createElement('div');
  errorSummary.id = 'error-summary';
  errorSummary.className = 'error-summary';
  errorSummary.setAttribute('tabindex', '-1');
  errorSummary.hidden = true;
  container.appendChild(errorSummary);

  // Título do step
  const header = document.createElement('div');
  header.className = 'step-header';
  header.innerHTML = `
    <h2 class="step-title">${step.title}</h2>
    ${step.subtitle ? `<p class="step-subtitle">${step.subtitle}</p>` : ''}
  `;
  container.appendChild(header);

  // Trust note (step de dados pessoais)
  if (step.trustNote) {
    const trust = document.createElement('div');
    trust.className = 'trust-note';
    trust.innerHTML = `<span class="trust-icon" aria-hidden="true">🔒</span> ${step.trustNote}`;
    container.appendChild(trust);
  }

  // Campos
  const fieldsEl = document.createElement('div');
  fieldsEl.className = 'fields-container';

  step.fields.forEach((field) => {
    const savedValue = State.answers[field.id];
    const fieldEl = renderField(field, savedValue);
    fieldsEl.appendChild(fieldEl);
  });

  container.appendChild(fieldsEl);

  // Botões de navegação
  const nav = document.createElement('div');
  nav.className = 'step-nav';

  if (State.currentStepIndex > 0) {
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'btn-back';
    backBtn.textContent = '← Voltar';
    backBtn.addEventListener('click', goBack);
    nav.appendChild(backBtn);
  } else {
    nav.appendChild(document.createElement('span')); // placeholder
  }

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.id = 'btn-next';
  nextBtn.className = 'btn-next';

  const isLast = !step.nextStep || (typeof step.nextStep !== 'function' && step.nextStep === null);
  nextBtn.textContent = isLast ? 'Enviar minha aplicação →' : 'Continuar →';

  nextBtn.addEventListener('click', () => {
    if (!validateStep(step)) return;

    const timeOnStep = State.stepStartTime ? Date.now() - State.stepStartTime : 0;
    collectStepAnswers(step);

    track('step_complete', {
      step_id: step.id,
      step_number: step.stepNumber,
      time_on_step: timeOnStep,
    });

    const nextId = getNextStepId(step);

    if (nextId === 'disqualify') {
      track('disqualify', {
        step_id: step.id,
        disqualify_reason: 'faturamento_abaixo_minimo',
      });
    }

    navigateToStep(nextId);
  });

  nav.appendChild(nextBtn);
  container.appendChild(nav);

  // Scroll suave ao topo do funil
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Focus no primeiro campo interativo
  setTimeout(() => {
    const firstInteractive = container.querySelector(
      'input:not(.sr-only), select, textarea, .radio-card, .checkbox-card'
    );
    if (firstInteractive) firstInteractive.focus();
  }, 100);
}

// ─────────────────────────────────────────────
// TELA DE DESQUALIFICAÇÃO
// ─────────────────────────────────────────────
function renderDisqualify() {
  const container = el('funnel-container');
  if (!container) return;

  // Esconde barra de progresso
  const progressEl = el('funnel-progress');
  if (progressEl) progressEl.hidden = true;

  container.innerHTML = `
    <div class="screen-disqualify">
      <div class="disqualify-icon" aria-hidden="true">◈</div>
      <h2>${disqualifyScreen.title}</h2>
      <p class="disqualify-subtitle">${disqualifyScreen.subtitle}</p>
      <p class="disqualify-message">${disqualifyScreen.message}</p>
      <a
        href="${disqualifyScreen.alternativeUrl}"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-alternative"
      >
        ${disqualifyScreen.alternativeButtonText}
      </a>
      <button type="button" class="btn-restart" id="btn-restart-dq">
        Recomeçar do início
      </button>
    </div>
  `;

  el('btn-restart-dq').addEventListener('click', restartFunnel);
}

// ─────────────────────────────────────────────
// SUBMIT
// ─────────────────────────────────────────────
async function submitFunnel() {
  const container = el('funnel-container');
  const btn = el('btn-next');

  // Estado de loading
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    btn.classList.add('loading');
  }

  const payload = {
    ...State.answers,
    _meta: {
      source: window.location.href,
      referrer: document.referrer,
      submitted_at: new Date().toISOString(),
      total_time_ms: State.startTime ? Date.now() - State.startTime : 0,
      funnel: 'valeur-aplicacao-v1',
    },
  };

  let submitted = false;

  try {
    const res = await Promise.race([
      fetch(FUNNEL_CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
    ]);

    if (res.ok) {
      submitted = true;
    }
  } catch (err) {
    console.warn('[Valeur] Submit falhou:', err);
  }

  if (!submitted) {
    // Backup em localStorage
    try {
      localStorage.setItem('valeur_lead_backup', JSON.stringify(payload));
    } catch (_) {}

    // Erro visível ao usuário
    if (container) {
      const errorBanner = document.createElement('div');
      errorBanner.className = 'submit-error';
      errorBanner.setAttribute('role', 'alert');
      errorBanner.innerHTML = `
        <p><strong>Houve um problema ao enviar sua aplicação.</strong></p>
        <p>Seus dados foram salvos. Você pode tentar novamente ou nos contatar diretamente pelo WhatsApp.</p>
        <div class="submit-error-actions">
          <button type="button" id="btn-retry" class="btn-retry">Tentar novamente</button>
          <a
            href="https://wa.me/${FUNNEL_CONFIG.whatsappFallback}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-whatsapp"
          >
            Falar pelo WhatsApp
          </a>
        </div>
      `;
      container.insertBefore(errorBanner, container.firstChild);

      el('btn-retry').addEventListener('click', () => {
        errorBanner.remove();
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Enviar minha aplicação →';
          btn.classList.remove('loading');
        }
        submitFunnel();
      });
    }

    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Enviar minha aplicação →';
      btn.classList.remove('loading');
    }

    return;
  }

  // Sucesso
  State.submitted = true;
  State.clear();

  track('funnel_complete', {
    total_time: payload._meta.total_time_ms,
    segmento: payload.segmento,
    faturamento: payload.faturamento,
  });

  renderSuccess();
}

// ─────────────────────────────────────────────
// TELA DE SUCESSO
// ─────────────────────────────────────────────
function renderSuccess() {
  const container = el('funnel-container');
  if (!container) return;

  const progressEl = el('funnel-progress');
  if (progressEl) progressEl.hidden = true;

  const stepsHtml = successScreen.steps
    .map(
      (s) => `
    <div class="success-step">
      <div class="success-step-icon">${s.icon}</div>
      <div class="success-step-content">
        <h3>${s.title}</h3>
        <p>${s.description}</p>
      </div>
    </div>`
    )
    .join('');

  container.innerHTML = `
    <div class="screen-success">
      <div class="success-badge" aria-hidden="true">✓</div>
      <h2>${successScreen.title}</h2>
      <p class="success-subtitle">${successScreen.subtitle}</p>

      <div class="success-steps">
        ${stepsHtml}
      </div>

      <div class="success-calendly">
        <p>${successScreen.calendlyLabel}</p>
        <a
          href="${FUNNEL_CONFIG.calendlyUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-calendly"
        >
          ${successScreen.calendlyButtonText}
        </a>
      </div>

      <p class="success-note">${successScreen.note}</p>
    </div>
  `;

  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─────────────────────────────────────────────
// REINICIAR
// ─────────────────────────────────────────────
function restartFunnel() {
  State.clear();
  const progressEl = el('funnel-progress');
  if (progressEl) progressEl.hidden = false;
  initFunnel();
}

// ─────────────────────────────────────────────
// INICIALIZAÇÃO DO FUNIL
// ─────────────────────────────────────────────
function initFunnel() {
  State.startTime = Date.now();
  State.funnelStarted = true;

  track('funnel_start', { timestamp: State.startTime });

  const progressEl = el('funnel-progress');
  if (progressEl) progressEl.hidden = false;

  renderCurrentStep();
}

// ─────────────────────────────────────────────
// RETOMADA DE SESSÃO
// ─────────────────────────────────────────────
function checkResume() {
  const hasSaved = State.load();
  if (!hasSaved || State.currentStepIndex === 0) return false;

  const container = el('funnel-container');
  if (!container) return false;

  const resumeBanner = document.createElement('div');
  resumeBanner.className = 'resume-banner';
  resumeBanner.setAttribute('role', 'alert');
  resumeBanner.innerHTML = `
    <p>Você começou a preencher antes. Quer continuar de onde parou?</p>
    <div class="resume-actions">
      <button type="button" id="btn-resume" class="btn-resume">Continuar</button>
      <button type="button" id="btn-restart" class="btn-restart-sm">Recomeçar</button>
    </div>
  `;

  container.appendChild(resumeBanner);

  el('btn-resume').addEventListener('click', () => {
    resumeBanner.remove();
    const progressEl = el('funnel-progress');
    if (progressEl) progressEl.hidden = false;
    renderCurrentStep();
    track('funnel_start', { resumed: true });
  });

  el('btn-restart').addEventListener('click', () => {
    resumeBanner.remove();
    State.clear();
    initFunnel();
  });

  return true;
}

// ─────────────────────────────────────────────
// TRACKING DE ABANDON
// ─────────────────────────────────────────────
window.addEventListener('beforeunload', () => {
  if (State.funnelStarted && !State.submitted) {
    track('funnel_abandon', {
      last_step: steps[State.currentStepIndex]?.id,
      time_on_page: State.startTime ? Date.now() - State.startTime : 0,
    });
  }
});

// ─────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  track('page_view', {
    url: window.location.href,
    referrer: document.referrer,
  });

  renderLandingPage();

  // CTA fixo mobile
  const fixedCta = el('fixed-cta');
  if (fixedCta) {
    fixedCta.addEventListener('click', () => {
      el('funnel-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        if (!State.funnelStarted) {
          const resumed = checkResume();
          if (!resumed) initFunnel();
        }
      }, 400);
    });
  }

  // Observer: inicia funil ao entrar na viewport
  const funnelSection = el('funnel-section');
  if (funnelSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !State.funnelStarted) {
            const resumed = checkResume();
            if (!resumed) initFunnel();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(funnelSection);
  }

  // Smooth scroll para links âncora internos
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
