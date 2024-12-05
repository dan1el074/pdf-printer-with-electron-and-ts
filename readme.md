# Aplicação ImprimePDF

![Static Badge](https://img.shields.io/badge/status-finished-green) ![Static Badge](https://img.shields.io/badge/release-v3.0.1-blue)

Este projeto é uma aplicação desktop em **Node.js**, usando **TypeScript** com o framework **Electron.js**, desenvolvida para o setor de PCP da empresa [Metaro Indústria e Comércio LTDA](https://www.metaro.com.br). Ela realiza uma varredura em um arquivo Excel e extrai códigos que representam projetos, dos quais precisam ser impressos em uma sequencia expecífica.

## Pré-requisitos

Os scripts só funcionam no Linux, portanto faça tudo dentro do "**Git Bash**" para que não aconteça nenhum erro usando Windows. Para executar a aplicação, certifique-se de que o seguinte esteja instalado:

- [Node.js](https://nodejs.org/en/download/current) (versão 12 ou superior)
- [Git](https://git-scm.com/download/win) (sistema de controle de versões)

## Pré-configuração

1. Clone este repositório para o seu ambiente local:

    ```bash
    git clone git@github.com:dan1el074/pdf-printer-with-electron-and-ts.git 
    ```

3. Navegue até o diretório do projeto:

   ```bash
    cd pdf-printer-with-electron-and-ts
    ```

4. Instale as dependências:

    ```bash
    npm install
    ```
## Iniciar a aplicação

Rode o seguinte comando no terminal:

```bash
npm run start:dev 
```

## Criando instalador:

Rode o seguinte comando no terminal:

```bash
npm run build:prod 
```
