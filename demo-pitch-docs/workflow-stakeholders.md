# Para El Sentido del Humor Producciones
## Cómo funciona DADOS & RISAS en sus shows

> **Este documento es para ustedes** — sin código, sin tecnicismos.  
> Solo lo que necesitan saber para decidir si esto encaja en su contenido.

---

## ¿Qué problema resuelve esto?

Cuando hacen un show de D&D en vivo o en stream, su audiencia no puede ver qué está pasando en la mesa: ¿Cuánta vida le queda al personaje? ¿Qué salió en ese dado? Y los jugadores tienen que estar mirando hojas de papel en lugar de enfocarse en ser graciosos.

Con DADOS & RISAS, **todo eso se resuelve de una sola vez**: la audiencia ve todo en pantalla en tiempo real, y los jugadores tienen sus fichas de personaje en su propio celular — actualizadas automáticamente, sin tocar nada manualmente.

---

## El sistema completo — tres partes

```mermaid
flowchart TD
    subgraph STREAM["🎬 Para la audiencia (OBS)"]
        HP[Barras de vida\nde cada personaje]
        DICE[Popup del dado\n¡CRÍTICO! / ¡PIFIA!]
    end

    subgraph CONTROL["📱 Para el Dungeon Master\nPanel de control en celular"]
        DM1[Actualizar HP\nde cualquier personaje]
        DM2[Tirar dados\nd4 a d20]
        DM3[Agregar condiciones\ne.g. envenenado]
        DM4[Descansos cortos\ny largos]
    end

    subgraph PLAYERS["📺 Para los jugadores\nDashboard en celular o pantalla"]
        P1[Ver sus stats en vivo:\nHP · AC · Velocidad]
        P2[Ver sus recursos:\nRage · Ki · Hechizos]
        P3[Ver condiciones\nactivas]
        P4[Ver historial de dados\ny acciones de la sesión]
    end

    subgraph MGMT["⚙️ Antes del show\nCreación y gestión de personajes"]
        M1[Crear personajes nuevos\ncon nombre, foto y stats]
        M2[Editar personajes\nexistentes]
    end

    CONTROL -- actualiza --> STREAM
    CONTROL -- sincroniza --> PLAYERS
    MGMT -- prepara --> CONTROL
```

**Tres beneficios en uno:**
1. **La audiencia** ve todo lo que pasa en tiempo real
2. **Los jugadores** tienen sus fichas en el celular, actualizadas automáticamente
3. **El DM** controla todo desde el celular con unos toques

---

## La experiencia completa — de un vistazo

```mermaid
flowchart TD
    A([🎬 Comienza el show\nOBS está en vivo]) --> B[Equipo técnico\nya configuró todo\n antes del stream]

    B --> C{Durante el show}

    C --> D[🎲 Un comediante\ntira los dados]
    D --> E[Toca un botón\nen su celular]
    E --> F[✨ En pantalla del stream\naparece el resultado del dado\ncon animación especial]

    C --> G[⚔️ Un personaje\nrecibe daño]
    G --> H[El Dungeon Master\ntoca el celular]
    H --> I[📊 La barra de vida\nse actualiza en pantalla\nen menos de 1 segundo]

    F --> J([👀 La audiencia ve todo\ny reacciona en chat])
    I --> J
```

---

## Lo que ve la audiencia en stream

```mermaid
flowchart LR
    subgraph OBS["🖥️ Lo que ve la audiencia en YouTube / Twitch"]
        CAM[Cámara del show]
        HP[Barras de vida\nde cada personaje\narriba a la derecha]
        DICE[Popup del dado\ncuando alguien tira\narriba o abajo]
    end

    subgraph Control["📱 Lo que maneja el equipo en escena"]
        PHONE[Celular con\npanel de control]
    end

    PHONE -- toca un botón --> HP
    PHONE -- toca un botón --> DICE
```

**Todo sucede de forma automática y en tiempo real. No hay delays. No hay edición en post.**

---

## Los tres momentos que hacen reaccionar al chat

```mermaid
flowchart TD
    A([Jugador tira el d20]) --> B{¿Qué salió?}

    B -- "20 natural 🎉" --> C["¡CRÍTICO!\nEl dado aparece en pantalla\ncon brillo verde intenso\ny texto enorme"]
    C --> D[Chat explota\ncon emotes]

    B -- "1 natural 😱" --> E["¡PIFIA!\nEl dado aparece en rojo\ncon efecto de error\ntodos ríen"]
    E --> D

    B -- Cualquier otro número --> F[Resultado aparece\nfade in / fade out\nen 4 segundos]
    F --> G[Show continúa]

    D --> G
```

---

## Cómo se ve una sesión típica

```mermaid
flowchart TD
    A([⏱️ 30 minutos antes\ndel stream]) --> B[Técnico enciende el servidor\nen la laptop]
    B --> C[Agrega los overlays\nen OBS como fuentes\nya configuradas]
    C --> D[Carga los personajes\ndel episodio de hoy]
    D --> E([Todo listo ✅])

    E --> F([🔴 Stream en vivo])
    F --> G[Comediantes juegan D&D\ncomo siempre]
    G --> H{Algo pasa en el juego}

    H -- Daño / curación --> I[DM toca el celular\n5 segundos]
    H -- Tirada de dado --> J[Jugador toca el celular\n2 segundos]
    H -- Condición de estado\ne.g. envenenado --> K[DM agrega condición\nen celular\n5 segundos]

    I --> L[📺 Pantalla del stream\nse actualiza sola]
    J --> L
    K --> L

    L --> M([Audiencia ve todo\nen tiempo real 🎯])
```

---

## Los jugadores tienen su ficha en el celular — sin papel

Uno de los mayores beneficios del sistema es que **los jugadores no necesitan hojas de papel**. Cada jugador puede abrir el Dashboard en su propio teléfono y ver su personaje actualizado en tiempo real.

```mermaid
flowchart LR
    subgraph SIN["❌ Sin el sistema"]
        A1[Jugador mira hoja de papel]
        A2[Tiene que calcular los números]
        A3[Interrumpe el show para\npreguntar '¿cuánta vida me queda?']
        A4[Se distrae de hacer comedia]
    end

    subgraph CON["✅ Con DADOS & RISAS"]
        B1[Jugador mira su celular]
        B2[Ve HP · AC · Recursos\nCondiciones actualizados]
        B3[El DM actualiza los números\nen su celular]
        B4[El jugador se enfoca\nen ser gracioso]
    end
```

**Lo que cada jugador ve en su celular (Dashboard):**

| Información | Ejemplo |
|-------------|---------|
| HP actual / máximo | 8 / 12 |
| HP temporal | +3 |
| Armadura (AC) | 15 |
| Velocidad | 30 ft |
| Atributos | STR 16 · DEX 12 · CON 14 · INT 8 · WIS 10 · CHA 18 |
| Condiciones activas | Envenenado · nivel 1 |
| Recursos con cargas | Furia: 2/3 (recarga: descanso corto) |
| Últimas 10 acciones | 14:32 Kael HP → 8/12 |
| Últimos 10 dados | 14:35 Lyra tiró 18 (d20+2) |

**Todo se actualiza automáticamente.** Cuando el DM actualiza el HP desde su celular, el dashboard del jugador refleja el cambio en menos de 1 segundo.

---

## Crear y gestionar personajes

Antes de cada episodio, el equipo técnico (o el productor) usa el panel de gestión para preparar los personajes del show. No requiere programación — es un formulario web.

```mermaid
flowchart TD
    A([Preparar episodio nuevo]) --> B[Abrir panel de gestión\nen cualquier browser]

    B --> C{Personaje nuevo\no episodio recurrente?}

    C -- Nuevo personaje --> D[Llenar el formulario:\nNombre · Jugador\nHP máximo · Armadura\nClase · Nivel\nFoto del personaje]
    D --> E[Guardar personaje]
    E --> F[Aparece en todos\nlos paneles conectados\nen tiempo real]

    C -- Personaje recurrente --> G[Ir a Gestión → Administrar]
    G --> H[Buscar el personaje]
    H --> I[Editar stats para\neste episodio\ne.g. subió de nivel]
    I --> F

    F --> J([Listos para el show ✅])
```

**Opciones de foto para cada personaje:**
- Elegir arte predefinido (bárbaro, elfo, mago)
- Pegar una URL de imagen externa
- Subir una imagen desde el dispositivo (fan art, fotos del equipo, etc.)

---

## ¿Qué necesitan ustedes hacer?

```mermaid
flowchart TD
    A([Lo que necesitan de ESDH]) --> B[Decidir los personajes\nnombres y puntos de vida]
    B --> C[Fotos o avatares\nde cada personaje\nopcional]
    C --> D[Una laptop encendida\ndurante el show]
    D --> E[Un teléfono por persona\no solo para el DM]
    E --> F([Eso es todo ✅\nEl resto lo maneja\nel equipo técnico])
```

**No necesitan saber programar. No necesitan tocar código. No necesitan instalar nada en sus teléfonos.**

---

## Lo que hace el equipo técnico (una sola vez)

```mermaid
flowchart TD
    A([Setup inicial\npor el dev team]) --> B[Instala el sistema\nen laptop dedicada]
    B --> C[Configura los overlays\nen el OBS de ESDH]
    C --> D[Crea plantillas\nde personajes recurrentes]
    D --> E[Hace demo + entrenamiento\ncon el equipo de producción]
    E --> F([✅ Sistema entregado\nlisto para usar en cada show])

    F --> G([Para cada episodio\nel productor solo:])
    G --> H[Enciende la laptop]
    H --> I[Carga los personajes\ndel episodio]
    I --> J([Stream en vivo ✅])
```

---

## ¿Qué pueden personalizar?

| Elemento | ¿Se puede cambiar? | Ejemplos |
|----------|-------------------|----------|
| Colores de las barras de vida | ✅ Sí | Colores de ESDH, branding del show |
| Fuente y tipografía | ✅ Sí | La que usen en sus thumbnails |
| Posición de los overlays | ✅ Sí | Arriba, abajo, costado |
| Texto de ¡CRÍTICO! / ¡PIFIA! | ✅ Sí | Frases propias del show |
| Sonidos al tirar dados | ✅ Sí | Efectos de audio custom |
| Avatares de personajes | ✅ Sí | Fan art, fotos, ilustraciones |
| Nombre del show en overlays | ✅ Sí | "DADOS & RISAS" o su marca |

---

## Comparación: con y sin el sistema

```mermaid
flowchart LR
    subgraph SIN["❌ Sin el sistema"]
        A1[DM dice 'te quedan 8 puntos de vida'\nen voz]
        A2[Audiencia tiene que\nrecordar los números]
        A3[Chat no sabe\nquién está mal]
        A4[Jugadores miran hojas de papel]
        A5[El show se detiene para\nexplicar el estado del juego]
    end

    subgraph CON["✅ Con DADOS & RISAS"]
        B1[Barra de vida actualizada\nen pantalla al instante]
        B2[Audiencia ve el drama\nen tiempo real]
        B3[Chat reacciona cuando\nel personaje está crítico]
        B4[Jugadores ven su ficha\nen el celular — automático]
        B5[El show fluye sin\ninterrupciones técnicas]
    end
```

---

## Preguntas frecuentes

**¿Los jugadores necesitan instalar alguna app?**  
No. El panel de control y el dashboard son páginas web. Los jugadores abren el navegador de su celular, escriben la URL, y listo.

**¿Cuántas pantallas necesitan?**  
Como mínimo una (la laptop con OBS). Idealmente: una pantalla para OBS, y los jugadores con el dashboard en su propio celular. Si tienen una TV en la mesa, pueden mostrar el dashboard ahí para que todos lo vean.

**¿Funciona con Twitch y YouTube al mismo tiempo?**  
Sí. El sistema actualiza OBS, que transmite a donde sea que estén haciendo stream.

**¿Qué pasa si se corta internet durante el show?**  
El sistema no necesita internet — funciona completamente en la red local (Wi-Fi entre la laptop y los teléfonos). Si se cae el Wi-Fi local, los overlays muestran el último estado conocido y se reconectan solos cuando vuelve la señal. Internet solo es necesario para transmitir el stream a YouTube o Twitch, no para el sistema de overlays en sí.

**¿Pueden usarlo en shows grabados (no en vivo)?**  
Sí. Funciona igual para grabaciones. El resultado se ve igual en el video final.

**¿Cuántos personajes pueden tener en pantalla?**  
El sistema soporta múltiples personajes. Para un show, entre 3 y 6 personajes es lo ideal visualmente.

**¿Necesitan tener internet en el lugar del show?**  
Solo necesitan una red local (Wi-Fi entre la laptop y los teléfonos). No necesitan internet para que el sistema funcione entre sus dispositivos.

**¿Qué pasa si un personaje cambia de episodio a episodio (sube de nivel, nuevo equipo)?**  
El productor o DM edita el personaje en el panel de gestión antes del show. Cambia los stats, sube el nivel, actualiza la foto si quieren. Todo se actualiza en tiempo real cuando se guarda.

---

## El pitch en una sola imagen

```mermaid
flowchart TD
    A(["🎭 El Sentido del Humor\nhace un show de D&D"]) --> B1
    A --> B2
    A --> B3

    B1["🎬 La audiencia ve todo\nen tiempo real en OBS\n— más engagement, más clips"]
    B2["📱 Los jugadores tienen\nsus fichas en el celular\n— se enfocan en hacer comedia"]
    B3["⚙️ El equipo prepara\ncada episodio en minutos\n— gestión de personajes en el browser"]

    B1 --> C(["🚀 Un show diferente a\ntodo lo que hay en\nYouTube de habla hispana"])
    B2 --> C
    B3 --> C
```

---

> *"Este es el MVP — puedo agregar lo que necesiten."*  
> — Equipo DADOS & RISAS
