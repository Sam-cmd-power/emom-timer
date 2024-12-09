document.addEventListener("DOMContentLoaded", () => {
    let emomInterval;
    let remainingTime = 0;
    let cycleCount = 1; // Inicia en la ronda 1
    let sessionData = [];
    let isRunning = false;
    let isPaused = false;

    // Elementos del DOM
    const countdownView = document.getElementById("countdownView");
    const countdownDisplay = document.getElementById("countdownDisplay");
    const cycleCountDisplay = document.getElementById("cycleCountDisplay");
    const repsCountDisplay = document.getElementById("repsCountDisplay");
    const section1 = document.getElementById("section1");
    const pauseButton = document.getElementById("pauseButton");
    const downloadButton = document.getElementById("downloadButton");
    const stopButton = document.getElementById("stopButton");
    const resetButton = document.getElementById("resetButton");
    const notification = document.getElementById("roundNotification");
    const startButton = document.getElementById("startButton");

    // Validaciones y animaciones
    function validateInputs() {
        const minutesInput = document.getElementById("customMinutes1");
        const repsInput = document.getElementById("kettlebellReps");
        let isValid = true;

        if (!minutesInput.value || minutesInput.value <= 0) {
            minutesInput.classList.add("is-invalid");
            isValid = false;
        } else {
            minutesInput.classList.remove("is-invalid");
        }

        if (!repsInput.value || repsInput.value <= 0) {
            repsInput.classList.add("is-invalid");
            isValid = false;
        } else {
            repsInput.classList.remove("is-invalid");
        }

        return isValid;
    }

    function startEMOM() {
        if (isRunning) return;

        if (!validateInputs()) {
            alert("Por favor, corrige los errores antes de iniciar el temporizador.");
            return;
        }

        const minutesInput = parseInt(document.getElementById("customMinutes1").value);
        const weightInput = parseInt(document.getElementById("kettlebellWeight").value) || 0;
        const repsInput = parseInt(document.getElementById("kettlebellReps").value) || 0;

        isRunning = true;
        remainingTime = minutesInput * 60;
        sessionData = [];

        // Ocultar el título y la sección de configuración
        document.querySelector("h1").style.display = "none";
        section1.style.display = "none";

        // Mostrar el temporizador
        countdownView.style.display = "block";

        cycleCountDisplay.textContent = `Ronda: 1`;
        repsCountDisplay.textContent = `Repeticiones: ${repsInput}`;

        // Mostrar la notificación de voz
        speakRoundNotification(cycleCount);

        // Iniciar el temporizador con setInterval
        emomInterval = setInterval(() => updateCountdown(weightInput, repsInput), 1000);

        // Asegurarse de que solo el botón "Detener" esté visible
        stopButton.style.display = "inline-block";
        resetButton.style.display = "none";
        downloadButton.style.display = "none";
    }

    function updateCountdown(weight, reps) {
        if (!isPaused) {
            remainingTime--;
            countdownDisplay.textContent = formatTime(remainingTime);

            if (remainingTime <= 0) {
                // Calculamos el volumen de trabajo para la ronda actual
                const workVolume = weight * reps * cycleCount; // Ahora incluye el número de ciclos

                // Guardamos el ciclo con su volumen de trabajo
                sessionData.push({ cycle: cycleCount, weight, reps, workVolume });

                // Al iniciar una nueva ronda, avisa con un mensaje de voz
                speakRoundNotification(cycleCount);

                // Actualizamos los datos para la siguiente ronda
                cycleCount++;
                cycleCountDisplay.textContent = `Ronda: ${cycleCount}`;
                repsCountDisplay.textContent = `Repeticiones: ${reps}`;

                // Restablecer el tiempo para la nueva ronda
                remainingTime = (parseInt(document.getElementById("customMinutes1").value) * 60) || 60;
            }
        }
    }

    function speakRoundNotification(cycleCount) {
        const msg = new SpeechSynthesisUtterance(`Comienza la ronda ${cycleCount}`);
        window.speechSynthesis.speak(msg); // Inicia la voz

        notification.style.display = "block"; // Mostrar la notificación
        notification.textContent = `Ronda ${cycleCount} - ¡Comienza!`;

        // Ocultar la notificación después de 5 segundos
        setTimeout(() => {
            notification.style.display = "none";
        }, 5000);
    }

    function stopEMOM() {
        clearInterval(emomInterval); // Detener el intervalo de temporizador
        isRunning = false;
        remainingTime = 0;
        countdownDisplay.textContent = "00:00"; // Resetear el temporizador

        // Mostrar los botones de "Reiniciar" y "Descargar Datos"
        resetButton.style.display = "inline-block";
        downloadButton.style.display = "inline-block";

        // Ocultar el botón "Detener"
        stopButton.style.display = "none";
    }

    function resetEMOM() {
        // Reiniciar el temporizador
        cycleCount = 1;
        remainingTime = 0;
        sessionData = [];

        // Ocultar los botones de "Reiniciar" y "Descargar Datos"
        resetButton.style.display = "none";
        downloadButton.style.display = "none";

        // Mostrar el título y la configuración nuevamente
        section1.style.display = "block";
        document.querySelector("h1").style.display = "block";

        // Ocultar el temporizador
        countdownView.style.display = "none";
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    // Función para descargar los datos de la sesión
    function downloadSessionData() {
        const csvHeader = "Ciclo,Peso (kg),Repeticiones,Volumen de Trabajo\n";
        const csvContent =
            csvHeader +
            sessionData
                .map((e) => `${e.cycle},${e.weight},${e.reps},${e.workVolume}`)
                .join("\n");
        const link = document.createElement("a");
        link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
        link.download = "Datos_Sesion_EMOM.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    // Asociar los eventos de los botones
    startButton.addEventListener("click", startEMOM);
    pauseButton.addEventListener("click", () => isPaused = !isPaused);
    downloadButton.addEventListener("click", downloadSessionData);
    stopButton.addEventListener("click", stopEMOM);
    resetButton.addEventListener("click", resetEMOM);
});
