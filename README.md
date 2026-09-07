# Site do DXS Boost

Página oficial do **DXS Boost**, aplicativo local de monitoramento de desempenho
para jogos no Windows 10 e 11.

Publicada em <https://dxsboost.com.br> pelo GitHub Pages.

## O que tem aqui

| Caminho | O que é |
|---|---|
| `index.html` e demais páginas HTML | Exportação estática do site em React e TypeScript. |
| `_next/` | JavaScript e CSS gerados na compilação. |
| `images/` | Logo e capturas reais do aplicativo. |
| `downloads/` | Instalador oferecido pela versão atual. |
| `docs/` | Documentação e licenças do software. |
| `CNAME` e `.nojekyll` | Domínio próprio e publicação dos arquivos estáticos. |
| `imagens/`, `download/` e `favicon.ico` | Arquivos anteriores preservados para manter links existentes. |

O código-fonte do aplicativo **não** está neste repositório.

## Publicar uma versão nova do app

1. No projeto-fonte do site, atualize `config/software-config.ts` e o instalador em `public/downloads/`.
2. Execute `npm run build` e copie o conteúdo completo de `dist/client/` para este repositório, incluindo `.nojekyll`, `CNAME` e `_next/`.
3. Faça commit e push e acompanhe a conclusão do GitHub Pages na aba Actions.
4. Confira o site, as páginas informativas e o download em HTTPS.

Este repositório contém o resultado compilado. As alterações de conteúdo devem ser feitas no projeto-fonte e compiladas novamente.

## Licença

O texto e o desenho da página são © 2026 DXS.
