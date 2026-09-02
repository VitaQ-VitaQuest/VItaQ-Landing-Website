'use strict';

const currencyCodes = ['USD', 'AED'];
const customerIds = ['academies', 'trainingCamps', 'events'];

const calculatorState = {
    currency: 'USD',
    customerId: 'academies',
    academyBilling: 'annual',
    branches: 1,
    sports: 1,
    activeRelationships: 1,
    academyMonths: 3,
    campPricingModel: 'fixed',
    registrationWindowDays: 30,
    expectedCollections: 25000,
    participants: 200,
    accreditations: 30,
    specialistCount: 1,
    specialistDays: 1,
};

let pricingData = null;
let activePlanCategoryId = 'academies';

function initializePricingCardTilt() {
    const pricingCard = document.querySelector('.pricing-logic');
    if (!pricingCard) return;

    let targetRotateX = 0;
    let targetRotateY = 0;

    window.addEventListener('mousemove', (e) => {
        targetRotateX = gsap.utils.mapRange(0, window.innerHeight, -8, 8, e.clientY);
        targetRotateY = gsap.utils.mapRange(0, window.innerWidth, 8, -8, e.clientX);
    });

    gsap.ticker.add(() => {
        gsap.to(pricingCard, {
            duration: 1.5,
            rotationX: targetRotateX,
            rotationY: targetRotateY,
            transformPerspective: 1000,
            ease: 'power3.out',
        });
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function pluralize(value, singular, plural = `${singular}s`) {
    return value === 1 ? singular : plural;
}

function clampNumber(value, min, max, wholeNumber) {
    if (!Number.isFinite(value)) return min;
    const normalizedValue = wholeNumber ? Math.round(value) : value;
    return Math.min(Math.max(normalizedValue, min), max);
}

function formatMoney(currencyCode, amount) {
    const currency = pricingData.currencies[currencyCode];
    return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

function validatePrices(data) {
    const requiredMoneyPaths = [
        data?.customers?.academies?.rates?.annual?.prices,
        data?.customers?.academies?.rates?.monthly?.prices,
        data?.customers?.trainingCamps?.rates?.fixed?.prices,
        data?.customers?.events?.rates?.setup?.prices,
        data?.customers?.events?.rates?.participant?.prices,
        data?.customers?.events?.rates?.accreditation?.prices,
        data?.customers?.events?.rates?.onGroundSpecialist?.prices,
        data?.addOns?.brandedApplication?.prices,
    ];

    const hasEveryMoneyValue = requiredMoneyPaths.every((prices) => (
        prices && currencyCodes.every((currencyCode) => Number.isFinite(prices[currencyCode]))
    ));
    const hasRevenueShare = Number.isFinite(data?.customers?.trainingCamps?.rates?.revenueShare?.percentage);
    const hasCurrencyConfiguration = currencyCodes.every((currencyCode) => data?.currencies?.[currencyCode]?.locale);

    if (!hasEveryMoneyValue || !hasRevenueShare || !hasCurrencyConfiguration) {
        throw new Error('prices.json does not contain the complete published rate structure.');
    }

    return data;
}

function renderChoiceButton(group, value, label, description, selectedValue) {
    const isSelected = value === selectedValue;
    return `
        <button
            type="button"
            class="pricing-choice"
            data-choice="${escapeHtml(group)}"
            data-choice-value="${escapeHtml(value)}"
            aria-pressed="${isSelected}"
        >
            <span>${escapeHtml(label)}</span>
            <small>${escapeHtml(description)}</small>
        </button>
    `;
}

function renderNumberField({ field, label, value, min, max, suffix, help = '', wholeNumber = true }) {
    const inputId = `pricing-${field}`;
    const labelId = `${inputId}-label`;
    const step = wholeNumber ? 1 : 0.01;
    return `
        <div class="pricing-number-field">
            <div class="pricing-field-copy">
                <label class="pricing-label" id="${labelId}" for="${inputId}">${escapeHtml(label)}</label>
                ${help ? `<small class="pricing-field-help">${escapeHtml(help)}</small>` : ''}
            </div>
            <span class="pricing-input-shell">
                <button
                    type="button"
                    class="pricing-step-button"
                    data-step-field="${escapeHtml(field)}"
                    data-step-direction="-1"
                    aria-label="Decrease ${escapeHtml(label)}"
                >−</button>
                <input
                    id="${inputId}"
                    aria-label="${escapeHtml(label)}"
                    type="number"
                    inputmode="${wholeNumber ? 'numeric' : 'decimal'}"
                    min="${min}"
                    max="${max}"
                    step="${step}"
                    value="${value}"
                    data-field="${escapeHtml(field)}"
                    data-whole-number="${wholeNumber}"
                >
                <span class="pricing-input-suffix">${escapeHtml(suffix)}</span>
                <button
                    type="button"
                    class="pricing-step-button"
                    data-step-field="${escapeHtml(field)}"
                    data-step-direction="1"
                    aria-label="Increase ${escapeHtml(label)}"
                >+</button>
            </span>
        </div>
    `;
}

function renderCustomerSelector() {
    const selector = document.querySelector('[data-customer-selector]');
    selector.innerHTML = customerIds.map((customerId) => {
        const customer = pricingData.customers[customerId];
        const isSelected = calculatorState.customerId === customerId;
        return `
            <button
                type="button"
                class="pricing-plan-tab pricing-calculator-tab"
                role="tab"
                data-customer="${customerId}"
                aria-selected="${isSelected}"
                aria-controls="pricing-configuration-panel"
                tabindex="${isSelected ? 0 : -1}"
            >${escapeHtml(customer.name)}</button>
        `;
    }).join('');
}

function renderAcademyConfiguration() {
    const academy = pricingData.customers.academies;
    const maximumRelationships = calculatorState.branches * calculatorState.sports;
    const annualRate = formatMoney(calculatorState.currency, academy.rates.annual.prices[calculatorState.currency]);
    const monthlyRate = formatMoney(calculatorState.currency, academy.rates.monthly.prices[calculatorState.currency]);

    return `
        <fieldset class="pricing-fieldset">
            <legend>Billing cycle</legend>
            <div class="pricing-choice-grid">
                ${renderChoiceButton('academyBilling', 'annual', 'Yearly', annualRate, calculatorState.academyBilling)}
                ${renderChoiceButton('academyBilling', 'monthly', 'Monthly', monthlyRate, calculatorState.academyBilling)}
            </div>
        </fieldset>
        <div class="pricing-field-grid">
            ${renderNumberField({ field: 'branches', label: 'Branches', value: calculatorState.branches, min: 1, max: 100, suffix: 'locations' })}
            ${renderNumberField({ field: 'sports', label: 'Sports', value: calculatorState.sports, min: 1, max: 100, suffix: 'disciplines' })}
        </div>
        ${renderNumberField({
            field: 'activeRelationships',
            label: 'Active branch–sport relationships',
            value: calculatorState.activeRelationships,
            min: 1,
            max: maximumRelationships,
            suffix: 'relationships',
            help: 'Adjust this when a sport does not run at every branch. Each active pairing is billed once.',
        })}
        ${calculatorState.academyBilling === 'monthly' ? renderNumberField({
            field: 'academyMonths',
            label: 'Months',
            value: calculatorState.academyMonths,
            min: academy.minimumMonthlyCommitmentMonths,
            max: 36,
            suffix: 'months',
            help: `Minimum ${academy.minimumMonthlyCommitmentMonths} months, paid upfront.`,
        }) : ''}
    `;
}

function renderPricingRelationshipReadout() {
    if (calculatorState.customerId === 'academies') {
        const possibleRelationships = calculatorState.branches * calculatorState.sports;
        const branchLabel = pluralize(calculatorState.branches, 'branch', 'branches');
        const sportLabel = pluralize(calculatorState.sports, 'sport');
        return `
            <span>Pricing relationship</span>
            <strong>${calculatorState.activeRelationships} active / ${possibleRelationships} possible</strong>
            <small>${calculatorState.branches} ${branchLabel} × ${calculatorState.sports} ${sportLabel}</small>
        `;
    }

    if (calculatorState.customerId === 'trainingCamps') {
        const camps = pricingData.customers.trainingCamps;
        const isFixed = calculatorState.campPricingModel === 'fixed';
        return `
            <span>Pricing relationship</span>
            <strong>${isFixed ? 'Fixed fee' : `${camps.rates.revenueShare.percentage}% collected`}</strong>
            <small>${calculatorState.registrationWindowDays}-day registration window</small>
        `;
    }

    return `
        <span>Pricing relationship</span>
        <strong>Setup + volume + crew</strong>
        <small>${calculatorState.participants} ${pluralize(calculatorState.participants, 'participant')} · ${calculatorState.accreditations} ${pluralize(calculatorState.accreditations, 'accreditation')} · ${calculatorState.specialistCount} ${pluralize(calculatorState.specialistCount, 'specialist')} × ${calculatorState.specialistDays} ${pluralize(calculatorState.specialistDays, 'day')}</small>
    `;
}

function updatePricingRelationshipReadout() {
    const readout = document.querySelector('[data-pricing-relationship]');
    if (readout) readout.innerHTML = renderPricingRelationshipReadout();
}

function renderCampConfiguration() {
    const camps = pricingData.customers.trainingCamps;
    const fixedRate = formatMoney(calculatorState.currency, camps.rates.fixed.prices[calculatorState.currency]);
    const percentage = camps.rates.revenueShare.percentage;

    return `
        <fieldset class="pricing-fieldset">
            <legend>Pricing track</legend>
            <div class="pricing-choice-grid">
                ${renderChoiceButton('campPricingModel', 'fixed', 'Fixed fee', fixedRate, calculatorState.campPricingModel)}
                ${renderChoiceButton('campPricingModel', 'revenueShare', 'Collection-based', `${percentage}% collected`, calculatorState.campPricingModel)}
            </div>
        </fieldset>
        ${renderNumberField({
            field: 'registrationWindowDays',
            label: 'Registration window',
            value: calculatorState.registrationWindowDays,
            min: 1,
            max: camps.rates.fixed.registrationWindowDaysIncluded,
            suffix: 'days',
            help: `Registration can open up to ${camps.rates.fixed.registrationWindowDaysIncluded} days before camp.`,
        })}
        ${calculatorState.campPricingModel === 'revenueShare' ? renderNumberField({
            field: 'expectedCollections',
            label: `Expected amount collected (${calculatorState.currency})`,
            value: calculatorState.expectedCollections,
            min: 0,
            max: 100000000,
            suffix: calculatorState.currency,
            wholeNumber: false,
        }) : ''}
    `;
}

function renderEventConfiguration() {
    const events = pricingData.customers.events;
    const setupRate = formatMoney(calculatorState.currency, events.rates.setup.prices[calculatorState.currency]);

    return `
        <div class="pricing-field-grid">
            ${renderNumberField({ field: 'participants', label: 'Expected participants', value: calculatorState.participants, min: 0, max: 1000000, suffix: 'people' })}
            ${renderNumberField({ field: 'accreditations', label: 'Accreditations', value: calculatorState.accreditations, min: 0, max: 1000000, suffix: 'passes' })}
        </div>
        <div class="pricing-field-grid">
            ${renderNumberField({ field: 'specialistCount', label: 'On-ground specialists', value: calculatorState.specialistCount, min: 0, max: 100, suffix: 'people' })}
            ${renderNumberField({ field: 'specialistDays', label: 'Specialist operating days', value: calculatorState.specialistDays, min: 0, max: 365, suffix: 'days' })}
        </div>

    `;
}

function renderConfiguration() {
    const panel = document.querySelector('[data-configuration-panel]');
    panel.id = 'pricing-configuration-panel';

    if (calculatorState.customerId === 'academies') {
        panel.innerHTML = renderAcademyConfiguration();
    } else if (calculatorState.customerId === 'trainingCamps') {
        panel.innerHTML = renderCampConfiguration();
    } else {
        panel.innerHTML = renderEventConfiguration();
    }

    updatePricingRelationshipReadout();
}

function buildAcademyEstimate() {
    const academy = pricingData.customers.academies;
    const rate = academy.rates[calculatorState.academyBilling];
    const billedMonths = calculatorState.academyBilling === 'monthly' ? calculatorState.academyMonths : 1;
    const total = calculatorState.activeRelationships * rate.prices[calculatorState.currency] * billedMonths;
    const relationshipDescription = `${calculatorState.activeRelationships} ${pluralize(calculatorState.activeRelationships, academy.relationshipLabel)}`;

    return {
        title: academy.name,
        context: `${calculatorState.branches} ${pluralize(calculatorState.branches, 'branch', 'branches')} × ${calculatorState.sports} ${pluralize(calculatorState.sports, 'sport')} · ${calculatorState.activeRelationships} active`,
        lines: [{
            label: rate.label,
            formula: calculatorState.academyBilling === 'monthly'
                ? `${relationshipDescription} × ${calculatorState.academyMonths} months`
                : relationshipDescription,
            amount: total,
        }],
        total,
        minimumDue: calculatorState.academyBilling === 'monthly'
            ? calculatorState.activeRelationships * rate.prices[calculatorState.currency] * academy.minimumMonthlyCommitmentMonths
            : null,
        note: calculatorState.academyBilling === 'monthly'
            ? `${academy.minimumMonthlyCommitmentMonths} months are paid upfront. Your estimate covers ${calculatorState.academyMonths} ${pluralize(calculatorState.academyMonths, 'month')}.`
            : 'Annual access is priced for each active branch–sport relationship.',
    };
}

function buildTrainingCampEstimate() {
    const camps = pricingData.customers.trainingCamps;

    if (calculatorState.campPricingModel === 'fixed') {
        const fixedRate = camps.rates.fixed;
        const total = fixedRate.prices[calculatorState.currency];
        return {
            title: camps.name,
            context: 'Fixed-fee track',
            lines: [{ label: fixedRate.label, formula: `${calculatorState.registrationWindowDays}-day registration window`, amount: total }],
            total,
            minimumDue: null,
            note: `Registration can open up to ${fixedRate.registrationWindowDaysIncluded} days before the camp at the same fixed fee.`,
        };
    }

    const revenueShare = camps.rates.revenueShare;
    const total = calculatorState.expectedCollections * (revenueShare.percentage / 100);
    return {
        title: camps.name,
        context: 'Collection-based track',
        lines: [{
            label: revenueShare.label,
            formula: `${revenueShare.percentage}% of ${formatMoney(calculatorState.currency, calculatorState.expectedCollections)}`,
            amount: total,
        }],
        total,
        minimumDue: null,
        note: `The fee is calculated from the total amount collected in the application during the ${calculatorState.registrationWindowDays}-day registration window.`,
    };
}

function buildEventEstimate() {
    const events = pricingData.customers.events;
    const setupAmount = events.rates.setup.prices[calculatorState.currency];
    const participantAmount = calculatorState.participants * events.rates.participant.prices[calculatorState.currency];
    const accreditationAmount = calculatorState.accreditations * events.rates.accreditation.prices[calculatorState.currency];
    const specialistAmount = calculatorState.specialistCount
        * calculatorState.specialistDays
        * events.rates.onGroundSpecialist.prices[calculatorState.currency];

    return {
        title: events.name,
        context: `${calculatorState.participants} ${pluralize(calculatorState.participants, 'participant')} · ${calculatorState.specialistCount} ${pluralize(calculatorState.specialistCount, 'specialist')} × ${calculatorState.specialistDays} ${pluralize(calculatorState.specialistDays, 'day')}`,
        lines: [
            { label: events.rates.setup.label, formula: events.rates.setup.unit, amount: setupAmount },
            {
                label: events.rates.participant.label,
                formula: `${calculatorState.participants} × ${formatMoney(calculatorState.currency, events.rates.participant.prices[calculatorState.currency])}`,
                amount: participantAmount,
            },
            {
                label: events.rates.accreditation.label,
                formula: `${calculatorState.accreditations} × ${formatMoney(calculatorState.currency, events.rates.accreditation.prices[calculatorState.currency])}`,
                amount: accreditationAmount,
            },
            {
                label: events.rates.onGroundSpecialist.label,
                formula: `${calculatorState.specialistCount} ${pluralize(calculatorState.specialistCount, 'specialist')} × ${calculatorState.specialistDays} ${pluralize(calculatorState.specialistDays, 'day')} × ${formatMoney(calculatorState.currency, events.rates.onGroundSpecialist.prices[calculatorState.currency])}`,
                amount: specialistAmount,
            },
        ],
        total: setupAmount + participantAmount + accreditationAmount + specialistAmount,
        minimumDue: null,
        note: 'The setup fee is included once. Participant, accreditation, and specialist rates scale with your event.',
    };
}

function buildEstimate() {
    if (calculatorState.customerId === 'academies') {
        return buildAcademyEstimate();
    }

    return calculatorState.customerId === 'trainingCamps'
        ? buildTrainingCampEstimate()
        : buildEventEstimate();
}

function renderEstimate() {
    const estimate = buildEstimate();
    const panel = document.querySelector('[data-estimate-panel]');

    panel.innerHTML = `
        <div class="pricing-estimate-content">
            <header class="pricing-estimate-header">
                <span>Expected breakdown</span>
                <h3 id="pricing-estimate-title">${escapeHtml(estimate.title)}</h3>
                <small class="pricing-estimate-context">${escapeHtml(estimate.context)}</small>
            </header>
            <output class="pricing-estimate-total" aria-live="polite">
                <span>Estimated total</span>
                <strong>${escapeHtml(formatMoney(calculatorState.currency, estimate.total))}</strong>
            </output>
        </div>
    `;

    const actionSlot = document.querySelector('[data-estimate-action]');
    if (actionSlot) {
        actionSlot.innerHTML = '<a class="btn btn-primary pricing-estimate-action" href="/#contact">Discuss the<br>Estimate</a>';
    }
}

function renderCurrencyControls() {
    document.querySelectorAll('[data-currency]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.currency === calculatorState.currency));
    });
}

function formatDualCurrency(prices) {
    return `<strong>${escapeHtml(formatMoney('USD', prices.USD))}</strong><span class="pricing-plan-secondary-price">/ ${escapeHtml(formatMoney('AED', prices.AED))}</span>`;
}

function getPlanCategories() {
    const academy = pricingData.customers.academies;
    const camps = pricingData.customers.trainingCamps;
    const events = pricingData.customers.events;
    const brandedApplication = pricingData.addOns.brandedApplication;

    return [
        {
            id: 'academies',
            label: 'Academies',
            items: [
                {
                    label: academy.rates.annual.label,
                    amount: formatDualCurrency(academy.rates.annual.prices),
                    basis: academy.rates.annual.unit,
                    features: [
                        'Unlimited trainees and staff',
                        'Free support for the first 6 months for your staff',
                    ],
                },
                {
                    label: academy.rates.monthly.label,
                    amount: formatDualCurrency(academy.rates.monthly.prices),
                    basis: academy.rates.monthly.unit,
                    features: [
                        'Unlimited trainees and staff',
                        `${academy.minimumMonthlyCommitmentMonths}-month minimum paid upfront`,
                    ],
                },
            ],
        },
        {
            id: 'trainingCamps',
            label: 'Training Camps',
            items: [
                { label: camps.rates.fixed.label, amount: formatDualCurrency(camps.rates.fixed.prices), basis: camps.rates.fixed.unit, note: `Registration open up to ${camps.rates.fixed.registrationWindowDaysIncluded} days before camp` },
                { label: camps.rates.revenueShare.label, amount: `<strong>${camps.rates.revenueShare.percentage}%</strong>`, basis: camps.rates.revenueShare.unit },
            ],
        },
        {
            id: 'events',
            label: 'Events & Competitions',
            items: [
                { label: events.rates.setup.label, amount: formatDualCurrency(events.rates.setup.prices), basis: events.rates.setup.unit, features: [] },
                { label: events.rates.participant.label, amount: formatDualCurrency(events.rates.participant.prices), basis: events.rates.participant.unit, features: [] },
                { label: events.rates.accreditation.label, amount: formatDualCurrency(events.rates.accreditation.prices), basis: events.rates.accreditation.unit, features: [] },
                { label: events.rates.onGroundSpecialist.label, amount: formatDualCurrency(events.rates.onGroundSpecialist.prices), basis: events.rates.onGroundSpecialist.unit, features: [] },
            ],
        },
        {
            id: 'brandedApplication',
            label: 'Branded Application / White Label',
            items: [
                {
                    label: brandedApplication.name,
                    amount: formatDualCurrency(brandedApplication.prices),
                    basis: brandedApplication.unit,
                    features: [
                        'Your own branded experience across web, iOS, and Android with your name, logo, colors, and identity',
                    ],
                },
            ],
        },
    ];
}

function renderPlanTabs() {
    const categories = getPlanCategories();
    const tabsContainer = document.querySelector('[data-plan-tabs]');
    tabsContainer.innerHTML = categories.map((category) => {
        const isSelected = category.id === activePlanCategoryId;
        return `
            <button
                type="button"
                class="pricing-plan-tab"
                role="tab"
                data-plan-category="${escapeHtml(category.id)}"
                aria-selected="${isSelected}"
                aria-controls="pricing-plan-panel"
                tabindex="${isSelected ? 0 : -1}"
            >${escapeHtml(category.label)}</button>
        `;
    }).join('');
}

function renderPlanCard(item) {
    const featuresMarkup = item.features && item.features.length
        ? `
            <ul class="pricing-plan-features">
                ${item.features.map((feature) => `
                    <li>
                        <span class="pricing-plan-check" aria-hidden="true">✓</span>
                        <span>${escapeHtml(feature)}</span>
                    </li>
                `).join('')}
            </ul>
        `
        : '';

    return `
        <article class="pricing-plan-card">
            <header class="pricing-plan-card-header">
                <h3>${escapeHtml(item.label)}</h3>
                <p>${escapeHtml(item.basis)}</p>
            </header>
            <div class="pricing-plan-price">${item.amount}</div>
            ${featuresMarkup}
            <a href="/#contact" class="btn btn-primary btn-sm pricing-plan-cta">Get started</a>
        </article>
    `;
}

function renderRateCards() {
    const categories = getPlanCategories();
    const activeCategory = categories.find((category) => category.id === activePlanCategoryId) || categories[0];
    const container = document.querySelector('[data-rate-cards]');
    container.id = 'pricing-plan-panel';
    container.setAttribute('role', 'tabpanel');
    container.innerHTML = activeCategory.items.map(renderPlanCard).join('');
}

function selectPlanCategory(categoryId) {
    if (!pricingData) return;
    const categories = getPlanCategories();
    if (!categories.some((category) => category.id === categoryId)) return;
    activePlanCategoryId = categoryId;
    renderPlanTabs();
    renderRateCards();
}

function renderPublishedPricing() {
    calculatorState.currency = pricingData.defaultCurrency;
    calculatorState.academyMonths = pricingData.customers.academies.minimumMonthlyCommitmentMonths;
    document.querySelectorAll('[data-revenue-percentage]').forEach((element) => {
        element.textContent = `${pricingData.customers.trainingCamps.rates.revenueShare.percentage}%`;
    });
    document.querySelectorAll('[data-currency-notice]').forEach((element) => {
        element.textContent = pricingData.currencyNotice;
    });

    renderCurrencyControls();
    renderCustomerSelector();
    renderConfiguration();
    renderEstimate();
    renderPlanTabs();
    renderRateCards();
}

function renderPricingError(error) {
    const message = 'Published pricing could not be loaded. Refresh the page or contact demo@vitaq.app for help.';
    const errorMarkup = `<p class="pricing-data-error" role="alert"><strong>Pricing is temporarily unavailable.</strong>${escapeHtml(message)}</p>`;
    const relationshipReadout = document.querySelector('[data-pricing-relationship]');
    if (relationshipReadout) relationshipReadout.innerHTML = '<span>Pricing relationship</span><strong>Unavailable</strong>';
    document.querySelector('[data-configuration-panel]').innerHTML = errorMarkup;
    document.querySelector('[data-estimate-panel]').innerHTML = errorMarkup;
    const estimateAction = document.querySelector('[data-estimate-action]');
    if (estimateAction) estimateAction.innerHTML = '';
    document.querySelector('[data-plan-tabs]').innerHTML = '';
    document.querySelector('[data-rate-cards]').innerHTML = errorMarkup;
    console.error('Failed to load VitaQ pricing.', error);
}

function updateRelationshipInputs() {
    const maximumRelationships = calculatorState.branches * calculatorState.sports;
    calculatorState.activeRelationships = clampNumber(calculatorState.activeRelationships, 1, maximumRelationships, true);

    const activeRelationshipsInput = document.querySelector('[data-field="activeRelationships"]');
    if (activeRelationshipsInput) {
        activeRelationshipsInput.max = maximumRelationships;
        activeRelationshipsInput.value = calculatorState.activeRelationships;
    }

}

function selectCustomer(customerId) {
    if (!customerIds.includes(customerId)) return;
    calculatorState.customerId = customerId;
    renderCustomerSelector();
    renderConfiguration();
    renderEstimate();
}

function selectCurrency(currencyCode) {
    if (!currencyCodes.includes(currencyCode)) return;
    calculatorState.currency = currencyCode;
    renderCurrencyControls();
    renderConfiguration();
    renderEstimate();
}

function handlePricingClick(event) {
    if (!pricingData) return;

    const stepButton = event.target.closest('[data-step-field]');
    if (stepButton) {
        const input = document.querySelector(`[data-field="${stepButton.dataset.stepField}"]`);
        if (!input) return;

        const direction = Number(stepButton.dataset.stepDirection);
        const step = input.dataset.wholeNumber === 'true' ? 1 : 0.01;
        input.value = String(input.valueAsNumber + (direction * step));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return;
    }

    const currencyButton = event.target.closest('[data-currency]');
    if (currencyButton) {
        selectCurrency(currencyButton.dataset.currency);
        return;
    }

    const customerButton = event.target.closest('[data-customer]');
    if (customerButton) {
        selectCustomer(customerButton.dataset.customer);
        return;
    }

    const planTabButton = event.target.closest('[data-plan-category]');
    if (planTabButton) {
        selectPlanCategory(planTabButton.dataset.planCategory);
        return;
    }

    const choiceButton = event.target.closest('[data-choice]');
    if (choiceButton) {
        const stateKey = choiceButton.dataset.choice;
        const value = choiceButton.dataset.choiceValue;
        if (!(stateKey in calculatorState)) return;

        calculatorState[stateKey] = value;
        renderConfiguration();
        renderEstimate();
    }
}

function handlePricingInput(event) {
    if (!pricingData || !event.target.matches('[data-field]')) return;

    const input = event.target;
    const field = input.dataset.field;
    const min = Number(input.min);
    const max = Number(input.max);
    const wholeNumber = input.dataset.wholeNumber === 'true';
    calculatorState[field] = clampNumber(input.valueAsNumber, min, max, wholeNumber);

    if (field === 'branches' || field === 'sports') {
        calculatorState.activeRelationships = calculatorState.branches * calculatorState.sports;
        updateRelationshipInputs();
    } else if (field === 'activeRelationships') {
        updateRelationshipInputs();
    }

    updatePricingRelationshipReadout();
    renderEstimate();
}

function handlePricingChange(event) {
    if (event.target.matches('[data-field]')) {
        const input = event.target;
        input.value = calculatorState[input.dataset.field];
        return;
    }

}

function initializeMenu() {
    const menuButton = document.querySelector('.header-menu-button');
    const navLinks = document.querySelectorAll('.nav-link');

    function setMenuOpen(isOpen) {
        document.body.classList.toggle('menu-open', isOpen);
        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.setAttribute('aria-label', isOpen ? 'Close Menu' : 'Open Menu');
    }

    menuButton.addEventListener('click', () => setMenuOpen(!document.body.classList.contains('menu-open')));
    navLinks.forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setMenuOpen(false);
    });
}

function initializeParticles() {
    if (typeof window.particlesJS !== 'function') return;

    try {
        window.particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#FFFFFF' },
                shape: { type: 'circle' },
                opacity: { value: 0.4, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                size: { value: 2, random: true, anim: { enable: false } },
                line_linked: { enable: false },
                move: { enable: true, speed: 1, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false },
            },
            interactivity: {
                detect_on: 'canvas',
                events: { onhover: { enable: true, mode: 'push' }, onclick: { enable: true, mode: 'push' }, resize: true },
                modes: { push: { particles_nb: 4 } },
            },
            retina_detect: true,
        });
    } catch (error) {
        console.warn('particles.js failed to initialize; continuing without particles.', error);
    }
}

function initializeAmbientMotion() {
    const glows = Array.from(document.querySelectorAll('.aurora-glow'));
    const glowFactors = [60, 40, 25];
    const usesFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (usesFinePointer) {
        const spotlight = document.createElement('div');
        spotlight.classList.add('spotlight');
        document.body.appendChild(spotlight);

        window.addEventListener('mousemove', (event) => {
            const spotlightX = event.clientX - spotlight.offsetWidth / 2;
            const spotlightY = event.clientY - spotlight.offsetHeight / 2;

            if (window.gsap) {
                window.gsap.to(spotlight, { x: spotlightX, y: spotlightY, duration: 0.4, ease: 'power3.out' });
            } else {
                spotlight.style.transform = `translate(${spotlightX}px, ${spotlightY}px)`;
            }
        });
    }

    window.addEventListener('mousemove', (event) => {
        if (!window.gsap) return;
        const xPosition = (event.clientX / window.innerWidth) - 0.5;
        const yPosition = (event.clientY / window.innerHeight) - 0.5;
        glows.forEach((glow, index) => {
            window.gsap.to(glow, {
                x: -xPosition * glowFactors[index],
                y: -yPosition * glowFactors[index],
                duration: 1.5,
                ease: 'power2.out',
            });
        });
    });
}

function initializeHeaderBehavior() {
    const header = document.querySelector('.main-nav');
    let lastScrollPosition = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollPosition = window.scrollY;
        const isScrollingDown = currentScrollPosition > lastScrollPosition;
        header.classList.toggle('header--hidden', isScrollingDown && currentScrollPosition > header.offsetHeight);
        lastScrollPosition = currentScrollPosition;
    });
}

function initializeCursorBehavior() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.addEventListener('mouseover', (event) => {
        if (event.target.closest('a, button, input, label')) document.body.classList.add('cursor-active');
    });
    document.addEventListener('mouseout', (event) => {
        if (event.target.closest('a, button, input, label')) document.body.classList.remove('cursor-active');
    });
}

function initializePageAnimations() {
    if (!window.gsap) return;

    if (window.ScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        window.ScrollTrigger.config({ ignoreMobileResize: true });
    }

    window.gsap.from('.pricing-hero-copy > *', {
        y: 36,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.2,
    });
    window.gsap.from('.pricing-logic', { x: 36, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.45 });

    if (window.ScrollTrigger) {
        document.querySelectorAll('.pricing-section-header, .pricing-customer-selector, .pricing-workspace, .pricing-table-shell').forEach((element) => {
            window.gsap.from(element, {
                scrollTrigger: { trigger: element, start: 'top 88%', toggleActions: 'play none none none' },
                y: 34,
                opacity: 0,
                duration: 0.75,
                ease: 'power3.out',
            });
        });
    }
}

async function loadPublishedPricing() {
    const pricesUrl = document.body.dataset.pricesUrl || '/prices.json';
    const response = await fetch(pricesUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`prices.json returned HTTP ${response.status}.`);
    pricingData = validatePrices(await response.json());
    renderPublishedPricing();
}

document.addEventListener('click', handlePricingClick);
document.addEventListener('input', handlePricingInput);
document.addEventListener('change', handlePricingChange);

document.addEventListener('DOMContentLoaded', () => {
    initializeMenu();
    initializeParticles();
    initializeAmbientMotion();
    initializeHeaderBehavior();
    initializeCursorBehavior();
    initializePageAnimations();
    initializePricingCardTilt();
    loadPublishedPricing().catch(renderPricingError);

    window.__vitaqAnimationsReady = true;
    document.body.classList.remove('loading-fallback');
});

const originalDocumentTitle = document.title;
window.addEventListener('blur', () => {
    document.title = '👋 Come back to VitaQ!';
});
window.addEventListener('focus', () => {
    document.title = originalDocumentTitle;
});