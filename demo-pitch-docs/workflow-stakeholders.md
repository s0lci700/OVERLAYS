# Para El Sentido del Humor Producciones
## Cómo funciona DADOS & RISAS en sus shows

> **Este documento es para ustedes** — sin código, sin tecnicismos.  
> Solo lo que necesitan saber para decidir si esto encaja en su contenido.

---

## ¿Qué problema resuelve esto?

Cuando hacen un show de D&D en vivo o en stream, su audiencia no puede ver qué está pasando en la mesa: ¿Cuánta vida le queda al personaje? ¿Qué salió en ese dado? Con DADOS & RISAS, **todo eso aparece automáticamente en pantalla**, en tiempo real, sin que el equipo técnico tenga que tocar nada durante el show.

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
        A4[El show se detiene\npara explicar el estado]
    end

    subgraph CON["✅ Con DADOS & RISAS"]
        B1[Barra de vida actualizada\nen pantalla al instante]
        B2[Audiencia ve el drama\nen tiempo real]
        B3[Chat reacciona cuando\nel personaje está crítico]
        B4[El show fluye sin\ninterrupciones técnicas]
    end
```

---

## Preguntas frecuentes

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

---

## El pitch en una sola imagen

```mermaid
flowchart TD
    A(["🎭 El Sentido del Humor\nhace un show de D&D"]) --> B["Su audiencia ve\nlo que pasa EN TIEMPO REAL\nen los overlays de OBS"]
    B --> C["Chat explota\ncon cada tirada crítica"]
    C --> D["Contenido más dinámico\nmás engagement\nmás clips compartibles"]
    D --> E(["🚀 Un show diferente a\ntodo lo que hay en\nYouTube de habla hispana"])
```

---

> *"Este es el MVP — puedo agregar lo que necesiten."*  
> — Equipo DADOS & RISAS
