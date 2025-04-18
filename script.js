// script.js - Versión Ingeniería

// --- CONFIGURACIÓN ---
const API_ENDPOINT = '/api/generate';

// *** NUEVO: Lista de áreas/tipos de problemas de Ingeniería Civil ***
const engineeringAreas = [
    "Cálculo de Resistencia de Materiales (Esfuerzo/Deformación)",
    "Análisis de Cargas Estructurales (Cargas Vivas/Muertas)",
    "Diseño Básico de Vigas (Flexión/Cortante)",
    "Principios de Mecánica de Suelos (Capacidad Portante)",
    "Estimación de Costos de Construcción (Materiales/Mano de Obra)",
    "Hidráulica Básica (Flujo en Tuberías/Canales)",
    "Diseño Geométrico de Carreteras (Pendientes/Curvas)",
    "Selección de Materiales de Construcción (Concreto/Acero)",
    "Planificación Básica de Proyectos (Secuencia de Tareas)",
    "Impacto Ambiental de Obras Civiles (Conceptual)",
    "Cálculo de Volumen de Movimiento de Tierras",
    "Diseño de Cimentaciones Superficiales (Básico)",
    "Análisis de Estabilidad de Taludes (Conceptual)",
    "Propiedades del Concreto (Resistencia/Trabajabilidad)",
    "Comportamiento de Estructuras de Acero (Pandeo/Conexiones - Básico)"
];

// --- REFERENCIAS A ELEMENTOS DEL DOM ---
const loadingDiv = document.getElementById('loading');
const loadingAnalysisDiv = document.getElementById('loading-analysis');
// Cambiamos IDs para mayor claridad semántica (opcional, pero bueno)
// Asegúrate de cambiar los IDs también en index.html si haces esto
const problemSectionDiv = document.getElementById('dilemma-section'); // O renombra a 'problem-section' en HTML
const scenarioTextP = document.getElementById('case-text');       // O renombra a 'scenario-text' en HTML
const questionTextP = document.getElementById('question-text');
const optionsContainerDiv = document.getElementById('options-container');
const analysisSectionDiv = document.getElementById('analysis-section');
const analysisTextP = document.getElementById('analysis-text');
const newProblemButton = document.getElementById('new-dilemma-button'); // O renombra a 'new-problem-button' en HTML

// --- ESTADO DE LA APLICACIÓN ---
let currentProblem = null; // Cambiamos nombre de variable

// --- FUNCIONES ---

// --- callBackendAPI --- (Sin cambios funcionales)
async function callBackendAPI(prompt) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ prompt: prompt }),
        });
        const data = await response.json();
        if (!response.ok) {
            console.error("Error desde el backend:", data.error);
            throw new Error(data.error || `Error del servidor: ${response.statusText}`);
        }
        return data.result;
    } catch (error) {
        console.error("Error al llamar al endpoint del backend:", error);
        throw error;
    }
}

/**
 * Genera un nuevo problema de ingeniería usando nuestra API backend,
 * enfocándose en un área temática seleccionada aleatoriamente.
 */
async function generateProblem() { // Renombramos función
    console.log("Generando NUEVO problema de ingeniería...");
    setLoadingState(true);
    analysisSectionDiv.style.display = 'none';
    problemSectionDiv.style.display = 'none'; // Usa el ID correcto
    optionsContainerDiv.innerHTML = '';

    const randomIndex = Math.floor(Math.random() * engineeringAreas.length);
    const selectedArea = engineeringAreas[randomIndex];
    console.log("Área de ingeniería seleccionada:", selectedArea);

    // *** PROMPT MODIFICADO PARA INGENIERÍA ***
    const prompt = `
        Genera un problema práctico y realista de ingeniería civil, enfocado específicamente en: **${selectedArea}**.
        El problema debe requerir un cálculo básico, una estimación o una decisión de diseño fundamentada.

        **Instrucciones:**
        1.  Crea un escenario conciso (máximo 100 palabras) que describa la situación del ingeniero. Incluye datos numéricos relevantes si es un problema de cálculo (dimensiones, cargas, propiedades de materiales, etc.).
        2.  Formula una pregunta clara y directa que el ingeniero debe resolver.
        3.  Proporciona 3 o 4 opciones de respuesta.
            *   Si es un **cálculo**, una opción debe ser la respuesta correcta (o una aproximación razonable) y las otras deben ser incorrectas pero plausibles (errores comunes de cálculo, unidades incorrectas, etc.). Incluye las unidades en las opciones si aplica.
            *   Si es una **decisión de diseño** o **estimación conceptual**, las opciones deben representar enfoques o conclusiones diferentes, donde uno es generalmente más adecuado según principios de ingeniería estándar.
        4.  El resultado debe ser un objeto JSON válido con las claves "scenario", "question" y "options".

        **Ejemplo de formato de salida (NO uses este ejemplo exacto, adapta al área ${selectedArea}):**
        {
          "scenario": "Se necesita diseñar una viga de concreto simplemente apoyada de 5m de longitud para soportar una carga uniformemente distribuida de 10 kN/m. Se usará concreto f'c=25 MPa.",
          "question": "¿Cuál es el momento flector máximo aproximado en la viga?",
          "options": [
            "31.25 kN·m", // Respuesta correcta (w*L^2 / 8)
            "62.50 kN·m", // Error común (factor 2)
            "12.50 kN·m", // Otro error
            "50.00 kN"    // Unidad incorrecta
          ]
        }

        Asegúrate de que el JSON sea válido y esté bien formado, sin texto adicional antes o después. El problema debe ser diferente a los generados previamente.
    `;

    try {
        const responseText = await callBackendAPI(prompt);
        console.log("Respuesta recibida del backend (problema):", responseText);

        let problemData;
        try {
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
            const jsonString = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
            // Intenta corregir posibles errores comunes de JSON (comas finales) antes de parsear
            const correctedJsonString = jsonString.replace(/,\s*([}\]])/g, '$1');
            problemData = JSON.parse(correctedJsonString);
        } catch (parseError) {
            console.error("Error al parsear JSON del problema:", parseError, "Respuesta recibida:", responseText);
            throw new Error(`La respuesta del backend no contenía un JSON válido para el problema.`);
        }

        // Validar estructura del JSON recibido
        if (!problemData || !problemData.scenario || !problemData.question || !problemData.options || !Array.isArray(problemData.options)) {
            console.error("JSON parseado incompleto:", problemData);
            throw new Error("El JSON del problema recibido no tiene la estructura esperada (requiere 'scenario', 'question', 'options').");
        }

        currentProblem = { ...problemData, area: selectedArea }; // Guarda el problema actual
        displayProblem(currentProblem); // Llama a la función para mostrar

    } catch (error) {
        console.error("Error generando problema:", error);
        scenarioTextP.textContent = `Error al generar el problema (${selectedArea}): ${error.message}. Intenta de nuevo.`; // Usa el ID correcto
        questionTextP.textContent = '';
        optionsContainerDiv.innerHTML = '<button id="retry-problem-button">Reintentar Generar Problema</button>';
        const retryButton = document.getElementById('retry-problem-button');
        if (retryButton) {
            retryButton.addEventListener('click', generateProblem);
        }
    } finally {
        setLoadingState(false);
        problemSectionDiv.style.display = 'block'; // Usa el ID correcto
    }
}

/**
 * Muestra el problema de ingeniería en la UI.
 * @param {object} problemData Objeto con scenario, question, options y area.
 */
function displayProblem(problemData) { // Renombramos función
    // Podríamos añadir el área temática:
    // const areaTitle = problemSectionDiv.querySelector('h3'); // Busca si ya existe
    // if (areaTitle) areaTitle.textContent = `Área: ${problemData.area}`;
    // else {
    //     const newAreaTitle = document.createElement('h3');
    //     newAreaTitle.textContent = `Área: ${problemData.area}`;
    //     problemSectionDiv.insertBefore(newAreaTitle, scenarioTextP.previousSibling); // O ajusta posición
    // }

    scenarioTextP.textContent = problemData.scenario; // Usa ID correcto
    questionTextP.textContent = problemData.question;
    optionsContainerDiv.innerHTML = ''; // Limpia opciones

    problemData.options.forEach((optionText, index) => {
        const button = document.createElement('button');
        button.textContent = optionText;
        button.classList.add('option-button');
        button.dataset.optionIndex = index;
        button.addEventListener('click', handleOptionClick);
        optionsContainerDiv.appendChild(button);
    });
}

/**
 * Maneja el clic en un botón de opción.
 * @param {Event} event El evento de clic.
 */
function handleOptionClick(event) {
    const chosenOptionText = event.target.textContent;
    console.log("Opción elegida:", chosenOptionText);

    const optionButtons = optionsContainerDiv.querySelectorAll('.option-button');
    optionButtons.forEach(btn => btn.disabled = true);

    getAnalysis(currentProblem, chosenOptionText); // Llama a obtener análisis
}

/**
 * Obtiene el análisis/explicación de la opción elegida usando la API backend.
 * @param {object} problem El problema completo (scenario, question, options, area).
 * @param {string} chosenOption La opción textual elegida por el usuario.
 */
async function getAnalysis(problem, chosenOption) {
    console.log("Obteniendo análisis/explicación...");
    setLoadingAnalysisState(true);
    analysisSectionDiv.style.display = 'block';
    analysisTextP.textContent = '';

    // *** PROMPT MODIFICADO PARA ANÁLISIS DE INGENIERÍA ***
    const prompt = `
        Contexto: Se presentó el siguiente problema de ingeniería civil del área "${problem.area}":
        Escenario: ${problem.scenario}
        Pregunta: ${problem.question}
        Opciones presentadas:
        ${problem.options.map((opt, i) => `- Opción ${i + 1}: ${opt}`).join('\n')}

        El usuario eligió la opción: "${chosenOption}"

        Tarea: Proporciona una explicación técnica concisa (máximo 150 palabras) sobre la elección del usuario.
        Instrucciones:
        1.  Identifica cuál es la opción correcta o el enfoque más adecuado entre las presentadas.
        2.  Explica brevemente el principio de ingeniería, la fórmula clave o el razonamiento que lleva a la solución correcta.
        3.  Si la opción del usuario fue correcta, confírmalo y refuerza por qué es correcta.
        4.  Si la opción del usuario fue incorrecta, explica por qué es incorrecta y por qué la opción correcta es la adecuada. Evita lenguaje condescendiente.
        5.  Si era una pregunta de decisión/conceptual, analiza brevemente por qué la opción elegida es (o no es) la preferible según buenas prácticas de ingeniería.
        6.  Sé directo y técnico. Usa unidades si es relevante.

        Ejemplo de inicio de análisis (NO uses este ejemplo exacto): "La opción correcta es X. Esto se calcula usando la fórmula Y = ...", o "Esta elección es incorrecta porque no considera el factor Z...", o "Si bien esta opción es viable, la opción X es preferible debido a..."
    `;

    try {
        const analysisResult = await callBackendAPI(prompt);
        console.log("Respuesta recibida del backend (análisis):", analysisResult);
        displayAnalysis(analysisResult);
    } catch (error) {
        console.error("Error obteniendo análisis:", error);
        analysisTextP.textContent = `Error al obtener el análisis: ${error.message}. Puedes generar un nuevo problema.`;
    } finally {
        setLoadingAnalysisState(false);
    }
}

/**
 * Muestra el análisis/explicación en la interfaz.
 * @param {string} analysis El texto del análisis.
 */
function displayAnalysis(analysis) { // Sin cambios funcionales
    analysisTextP.innerHTML = analysis.replace(/\n/g, '<br>');
}

// --- setLoadingState --- (Sin cambios funcionales)
function setLoadingState(isLoading) {
    loadingDiv.style.display = isLoading ? 'flex' : 'none';
}

// --- setLoadingAnalysisState --- (Sin cambios funcionales)
function setLoadingAnalysisState(isLoading) {
    loadingAnalysisDiv.style.display = isLoading ? 'flex' : 'none';
}

// --- INICIALIZACIÓN ---
// Asegúrate que el botón tenga el ID correcto en HTML o actualiza aquí
newProblemButton.addEventListener('click', generateProblem); // Renombramos la función llamada
window.addEventListener('load', generateProblem); // Carga el primer problema al iniciar
