/**
 * MediPredict Clinical Intelligence Platform
 * Vanilla JS - Flask Compatible
 * Features: Charts, Validation, Dual-View Results, Exports
 */

// ==========================================
// GLOBAL STATE
// ==========================================
let selectedModel = null;
let selectedModelData = null;
let currentResults = null;
let resultsChart = null;
let currentChartType = 'bar';
let currentResultView = 'doctor';

// ==========================================
// MODEL DATA CONFIGURATION
// ==========================================
const MODELS_DATA = [
    { name: "Clinical_multilabel_model", displayName: "Clinical Multilabel", desc: "Comprehensive multi-disease screening across all major renal and metabolic conditions in a single assessment.", accuracy: "97.1%", params: 24, type: "multilabel", iconBg: "#EDE9FE", iconColor: "#7C3AED", icon: "activity" },
    { name: "Hypertension", displayName: "Hypertension", desc: "Predicts hypertension risk based on blood pressure, age, creatinine, and other clinical markers.", accuracy: "96.5%", params: 10, type: "binary", iconBg: "#DBEAFE", iconColor: "#2563EB", icon: "heart-pulse" },
    { name: "Anemia", displayName: "Anemia", desc: "Detects anemia probability using hemoglobin, packed cell volume, and red blood cell count data.", accuracy: "97.9%", params: 8, type: "binary", iconBg: "#FCE7F3", iconColor: "#DB2777", icon: "droplets" },
    { name: "Coronary Artery Disease (CAD)", displayName: "Coronary Artery Disease", desc: "Assesses CAD risk from age, blood pressure, diabetes markers, and cholesterol indicators.", accuracy: "97.6%", params: 14, type: "binary", iconBg: "#FEE2E2", iconColor: "#DC2626", icon: "heart" },
    { name: "Diabetes Mellitus", displayName: "Diabetes Mellitus", desc: "Evaluates diabetes likelihood using blood glucose, sugar levels, and renal function markers.", accuracy: "90.0%", params: 9, type: "binary", iconBg: "#FEF3C7", iconColor: "#D97706", icon: "test-tube" },
    { name: "CKD", displayName: "Chronic Kidney Disease", desc: "Screens for CKD using serum creatinine, blood urea, hemoglobin, and specific gravity values.", accuracy: "98.7%", params: 10, type: "binary", iconBg: "#D1FAE5", iconColor: "#059669", icon: "kidney" },
    { name: "Urinary Tract Infection", displayName: "Urinary Tract Infection", desc: "Detects UTI from pus cells, bacteria count, white blood cells, and urine analysis data.", accuracy: "98.0%", params: 10, type: "binary", iconBg: "#E0E7FF", iconColor: "#4F46E5", icon: "flame" },
    { name: "Proteinuria", displayName: "Proteinuria", desc: "Identifies proteinuria risk from specific gravity, albumin levels, and urine sediment findings.", accuracy: "98.0%", params: 6, type: "binary", iconBg: "#F3E8FF", iconColor: "#7C3AED", icon: "beaker" },
    { name: "Hyperglycemia", displayName: "Hyperglycemia", desc: "Assesses elevated blood sugar risk using glucose levels, diabetes history, and metabolic markers.", accuracy: "97.0%", params: 10, type: "binary", iconBg: "#FFEDD5", iconColor: "#EA580C", icon: "trending-up" },
    { name: "Electrolyte Imbalance", displayName: "Electrolyte Imbalance", desc: "Evaluates sodium, potassium, and creatinine balance to detect electrolyte disturbances.", accuracy: "95.0%", params: 8, type: "binary", iconBg: "#ECFDF5", iconColor: "#10B981", icon: "zap" },
    { name: "Kidney Failure", displayName: "Kidney Failure", desc: "Predicts acute kidney failure risk from creatinine, blood urea, and hemoglobin trends.", accuracy: "99.0%", params: 7, type: "binary", iconBg: "#FEF2F2", iconColor: "#EF4444", icon: "alert-circle" },
    { name: "Diabetic Nephropathy", displayName: "Diabetic Nephropathy", desc: "Detects diabetic kidney disease using glucose, creatinine, albumin, and blood pressure data.", accuracy: "100%", params: 14, type: "binary", iconBg: "#EFF6FF", iconColor: "#3B82F6", icon: "shield-alert" }
];

const ACCURACY_DATA = [
    { name: "Kidney Failure", value: 99, display: "99%" },
    { name: "Diabetic Nephropathy", value: 100, display: "100%" },
    { name: "CKD", value: 98.7, display: "98.7%" },
    { name: "UTI", value: 98, display: "98%" },
    { name: "Proteinuria", value: 98, display: "98%" },
    { name: "Anemia", value: 97.9, display: "97.9%" },
    { name: "CAD", value: 97.6, display: "97.6%" },
    { name: "Clinical Multilabel", value: 97.1, display: "97.1%" },
    { name: "Hyperglycemia", value: 97, display: "97%" },
    { name: "Hypertension", value: 96.5, display: "96.5%" },
    { name: "Electrolyte Imbalance", value: 95, display: "95%" },
    { name: "Diabetes Mellitus", value: 90, display: "90%" }
];

// ==========================================
// SVG ICONS
// ==========================================
const ICONS = {
    activity: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
    "heart-pulse": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>`,
    droplets: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`,
    heart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
    "test-tube": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M6.5 8h10"/></svg>`,
    kidney: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11.5 8.5c0-2.5-2-4.5-4.5-4.5S2.5 6 2.5 8.5c0 2.3 1.7 4.2 4 4.5v3c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5v-3c2.3-.3 4-2.2 4-4.5C19.5 6 17.5 4 15 4s-4.5 2-4.5 4.5"/><path d="M8 13v4"/><path d="M16 13v4"/></svg>`,
    flame: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 1.5 1.3 2.5 3 2.5 5.5a6 6 0 0 1-12 0c0-2.8 1.5-4.8 3-6.5Z"/></svg>`,
    beaker: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>`,
    "trending-up": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
    zap: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    "alert-circle": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    "shield-alert": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    "arrow-right": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
    download: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`
};

// ==========================================
// FIELD DEFINITIONS
// ==========================================
const FIELD_DEFINITIONS = {
    age: { label: 'Age', type: 'number', min: 1, max: 120, placeholder: 'e.g. 48', hint: 'Patient age in years', required: true },
    bp: { label: 'Blood Pressure', type: 'select', options: [{value:'high',label:'High'},{value:'normal',label:'Normal'},{value:'low',label:'Low'}], hint: 'Blood pressure category', required: true },
    sg: { label: 'Specific Gravity', type: 'number', step: '0.001', min: 1.005, max: 1.030, placeholder: 'e.g. 1.020', hint: 'Urine specific gravity (1.005 - 1.030)' },
    al: { label: 'Albumin', type: 'select', options: [{value:'0',label:'0 - None'},{value:'1',label:'1 - Trace'},{value:'2',label:'2 - Mild'},{value:'3',label:'3 - Moderate'},{value:'4',label:'4 - Severe'},{value:'5',label:'5 - Very Severe'}], hint: 'Urine albumin level' },
    su: { label: 'Sugar (Urine)', type: 'select', options: [{value:'0',label:'0 - None'},{value:'1',label:'1 - Trace'},{value:'2',label:'2 - Mild'},{value:'3',label:'3 - Moderate'},{value:'4',label:'4 - High'},{value:'5',label:'5 - Very High'}], hint: 'Urine sugar level' },
    rbc: { label: 'Red Blood Cells (Urine)', type: 'select', options: [{value:'normal',label:'Normal'},{value:'abnormal',label:'Abnormal'}], hint: 'Urine RBC examination' },
    pc: { label: 'Pus Cell', type: 'select', options: [{value:'normal',label:'Normal'},{value:'abnormal',label:'Abnormal'}], hint: 'Urine pus cell count' },
    pcc: { label: 'Pus Cell Clumps', type: 'select', options: [{value:'present',label:'Present'},{value:'notpresent',label:'Not Present'}], hint: 'Pus cell clumps in urine' },
    ba: { label: 'Bacteria', type: 'select', options: [{value:'present',label:'Present'},{value:'notpresent',label:'Not Present'}], hint: 'Bacteria in urine' },
    bgr: { label: 'Blood Glucose Random', type: 'number', step: '0.1', min: 50, max: 500, placeholder: 'e.g. 121', hint: 'Random blood glucose (mg/dL)' },
    bu: { label: 'Blood Urea', type: 'number', step: '0.1', min: 5, max: 200, placeholder: 'e.g. 36', hint: 'Blood urea nitrogen (mg/dL)' },
    sc: { label: 'Serum Creatinine', type: 'number', step: '0.1', min: 0.3, max: 20, placeholder: 'e.g. 1.2', hint: 'Serum creatinine (mg/dL)', required: true },
    sod: { label: 'Sodium', type: 'number', step: '0.1', min: 100, max: 180, placeholder: 'e.g. 138', hint: 'Serum sodium (mEq/L)', required: true },
    pot: { label: 'Potassium', type: 'number', step: '0.1', min: 2, max: 8, placeholder: 'e.g. 4.5', hint: 'Serum potassium (mEq/L)', required: true },
    hemo: { label: 'Hemoglobin', type: 'number', step: '0.1', min: 3, max: 20, placeholder: 'e.g. 13.5', hint: 'Hemoglobin level (g/dL)', required: true },
    pcv: { label: 'Packed Cell Volume', type: 'number', step: '0.1', min: 10, max: 60, placeholder: 'e.g. 44', hint: 'PCV percentage (%)' },
    wc: { label: 'White Blood Cell Count', type: 'number', min: 2000, max: 30000, placeholder: 'e.g. 7800', hint: 'WBC count (cells/cmm)' },
    rc: { label: 'Red Blood Cell Count', type: 'number', step: '0.1', min: 2, max: 8, placeholder: 'e.g. 5.2', hint: 'RBC count (millions/cmm)' },
    htn: { label: 'Hypertension', type: 'select', options: [{value:'yes',label:'Yes'},{value:'no',label:'No'}], hint: 'Known hypertension diagnosis', required: true },
    dm: { label: 'Diabetes Mellitus', type: 'select', options: [{value:'yes',label:'Yes'},{value:'no',label:'No'}], hint: 'Known diabetes diagnosis', required: true },
    cad: { label: 'Coronary Artery Disease', type: 'select', options: [{value:'yes',label:'Yes'},{value:'no',label:'No'}], hint: 'Known CAD diagnosis' },
    appet: { label: 'Appetite', type: 'select', options: [{value:'good',label:'Good'},{value:'poor',label:'Poor'}], hint: 'Patient appetite status' },
    pe: { label: 'Pedal Edema', type: 'select', options: [{value:'yes',label:'Yes'},{value:'no',label:'No'}], hint: 'Swelling in feet/ankles' },
    ane: { label: 'Anemia Present', type: 'select', options: [{value:'yes',label:'Yes'},{value:'no',label:'No'}], hint: 'Known anemia diagnosis' },
    label_CKD: { label: 'CKD Label', type: 'select', options: [{value:'0',label:'0 - No CKD'},{value:'1',label:'1 - Has CKD'}], hint: 'Previous CKD diagnosis status' }
};

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
        error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };

    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// ==========================================
// VIEW MANAGEMENT
// ==========================================
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
        targetView.scrollIntoView({ behavior: 'instant', block: 'start' });
    }

    const navLink = document.querySelector(`.nav-link[data-view="${viewName}"]`);
    if (navLink) navLink.classList.add('active');

    if (viewName === 'home') {
        renderAccuracyGrid();
    }
}

// Nav link handlers
document.querySelectorAll('.nav-link[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(link.dataset.view);
    });
});

// ==========================================
// RENDER ACCURACY GRID (Home)
// ==========================================
function renderAccuracyGrid() {
    const grid = document.getElementById('accuracyGrid');
    if (!grid || grid.children.length > 0) return;

    grid.innerHTML = ACCURACY_DATA.map((item, i) => `
        <div class="accuracy-card" style="animation: fadeIn 0.5s ease-out ${i * 0.05}s both;">
            <div class="accuracy-card-header">
                <div class="accuracy-card-icon" style="background: ${getColorForAccuracy(item.value)}20; color: ${getColorForAccuracy(item.value)};">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
            </div>
            <div class="accuracy-card-name">${item.name}</div>
            <div class="accuracy-card-value">${item.display}</div>
            <div class="accuracy-card-label">Validated Accuracy</div>
            <div class="accuracy-progress">
                <div class="accuracy-progress-fill" style="width: ${item.value}%; background: linear-gradient(90deg, ${getColorForAccuracy(item.value)}, ${getColorForAccuracy(item.value)}88);"></div>
            </div>
        </div>
    `).join('');
}

function getColorForAccuracy(val) {
    if (val >= 98) return '#059669';
    if (val >= 95) return '#2563EB';
    if (val >= 90) return '#D97706';
    return '#DC2626';
}

// ==========================================
// RENDER MODELS GRID
// ==========================================
function renderModelsGrid() {
    const grid = document.getElementById('modelsGrid');
    if (!grid || grid.children.length > 0) return;

    grid.innerHTML = MODELS_DATA.map((model, i) => `
        <div class="model-card" onclick="selectModel('${model.name}')" style="animation: fadeIn 0.5s ease-out ${i * 0.06}s both;">
            <div class="model-card-header">
                <div class="model-card-icon" style="background: ${model.iconBg}; color: ${model.iconColor};">
                    ${ICONS[model.icon] || ICONS.activity}
                </div>
                <div class="model-card-arrow">${ICONS['arrow-right']}</div>
            </div>
            <div class="model-card-name">${model.displayName}</div>
            <div class="model-card-desc">${model.desc}</div>
            <div class="model-card-footer">
                <span class="model-card-accuracy">${model.accuracy} Accuracy</span>
                <span class="model-card-params">${model.params} params</span>
            </div>
        </div>
    `).join('');
}

// ==========================================
// MODEL SELECTION
// ==========================================
function selectModel(modelName) {
    selectedModel = modelName;
    selectedModelData = MODELS_DATA.find(m => m.name === modelName);

    // Update sidebar
    const model = selectedModelData;
    document.getElementById('sidebarModelName').textContent = model.displayName;
    document.getElementById('sidebarModelDesc').textContent = model.desc;
    document.getElementById('sidebarModelAccuracy').textContent = model.accuracy;
    document.getElementById('sidebarModelParams').textContent = model.params;
    document.getElementById('sidebarModelType').textContent = model.type === 'multilabel' ? 'Multi-Label' : 'Binary';
    document.getElementById('sidebarModelIcon').style.background = model.iconBg;
    document.getElementById('sidebarModelIcon').style.color = model.iconColor;
    document.getElementById('sidebarModelIcon').innerHTML = ICONS[model.icon] || ICONS.activity;

    document.getElementById('formTitle').textContent = `Patient Data Input — ${model.displayName}`;

    // Fetch model features from server
    fetchModelInfo(modelName);

    switchView('form');
}

async function fetchModelInfo(modelName) {
    try {
        const response = await fetch(`/api/model-info/${encodeURIComponent(modelName)}`);
        const data = await response.json();
        if (data.features) {
            buildFormFields(data.features, data.categorical || []);
        }
    } catch (error) {
        console.error('Error fetching model info:', error);
        showToast('Failed to load model configuration. Using cached data.', 'warning');
        // Fallback: use hardcoded features from the original app
        const modelMeta = getModelMeta(modelName);
        if (modelMeta) {
            buildFormFields(modelMeta.features, modelMeta.categorical);
        }
    }
}

function getModelMeta(modelName) {
    const registry = {
        "Clinical_multilabel_model": { features: ['age','bp','sg','al','su','rbc','pc','pcc','ba','bgr','bu','sc','sod','pot','hemo','pcv','wc','rc','htn','dm','cad','appet','pe','ane'], categorical: ['rbc','pc','pcc','ba','htn','dm','cad','appet','pe','ane'] },
        "Hypertension": { features: ['bp','age','sc','bu','sod','pot','pe','cad','dm','hemo'], categorical: ['bp','pe','cad','dm'] },
        "Anemia": { features: ['hemo','pcv','rc','sc','bu','htn','dm','label_CKD'], categorical: ['htn','dm'] },
        "Coronary Artery Disease (CAD)": { features: ['age','bp','dm','htn','bgr','sc','bu','hemo','ane','sod','pot','pe','wc','appet'], categorical: ['bp','dm','htn','ane','pe','appet'] },
        "Diabetes Mellitus": { features: ['bgr','su','sc','bu','hemo','htn','age','al','sg'], categorical: ['su','htn','al'] },
        "CKD": { features: ['sc','bu','hemo','sg','al','htn','dm','pcv','rc','pe'], categorical: ['htn','dm','pe','al'] },
        "Urinary Tract Infection": { features: ['pc','pcc','ba','wc','rbc','su','dm','hemo','age','pe'], categorical: ['pc','pcc','ba','rbc','su','dm','pe'] },
        "Proteinuria": { features: ['sg','al','rbc','pc','pcc','ba'], categorical: ['al','rbc','pc','pcc','ba'] },
        "Hyperglycemia": { features: ['bgr','su','dm','hemo','pcv','age','htn','bp','sc','bu'], categorical: ['su','dm','htn','bp'] },
        "Electrolyte Imbalance": { features: ['sod','pot','sc','bu','bgr','age','htn','dm'], categorical: ['htn','dm'] },
        "Kidney Failure": { features: ['sc','bu','sg','hemo','pcv','sod','pot'], categorical: [] },
        "Diabetic Nephropathy": { features: ['bgr','dm','sc','bu','sg','al','hemo','pcv','rc','htn','sod','pot','pe','ane'], categorical: ['dm','htn','pe','ane'] }
    };
    return registry[modelName];
}

// ==========================================
// FORM BUILDING
// ==========================================
function buildFormFields(features, categoricalFields) {
    const container = document.getElementById('dynamicFields');
    container.innerHTML = '';

    features.forEach((fieldName, index) => {
        const def = FIELD_DEFINITIONS[fieldName];
        if (!def) return;

        const isRequired = def.required || false;
        const div = document.createElement('div');
        div.className = 'form-field';
        div.dataset.field = fieldName;

        // Label
        const label = document.createElement('label');
        label.innerHTML = `${def.label}${isRequired ? ' <span class="required">*</span>' : ''}`;

        // Input or Select
        let input;
        if (def.type === 'select') {
            input = document.createElement('select');
            input.name = fieldName;
            input.id = `field_${fieldName}`;

            const emptyOpt = document.createElement('option');
            emptyOpt.value = '';
            emptyOpt.textContent = '-- Select --';
            input.appendChild(emptyOpt);

            def.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                input.appendChild(option);
            });
        } else {
            input = document.createElement('input');
            input.type = 'number';
            input.name = fieldName;
            input.id = `field_${fieldName}`;
            if (def.placeholder) input.placeholder = def.placeholder;
            if (def.min !== undefined) input.min = def.min;
            if (def.max !== undefined) input.max = def.max;
            if (def.step) input.step = def.step;
        }

        input.addEventListener('change', () => validateField(div, input, isRequired));
        input.addEventListener('blur', () => validateField(div, input, isRequired));
        input.addEventListener('input', updateProgress);

        // Hint
        const hint = document.createElement('span');
        hint.className = 'form-field-hint';
        hint.textContent = def.hint || '';

        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(hint);
        container.appendChild(div);
    });

    updateProgress();
}

function validateField(fieldDiv, input, isRequired) {
    const value = input.value.trim();
    fieldDiv.classList.remove('error', 'success');

    if (isRequired && !value) {
        fieldDiv.classList.add('error');
        return false;
    }
    if (value && input.type === 'number') {
        const num = parseFloat(value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        if ((min !== undefined && num < min) || (max !== undefined && num > max)) {
            fieldDiv.classList.add('error');
            return false;
        }
    }
    if (value) {
        fieldDiv.classList.add('success');
    }
    return true;
}

function updateProgress() {
    const fields = document.querySelectorAll('.form-field');
    if (fields.length === 0) return;

    let filled = 0;
    let requiredTotal = 0;
    let requiredFilled = 0;

    fields.forEach(f => {
        const input = f.querySelector('input, select');
        const isRequired = f.querySelector('label .required') !== null;
        const hasValue = input && input.value.trim() !== '';

        if (hasValue) filled++;
        if (isRequired) {
            requiredTotal++;
            if (hasValue) requiredFilled++;
        }
    });

    const percent = Math.round((filled / fields.length) * 100);
    document.getElementById('formProgressFill').style.width = `${percent}%`;
    document.getElementById('formProgressText').textContent = `${percent}% Complete (${requiredFilled}/${requiredTotal} required)`;
}

// ==========================================
// FORM SUBMISSION
// ==========================================
document.getElementById('dataForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedModel) {
        showToast('Please select a model first.', 'warning');
        return;
    }

    // Validate required fields
    const fields = document.querySelectorAll('.form-field');
    let hasError = false;
    let missingFields = [];

    fields.forEach(f => {
        const input = f.querySelector('input, select');
        const isRequired = f.querySelector('label .required') !== null;
        const valid = validateField(f, input, isRequired);
        if (isRequired && !valid) {
            hasError = true;
            const label = f.querySelector('label').childNodes[0].textContent.trim();
            missingFields.push(label);
        }
    });

    if (hasError) {
        showToast(`Please fill in required fields: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? '...' : ''}`, 'error');
        // Scroll to first error
        const firstError = document.querySelector('.form-field.error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // Collect form data
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach((val, key) => {
        if (val !== '') data[key] = val;
    });

    // Submit
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> Processing...';

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model_name: selectedModel, form_data: data })
        });

        const result = await response.json();

        if (result.success) {
            currentResults = result.results;
            showToast('Prediction completed successfully!', 'success');
            displayResults(result.results, result.model_name);
        } else {
            showToast(`Prediction Error: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Submission failed:', error);
        showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Run Prediction`;
    }
});

// ==========================================
// DISPLAY RESULTS
// ==========================================
function displayResults(results, modelName) {
    const container = document.getElementById('resultsContent');
    const section = document.getElementById('resultsSection');
    container.innerHTML = '';
    section.classList.remove('hidden');

    // Doctor View
    const doctorView = document.createElement('div');
    doctorView.className = 'result-view-doctor';
    doctorView.id = 'doctorView';

    results.forEach(r => {
        const percentage = (r.probability * 100).toFixed(1);
        const status = r.status === 'Positive' ? 'positive' : r.probability > 0.3 ? 'moderate' : 'negative';
        const badgeText = r.status === 'Positive' ? 'Detected' : 'Not Detected';
        const riskLevel = r.probability > 0.7 ? 'high' : r.probability > 0.3 ? 'medium' : 'low';
        const riskLabel = riskLevel === 'high' ? 'High Risk' : riskLevel === 'medium' ? 'Moderate Risk' : 'Low Risk';

        // Clinical interpretation
        const interpretation = getClinicalInterpretation(r.disease, r.probability, r.status);

        doctorView.innerHTML += `
            <div class="result-card ${status}">
                <div class="result-card-header">
                    <span class="result-card-title">${r.disease}</span>
                    <span class="result-card-badge ${status}">${badgeText}</span>
                </div>
                <div class="result-card-body">
                    <div class="result-probability">
                        <span class="result-probability-label">Probability</span>
                        <span class="result-probability-value ${riskLevel}">${percentage}%</span>
                        <div class="result-probability-bar">
                            <div class="result-probability-bar-fill ${riskLevel}" style="width: ${percentage}%"></div>
                        </div>
                        <span class="result-detail-label">Risk Level: ${riskLabel}</span>
                    </div>
                    <div class="result-details">
                        <div class="result-detail-row">
                            <span class="result-detail-label">Status</span>
                            <span class="result-detail-value">${r.status}</span>
                        </div>
                        <div class="result-detail-row">
                            <span class="result-detail-label">Confidence</span>
                            <span class="result-detail-value">${r.probability > 0.8 ? 'High' : r.probability > 0.5 ? 'Moderate' : 'Low'}</span>
                        </div>
                        <div class="result-detail-row">
                            <span class="result-detail-label">Model</span>
                            <span class="result-detail-value">${modelName}</span>
                        </div>
                    </div>
                    <div class="result-clinical-note">
                        <h5>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            Clinical Note
                        </h5>
                        <p>${interpretation.doctor}</p>
                    </div>
                </div>
            </div>
        `;
    });

    // Patient View
    const patientView = document.createElement('div');
    patientView.className = 'result-view-patient hidden';
    patientView.id = 'patientView';

    const primaryResult = results[0];
    const pProb = (primaryResult.probability * 100).toFixed(1);
    const pStatus = primaryResult.status;
    const pInterp = getClinicalInterpretation(primaryResult.disease, primaryResult.probability, primaryResult.status);
    const iconType = pStatus === 'Positive' ? 'risk' : pProb > 30 ? 'caution' : 'safe';
    const iconSvg = iconType === 'safe'
        ? `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
        : iconType === 'caution'
        ? `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
        : `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

    patientView.innerHTML = `
        <div class="patient-result">
            <div class="patient-result-icon ${iconType}">${iconSvg}</div>
            <h3>${primaryResult.disease} — ${pStatus === 'Positive' ? 'Detected' : 'Not Detected'}</h3>
            <p class="patient-result-summary">${pInterp.patient}</p>
            <div class="patient-result-gauge">
                <canvas id="gaugeChart"></canvas>
            </div>
            <div class="patient-result-actions">
                <button class="btn-primary" onclick="document.getElementById('doctorView').classList.remove('hidden'); document.getElementById('patientView').classList.add('hidden'); switchResultView('doctor');">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    View Doctor Details
                </button>
                <button class="btn-secondary" onclick="toggleExportMenu()">
                    ${ICONS.download}
                    Export Report
                </button>
            </div>
            <div class="patient-recommendation">
                <h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Recommendations
                </h4>
                <ul>
                    ${pInterp.recommendations.map(rec => `<li>${ICONS.check} ${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
        ${results.length > 1 ? '<div style="margin-top: 20px;"><p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Additional conditions checked:</p>' + results.slice(1).map(r => {
            const pct = (r.probability * 100).toFixed(1);
            const st = r.status === 'Positive' ? 'positive' : 'negative';
            return `<div class="result-card ${st}" style="margin-bottom: 10px; padding: 16px;"><div class="result-card-header"><span class="result-card-title">${r.disease}</span><span class="result-card-badge ${st}">${r.status}</span></div><div class="result-probability-bar"><div class="result-probability-bar-fill ${r.probability > 0.7 ? 'high' : r.probability > 0.3 ? 'medium' : 'low'}" style="width: ${pct}%"></div></div></div>`;
        }).join('') + '</div>' : ''}
    `;

    container.appendChild(doctorView);
    container.appendChild(patientView);

    // Show chart section
    document.getElementById('chartSection').classList.remove('hidden');

    // Render charts
    setTimeout(() => {
        renderChart(results);
        if (pStatus === 'Positive' || pProb > 20) {
            renderGaugeChart('gaugeChart', primaryResult.probability);
        }
    }, 100);

    // Scroll to results
    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
}

function getClinicalInterpretation(disease, probability, status) {
    const interpretations = {
        default: {
            doctor: status === 'Positive'
                ? `The model indicates a ${(probability * 100).toFixed(1)}% probability of ${disease}. Clinical correlation is strongly recommended. Consider ordering confirmatory diagnostic tests and initiating appropriate management protocol.`
                : `The model indicates low probability (${(probability * 100).toFixed(1)}%) for ${disease}. However, continue monitoring clinical signs. False negatives can occur — maintain standard clinical vigilance.`,
            patient: status === 'Positive'
                ? `Our analysis indicates signs that may be associated with ${disease}. The probability score is ${(probability * 100).toFixed(1)}%. This does not confirm a diagnosis — please consult your doctor for a thorough clinical evaluation and confirmatory testing.`
                : `Our analysis shows a low probability of ${disease} at ${(probability * 100).toFixed(1)}%. This is reassuring, but please continue following your doctor's advice and attend regular check-ups.`,
            recommendations: status === 'Positive'
                ? ['Schedule an appointment with your healthcare provider', 'Bring this report to your consultation', 'Follow your prescribed medication regimen', 'Monitor symptoms and report any changes']
                : ['Continue regular health check-ups', 'Maintain a healthy lifestyle', 'Follow your doctor\'s preventive care advice', 'Keep monitoring your health markers']
        }
    };
    return interpretations[disease] || interpretations.default;
}

// ==========================================
// DUAL VIEW SWITCHING
// ==========================================
function switchResultView(view) {
    currentResultView = view;
    const doctorView = document.getElementById('doctorView');
    const patientView = document.getElementById('patientView');

    document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.view-toggle-btn[data-view="${view}"]`)?.classList.add('active');

    if (view === 'doctor') {
        doctorView.classList.remove('hidden');
        patientView.classList.add('hidden');
    } else {
        doctorView.classList.add('hidden');
        patientView.classList.remove('hidden');
        // Re-render gauge if needed
        if (currentResults && currentResults[0]) {
            setTimeout(() => renderGaugeChart('gaugeChart', currentResults[0].probability), 50);
        }
    }
}

// ==========================================
// CHARTS
// ==========================================
function renderChart(results) {
    const ctx = document.getElementById('resultsChart');
    if (!ctx) return;

    if (resultsChart) {
        resultsChart.destroy();
    }

    const labels = results.map(r => r.disease.length > 20 ? r.disease.substring(0, 20) + '...' : r.disease);
    const data = results.map(r => (r.probability * 100).toFixed(1));
    const colors = results.map(r => r.probability > 0.7 ? '#DC2626' : r.probability > 0.3 ? '#D97706' : '#059669');
    const bgColors = results.map(r => r.probability > 0.7 ? 'rgba(220, 38, 38, 0.15)' : r.probability > 0.3 ? 'rgba(217, 119, 6, 0.15)' : 'rgba(5, 150, 105, 0.15)');

    if (currentChartType === 'bar') {
        resultsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Probability (%)',
                    data: data,
                    backgroundColor: colors.map(c => c + '22'),
                    borderColor: colors,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1000, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1A1D1F',
                        titleFont: { family: 'Inter', size: 13 },
                        bodyFont: { family: 'Inter', size: 13, weight: '600' },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: (ctx) => `Probability: ${ctx.parsed.y}%`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#F3F4F6' },
                        ticks: { font: { family: 'Inter', size: 11 }, color: '#9CA3AF', callback: v => v + '%' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Inter', size: 11 }, color: '#6B7280', maxRotation: 45 }
                    }
                }
            }
        });
    } else if (currentChartType === 'gauge') {
        // Multiple doughnut gauges
        const gaugeData = {
            labels: labels,
            datasets: results.map((r, i) => ({
                label: r.disease,
                data: [(r.probability * 100).toFixed(1), (100 - r.probability * 100).toFixed(1)],
                backgroundColor: [colors[i], '#F3F4F6'],
                borderWidth: 0,
                circumference: 270,
                rotation: 225
            }))
        };

        resultsChart = new Chart(ctx, {
            type: 'doughnut',
            data: gaugeData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { font: { family: 'Inter', size: 11 }, padding: 16, usePointStyle: true } }
                }
            }
        });
    } else if (currentChartType === 'radar') {
        resultsChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Probability (%)',
                    data: data,
                    backgroundColor: 'rgba(124, 58, 237, 0.15)',
                    borderColor: '#7C3AED',
                    borderWidth: 2,
                    pointBackgroundColor: colors,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { display: false },
                        grid: { color: '#F3F4F6' },
                        pointLabels: { font: { family: 'Inter', size: 11 }, color: '#6B7280' }
                    }
                }
            }
        });
    }
}

function renderGaugeChart(canvasId, probability) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const pct = (probability * 100).toFixed(1);
    const color = probability > 0.7 ? '#DC2626' : probability > 0.3 ? '#D97706' : '#059669';

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [pct, 100 - pct],
                backgroundColor: [color, '#F3F4F6'],
                borderWidth: 0,
                circumference: 270,
                rotation: 225
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        },
        plugins: [{
            id: 'gaugeText',
            afterDraw: (chart) => {
                const { ctx, chartArea: { width, height } } = chart;
                ctx.save();
                ctx.font = 'bold 28px Inter, sans-serif';
                ctx.fillStyle = '#1A1D1F';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${pct}%`, width / 2, height / 2 + 5);
                ctx.font = '12px Inter, sans-serif';
                ctx.fillStyle = '#9CA3AF';
                ctx.fillText('Probability', width / 2, height / 2 + 28);
                ctx.restore();
            }
        }]
    });
}

function switchChart(type) {
    currentChartType = type;
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.chart-tab[data-chart="${type}"]`)?.classList.add('active');
    if (currentResults) renderChart(currentResults);
}

// ==========================================
// EXPORT FUNCTIONALITY
// ==========================================
function toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    menu.classList.toggle('hidden');
}

// Close export menu on outside click
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('exportDropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        const menu = document.getElementById('exportMenu');
        if (menu) menu.classList.add('hidden');
    }
});

function exportResults(format) {
    if (!currentResults) {
        showToast('No results to export.', 'warning');
        return;
    }

    const modelName = selectedModelData?.displayName || selectedModel || 'Unknown';
    const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    switch (format) {
        case 'pdf':
            exportPDF(modelName, timestamp);
            break;
        case 'doc':
            exportDOC(modelName, timestamp);
            break;
        case 'image':
            exportImage(modelName);
            break;
        case 'csv':
            exportCSV(modelName, timestamp);
            break;
    }

    document.getElementById('exportMenu').classList.add('hidden');
}

function exportPDF(modelName, timestamp) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237);
    doc.text('MediPredict Clinical Report', 20, 25);

    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated: ${timestamp}`, 20, 35);
    doc.text(`Model: ${modelName}`, 20, 42);

    // Line
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 48, 190, 48);

    // Results
    let y = 60;
    currentResults.forEach((r, i) => {
        const pct = (r.probability * 100).toFixed(1);

        doc.setFontSize(14);
        doc.setTextColor(26, 29, 31);
        doc.text(`${i + 1}. ${r.disease}`, 20, y);

        doc.setFontSize(11);
        doc.setTextColor(r.status === 'Positive' ? 220 : 5, r.status === 'Positive' ? 38 : 150, r.status === 'Positive' ? 38 : 105);
        doc.text(`Status: ${r.status}`, 20, y + 8);

        doc.setTextColor(107, 114, 128);
        doc.text(`Probability: ${pct}%`, 20, y + 15);
        doc.text(`Confidence: ${r.probability > 0.8 ? 'High' : r.probability > 0.5 ? 'Moderate' : 'Low'}`, 80, y + 15);

        // Probability bar
        doc.setFillColor(243, 244, 246);
        doc.rect(20, y + 20, 170, 6, 'F');
        const barColor = r.probability > 0.7 ? [220, 38, 38] : r.probability > 0.3 ? [217, 119, 6] : [5, 150, 105];
        doc.setFillColor(...barColor);
        doc.rect(20, y + 20, 170 * r.probability, 6, 'F');

        y += 38;
    });

    // Disclaimer
    if (y > 250) doc.addPage();
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text('Disclaimer: This report is generated by an AI-based clinical decision support tool', 20, 270);
    doc.text('and does not replace professional medical judgment. Always consult a qualified', 20, 275);
    doc.text('healthcare provider for diagnosis and treatment decisions.', 20, 280);

    doc.save(`MediPredict_Report_${modelName.replace(/\s+/g, '_')}.pdf`);
    showToast('PDF exported successfully!', 'success');
}

function exportDOC(modelName, timestamp) {
    const content = currentResults.map(r => {
        const pct = (r.probability * 100).toFixed(1);
        return `
Disease: ${r.disease}
Status: ${r.status}
Probability: ${pct}%
Confidence: ${r.probability > 0.8 ? 'High' : r.probability > 0.5 ? 'Moderate' : 'Low'}
${'='.repeat(40)}
`;
    }).join('\n');

    const html = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>MediPredict Report</title></head>
<body style="font-family: Inter, Arial, sans-serif; padding: 40px;">
<h1 style="color: #7C3AED;">MediPredict Clinical Report</h1>
<p style="color: #6B7280;"><strong>Model:</strong> ${modelName}</p>
<p style="color: #6B7280;"><strong>Generated:</strong> ${timestamp}</p>
<hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
${currentResults.map((r, i) => {
    const pct = (r.probability * 100).toFixed(1);
    const interp = getClinicalInterpretation(r.disease, r.probability, r.status);
    return `
<div style="margin-bottom: 30px; padding: 20px; border-left: 4px solid ${r.probability > 0.7 ? '#DC2626' : r.probability > 0.3 ? '#D97706' : '#059669'};">
<h3 style="color: #1A1D1F; margin-top: 0;">${i + 1}. ${r.disease}</h3>
<p><strong>Status:</strong> ${r.status}</p>
<p><strong>Probability:</strong> ${pct}%</p>
<p><strong>Clinical Note:</strong> ${interp.doctor}</p>
</div>`;
}).join('')}
<div style="margin-top: 40px; padding: 20px; background: #FEF3C7; border-radius: 8px;">
<p style="color: #92400E; font-size: 12px; margin: 0;"><strong>Disclaimer:</strong> This report is generated by an AI-based clinical decision support tool and does not replace professional medical judgment. Always consult a qualified healthcare provider for diagnosis and treatment decisions.</p>
</div>
</body></html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MediPredict_Report_${modelName.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('DOC exported successfully!', 'success');
}

async function exportImage(modelName) {
    const section = document.getElementById('resultsSection');
    if (!section) return;

    try {
        const canvas = await html2canvas(section, {
            backgroundColor: '#F4F6F9',
            scale: 2,
            useCORS: true
        });
        const link = document.createElement('a');
        link.download = `MediPredict_Report_${modelName.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Image exported successfully!', 'success');
    } catch (err) {
        console.error('Image export failed:', err);
        showToast('Image export failed. Try a different format.', 'error');
    }
}

function exportCSV(modelName, timestamp) {
    const headers = ['Disease', 'Status', 'Probability', 'Confidence', 'Timestamp', 'Model'];
    const rows = currentResults.map(r => [
        `"${r.disease}"`,
        r.status,
        (r.probability * 100).toFixed(2) + '%',
        r.probability > 0.8 ? 'High' : r.probability > 0.5 ? 'Moderate' : 'Low',
        timestamp,
        `"${modelName}"`
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MediPredict_Report_${modelName.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully!', 'success');
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Render accuracy grid on home
    renderAccuracyGrid();

    // Render models grid
    renderModelsGrid();

    // Set initial view
    switchView('home');

    // Initialize progress
    updateProgress();

    // Notification button
    document.getElementById('notificationBtn')?.addEventListener('click', () => {
        showToast('No new notifications', 'info');
    });

    console.log('%c MediPredict Clinical Intelligence Platform ', 'background: #7C3AED; color: white; font-size: 14px; font-weight: bold; padding: 8px 16px; border-radius: 8px;');
    console.log('%c Ready for clinical predictions ', 'color: #6B7280; font-size: 12px;');
});
