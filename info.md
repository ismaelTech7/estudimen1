📄 Documento MVP para Estudimen (con modelo “cada usuario usa su propia clave Gemini / OpenAI”)
1. Resumen ejecutivo

Nombre del producto: Estudimen

Propósito: Una aplicación web + PWA para estudiantes, que les ayuda a organizar su estudio con un asistente de IA (Gemini 2.5 Flash).

Modelo de API: Cada usuario introduce su propia clave API de Gemini / OpenAI, de forma que es él quien paga el uso de la IA. De este modo tú no gestionas ni pagas sus peticiones.

Stack tecnológico: Next.js + React, Supabase para la base de datos, integración con Gemini 2.5 Flash usando la clave API que ponga cada usuario.

Objetivo del MVP: Validar que los estudiantes configuran su clave, usan la IA para planificar, generar recursos y valorar el sistema de estudio.

2. Problema que resuelve (con este modelo)

Muchos estudiantes quieren usar IA para generar planes, tarjetas, resúmenes, pero no quieren depender de apps que carguen sus peticiones a la cuenta del creador.

El coste de la IA puede ser alto para quien paga si hay muchos usuarios.

Algunos desarrolladores no quieren asumir facturación de IA para todos sus usuarios.

Necesitas una solución donde los usuarios tengan control total sobre su consumo de IA y facturación.

3. Usuarios objetivo

Estudiantes que ya tienen (o están dispuestos a crear) una clave API de Gemini / OpenAI.

Usuarios con conocimientos básicos de IA y que entienden el coste por token o llamada API.

Personas responsables que prefieren pagar sus propias peticiones para no depender del creador de la app.

Estudiantes que quieren usar IA para estudio, pero no quieren que el creador de la app absorba el coste.

4. Propuesta de valor (modelo con clave personal)

Control total: cada usuario usa su propia clave API, por lo que controla su gasto.

Seguridad: tú no almacenas ni usas una sola clave central para IA, reduces tu exposición.

Escalabilidad sin coste extra para ti: tu app no se convierte en una carga de facturación de IA porque el usuario paga.

Asistente inteligente: sigues usando IA para generar planes, resúmenes, test y más, pero siempre con el “costo compartido” controlado por el usuario.

5. Hipótesis que queremos validar con este MVP

Los estudiantes están dispuestos a introducir y usar su propia clave API para pagar su uso de IA.

Los usuarios valoran que su uso de IA dependa de su cuenta (y no de la tuya).

Siguen usando las funciones de IA (planificador, resúmenes, flashcards) con ese modelo.

Esto reduce el riesgo / coste para ti y te permite escalar sin pagar por cada usuario.

6. Funcionalidades mínimas del MVP (adaptadas)

Registro / login de usuarios

Registro con email y contraseña (usando Supabase).

Dashboard donde el usuario puede introducir su clave API (Gemini / OpenAI).

Guardar la clave API del usuario de forma segura

El usuario introduce su clave.

Almacenarla en Supabase cifrada o protegida (ver precauciones más abajo).

No exponer esta clave directamente en frontend sin protección.

Planificador de estudio con IA

El usuario describe sus asignaturas, temas, fecha de examen y tiempo disponible.

Tu backend (o servidor intermedio) toma la clave del usuario y hace la llamada a Gemini con su clave para generar un plan.

Mostrar el plan al usuario (fechas, sesiones, recordatorios).

Generación de recursos con IA

El usuario puede enviar fragmentos de texto (apuntes) para que la IA genere:

Resúmenes

Flashcards

Test / preguntas

Se usan las llamadas con la clave del usuario.

Seguimiento de estudio

Registro de sesiones de estudio: cuándo, cuánto tiempo, tema.

Mostrar estadísticas: total horas estudiadas, sesiones por tema, progreso.

Notificaciones / recordatorios

Enviar recordatorios basados en el plan de estudio generado.

Notificaciones internas (dentro de la app) si se acerca un examen, si no estudias, etc.

Configuración del usuario

Permitir al usuario cambiar su clave API.

Permitir modificar los planes: cambiar fecha de examen, añadir/quitar temas.

7. Seguridad y consideraciones importantes

Guardar la clave API con seguridad: según buenas prácticas, las claves API son “secretos” y deben tratarse cuidadosamente. 
Lune.dev

Routing seguro: las llamadas a Gemini / OpenAI deben hacerse desde tu servidor/backend, no directamente desde el cliente (navegador), para que la clave no esté expuesta. 
Lune.dev
+1

Cifrado: almacena la clave API del usuario cifrada en tu base de datos, con acceso restringido. 
Reelmind
+1

Comunicación segura: todo debe ir por HTTPS para proteger la clave durante el envío. 
Reddit
+1

Almacenamiento en memoria: no uses almacenamiento local inseguro para mantener la clave (por ejemplo, evitar meterla en localStorage si no está bien protegida) 
Reddit

Restricciones / políticas: informa al usuario sobre riesgos y buenas prácticas para manejar su clave (seguridad, rotación, límites de gasto).

8. Métricas de éxito (KPIs) para este MVP

% de usuarios que configuran su propia clave API.

Número de llamadas IA realizadas por los usuarios (resúmenes, planes, test).

Número de sesiones de estudio registradas.

% de retención semanal: cuántos usuarios vuelven.

Feedback sobre la UX de poner la clave: si es fácil, si da miedo, si lo ven seguro.

9. Roadmap del MVP (adaptado)

Diseño inicial

Wireframes para pantalla de “Introduce tu API Key” + dashboard.

Flujos: onboarding para poner la clave API.

Infraestructura básica

Next.js + React + Supabase.

Registro / autenticación de usuario.

Funcionalidad API Key

Form para que los usuarios peguen su clave API.

Almacenamiento seguro en Supabase (cifrado).

Backend que acepta esa clave y la usa para llamar a Gemini.

Planificador IA

Interfaz para definir datos de examen / temas / tiempo.

Llamadas a Gemini usando la clave del usuario para generar el plan.

Mostrar plan al usuario.

Generación de recursos

Form para apuntes o fragmentos de texto.

Enviar a Gemini: resumen / tarjetas / test.

Mostrar los recursos generados.

Seguimiento

Registro de sesiones de estudio.

Estadísticas básicas.

Recordatorios / Notificaciones

Recordatorios basados en el plan.

Alertas dentro de la app.

Testing + feedback

Trae estudiantes para que prueben el MVP.

Recoge feedback específico sobre el uso de la clave API: si lo ven seguro, si tienen dudas.

10. Riesgos y mitigaciones específicos

Riesgo: Los usuarios no confían en meter su clave API en tu app → Mitigación: Explica con claridad cómo la almacenas, que no la ves en texto claro, usar cifrado, HTTPS, y transparencia sobre seguridad.

Riesgo: Fuga de clave API → Mitigación: asegúrate de no loguear la clave, no exponerla en el frontend, cifrarla en la base de datos.

Riesgo: Usuarios lo usan mal y generan un gasto alto → Mitigación: educar sobre cómo establecer límites en la plataforma de OpenAI / Gemini, aconsejar que pongan límites de gasto.

Riesgo: Problemas legales o de TOS → Mitigación: revisar los términos de OpenAI / Gemini para asegurar que permitir a los usuarios usar su propia clave no infringe nada. También, según Lune.Dev, no está prohibido si haces bien el almacenamiento y las llamadas seguras. 
Lune.dev