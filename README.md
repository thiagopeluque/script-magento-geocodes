## Magento Geocodes

### Inventory Geonames
Script para gerar a lista de CEPs para Magento (Tabela: 'inventory_geonames') baseando-se na planilha oferecida pelo site:
https://www.zipdata.com.br/base-de-ceps/

1. Adquirir a planilha ou baixar a planilha de demonstração pelo site (Optar pelo arquivo com extensão .XLSX)
2. Colocar a planilha de CEPs, de preferência na mesma pasta do script
3. Renomar caso deseje utilizando um nome fácil e alterar também dentro do script
4. Executar o script utilizando NodeJS (testado na versão ^22) com o comando 'node index.js'

Esse script cria um arquivo '.sql' já com os dados tratados e validados.
Só é necessário copiar o conteúdo do arquivo .sql gerado e executar conectado ao banco de dados do Magento diretamente pelo SGBD utilizado.
