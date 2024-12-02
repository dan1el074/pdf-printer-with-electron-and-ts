# Aplicação ImprimePDF

![Static Badge](https://img.shields.io/badge/status-finished-green) ![Static Badge](https://img.shields.io/badge/release-v2.2.1-blue)

Este projeto é uma aplicação desktop em **Node.js**, usando **TypeScript** com o framework **Electron.js**, desenvolvida para o setor de PCP da empresa [Metaro Indústria e Comércio LTDA](https://www.metaro.com.br). Ela realiza uma varredura em um arquivo Excel e extrai códigos que representam projetos, dos quais precisam ser impressos em uma sequencia expecífica.

## Pré-requisitos

Os scripts só funcionam no Linux, portanto faça tudo dentro do "**Git Bash**" para que não aconteça nenhum erro usando Windows. Para executar a aplicação, certifique-se de que o seguinte esteja instalado:

- [Node.js](https://nodejs.org/en/download/current) (versão 12 ou superior)
- [Git](https://git-scm.com/download/win) (sistema de controle de versões)

## Download

- [v2.2.1](https://github.com/dan1el074/pdf-printer-with-electron-and-ts/releases/tag/stable)
- [Link direto](https://github.com/dan1el074/pdf-printer-with-electron-and-ts/releases/download/stable/imprimePDF-v2.2.1-setup.rar)

## Criando instalador

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

5. Entre no arquivo `./dist/main.js`, e mude para o parâmetro de `Application` para `true`, na linha de número 4:

    ```
    4    var application = new Application_1.Application(true) 
    ```
    
6. Entre na pasta `dist`:

    ```bash
    cd dist
    ```
    
7. instale novamente as dependências:

    ```bash
    npm install
    ```

8. Dentro de `./dist`, rode o seguinte comando no terminal:

    ```bash
    npm run build:prod
    ```

9. Para fazer todas as configurações necessárias, rode o seguinte comando:
    ```bash
    npm run config:prod
    ``` 
10. Para instalar a aplicação no seu computador, basta iniciar o arquivo `install.bat`, e aperte as teclas **S** ou **N** para responder as perguntas referente a instalação.
