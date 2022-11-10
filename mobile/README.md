# Mobile

## Execução

É necessário rodar o servidor para que o projeto funcione corretamente.

1. Instale os pacotes utilizando `npm install`
2. Crie o app no Google para obter o acesso ao OAuth (https://docs.expo.dev/guides/authentication/#google)
3. Faça uma cópia do arquivo `.env.example` e renomeie para `.env`, fazendo as alterações necessárias
4. Altere o endereço do arquivo `src/services/api.ts`, inserindo o IP de sua máquina
5. Execute `npx expo start` para iniciar o servidor Expo