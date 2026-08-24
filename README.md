# ZetaHub

Portal con todos mis proyectos en un solo lugar. Los proyectos se muestran
como un anillo que gira, renderizado como un único shader WebGL — sin
imágenes ni tarjetas HTML, todo son campos de distancia (SDF) dibujados por
píxel. Las tarjetas vecinas se funden entre sí al acercarse y se estiran en
hilos finos al separarse.

HTML, CSS y JavaScript puro (sin framework ni paso de build), con Three.js y
GSAP cargados vía CDN como módulos ES.

## Cómo verlo en local

No hace falta `npm install`. Sirve la carpeta con cualquier servidor
estático, por ejemplo:

```bash
python -m http.server 5500
```

Y abre `http://localhost:5500`.

## Qué se puede hacer

- **Scroll o arrastrar** para girar el anillo.
- **Pasar el cursor** sobre la tarjeta centrada para ver su vídeo (tras un
  segundo) y su tag "Ver".
- **Clic en una tarjeta** lateral para centrarla; clic en la ya centrada para
  abrir su enlace.
- La lista de la esquina superior derecha también es clicable.

## Estructura

```
index.html          punto de entrada
css/style.css        estilos, fuentes locales
js/
  app.js              arranca el carrusel
  carousel.js          bucle principal: input, física del anillo, hover del vídeo
  ring/
    projects.js         los proyectos — editar aquí para añadir/quitar uno
    params.js            todos los parámetros ajustables
    techIcons.js         iconos de stack (HTML, CSS, Angular, Vue...)
    dom.js               construye el overlay (lista, meta, vídeo, tag)
    meta.js               morph de texto (nombre, tipo, descripción, stack)
    atlas.js               empaqueta las imágenes en una sola textura
    tag.js / splitText.js  tag del cursor / título de entrada
    utils.js                helpers matemáticos
  shaders/
    planeShaders.js         el anillo: SDFs, fusión, cristal, tag
    textShaders.js           revelado del título letra a letra
assets/
  proyects/front/*.png       imagen de cada proyecto
  proyects/back/*.mp4        vídeo al hacer hover
  proyects/icons/*.png       icono junto al nombre
  fonts/                     Satoshi (Fontshare) y Geist (SIL OFL), libres
```

## Añadir un proyecto

Todo vive en `js/ring/projects.js`. Cada entrada:

```js
{
  file: "assets/proyects/front/nombre.png",
  icon: "assets/proyects/icons/nombre.png",
  video: "assets/proyects/back/nombre.mp4", // o null
  name: "Nombre",
  type: "SPA",                // tipo de aplicación
  stack: ["angular", "ts"],    // claves de js/ring/techIcons.js
  year: "2026",
  url: "https://...",
  githubUrl: "https://github.com/...", // "#" para ocultar el botón
  description: "Una frase breve.",
}
```

## Créditos

El carrusel está portado desde
[**Viscose**](https://github.com/Yousuf-developer/viscose) de Yousuf Soomro
(MIT), adaptado de React/Next.js a JavaScript vanilla y con proyectos e
imágenes propios. El ruido simplex del shader es
[webgl-noise](https://github.com/ashima/webgl-noise) (Ashima Arts / Stefan
Gustavson, MIT).

Fuentes: [Satoshi](https://fontshare.com/fonts/satoshi) (Fontshare, libre) y
[Geist](https://github.com/vercel/geist-font) (SIL OFL).
