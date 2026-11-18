Especificación Técnica: Aplicación Móvil de Citas Célebres
1. Descripción General Aplicación móvil desarrollada en React Native (Expo) que presenta una interfaz minimalista centrada en una ventana flotante e interactiva (arrastrable dentro del área segura de la pantalla). La ventana simula un marco biselado físico y muestra citas célebres acompañadas de información histórica del autor. Incluye controles rápidos para la personalización visual, filtrado de contenido y navegación de citas.
2. Arquitectura y Stack Tecnológico
Framework: React Native (CLI).
Gestión de Gestos y Animaciones: react-native-gesture-handler y react-native-reanimated (para el arrastre fluido y físicas de la ventana móvil).
Almacenamiento Local: react-native-mmkv o @react-native-async-storage/async-storage (para persistencia del modo oscuro y preferencias de filtrado).
Gestión del Estado Global: Zustand o Context API (para manejar el tema activo y la cola de citas).
Fuente de Datos: Base de datos local SQLite (ej. react-native-quick-sqlite) o un archivo JSON estático si el catálogo es limitado, conteniendo el esquema de citas.
3. Interfaz de Usuario (UI) y Diseño
Contenedor Principal (Fondo): Vista translúcida o un fondo neutro que permita destacar la ventana móvil. Puede reaccionar al toque para ocultar los menús de ajustes si están abiertos.
Ventana Movible (El Marco):
Estilo Biselado: Implementado mediante View anidados con bordes asimétricos (ej. bordes superior/izquierdo más claros, inferior/derecho más oscuros) o utilizando sombras (shadowColor, elevation) para crear un efecto de relieve 3D tradicional.
Interacción: Arrastrable por toda la pantalla mediante PanResponder o useAnimatedGestureHandler.
Tipografía: Fuentes Serif clásicas (ej. Playfair Display o Merriweather) para el texto de la cita, y fuentes Sans-Serif legibles para los metadatos y botones.
4. Funcionalidades Principales
Motor de Visualización de Citas:
Muestra el texto principal de la cita entre comillas.
Muestra el Autor en un formato destacado.
Renderizado condicional del Año y País de origen (solo se muestran si los datos existen en el registro actual).
Controles de la Ventana (Botones integrados en el marco):
Botón "Siguiente Cita" (Icono de actualización/flecha): Carga una nueva cita aleatoria o secuencial basada en los filtros activos.
Botón "Ajustes" (Icono de engranaje): Despliega un modal o panel lateral con las opciones de configuración.
Botón "Cerrar" (Icono 'X'): Oculta la ventana. (Debe existir un mecanismo en el fondo de la app para volver a invocarla, como un botón flotante principal o un toque en la pantalla vacía).
Panel de Ajustes:
Selector de Tema: Toggle para alternar entre Modo Claro (marco claro, texto oscuro) y Modo Oscuro (marco oscuro, texto claro).
Filtros por Categoría: Checkboxes o selectores para elegir tipos de citas (Filosofía, Ciencia, Motivación, Arte, etc.).
Filtro por Autor: Menú desplegable o barra de búsqueda para restringir las citas a un autor específico.
5. Estructura de Datos (Esquema JSON/SQL)
Campo
Tipo
Requerido
Descripción
id
String/UUID
Sí
Identificador único de la cita.
text
String
Sí
El cuerpo de la cita célebre.
author
String
Sí
Nombre del autor.
year
Integer/String
No
Año o época de la cita (ej. "1945", "Siglo IV a.C.").
country
String
No
País o región de origen del autor.
tags
Array de Strings
Sí
Categorías para el filtrado (ej. ["ciencia", "tecnología"]).

6. Comportamientos Dinámicos y Casos de Uso
Gestión de Límites de Pantalla: Al arrastrar la ventana, las coordenadas x e y generadas por el gesto deben estar limitadas por las dimensiones de la pantalla (Dimensions.get('window')) para evitar que la ventana se pierda fuera del área visible.
Cambio de Tema en Tiempo Real: Al presionar el botón de Modo Oscuro, los colores del marco biselado deben invertirse (los bordes de luz pasan a ser sombras y viceversa) sin necesidad de reiniciar la aplicación.
Manejo de Estados Vacíos: Si el usuario aplica un filtro de autor/categoría que no arroja resultados, la ventana debe mostrar un mensaje amigable indicando que no hay citas para esos criterios, manteniendo los botones de ajustes y cerrar operativos.
