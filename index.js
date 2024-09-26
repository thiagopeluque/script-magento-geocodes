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

// Verificar se os dados estão corretos ou são nulos ou vazios
const validateLatLong = (data) => {
  if (data && typeof data === 'string' && data.length > 1) {
    return data;
  }
  return null; // Ou você pode retornar undefined se preferir
};

// Mapeando os dados para gerar o JSON e assim gerar o SQL correto
const processedData = data.map((row, index) => {
  return {
    postcode: formatPostcode(row.CEP.toString()),
    city: row.Cidade_Acento || row.Cidade_Oficial,
    region: ufToRegion[row.UF] || row.UF,
    province: row.Cod_Mun,
    latitude: validateLatLong(row.latitude),
    longitude: validateLatLong(row.longitude),
    source_code: '',
    entity_id: index * 3
  };
});

// SQL Insert
let sql = 'INSERT INTO inventory_geoname (country_code, postcode, city, region, province, latitude, longitude, source_code, entity_id) VALUES\n';
sql += processedData.map(row => {
    if (row.latitude != null && row.longitude != null) {
      return `('BR','${row.postcode}','${row.city}','${row.region}','${row.province}',${row.latitude},${row.longitude},'${row.source_code}',${row.entity_id})`;
    }
    return null; // Retorna null se não atender à condição
  })
  .filter(row => row !== null) // Filtra as linhas nulas
  .join(',\n');

sql += ';';

// Escreve o arquivo SQL e grava no disco
fs.writeFileSync('ceps.sql', sql);

console.log('Arquivo SQL gerado com Sucesso!');