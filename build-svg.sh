rsync -a --delete vendor/noto-emoji/svg/ svg/noto-emoji/
rsync -a --delete vendor/twemoji/assets/svg/ svg/twemoji/
rsync -a --delete vendor/blobmoji/svg/ svg/blobmoji/
rsync -a --delete vendor/emojitwo/svg/ svg/emojitwo/
deno run -RWE build-svg.js
