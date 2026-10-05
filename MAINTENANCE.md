# Perfil de BenjaGC

Este repositorio publica el README del perfil de GitHub. Editar `README.md` para cambiar presentación y proyectos. La portada es un SVG propio; los botones y estadísticas también se generan como SVG.

`scripts/update-profile.mjs` obtiene solo datos de repositorios públicos propios desde la API de GitHub. Excluye forks y el repositorio del perfil. Las proporciones representan bytes de código, no experiencia ni dominio de un lenguaje. No se inventan métricas de commits, rachas ni calificaciones.

GitHub Actions regenera cada día las estadísticas y la animación de contribuciones, y guarda los archivos dentro de este repositorio. También se puede ejecutar desde Actions → Actualizar actividad del perfil → Run workflow. La alternativa sin movimiento se presenta según la preferencia del dispositivo. Los datos no dependen de un servicio de estadísticas externo.

La automatización usa el token efímero del repositorio con permiso de escritura de contenido; no necesita claves personales. Las acciones externas están fijadas a un commit. Revisar periódicamente sus versiones y la disponibilidad del calendario. GitHub puede pausar los workflows programados tras un periodo prolongado sin actividad del repositorio.

Iconos: [Skill Icons](https://github.com/tandpfun/skill-icons), licencia MIT conservada en `assets/icons/LICENSE`. Los nombres y logotipos pertenecen a sus respectivas marcas.

Animación de contribuciones: [Platane/snk](https://github.com/Platane/snk), utilizada mediante su acción oficial.
