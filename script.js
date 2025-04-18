// script.js - Versión Ingeniería Eléctrica

// --- CONFIGURACIÓN ---
const API_ENDPOINT = '/api/generate'; // Nuestra función serverless

// Lista de áreas/tipos de problemas de Ingeniería Eléctrica
const electricalEngineeringAreas = [
    "Análisis de Circuitos DC (Ley de Ohm, Kirchhoff)",
    "Análisis de Circuitos AC (Impedancia, Fasores, Potencia)",
    "Principios de Electromagnetismo (Ley de Coulomb, Campos E/M básicos)",
    "Componentes Electrónicos Básicos (Diodos, Transistores - Conceptual)",
    "Sistemas Digitales (Puertas Lógicas, Álgebra Booleana)",
    "Máquinas Eléctricas (Transformadores, Motores - Principios)",
    "Sistemas de Potencia (Generación/Transmisión - Conceptual)",
    "Señales y Sistemas (Conceptos básicos de señales)",
    "Teoría de Control (Sistemas de Lazo Abierto/Cerrado - Conceptual)",
    "Conversión de Energía (Rectificadores, Inversores - Básico)",
    "Mediciones Eléctricas (Voltímetros, Amperímetros)",
    "Análisis de Transitorios RC/RL (Básico)",
    "Corrección del Factor de Potencia (Conceptual)",
    "Respuesta en Frecuencia (Filtros Pasivos Simples - RC, RL)",
    "Instalaciones Eléctricas Residenciales (Cálculo de Carga Básico)",
    "Seguridad Eléctrica (Conceptos)",
    "Campos Electromagnéticos (Ley de Faraday/Lenz - Conceptual)"
];

// --- REFERENCIAS A ELEMENTOS DEL DOM ---
// Usamos IDs originales del HTML
const loadingDiv = document.getElementById('loading');
const loadingAnalysisDiv = document.getElementById('loading-analysis');
const problemSectionDiv = document.getElementById('dilemma-section');
const scenarioTextP = document.getElementById('case-text');
const questionTextP = document.getElementById('question-text');
const optionsContainerDiv = document.getElementById('options-container');
const analysisSectionDiv = document.getElementById('analysis-section');
const analysisTextP = document.getElementById('analysis-text');
const newProblemButton = document.getElementById('new-dilemma-button'); // ID del botón principal

// --- ESTADO DE LA APLICACIÓN ---
let currentProblem = null;

// --- FUNCIONES ---

/**
 * Llama a nuestra API backend (Serverless Function) para generar contenido.
 * @param {string} prompt El prompt para enviar a nuestra API.
 * @returns {Promise<string>} El texto generado por la API de Gemini (vía nuestro backend).
 * @throws {Error} Si nuestra API backend devuelve un error.
 */
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
 * Genera un nuevo problema de ingeniería eléctrica usando nuestra API backend.
 */
async function generateProblem() {
    console.log("Generando NUEVO problema de ingeniería eléctrica...");
    setLoadingState(true);
    analysisSectionDiv.style.display = 'none';
    problemSectionDiv.style.display = 'none';
    optionsContainerDiv.innerHTML = '';

    const randomIndex = Math.floor(Math.random() * electricalEngineeringAreas.length);
    const selectedArea = electricalEngineeringAreas[randomIndex];
    console.log("Área de ingeniería eléctrica seleccionada:", selectedArea);

    // Prompt específico para Ingeniería Eléctrica
    const prompt = `
        Genera un problema práctico y realista de ingeniería eléctrica, enfocado específicamente en: **${selectedArea}**.
        El problema debe requerir un cálculo básico, análisis conceptual o una decisión simple de diseño/componente.

        **Instrucciones:**
        1.  Crea un escenario conciso (máximo 100 palabras) que describa la situación. Incluye datos numéricos relevantes (Voltajes, Corrientes, Resistencias, Capacitancias, Inductancias, Frecuencias, etc., con unidades V, A, Ω, F, H, Hz).
        2.  Formula una pregunta clara y directa que el ingeniero debe resolver.
        3.  Proporciona 3 o 4 opciones de respuesta.
            *   Si es un **cálculo**, una opción debe ser la respuesta correcta (o una aproximación razonable) y las otras deben ser incorrectas pero plausibles (errores comunes de cálculo, unidades, factores de 10). Incluye las unidades (V, A, W, Ω, etc.) en las opciones.
            *   Si es una **decisión conceptual** o **análisis**, las opciones deben representar diferentes conclusiones o componentes, donde uno es el más adecuado según principios de ingeniería eléctrica estándar.
        4.  El resultado debe ser un objeto JSON válido con las claves "scenario", "question" y "options".

        **Ejemplo de formato de salida (NO uses este ejemplo exacto, adapta al área ${selectedArea}):**
        {
          "scenario": "Un resistor de 100 Ω está conectado a una fuente de voltaje DC de 12 V.",
          "question": "¿Cuál es la corriente que circula por el resistor?",
          "options": [
            "0.12 A", // Respuesta correcta (I = V/R = 12/100)
            "1.2 A",  // Error decimal
            "1200 A", // Error magnitud
            "0.12 V"  // Unidad incorrecta
          ]
        }

        Asegúrate de que el JSON sea válido y esté bien formado, sin texto adicional antes o después. El problema debe ser diferente a los generados previamente.
    `;

    try {
        const responseText = await callBackendAPI(prompt);
        console.log("Respuesta recibida del backend (problema EE):", responseText);

        let problemData;
        try {
            // Intenta extraer JSON si está dentro de bloques de código markdown
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
            const jsonString = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
            // Intenta corregir comas finales antes de parsear
            const correctedJsonString = jsonString.replace(/,\s*([}\]])/g, '$1');
            problemData = JSON.parse(correctedJsonString);
        } catch (parseError) {
            console.error("Error al parsear JSON del problema EE:", parseError, "Respuesta recibida:", responseText);
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
        console.error("Error generando problema EE:", error);
        scenarioTextP.textContent = `Error al generar el problema (${selectedArea}): ${error.message}. Intenta de nuevo.`;
        questionTextP.textContent = '';
        // Asegúrate que el ID del botón de reintento sea consistente si lo usas
        optionsContainerDiv.innerHTML = '<button id="retry-problem-button" class="option-button" style="background-color: #ae2012;">Reintentar Generar Problema</button>';
        const retryButton = document.getElementById('retry-problem-button');
        if (retryButton) {
            // Añade un listener para que este botón también funcione
            retryButton.addEventListener('click', generateProblem);
        }
    } finally {
        setLoadingState(false);
        problemSectionDiv.style.display = 'block';
    }
}

/**
 * Muestra el problema de ingeniería eléctrica en la UI.
 * @param {object} problemData Objeto con scenario, question, options y area.
 */
function displayProblem(problemData) {
    // Opcional: Mostrar el área
    /*
    const existingAreaTitle = problemSectionDiv.querySelector('h3.area-title');
    if (existingAreaTitle) {
        existingAreaTitle.textContent = `Área: ${problemData.area}`;
    } else {
        const newAreaTitle = document.createElement('h3');
        newAreaTitle.classList.add('area-title'); // Añadir clase para seleccionar/estilar
        newAreaTitle.textContent = `Área: ${problemData.area}`;
        // Insertar antes del escenario (ajusta según tu HTML)
        const scenarioH2 = problemSectionDiv.querySelector('h2'); // Busca el primer H2
        if (scenarioH2) {
           problemSectionDiv.insertBefore(newAreaTitle, scenarioH2);
        }
    }
    */

    scenarioTextP.textContent = problemData.scenario;
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
 */
function handleOptionClick(event) {
    const chosenOptionText = event.target.textContent;
    console.log("Opción elegida:", chosenOptionText);

    const optionButtons = optionsContainerDiv.querySelectorAll('.option-button');
    optionButtons.forEach(btn => btn.disabled = true);

    getAnalysis(currentProblem, chosenOptionText);
}

/**
 * Obtiene el análisis/explicación de la opción elegida (Ing. Eléctrica).
 * @param {object} problem El problema completo.
 * @param {string} chosenOption La opción textual elegida.
 */
async function getAnalysis(problem, chosenOption) {
    console.log("Obteniendo análisis/explicación eléctrica...");
    setLoadingAnalysisState(true);
    analysisSectionDiv.style.display = 'block';
    analysisTextP.textContent = '';

    // Prompt específico para análisis de Ingeniería Eléctrica
    const prompt = `
        Contexto: Se presentó el siguiente problema de ingeniería eléctrica del área "${problem.area}":
        Escenario: ${problem.scenario}
        Pregunta: ${problem.question}
        Opciones presentadas:
        ${problem.options.map((opt, i) => `- Opción ${i + 1}: ${opt}`).join('\n')}

        El usuario eligió la opción: "${chosenOption}"

        Tarea: Proporciona una explicación técnica concisa (máximo 150 palabras) sobre la elección del usuario en este contexto eléctrico.
        Instrucciones:
        1.  Identifica la opción correcta o el enfoque más adecuado.
        2.  Explica brevemente el principio de ingeniería eléctrica, la ley (Ohm, Kirchhoff), fórmula (P=VI, Z=V/I, etc.) o razonamiento que lleva a la solución correcta.
        3.  Si la opción del usuario fue correcta, confírmalo y explica por qué.
        4.  Si la opción del usuario fue incorrecta, explica claramente por qué es incorrecta y cuál es la correcta, basándote en principios eléctricos.
        5.  Si era conceptual, analiza la validez de la elección según prácticas estándar en ing. eléctrica.
        6.  Sé directo, técnico y usa las unidades correctas (V, A, Ω, W, F, H, Hz...).

        Ejemplo de inicio de análisis (NO uses este ejemplo exacto): "Correcto. Aplicando la Ley de Ohm (V=IR), la corriente es I = V/R = ...", o "Incorrecto. La impedancia total en serie se calcula como Z = Z1 + Z2...", o "Esta opción no es la más eficiente porque..."
    `;

    try {
        const analysisResult = await callBackendAPI(prompt);
        console.log("Respuesta recibida del backend (análisis EE):", analysisResult);
        displayAnalysis(analysisResult);
    } catch (error) {
        console.error("Error obteniendo análisis EE:", error);
        analysisTextP.textContent = `Error al obtener el análisis: ${error.message}. Puedes generar un nuevo problema.`;
    } finally {
        setLoadingAnalysisState(false);
    }
}

/**
 * Muestra el análisis/explicación en la interfaz.
 */
function displayAnalysis(analysis) {
    analysisTextP.innerHTML = analysis.replace(/\n/g, '<br>');
}

/**
 * Controla la visibilidad del indicador de carga principal.
 * @param {boolean} isLoading True para mostrar, false para ocultar.
 */
function setLoadingState(isLoading) {
    loadingDiv.style.display = isLoading ? 'flex' : 'none';
}

/**
 * Controla la visibilidad del indicador de carga del análisis.
 * @param {boolean} isLoading True para mostrar, false para ocultar.
 */
function setLoadingAnalysisState(isLoading) {
    loadingAnalysisDiv.style.display = isLoading ? 'flex' : 'none';
}

// --- INICIALIZACIÓN ---
// Asegúrate que el botón tiene el ID correcto en HTML ('new-dilemma-button')
newProblemButton.addEventListener('click', generateProblem);
window.addEventListener('load', generateProblem); // Carga el primer problema al iniciar
