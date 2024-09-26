const xlsx = require('xlsx');
const fs = require('fs');

// Arquivo em Excel com nome de 'basecep_integrada.xlsx'. Caso mude, alterar na variável abaixo
// Arquivo deve estar na mesma pasta do projeto.
const workbook = xlsx.readFile('basecep_integrada_exemplo.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Converte para a tabela para JSON
const data = xlsx.utils.sheet_to_json(sheet);

// Mapeando as siglas com o  estados
const ufToRegion = {
  'SP': 'São Paulo',
  'MG': 'Minas Gerais',
  'ES': 'Espírito Santo',
  'RJ': 'Rio de Janeiro',
  'PR': 'Paraná',
  'SC': 'Santa Catarina',
  'RS': 'Rio Grande do Sul',
  'MT': 'Mato Grosso',
  'MS': 'Mato Grosso do Sul',
  'GO': 'Goiás',
  'DF': 'Distrito Federal',
  'PE': 'Pernambuco',
  'CE': 'Ceará',
  'RN': 'Rio Grande do Norte',
  'AL': 'Alagoas',
  'SE': 'Sergipe',
  'BA': 'Bahia',
  'PB': 'Paraiba',
  'PA': 'Paraú',
  'AM': 'Amazonas',
  'RO': 'Rondoônia',
  'AC': 'Acre',
  'AP': 'Amapá',
  'RR': 'Roraima',
  'MA': 'Maranhão',
  'PI': 'Piaú',
  'TO': 'Tocantins',
};

// Mudar o formato do CEP colocando o '-'
const formatPostcode = (cep) => {
  return `${cep.slice(0, 5)}-${cep.slice(5)}`;
};

// Mudar o formato da Latitude e Longitude para o padrão BR utilizando vírgulas
const formatLatLong = (data) => {
    if (data) {
        if(data.length == 1){
            return data.replace('-','NULL')
        }
        return data.replace('.',',')
    }
};

// Mapeando os dados para gerar o JSON e assim gerar o SQL correto
const processedData = data.map((row, index) => {
  return {
    postcode: formatPostcode(row.CEP.toString()),
    city: row.Cidade_Acento || row.Cidade_Oficial,
    region: ufToRegion[row.UF] || row.UF,
    province: row.Cod_Mun,
    latitude: formatLatLong(row.latitude),
    longitude: formatLatLong(row.longitude),
    source_code: '',
    entity_id: index++
  };
});

// SQL Insert
let sql = 'INSERT INTO inventory_geoname (country_code, postcode, city, region, province, latitude, longitude, source_code, entity_id) VALUES\n';

sql += processedData.map(row => {
  return `('BR', '${row.postcode}', '${row.city}', '${row.region}', '${row.province}', ${row.latitude || 'NULL'}, ${row.longitude || 'NULL'}, '${row.source_code}', ${row.entity_id})`;
}).join(',\n');

sql += ';';

// Escreve o arquivo SQL e grava no disco
fs.writeFileSync('ceps.sql', sql);

console.log('Arquivo SQL gerado com Sucesso!');