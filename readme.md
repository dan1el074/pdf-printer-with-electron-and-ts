# Aplicação ImprimePDF

![Static Badge](https://img.shields.io/badge/status-finished-green) ![Static Badge](https://img.shields.io/badge/release-v2.1.4-blue)

Este projeto é uma aplicação desktop em **Node.js**, usando **TypeScript** com o framework **Electron.js**, desenvolvida para o setor de PCP da empresa [Metaro Indústria e Comércio LTDA](https://www.metaro.com.br). Ela realiza uma varredura em um arquivo Excel e extrai códigos que representam projetos, dos quais precisam ser impressos em uma sequencia expecífica.

## Pré-requisitos

Para executar a aplicação, certifique-se de que o seguinte esteja instalado:

- [Node.js](https://nodejs.org/en/download/current) (versão 12 ou superior)
- [Git](https://git-scm.com/download/win) (sistema de controle de versões)

## Instalação

1. Clone este repositório para o seu ambiente local:

    ```bash
    git clone git@github.com:dan1el074/pdf-printer-with-electron-and-ts.git 
    ```

2. Navegue até o diretório do projeto:

    ```bash
    cd pdf-printer-with-electron-and-ts
    ```

3. Instale as dependências:

    ```bash
    npm install
    ```

4. Rode o seguinte comando no terminal:

    ```bash
    npm run build:dev 
    ```
   
5. Com a pasta `./dist` criada, copie todos os arquivos presentes em `./src/.dist/` para `./dist`
6. Copie também, as pastas `./src/public` e `./src/resource` para `./dist`
7. inicie a aplicação usando o comando:

    ```bash
    npm run start:dev 
    ```

## Preparando ambiente para deploy

1. Entre no arquivo `./dist/main.js`, e mude para o parâmetro de `Application` para `true`, na linha de número 4:

    ```
    4    var application = new Application_1.Application(true) 
    ```

2. Entre na pasta `dist`:

    ```bash
    cd dist
    ```

3. instale novamente as dependências:

    ```bash
    npm install
    ```

4. Para testas a aplicação, execute o comando:

    ```bash
    npm run start:prod
    ```

## Criando instalador:

1. Dentro de `./dist`, rode o seguinte comando no terminal:

    ```bash
    npm run build:prod
    ```

2. Na pasta `./dist/dist/ImprimePDF-win32-x64`, apague os seguintes arquivos:

    - `LICENSE`
    - `LICENSES.chromium.html`

3. Copie o arquivo do diretório `./dist/dist/ImprimePDF-win32-x64/resources/app/install.bat` dentro de `./dist/dist`

4. Renomeie a pasta em `./dist/dist/ImprimePDF-win32-x64`, para `resources`

5. Para instalar a aplicação no seu computador, basta iniciar o arquivo abaixo, e aperte as teclas **S** ou **N** para responder as perguntas referente a instalação.

    ```bash
    start install.bat
    ```
