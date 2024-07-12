# Aplicação ImprimePDF

![Static Badge](https://img.shields.io/badge/status-finished-green) ![Static Badge](https://img.shields.io/badge/release-v4.2.9-blue)

Este projeto é uma aplicação desktop em **Node.js**, usando o framework **Electron.js**, desenvolvida para o setor de PCP da empresa [Metaro Indústria e Comércio LTDA](https://www.metaro.com.br). Ela realiza uma varredura em um arquivo Excel e extrai códigos que representam projetos, dos quais precisam ser impressos em uma sequencia expecífica.

## Pré-requisitos

Para executar a aplicação, certifique-se de que o seguinte esteja instalado:

- [Node.js](https://nodejs.org/en/download/current) (versão 12 ou superior)
- [Git](https://git-scm.com/download/win) (sistema de controle de versões)

## Instalação

1. Clone este repositório para o seu ambiente local:

    ```bash
    git clone https://github.com/dan1el074/pdf-printer-with-electron.git              
    ```

2. Navegue até o diretório do projeto:

    ```bash
    cd pdf-printer-with-electron
    ```

3. Instale as dependências:

    ```bash
    npm install
    ```

## Configuração

1. Rode o seguinte comando no terminal:

    ```bash
    npm run build              
    ```

2. Na pasta `dist/ImprimePDF-win32-x64`, apague os seguintes arquivos:

    - `LICENSE`
    - `LICENSES.chromium.html`
    - `resources/app/.gitignore`
    - `resources/app/readme.md`
    - `resources/app/instalation/`
    - `resources/app/bin/`

3. Recorte todos os arquivos presentes em `ImprimePDF-win32-x64`, para `ImprimePDF-win32-x64/resource`

4. Copie a pasta `bin`, da raiz do projeto, dentro da pasta `ImprimePDF-win32-x64`

5. Por fim, copie o arquivo do diretório `instalation/install.bat` dentro de `ImprimePDF-win32-x64`

## Uso

- Caso queira iniciar o projeto em ambiente de desenvolvimento, execute o seguinte comando no console:

```bash
npm start
```

- Para instalar a aplicação no seu computador, basta iniciar o arquivo `install.bat`, e aperte as teclas **S** ou **N** para responder as perguntas referente a instalação.
