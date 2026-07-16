# Verificador de credenciales RecyInd

Sitio HTML5 estático para desplegar directamente en Netlify.

## Tecnología
- Bootstrap 5.3.8
- Bootstrap Icons 1.13.1
- JavaScript moderno sin frameworks
- Archivos JSON individuales por credencial

## Probar localmente
No abras `index.html` directamente con doble clic, porque algunos navegadores bloquean `fetch()` sobre archivos locales.

Puedes usar:
```bash
python -m http.server 8080
```
Después abre:
`http://localhost:8080/?v=RX7K-92QM-4TP8`

## Agregar una credencial
1. Genera un token largo y aleatorio, por ejemplo: `D8MK-7QP2-X9VA-4TFC`.
2. Crea un archivo dentro de `/data/` cuyo nombre sea exactamente el token:
   `data/D8MK-7QP2-X9VA-4TFC.json`
3. Copia la estructura del archivo de ejemplo y modifica sus datos.
4. Guarda la foto en `assets/img/` y cambia el campo `foto`.
5. Genera el QR con esta dirección:
   `https://TU-SITIO.netlify.app/?v=D8MK-7QP2-X9VA-4TFC`

## Estados admitidos
- `vigente`
- `vencida`
- `revocada`

Para dar de baja una credencial sin borrar su consulta, cambia `"estado": "revocada"`.

## Publicar en Netlify
Arrastra la carpeta completa al panel de despliegue manual de Netlify o súbela mediante Git.

## Seguridad
Este proyecto confirma credenciales, pero no sustituye un backend con autenticación. No coloques CURP, domicilio, teléfono personal, firma, identificaciones oficiales ni otros datos sensibles en los JSON.
