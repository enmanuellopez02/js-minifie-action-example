// Encapsulación en un IIFE para evitar conflictos globales
(function (global) {
    // Versión del SDK
    const SDK_VERSION = "1.0";

    // Configuración interna
    const config = {
        apiBaseUrl: "http://localhost:8080",
        endpoints: {
            receiveEvent: "/api/tracker-ingestor/v1/receive-event",
        },
    };

    // Función utilitaria para generar un UUID
    function generateUUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0,
                    v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    }

    // Función para obtener la fecha y hora en formato ISO
    function getCurrentISOTime() {
        return new Date().toISOString();
    }

    // Función utilitaria para obtener el User-Agent del navegador
    function getUserAgent() {
        return navigator.userAgent;
    }

    // Función utilitaria para obtener el origen
    function getOrigin() {
        return window.location.origin;
    }

    // Método principal del SDK: sendEvent
    async function sendEventAsync(event) {
        // Validación de campo requerido: eventType
        if (!event.eventType) {
            throw new Error("The 'eventType' field is required.");
        }

        // Completar campos opcionales generados si no se suministran
        const finalEvent = {
            eventId: event.eventId || generateUUID(),
            eventType: event.eventType,
            data: event.data || {},
            metadata: {
                clientId: event.metadata?.clientId || "Web",
                userAgent: getUserAgent(),
                origin: getOrigin(),
                eventTime: event.metadata?.eventTime || getCurrentISOTime(),
                eventVersion: SDK_VERSION,
            },
            tags: event.tags || [],
        };

        try {
            // Enviar el evento al endpoint
            const response = await fetch(`${config.apiBaseUrl}${config.endpoints.receiveEvent}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(finalEvent),
                }
            );

            // Verificar si el request fue exitoso
            if (response.ok) {
                console.log("Evento enviado exitosamente");
                return true;
            } else {
                console.error("Error en la solicitud:", response.statusText);
                return false;
            }
        } catch (error) {
            console.error("Error al enviar el evento:", error);
            return false;
        }
    }

    // Exponer el método sendEvent al consumidor del SDK
    global.TrackerService = {
        sendEventAsync,
    };
})(window);
